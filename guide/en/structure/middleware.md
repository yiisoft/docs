# Middleware

Yii works with HTTP using the abstraction layer built around [PSR-7 HTTP message interfaces](https://www.php-fig.org/psr/psr-7/)
and [PSR-15 request handler/middleware interfaces](https://www.php-fig.org/psr/psr-15/).

The application is composed of one or several middleware. When the URL is requested, the request object is passed to
the middleware dispatcher that starts executing middleware. Each middleware, given the request, can:

- Pass request to the next middleware or return a response. 
- Perform some work before and after the next middleware.

Depending on middleware used, application behavior may vary significantly.

![Middleware](img/middleware.svg)

In the above each next middleware wraps the previous middleware. Alternatively, it could be presented
as follows:

![Middleware](img/middleware_alternative.svg)

## Using middleware

Any PSR-15 compatible middleware could be used with Yii and there are many.
Say, you need to add basic authentication
one of the application URLs. URL-dependent middleware is configured using router, so you need to change router factory. 

Authentication middleware is implemented by `middlewares/http-authentication` package so execute
`composer require middlewares/http-authentication` in the application root directory.

Now register the middleware in DI container configuration `config/web.php`:

```php
<?php
\Middlewares\BasicAuthentication::class => [
    'class' => \Middlewares\BasicAuthentication::class,
    '__construct()' => [
        'users' => [
            'foo' => 'bar',
        ],
    ],
    'realm()' => ['Access to the staging site via basic auth'],
    'attribute()' => ['username'],
],
```

In the `config/routes.php`, add new route:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Route;
use App\Controller\SiteController;
use Middlewares\BasicAuthentication;


return [
    //...
    Route::get('/basic-auth')->([SiteController::class, 'auth'])
        ->name('site/auth')
        ->addMiddleware(BasicAuthentication::class)
];
```

When configuring routing, you're binding `/basic-auth` URL to a chain of middleware consisting of basic
authentication, and the action itself. A chain is a special middleware that executes all the middleware it's configured
with.

The action itself may be the following:

```php
public function auth(ServerRequestInterface $request): ResponseInterface
{
    $response = $this->responseFactory->createResponse();
    $response->getBody()->write('Hi ' . $request->getAttribute('username'));
    return $response;
}
```

Basic authentication middleware wrote to request `username` attribute, so you can access the data if needed.

To apply middleware to application overall regardless of URL, adjust `config/application.php`:

```php
return [
    Yiisoft\Yii\Http\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            ErrorCatcher::class,
                            BasicAuthentication::class,
                            SessionMiddleware::class,
                            CsrfMiddleware::class,
                            Router::class,
                        ]
                    );
            }),
            'fallbackHandler' => Reference::to(NotFoundHandler::class),
        ],
    ],
];
```

## Creating your own middleware

To create middleware, you need to implement a single `process` method of `Psr\Http\Server\MiddlewareInterface`:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $next): ResponseInterface;
```

There are many ways to handle request and choosing one depends on what the middleware should achieve.

### Forming response directly

To respond directly, one needs a response factory passed via constructor:

```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class RespondingMiddleware implements MiddlewareInterface
{
    private ResponseFactoryInterface $responseFactory;

    public function __construct(ResponseFactoryInterface $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $next): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

### Delegating handling to the next middleware

If middleware either isn't intended form response / change request or can't do it this time, handling could be
left to the next middleware in the stack:  

```php
return $next->handle($request);
```

In case you need to pass data to the next middleware, you can use request attributes:

```php
$request = $request->withAttribute('answer', 42);
return $next->handle();
``` 

To get it in the next middleware:

```php
$answer = $request->getAttribute('answer');
```

### Capturing response to manipulate it

You may want to capture response to manipulating it. It could be useful for adding CORS headers, gzipping content etc.

```php
$response = $next->handle($request);
// extra handing
return $response;
```

