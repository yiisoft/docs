# Routing and URL generation

Usually a Yii application processing certain requests with certain handlers. It selects a handler based on request
URL. The part of the application that does the job is a router and the process of selecting a handler, instantiating it
and running a handler method is called *routing*.

The reverse process of routing is called *URL generation*, which creates a URL from a given named route
and the associated query parameters. When we later request the created URL, the routing process can resolve it
back into the original route and query parameters.

Routing and URL generation are separate services but they use a common set of routes for both URL matching and
URL generation.

## Configuring routes

By configuring routes you can let your application recognize arbitrary URL formats without modifying your existing
application code. You can configure routes in `/config/routes.php`. The structure of the file is the following:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/', [SiteController::class, 'index'])->name('site/index')
];
```

File returns an array of routes. When defining a route you start with a method corresponding to a certain
HTTP request type:

- get
- post
- put
- delete
- patch
- head
- options

If you need multiple methods, you can use `methods()`:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user/{id}', [SiteController::class, 'user'])->name('site/user')
];
```

If any method should match, use `anyMethod()`.

All these methods accept route pattern and a handler. Route pattern defines how the URL is matched when routing and
how URL is generated based on route name and parameters. You will learn about the actual syntax later in this guide.
A handler could be specified as:

- [Middleware](../structure/middleware.md) class name.
- Handler action (an array of [HandlerClass, handlerMethod]).
- A callable.

In case of a handler action, a class of type `HandlerClass` is instantiated and its `handlerMethod` is called:

```php
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class HandlerClass
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // ...
    }
}
```

A callable is called as is:

```php
static function (ServerRequestInterface $request, RequestHandlerInterface $next) use ($responseFactory) {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
}
```

For handler action and callable typed parameters are automatically injected using dependency
injection container passed to the route. Current request and handler could be obtained by
type-hinting for `ServerRequestInterface` and `RequestHandlerInterface`.

Additional handlers could be added to wrap primary one with `addMiddleware()` method:

```php
<?php

declare(strict_types=1);

use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET], '/download/{id}', [DownloadController::class, 'download'])
        ->name('download/id')
        ->addMiddleware(LimitDownloadRate::class)
];
```

Check ["middleware"](../structure/middleware.md) guide to learn more about how to implement middleware.

This is especially useful when grouping routes:

```php
Group::create('/api', [
    Route::get('/info/v2', ApiInfo::class)
        ->addMiddleware(FormatDataResponseAsJson::class)
        ->name('api/info/v2'),
    Route::get('/user', [ApiUserController::class, 'index'])
        ->name('api/user/index'),
    Route::get('/user/{login}', [ApiUserController::class, 'profile'])
        ->addMiddleware(FormatDataResponseAsJson::class)
        ->name('api/user/profile'),
])->addMiddleware(ApiDataWrapper::class)
```

In the above `ApiDataWrapper` will be executed before handling any URL starting with `/api`.

A route could be named with a `name()` method. It is a good idea to choose a route name based on handler name.

You can set a default value for a route parameter. For example:


```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user[/{id}]', [SiteController::class, 'user'])
        ->name('site/user')
        ->defaults(['id' => 42])
];
```

The configuration above would result in a match with both `/user` and `/user/123`. In both cases `$request` will
have `id` attribute filled. In the first case it will be default `42` and in the second case it will be specified `123`.

In cause URL should be valid for a single host, you can specify it with `host()`. 

## Routing <span id="routing"></span>

Yii routing is flexible and internally it may use different routing implementations. The actual matching algorithm may
vary, but the basic concept stays the same.

Routes defined in config are matched from top to bottom. If there is a match, further matching is not performed and
router executes route handler to get the response. If there is no match at all, handling is passed to the next 
middleware in the [application middleware stack](../structure/middleware.md). 

## Generating URLs <span id="generating-urls"></span>

In order to generate URL based on a route, a route should have a name:

```php
<?php

declare(strict_types=1);

use App\Controller\TestController;
use Yiisoft\Router\Route;

return [
    Route::get('/test', [TestController::class, 'index'])->name('test/index'),
    Route::post('/test/submit/{id}', [TestController::class, 'submit'])->name('test/submit')
];
```


The generation looks like the following:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\UrlGeneratorInterface;

class TestController extends AbstractController
{
    protected function name(): string
    {
        return 'test';
    }

    public function index(UrlGeneratorInterface $urlGenerator): ResponseInterface
    {
        $url = $urlGenerator->generate('test/submit', ['id' => 42]);
        // ...
    }
}
```

In the above code we obtain generator instance with the help of [automatic dependency injection](../concept/di-container.md)
that works with action handlers. In another service you can obtain the instance with similar constructor injection.
In views URL generator is available as `$url`.

Then we use `generate()` method to get actual URL. It accepts a route name and an array of named query parameters.
The above code will return "/test/submit/42". If you need absolute URL, use `generateAbsolute()` instead.

## Route patterns <span id="route-patterns"></span>

Route patterns used depend on underlying implementation used. Default the implementation
is [nikic/FastRoute](https://github.com/nikic/FastRoute).

Basic patterns are static like `/test`. That means they must match exactly in order for a route match.

### Named Parameters <span id="named-parameters"></span>

A pattern can include one or more named parameters which are specified in the pattern in the format
of `{ParamName:RegExp}`, where `ParamName` specifies the parameter name and `RegExp` is an optional regular
expression used to match parameter values. If `RegExp` is not specified, it means the parameter value should be
a string without any slash.

> Note: You can only use regular expressions inside of parameters. The rest of a pattern is considered plain text.

You cannot use capturing groups. For example `{lang:(en|de)}` is not a valid placeholder, because `()` is
a capturing group. Instead, you can use either `{lang:en|de}` or `{lang:(?:en|de)}`.

On a route match router fills the associated request attributes with values matching the corresponding parts of the URL.
When the rule is used to create a URL, it will take the values of the provided parameters and insert them at the
places where the parameters are declared.

Let's use some examples to illustrate how named parameters work. Assume we have declared the following three patterns:


1. `'posts/{year:\d{4}}/{category}`
2. `'posts'`
3. `'post/{id:\d+}'`

- `/posts` match second pattern;
- `/posts/2014/php` match first pattern. Parametres are the `year` whose value is 2014
  and the `category` whose value is `php`;
- `/post/100` match third pattern. The `id` parameter value is 100;
- `/posts/php` does not match.

When generating URLs the following parameters should be used:

```php
echo $url->generate('first', ['year' => 2020, 'category' => 'Virology']);
echo $url->generate('second');
echo $url->generate('third', ['id' => 42]);
```

### Optional parts <span id="optional-parts"></span>

Optional pattern parts are wrapped with `[` and `]`. For example, `/posts[/{id}]` pattern would match
both `http://example.com/posts` and `http://example.com/posts/42`. Router would fill `id` request attribute 
in the second case only. For this case default value could be specified:

```php
use \Yiisoft\Router\Route;

Route::get('/posts[/{id}]')->defaults(['id' => 1]);
```

Optional parts are only supported in a trailing position, not in the middle of a route.
