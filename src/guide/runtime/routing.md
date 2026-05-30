# Routing and URL generation

Usually, a Yii application processes certain requests with certain handlers.
It selects a handler based on the request URL.
The part of the application that does the job is a router, and the process of selecting a handler, instantiating it
and running a handler method is *routing*.

The reverse process of routing is *URL generation*, which creates a URL from a given named route,
route arguments, and query parameters.
When you later request the created URL, the routing process can resolve it back into the original route
arguments and query parameters.

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

All these methods accept a route pattern.
The route pattern defines how the router matches the URL when routing and how it generates URL based on route name
and parameters.
You will learn about the actual syntax later in this guide.
Specify a handler with `action()` as:

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

### Route arguments in actions

Named route parameters are stored in `CurrentRoute`.
To pass a route parameter to an action method parameter, use the `RouteArgument` attribute:

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\Route;

return [
    Route::get('/post/{id:\d+}')
        ->action([PostController::class, 'view'])
        ->name('post/view')
];

final readonly class PostController
{
    public function view(#[RouteArgument('id')] int $id): ResponseInterface
    {
        // $id contains the value from the {id} route parameter.
    }
}
```

If a parameter has the same name as the action parameter, you can omit the attribute name:

```php
public function view(#[RouteArgument] int $id): ResponseInterface
{
    // ...
}
```

You can also inject `CurrentRoute` into an action or a service when you need several arguments or route metadata:

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\CurrentRoute;

final readonly class PostController
{
    public function view(CurrentRoute $currentRoute): ResponseInterface
    {
        $id = $currentRoute->getArgument('id');
        $routeName = $currentRoute->getName();

        // ...
    }
}
```

Route arguments aren't request attributes.
Read them from `CurrentRoute` or action parameters marked with `RouteArgument`.

For optional route parameters, provide a default value either in the route with `defaults()` or in the action method
signature.

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
                ->middleware(JsonDataResponseMiddleware::class),
            Route::get('/user')
                ->action([ApiUserController::class, 'index'])
                ->name('api/user/index'),
            Route::get('/user/{login}')
                ->action([ApiUserController::class, 'profile'])
                ->middleware(JsonDataResponseMiddleware::class)
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

### Automatic OPTIONS responses

When the request path matches a route but the HTTP method doesn't, router returns a `405 Method Not Allowed`
response with an `Allow` header:

```http
HTTP/1.1 405 Method Not Allowed
Allow: GET
```

For an `OPTIONS` request to the same path, router returns an empty `204 No Content` response with the same
`Allow` header:

```http
HTTP/1.1 204 No Content
Allow: GET
```

This response is generated from the configured routes before the route action runs.
If an API endpoint needs CORS headers, attach CORS middleware to a route group:

```php
<?php

declare(strict_types=1);

use App\Api\CorsMiddleware;
use App\Api\PostController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/api')
        ->withCors(CorsMiddleware::class)
        ->routes(
            Route::methods([Method::GET, Method::POST], '/posts')
                ->action([PostController::class, 'index'])
                ->name('api/posts')
        )
];
```

## Generating URLs <span id="generating-urls"></span>

To generate URL based on a route, a route should have a name:

```php
<?php

declare(strict_types=1);

use App\Controller\TestController;
use Yiisoft\Router\Route;

return [
    Route::get('/test')
        ->action([TestController::class, 'index'])
        ->name('test/index'),
    Route::post('/test/submit/{id}')
        ->action([TestController::class, 'submit'])
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

Then we use `generate()` method to get the actual URL.
It accepts a route name, route arguments, query parameters, and a hash fragment.
The code will return `/test/submit/42`.

Route arguments are used to fill placeholders in the route pattern.
Arguments that aren't used in the pattern are added to the query string when the query parameters array doesn't
already contain the same name:

```php
$url = $urlGenerator->generate(
    'test/submit',
    ['id' => '42', 'utm' => 'newsletter'],
    ['page' => '1']
);
// $url is "/test/submit/42?page=1&utm=newsletter".
```

If you need absolute URL, use `generateAbsolute()` instead.

### Generating URL from the current route

Use `generateFromCurrent()` when a link should keep the current route and most of its arguments.
For example, a detail page can link to another page number while keeping the current route name and `id` argument:

```php
$url = $urlGenerator->generateFromCurrent(['page' => '2']);
```

The method also keeps query parameters from the current request.
Pass explicit query parameters when a link should replace or add query string values.

### Pagination URLs

For most lists, keep the page number in the query string. This works well when the same list also has filters, sorting,
or search terms because all list state stays in one place:

```php
<?php

declare(strict_types=1);

use App\Web\Article\IndexAction;
use Yiisoft\Router\Route;

return [
    Route::get('/articles')
        ->action(IndexAction::class)
        ->name('article/index'),
];
```

Generate pagination links by passing the page number as a query parameter:

```php
$url = $urlGenerator->generate('article/index', [], [
    'page' => '2',
    'tag' => 'yii',
]);
// $url is "/articles?page=2&tag=yii".
```

When the user changes only the page number, preserve the current filters and replace `page`:

```php
$query = $request->getQueryParams();
$query['page'] = (string) $nextPage;

$url = $urlGenerator->generate('article/index', [], $query);
// For "/articles?tag=yii&sort=created_at&page=1" and $nextPage = 3,
// $url is "/articles?tag=yii&sort=created_at&page=3".
```

If page URLs are part of a public archive structure and don't need many other list parameters, put the page number in
the route path:

```php
<?php

declare(strict_types=1);

use App\Web\Article\IndexAction;
use Yiisoft\Router\Route;

return [
    Route::get('/articles/page/{page:\d+}')
        ->action(IndexAction::class)
        ->name('article/page'),
];
```

Then generate the URL with `page` as a route argument:

```php
$url = $urlGenerator->generate('article/page', ['page' => '2'], [
    'tag' => 'yii',
]);
// $url is "/articles/page/2?tag=yii".
```

Choose one canonical URL shape for the same list. If both `/articles?page=2` and `/articles/page/2` render identical
content, redirect one form to the other or add a canonical link in the page head.

### Locale-based URLs

When the locale is part of the URL path, define it as a route argument.
For a Yii application with routes in `config/common/routes.php`, wrap localized routes in a group with a locale
parameter:

```php
<?php

declare(strict_types=1);

use App\Web\HomePage\Action as HomePageAction;
use App\Web\Post\ViewAction as PostViewAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/{_locale:en-US|de}')
        ->routes(
            Route::get('/')
                ->action(HomePageAction::class)
                ->name('home'),
            Route::get('/posts/{slug}')
                ->action(PostViewAction::class)
                ->name('post/view')
        )
];
```

The route `/de/posts/welcome` matches the `post/view` route and stores `_locale` as a route argument with the `de`
value.

In middleware that chooses the request locale, read this argument from `CurrentRoute`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Translator\TranslatorInterface;
use Yiisoft\View\WebView;

final readonly class LocaleMiddleware implements MiddlewareInterface
{
    private const DEFAULT_LOCALE = 'en-US';

    public function __construct(
        private CurrentRoute $currentRoute,
        private TranslatorInterface $translator,
        private UrlGeneratorInterface $urlGenerator,
        private WebView $view,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $locale = $this->currentRoute->getArgument('_locale', self::DEFAULT_LOCALE);

        $this->translator->setLocale($locale);
        $this->view->setLocale($locale);
        $this->urlGenerator->setDefaultArgument('_locale', $locale);

        return $handler->handle($request);
    }
}
```

Register this middleware in the localized route group before the route action:

```php
use App\Web\HomePage\Action as HomePageAction;
use App\Web\Middleware\LocaleMiddleware;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/{_locale:en-US|de}')
        ->middleware(LocaleMiddleware::class)
        ->routes(
            Route::get('/')
                ->action(HomePageAction::class)
                ->name('home')
        )
];
```

After the middleware sets the default `_locale` argument, URL generation can omit it:

```php
$url = $urlGenerator->generate('post/view', ['slug' => 'welcome']);
// On a German page, $url is "/de/posts/welcome".
```

For a language switcher, use `generateFromCurrent()` and replace only the locale argument:

```php
$url = $urlGenerator->generateFromCurrent(
    ['_locale' => 'en-US'],
    fallbackRouteName: 'home'
);
```

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

On a route match router fills `CurrentRoute` arguments with values matching the corresponding parts of the URL.
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
