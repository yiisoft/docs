# Sessions

Sessions persist data between requests without passing them to the client and back.
Yii has [a session package](https://github.com/yiisoft/session) to work with session data.

To add it to your application, use composer:

```shell
composer require yiisoft/session
```

## Configuring middleware

To keep a session between requests, you need to add `SessionMiddleware` to your route group or
application middlewares.
You should prefer a route group when you have both API with token-based authentication
and regular web routes in the same application. Having it this way avoids starting the session for API endpoints.

To add a session for a certain group of routes, edit `config/routes.php` like the following:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Group;
use Yiisoft\Session\SessionMiddleware;

return [
    Group::create('/blog')
        ->middleware(SessionMiddleware::class)
        ->routes(
            // ...
        )
];
```

To add a session to the whole application, edit `config/application.php` like the following:

```php
return [
    Yiisoft\Yii\Web\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            Router::class,
                            CsrfMiddleware::class,
                            SessionMiddleware::class, // <-- add this
                            ErrorCatcher::class,
                        ]
                    );
            }),
        ],
    ],
];
```

## Opening and closing session

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // start a session if it's not yet started
    $session->open();

    // work with session

    // write session values and then close it
    $session->close();
}
``` 

> [!NOTE]
> Closing session as early as possible is a good practice since many session implementations are blocking other
> requests while the session is open.

There are two more ways to close a session:

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // discard changes and close the session
    $session->discard();

    // destroy the session completely
    $session->destroy();    
}
```

## Working with session data

Usually you will use the following methods to work with session data:

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // get a value
    $lastAccessTime = $session->get('lastAccessTime');

    // get all values
    $sessionData = $session->all();
        
    // set a value
    $session->set('lastAccessTime', time());

    // check if the value exists
    if ($session->has('lastAccessTime')) {
        // ...    
    }
    
    // remove value
    $session->remove('lastAccessTime');

    // get value and then remove it
    $sessionData = $session->pull('lastAccessTime');

    // clear session data from runtime
    $session->clear();
}
```

## Flash messages

In case you need some data to remain in session until read, such as in case of displaying a message on the next page,
"flash" messages are what you need.
A flash message is a special type of data that's available only in the current request and the next request.
After that, it will be deleted automatically.

`FlashInteface` usage is the following:

```php
/** @var Yiisoft\Session\Flash\FlashInterface $flash */

// request 1
$flash->set('warning', 'Oh no, not again.');

// request 2
$warning = $flash->get('warning');
if ($warning !== null) {
    // do something with it
}
```

## Custom session storage

When using `Yiisoft\Session\Session`, you can use your own storage implementation:

```php
$handler = new MySessionHandler();
$session = new \Yiisoft\Session\Session([], $handler);
```

Custom storage must implement `\SessionHandlerInterface`.
