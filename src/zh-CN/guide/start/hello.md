# 说声 Hello

本节描述如何在应用程序中创建一个新的“Hello”页面。这是一个简单的页面，它会回显您传递给它的任何内容，或者如果没有传递任何内容，则显示“Hello!”。

为实现这个目标，您将定义一个路由并创建一个 [处理器](../structure/handler.md)
来完成工作并形成响应。然后您将改进它，使用[视图](../views/view.md)来构建响应。

通过本教程，您将学习三件事：

1. 如何创建处理器来响应请求。
2. 如何将 URL 映射到处理器。
3. 如何使用 [视图](../views/view.md) 来组成响应的内容。

## 创建处理器 <span id="creating-handler"></span>

对于“Hello”任务，您将创建一个处理器类，从请求中读取 `message` 参数并将该消息显示给用户。如果请求没有提供 `message`
参数，操作将显示默认的“Hello”消息。

创建 `src/Web/Echo/Action.php`：

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Html\Html;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Action
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

在您的示例中，`__invoke` 方法接收 `$message` 参数，借助 `RouteArgument` 属性从 URL 中获取消息。该值默认为
`“Hello!”`。如果请求发送到 `/say/Goodbye`，操作将值“Goodbye”赋给 `$message` 变量。

应用程序将响应通过[中间件栈](../structure/middleware.md)传递给发射器，由发射器将响应输出给最终用户。

## 配置路由器

现在，要将处理器映射到 URL，您需要在 `config/common/routes.php` 中添加路由：

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::get('/say[/{message}]')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

In the above, you map the `/say[/{message}]` pattern to
`\App\Web\Echo\Action`.  For a request, the router creates an instance and
calls the `__invoke()` method.  The `{message}` part of the pattern writes
anything specified in this place to the `message` route argument.  `[]`
marks this part of the pattern as optional.

您还为此路由指定了 `echo/say` 名称，以便能够生成指向它的 URL。

## 试试看 <span id="trying-it-out"></span>

创建操作和视图后，在浏览器中打开 `http://localhost/say/Hello+World`。

此 URL 显示一个包含“The message is: Hello World”的页面。

如果您在 URL 中省略 `message` 参数，页面将显示“The message is: Hello!”。

## 创建视图模板 <span id="creating-view-template"></span>

通常，任务比打印“hello world”更复杂，涉及渲染一些复杂的 HTML。对于这项任务，使用视图模板很方便。它们是您编写的用于生成响应主体的脚本。

对于“Hello”任务，创建一个 `src/Web/Echo/template.php` 模板，打印从操作方法接收的 `message` 参数：

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

在上面的代码中，`message` 参数在打印之前使用 HTML 编码。这是必要的，因为该参数来自最终用户，通过在参数中嵌入恶意 JavaScript
容易受到 [跨站脚本（XSS）攻击](https://en.wikipedia.org/wiki/Cross-site_scripting)。

当然，您可以在 `say` 视图中放置更多内容。内容可以由 HTML 标签、纯文本甚至 PHP 语句组成。实际上，视图服务将 `say` 视图作为
PHP 脚本执行。

要使用视图，您需要修改 `src/Web/Echo/Action.php`：

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template', [
            'message' => $message,
        ]);
    }
}
```

现在打开浏览器再次查看。您应该看到类似的文本，但已应用布局。

此外，您已将其工作方式与呈现方式分离。在较大的应用程序中，这对处理复杂性很有帮助。

## 总结 <span id="summary"></span>

在本节中，您接触了典型 Web
应用程序的处理器和模板部分。您创建了一个处理器类来处理特定请求。您还创建了一个视图来组成响应的内容。在这个简单的示例中，没有涉及数据源，因为使用的唯一数据是
`message` 参数。

您还了解了 Yii 中的路由，它充当用户请求和处理器之间的桥梁。

在下一节中，您将学习如何获取数据并添加一个包含 HTML 表单的新页面。
