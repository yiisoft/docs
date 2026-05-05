# 路由与 URL 生成

通常，Yii 应用程序使用特定的处理器处理特定的请求。它根据请求 URL
选择处理器。应用程序中负责此工作的部分是路由器，而选择处理器、实例化并调用处理器方法的过程就是*路由*。

路由的逆过程是 *URL 生成*，它根据给定的命名路由和相关查询参数创建 URL。当您之后请求所生成的 URL
时，路由过程可以将其解析回原始路由和查询参数。

路由和 URL 生成是独立的服务，但它们共用同一套路由配置来进行 URL 匹配和 URL 生成。

## 配置路由

通过配置路由，您可以让应用程序识别任意 URL 格式，而无需修改现有应用代码。您可以在 `/config/routes.php`
中配置路由，文件结构如下：

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

该文件返回一个路由数组。定义路由时，您从与某种 HTTP 请求类型对应的方法开始：

- get
- post
- put
- delete
- patch
- head
- options

如果需要支持多个方法，可以使用 `methods()`：

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

所有这些方法都接受一个路由模式和一个处理器。路由模式定义了路由器在匹配 URL 时的规则，以及如何根据路由名称和参数生成
URL。本指南后续将介绍具体语法。处理器可以指定为：

- [中间件](../structure/middleware.md) 类名。
- 处理器操作（`[HandlerClass, handlerMethod]` 数组）。
- 可调用对象。

当使用处理器操作时，会实例化 `HandlerClass` 类型的类并调用其 `handlerMethod`：

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

可调用对象直接被调用：

```php
static function (ServerRequestInterface $request, RequestHandlerInterface $next) use ($responseFactory) {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
}
```

对于处理器操作和可调用对象，类型化参数会通过传递给路由的依赖注入容器自动注入。

Get current request and handler by type-hinting for `ServerRequestInterface`
and `RequestHandlerInterface`.

### Route arguments in actions

Named route parameters are stored in `CurrentRoute`. To pass a route
parameter to an action method parameter, use the `RouteArgument` attribute:

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

For optional route parameters, provide a default value either in the route
with `defaults()` or in the action method signature.

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

查阅[“中间件”](../structure/middleware.md)指南，了解更多关于如何实现中间件的内容。

在对路由进行分组时，这尤其有用：

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

路由器在处理任何以 `/api` 开头的 URL 之前，都会先执行 `ApiDataWrapper`。

您可以使用 `name()` 方法为路由命名。建议根据处理器的名称来选择路由名称。

您可以为路由参数设置默认值，例如：


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

此配置将同时匹配 `/user` 和 `/user/123`。两种情况下，`CurrentRoute` 服务都会填充 `id`
参数。第一种情况使用默认值 `42`，第二种情况使用 `123`。

如果 URL 只对特定主机有效，可以使用 `host()` 指定主机。

## 路由 <span id="routing"></span>

Yii 路由非常灵活，内部可以使用不同的路由实现。实际的匹配算法可能有所不同，但基本思路是一致的。

路由器从上到下匹配配置中定义的路由。一旦匹配成功，就不再继续匹配，路由器会执行路由处理器以获取响应。如果完全没有匹配，路由器会将处理传递给[应用中间件集合](../structure/middleware.md)中的下一个中间件。

## 生成 URL <span id="generating-urls"></span>

要根据路由生成 URL，路由必须有名称：

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


生成方式如下：

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

在上述代码中，我们借助适用于操作处理器的[自动依赖注入](../concept/di-container.md)获取生成器实例。在其他服务中，可以通过类似的构造函数注入获取实例。在视图中，URL
生成器以 `$url` 变量的形式提供。

然后使用 `generate()` 方法获取实际 URL，它接受路由名称和一个命名查询参数数组。上述代码将返回
"/test/submit/42"。如果需要绝对 URL，请改用 `generateAbsolute()`。

## 路由模式 <span id="route-patterns"></span>

所使用的路由模式取决于底层实现。默认实现为 [nikic/FastRoute](https://github.com/nikic/FastRoute)。

基本模式是静态的，如 `/test`，这意味着必须完全匹配才能成功路由。

### 命名参数 <span id="named-parameters"></span>

模式中可以包含一个或多个命名参数，格式为 `{ParamName:RegExp}`，其中 `ParamName` 指定参数名称，`RegExp`
是用于匹配参数值的可选正则表达式。如果未指定 `RegExp`，则表示参数值应为不含斜杠的字符串。

> [!NOTE]
> 您只能在参数内部使用正则表达式，模式的其余部分被视为纯文本。

不能使用捕获组。例如 `{lang:(en|de)}` 不是有效的占位符，因为 `()` 是捕获组。应改用 `{lang:en|de}` 或
`{lang:(?:en|de)}`。

On a route match router fills `CurrentRoute` arguments with values matching
the corresponding parts of the URL.  When you use the rule to create a URL,
it will take the values of the provided parameters and insert them at the
places where the parameters are declared.

让我们通过示例来说明命名参数的工作方式。假设您声明了以下三个模式：


1. `'posts/{year:\d{4}}/{category}`
2. `'posts'`
3. `'post/{id:\d+}'`

- `/posts` 匹配第二个模式；
- `/posts/2014/php` 匹配第一个模式，参数 `year` 的值为 2014，`category` 的值为 `php`；
- `/post/100` 匹配第三个模式，`id` 参数值为 100；
- `/posts/php` 不匹配任何模式。

生成 URL 时，应使用以下参数：

```php
echo $url->generate('first', ['year' => '2020', 'category' => 'Virology']);
echo $url->generate('second');
echo $url->generate('third', ['id' => '42']);
```

### 可选部分 <span id="optional-parts"></span>

可选模式部分应用 `[` 和 `]` 包裹。例如，`/posts[/{id}]` 模式可以同时匹配 `http://example.com/posts`
和 `http://example.com/posts/42`。路由器只在第二种情况下填充 `CurrentRoute` 服务的 `id`
参数。此时可以指定默认值：

```php
use \Yiisoft\Router\Route;

Route::get('/posts[/{id}]')->defaults(['id' => '1']);
```

可选部分只支持在路由末尾，不支持在路由中间。
