# Routing and URL generation

Usually, a Yii application processes certain requests with certain handlers.
It selects a handler based on the request URL.
The part of the application that does the job is a router, and the process of selecting a handler, instantiating it
and running a handler method is *routing*.

The reverse process of routing is *URL generation*, which creates a URL from a given named route
and the associated query parameters.
When you later request the created URL, the routing process can resolve it back into the original route
and query parameters.

Routing and URL generation are separate services, but they use a common set of routes for both URL matching and
URL generation.

## Configuring routes

By configuring routes, you can let your application recognize arbitrary URL formats without modifying your existing
application code. You can configure routes in `/config/routes.php`. The structure of the file is the following:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')
        ->action([SiteController::class, 'index'])
        ->name('site/index')
];
```

The file returns an array of routes. When defining a route, you start with a method corresponding to a certain
HTTP request type:

- get
- post
- put
- delete
- patch
- head
- options

If you need many methods, you can use `methods()`:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user/{id}')
        ->action([SiteController::class, 'user'])
        ->name('site/user')
];
```

All these methods accept a route pattern and a handler.
The route pattern defines how the router matches the URL when routing and how it generates URL based on route name
and parameters.
You will learn about the actual syntax later in this guide.
You could specify a handler as:

- [Middleware](../structure/middleware.md) class name.
- Handler action (an array of [HandlerClass, handlerMethod]).
- A callable.

In case of a handler action, a class of type `HandlerClass` is instantiated and its `handlerMethod` is called:

```php
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

final readonly class HandlerClass
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // ...
    }
}
```

The callable is called as is:

```php
static function (ServerRequestInterface $request, RequestHandlerInterface $next) use ($responseFactory) {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
}
```

For handler action and callable typed parameters are automatically injected using the dependency
injection container passed to the route.

Get current request and handler by type-hinting for `ServerRequestInterface` and `RequestHandlerInterface`.
You could add extra handlers to wrap primary one with `middleware()` method:

```php
<?php

declare(strict_types=1);

use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET], '/download/{id}')
        ->action([DownloadController::class, 'download'])
        ->name('download/id')
        ->middleware(LimitDownloadRate::class)
];
```

Check ["the middleware"](../structure/middleware.md) guide to learn more about how to implement middleware.

This is especially useful when grouping routes:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/api')
        ->middleware(ApiDataWrapper::class)
        ->routes(
            Route::get('/info/v2')
                ->action(ApiInfo::class)
                ->name('api/info/v2')
                ->middleware(FormatDataResponseAsJson::class),            
            Route::get('/user')
                ->action([ApiUserController::class, 'index'])
                ->name('api/user/index'),
            Route::get('/user/{login}')
                ->action([ApiUserController::class, 'profile'])
                ->middleware(FormatDataResponseAsJson::class)
                ->name('api/user/profile'),
        )
];
```

Router executes `ApiDataWrapper` before handling any URL starting with `/api`.

You could name a route with a `name()` method. It's a good idea to choose a route name based on the handler's name.

You can set a default value for a route parameter. For example:


```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user[/{id}]')
        ->action([SiteController::class, 'user'])
        ->name('site/user')
        ->defaults(['id' => '42'])
];
```

This configuration would result in a match with both `/user` and `/user/123`.
In both cases `CurrentRoute` service will contain `id` argument filled.
In the first case it will be default `42` and in the second case it will be `123`.

In cause URL should be valid for a single host, you can specify it with `host()`. 

## Routing <span id="routing"></span>

Yii routing is flexible, and internally it may use different routing implementations.
The actual matching algorithm may vary, but the basic idea stays the same.

Router matches routes defined in config from top to bottom.
If there is a match, further matching isn't performed and
the router executes the route handler to get the response.
If there is no match at all, router passes handling to the next 
middleware in the [application middleware set](../structure/middleware.md). 

## Generating URLs <span id="generating-urls"></span>

To generate URL based on a route, a route should have a name:

```php
<?php

declare(strict_types=1);

use App\Controller\TestController;
use Yiisoft\Router\Route;

return [
    Route::get('/test', [TestController::class, 'index'])
        ->name('test/index'),
    Route::post('/test/submit/{id}', [TestController::class, 'submit'])
        ->name('test/submit')
];
```


The generation looks like the following:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class TestController extends AbstractController
{
    protected function name(): string
    {
        return 'test';
    }

    public function index(UrlGeneratorInterface $urlGenerator): ResponseInterface
    {
        $url = $urlGenerator->generate('test/submit', ['id' => '42']);
        // ...
    }
}
```

In the above code, we get a generator instance with the help of [automatic dependency injection](../concept/di-container.md)
that works with action handlers.
In another service, you can get the instance with similar constructor injection.
In views URL generator is available as `$url`.

Then we use `generate()` method to get actual URL. It accepts a route name and an array of named query parameters.
The code will return "/test/submit/42." If you need absolute URL, use `generateAbsolute()` instead.

## Route patterns <span id="route-patterns"></span>

Route patterns used depend on the underlying implementation used.
The default implementation is [nikic/FastRoute](https://github.com/nikic/FastRoute).

Basic patterns are static like `/test`. That means they must match exactly in order for a route match.

### Named Parameters <span id="named-parameters"></span>

A pattern can include one or more named parameters which are specified in the pattern in the format
of `{ParamName:RegExp}`, where `ParamName` specifies the parameter name and `RegExp` is an optional regular
expression used to match parameter values.
If `RegExp` isn't specified, it means the parameter value should be a string without any slash.

> [!NOTE]
> You can only use regular expressions inside parameters. The rest of the pattern is considered plain text.

You can't use capturing groups. For example `{lang:(en|de)}` isn't a valid placeholder, because `()` is
a capturing group. Instead, you can use either `{lang:en|de}` or `{lang:(?:en|de)}`.

On a route match router fills the associated request attributes with values matching the corresponding parts of the URL.
When you use the rule to create a URL, it will take the values of the provided parameters and insert them at the
places where the parameters are declared.

Let's use some examples to illustrate how named parameters work. Assume you've declared the following three patterns:


1. `'posts/{year:\d{4}}/{category}`
2. `'posts'`
3. `'post/{id:\d+}'`

- `/posts` match the second pattern;
- `/posts/2014/php` match a first pattern. Parameters are the `year` whose value is 2014
  and the `category` whose value is `php`;
- `/post/100` match a third pattern. The `id` parameter value is 100;
- `/posts/php` doesn't match.

When generating URLs, you should use the following parameters:

```php
echo $url->generate('first', ['year' => '2020', 'category' => 'Virology']);
echo $url->generate('second');
echo $url->generate('third', ['id' => '42']);
```

### Optional parts <span id="optional-parts"></span>

You should wrap optional pattern parts with `[` and `]`.
For example, `/posts[/{id}]` pattern would match
both `http://example.com/posts` and `http://example.com/posts/42`.
Router would fill `id` argument of `CurrentRoute` service in the second case only.
In this case, you could specify the default value:

```php
use \Yiisoft\Router\Route;

Route::get('/posts[/{id}]')->defaults(['id' => '1']);
```

Optional parts are only supported in a trailing position, not in the middle of a route.
