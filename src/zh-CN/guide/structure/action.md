# 动作

在 Web 应用程序中，请求 URL
决定了要执行的内容。匹配由配置了多条路由的路由器完成。每条路由可以绑定一个中间件，该中间件接收请求并产生响应。由于中间件可以链式调用并将实际处理传递给下一个中间件，我们将真正执行任务的中间件称为动作。

描述动作有多种方式，最简单的是使用闭包：

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\Route;

Route::get('/')->action(function (ServerRequestInterface $request) use ($responseFactory): ResponseInterface {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
});
```

对于简单的处理，这种方式完全可以，但更复杂的处理通常需要获取依赖，因此将处理逻辑移至类方法是一个好主意。为此可以使用回调中间件：

```php
use Yiisoft\Router\Route;

Route::get('/')->action(FrontPageAction::class),
```

该类的结构如下：

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

final readonly class FrontPageAction
{
    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        // build response for a front page    
    }
}
```

在许多情况下，将多条路由的处理逻辑归入一个类是合理的：


```php
use Yiisoft\Router\Route;

Route::get('/post/index')->action([PostController::class, 'actionIndex']),
Route::get('/post/view/{id:\d+}')->action([PostController::class, 'actionView']),
```

该类的结构如下所示：

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class PostController
{
    public function actionIndex(ServerRequestInterface $request): ResponseInterface
    {
        // render posts list
    }
    
    
    public function actionView(
        ServerRequestInterface $request,
        #[RouteArgument('id')]
        int $id,
    ): ResponseInterface
    {
        // render a single post by $id
    }
}
```

我们通常将这样的类称为“控制器”。

The `{id}` part of the `/post/view/{id:\d+}` route is a named route
parameter. Route parameters are available from
`Yiisoft\Router\CurrentRoute`. To receive one as an action argument, add the
`RouteArgument` attribute to the corresponding parameter. The attribute name
should match the route parameter name.

## 自动注入

动作类的构造函数和动作方法都可以自动从
 依赖注入容器中获取服务：

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;

final readonly class PostController
{
    public function __construct(
        private PostRepository $postRepository
    )
    {
    }

    public function actionIndex(ServerRequestInterface $request, LoggerInterface $logger): ResponseInterface
    {
        $logger->debug('Rendering posts list');
        // render posts list
    }
    
    
    public function actionView(ServerRequestInterface $request): ResponseInterface
    {
        // render a single post      
    }
}
```

在上面的示例中，`PostRepository` 通过构造函数自动注入，因此在每个动作中都可用。而 Logger 仅注入到 `index` 动作中。
