# Sessions

Sessions allow persisting data between requests without passing them to the client and back. Yii has a special component
to work with session data.

## Configuring middleware

In order for session to work properly, ensure that `\Yiisoft\Yii\Web\Session\SessionMiddleware` is registed in application
middleware stack before request router.

## Opening and closing session

```php
public function actionProfile(\Yiisoft\Yii\Web\Session\SessionInterface $session)
{
    // start session if it's not yet started
    $session->open();

    // work with session

    // write session values and then close it
    $session->close();
}
``` 

> Note: Closing session as early as possible is a good practice since many session implementations are blocking other
> requests while session is open.

There are two more ways to close session:

```php
public function actionProfile(\Yiisoft\Yii\Web\Session\SessionInterface $session)
{
    // discard changes and close session
    $session->discard();

    // destroy session completely
    $session->destroy();    
}
```

## Working with session data

Usually you will use the following methods to work with session data:

```php
public function actionProfile(\Yiisoft\Yii\Web\Session\SessionInterface $session)
{
    // get a value
    $lastAccessTime = $session->get('lastAccessTime');

    // get all values
    $sessionData = $session->all();
        
    // set a value
    $session->set('lastAccessTime', time());

    // check if value exists
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

## Custom session storage

When using `Yiisoft\Yii\Web\Session\Session` as session component, you can provide your own storage implementation:

```php
$handler = new MySessionHandler();
$session = new \Yiisoft\Yii\Web\Session\Session([], $handler);
```

Custom storage must implement `\SessionHandlerInterface`.
