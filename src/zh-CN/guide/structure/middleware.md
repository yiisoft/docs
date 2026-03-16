# 中间件

Yii 通过基于 [PSR-7 HTTP 消息接口](https://www.php-fig.org/psr/psr-7/) 和 [PSR-15
请求处理器/中间件接口](https://www.php-fig.org/psr/psr-15/) 构建的抽象层来处理 HTTP。

应用程序由一个或多个中间件组成。中间件在请求和响应之间运行。当 URL
被请求时，请求对象被传递给中间件调度器，后者开始逐个执行中间件。每个中间件在给定请求的情况下可以：

- 将请求传递给下一个中间件，并在其之前/之后执行一些工作。
- 形成响应并返回它。

根据所使用的中间件，应用程序的行为可能会有很大差异。

![中间件](/images/guide/middleware.svg)

在上图中，每个后续中间件都包裹着前一个中间件。或者，它也可以如下所示：

![中间件](/images/guide/middleware_alternative.svg)

## 使用中间件

任何与 [PSR-15](https://www.php-fig.org/psr/psr-15/) 兼容的中间件都可以与 Yii
一起使用，而且有很多。比如，您需要为应用程序的某个 URL 添加基本身份验证。依赖 URL 的中间件使用路由器配置，因此您需要修改路由器工厂。

身份验证中间件由 `middlewares/http-authentication` 包实现，因此在应用程序根目录中执行 `composer
require middlewares/http-authentication`。

现在在 DI 容器配置 `config/web.php` 中注册中间件：

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

在 `config/routes.php` 中，添加新路由：

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Route;
use App\Controller\SiteController;
use Middlewares\BasicAuthentication;


return [
    //...
    Route::get('/basic-auth')
        ->action([SiteController::class, 'auth'])
        ->name('site/auth')
        ->prependMiddleware(BasicAuthentication::class)
];
```

配置路由时，您将 `/basic-auth` URL 绑定到由基本身份验证和操作本身组成的中间件链。链是一种特殊的中间件，它执行其配置的所有中间件。

操作本身可以如下所示：

```php
public function auth(ServerRequestInterface $request): ResponseInterface
{
    $response = $this->responseFactory->createResponse();
    $response->getBody()->write('Hi ' . $request->getAttribute('username'));
    return $response;
}
```

基本身份验证中间件将 `username` 写入请求属性，因此您可以在需要时访问该数据。

要将中间件应用于整个应用程序（不考虑 URL），请调整 `config/application.php`：

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

## 创建自己的中间件

要创建中间件，您需要实现 `Psr\Http\Server\MiddlewareInterface` 的单个 `process` 方法：

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface;
```

处理请求有多种方式，选择哪种取决于中间件应实现的目标。

### 直接形成响应

要直接响应，需要通过构造函数传递响应工厂：

```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class RespondingMiddleware implements MiddlewareInterface
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory
    )
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

### 将处理委托给下一个中间件

如果中间件既不打算形成响应或更改请求，也无法在此时执行任何操作，
则可以将处理留给栈中的下一个中间件：

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    return $handler->handle($request);    
}
```

如果您需要将数据传递给下一个中间件，可以使用请求属性：

```php
$request = $request->withAttribute('answer', 42);
return $handler->handle($request);
``` 

要在下一个中间件中获取它：

```php
$answer = $request->getAttribute('answer');
```

### 捕获响应以操作它

您可能希望捕获响应以对其进行操作。这对于添加 CORS 标头、gzip 压缩内容等非常有用。

```php
$response = $handler->handle($request);
// extra handing
return $response;
```
