# Handling errors

Yii has a [yiisoft/error-handler](https://github.com/yiisoft/error-handler) package that makes error handling
a much more pleasant experience than before. In particular, the Yii error handler provides the following:

- [PSR-15](https://www.php-fig.org/psr/psr-15/) middleware for catching unhandled errors.
- PSR-15 middleware for mapping certain exceptions to custom responses.
- Production and debug modes.
- Debug mode displays details, stacktrace, has dark and light themes and handy buttons to search for error without typing.
- Takes PHP settings into account.
- Handles out of memory errors, fatal errors, warnings, notices, and exceptions.
- Can use any [PSR-3](https://www.php-fig.org/psr/psr-3/) compatible logger for error logging.
- Detects a response format based on a mime type of the request.
- Supports responding with HTML, plain text, JSON, XML, and headers out of the box.
- You can implement your own error rendering for extra types.

This guide describes how to use the error handler in the [Yii framework](https://www.yiiframework.com/),
for information about using it separate from Yii, see the [package description](https://github.com/yiisoft/error-handler).

## Using error handler

The error handler consists of two parts. One part is `Yiisoft\ErrorHandler\Middleware\ErrorCatcher` middleware that,
when registered, catches exceptions that may appear during middleware stack execution and passes them to the handler.
Another part is the error handler itself, `Yiisoft\ErrorHandler\ErrorHandler`, that's catching exceptions occurring
outside the middleware stack and fatal errors. The handler also converts warnings and notices to exceptions and does
more handy things.

Error handler is registered in the application itself. Usually it happens in `ApplicationRunner`. By default, the handler 
configuration comes from the container. You may configure it in the application configuration, 
`config/web.php` like the following:

```php
use Psr\Log\LoggerInterface;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\ErrorHandler\ThrowableRendererInterface;

return [
    // ...
    ErrorHandler::class => static function (LoggerInterface $logger, ThrowableRendererInterface $renderer) {
        $errorHandler = new ErrorHandler($logger, $renderer);
        // Set the size of the reserved memory to 512 KB. Defaults to 256KB.
        $errorHandler->memoryReserveSize(524_288);
        return $errorHandler;
    },
    
    ThrowableRendererInterface::class => static fn () => new HtmlRenderer([
        // Defaults to the package file "templates/production.php".
        'template' => '/full/path/to/production/template/file',
        // Defaults to package file "templates/development.php".
        'verboseTemplate' => '/full/path/to/development/template/file',
        // Maximum number of source code lines to be displayed. Defaults to 19.
        'maxSourceLines' => 20,
        // Maximum number of trace source code lines to be displayed. Defaults to 13.
        'maxTraceLines' => 5,
        // Trace the header line with placeholders (file, line, icon) to be substituted. Defaults to `null`.
        'traceHeaderLine' => '<a href="ide://open?file={file}&line={line}">{icon}</a>',
    ]),
    // ...
];
```

As aforementioned, the error handler turns all non-fatal PHP errors into catchable exceptions
(`Yiisoft\ErrorHandler\Exception\ErrorException`). This means you can use the following code to deal with PHP errors:

```php
try {
    10 / 0;
} catch (\Yiisoft\ErrorHandler\Exception\ErrorException $e) {
    // Write a log or something else.
}
// execution continues...
```

The package has another middleware, `Yiisoft\ErrorHandler\Middleware\ExceptionResponder`.
This middleware maps certain exceptions to custom responses. Configure it in the application configuration as follows:

```php
use Psr\Http\Message\ResponseFactoryInterface;
use Yiisoft\ErrorHandler\Middleware\ExceptionResponder;
use Yiisoft\Injector\Injector;

return [
    // ...
    ExceptionResponder::class => static function (ResponseFactoryInterface $responseFactory, Injector $injector) {
        $exceptionMap = [
            // Status code with which the factory creates the response.
            MyNotFoundException::class => 404,
            // PHP callable that must return a `Psr\Http\Message\ResponseInterface`.
            MyHttpException::class => static fn (MyHttpException $exception) => new MyResponse($exception),
            // ...
        ];
        
        return new ExceptionResponder($exceptionMap, $responseFactory, $injector);
    },
];
```

Note that when configuring application middleware stack,
you must place `Yiisoft\ErrorHandler\Middleware\ExceptionResponder` before `Yiisoft\ErrorHandler\Middleware\ErrorCatcher`.

## Rendering error data

One of the renderers could render error data into a certain format.
The following renderers are available out of the box:

- `Yiisoft\ErrorHandler\Renderer\HeaderRenderer` - Renders error into HTTP headers. It's used for `HEAD` request.
- `Yiisoft\ErrorHandler\Renderer\HtmlRenderer` - Renders error into HTML.
- `Yiisoft\ErrorHandler\Renderer\JsonRenderer` - Renders error into JSON.
- `Yiisoft\ErrorHandler\Renderer\PlainTextRenderer` - Renders error into plain text.
- `Yiisoft\ErrorHandler\Renderer\XmlRenderer` - Renders error into XML.

The renderer produces detailed error data depending on whether debug mode is enabled or disabled.

An Example of header rendering with a debugging mode turned off:

```
...
X-Error-Message: An internal server error occurred.
...
```

An Example of header rendering with a debugging mode turned on:

```
...
X-Error-Type: Error
X-Error-Message: Call to undefined function App\Controller\myFunc()
X-Error-Code: 0
X-Error-File: /var/www/yii/app/src/Controller/SiteController.php
X-Error-Line: 21
...
```

Example of JSON rendering output with a debugging mode turned off:

```json
{"message":"An internal server error occurred."}
```

An Example of JSON rendering output with debugging mode turned on:

```json
{
    "type": "Error",
    "message": "Call to undefined function App\\Controller\\myFunc()",
    "code": 0,
    "file": "/var/www/yii/app/src/Controller/SiteController.php",
    "line": 21,
    "trace": [
        {
            "function": "index",
            "class": "App\\Controller\\SiteController",
            "type": "->"
        },
        {
            "file": "/var/www/yii/app/vendor/yiisoft/injector/src/Injector.php",
            "line": 63,
            "function": "invokeArgs",
            "class": "ReflectionFunction",
            "type": "->"
        },
        ...
    ]
}
```

Example of HTML rendering with debugging mode turned off:

![View production](/images/guide/runtime/view-production.png)

Example of HTML rendering with debugging mode on and a light theme:

![View development with light theme](/images/guide/runtime/view-development-light.png)

Example of HTML rendering with debugging mode on and a dark theme:

![View development with dark theme](/images/guide/runtime/view-development-dark.png)

The error catcher chooses how to render an exception based on `accept` HTTP header.
If it's `text/html` or any unknown content type, it will use the error or exception HTML template to display errors.
For other mime types, the error handler will choose different renderers registered in a renderer provider.
By default, it supports JSON, XML, and plain text.

### Implementing your own renderer

You may customize the error response format by implementing `Yiisoft\ErrorHandler\ThrowableRendererInterface`.
The renderer converts a throwable into `Yiisoft\ErrorHandler\ErrorData`, which contains the response body and headers.

```php
use Psr\Http\Message\ServerRequestInterface;
use Throwable;
use Yiisoft\ErrorHandler\ErrorData;
use Yiisoft\ErrorHandler\ThrowableRendererInterface;
use Yiisoft\Http\Header;

final readonly class MyRenderer implements ThrowableRendererInterface
{
    public function render(Throwable $t, ?ServerRequestInterface $request = null): ErrorData
    {
        return new ErrorData(
            '{"message":"An internal server error occurred."}',
            [Header::CONTENT_TYPE => 'application/problem+json'],
        );
    }

    public function renderVerbose(Throwable $t, ?ServerRequestInterface $request = null): ErrorData
    {
        return new ErrorData(
            json_encode(
                [
                    'type' => $t::class,
                    'message' => $t->getMessage(),
                    'file' => $t->getFile(),
                    'line' => $t->getLine(),
                ],
                JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES,
            ),
            [Header::CONTENT_TYPE => 'application/problem+json'],
        );
    }
}
```

Register the renderer in `config/common/di/error-handler.php`:

```php
use Psr\Container\ContainerInterface;
use App\Error\MyRenderer;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\ErrorHandler\Renderer\JsonRenderer;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\ErrorHandler\Renderer\XmlRenderer;
use Yiisoft\ErrorHandler\RendererProvider\CompositeRendererProvider;
use Yiisoft\ErrorHandler\RendererProvider\ContentTypeRendererProvider;
use Yiisoft\ErrorHandler\RendererProvider\HeadRendererProvider;
use Yiisoft\ErrorHandler\ThrowableResponseFactory;
use Yiisoft\ErrorHandler\ThrowableResponseFactoryInterface;

return [
    ThrowableResponseFactoryInterface::class => [
        'class' => ThrowableResponseFactory::class,
        '__construct()' => [
            'rendererProvider' => DynamicReference::to(
                static fn (ContainerInterface $container) => new CompositeRendererProvider(
                    new HeadRendererProvider(),
                    new ContentTypeRendererProvider($container, [
                        'application/problem+json' => MyRenderer::class,
                        'application/json' => JsonRenderer::class,
                        'application/xml' => XmlRenderer::class,
                        'text/xml' => XmlRenderer::class,
                        'text/plain' => PlainTextRenderer::class,
                        'text/html' => HtmlRenderer::class,
                        '*/*' => HtmlRenderer::class,
                    ]),
                ),
            ),
        ],
    ],
];
```

The `renderers` array maps `Accept` header content types to renderer class names. When you provide this array, it
replaces the default map, so include the default renderer classes you still need.

## Friendly exceptions

Yii error renderer supports [friendly exceptions](https://github.com/yiisoft/friendly-exception) that make
error handling an even more pleasant experience for your team. The idea is to offer a readable name and possible
solutions to the problem:

```php
use Yiisoft\FriendlyException\FriendlyExceptionInterface;

final readonly class RequestTimeoutException extends \RuntimeException implements FriendlyExceptionInterface
{
    public function getName(): string
    {
        return 'Request timed out';
    }
    
    public function getSolution(): ?string
    {
        return <<<'SOLUTION'
Likely it is a result of resource request is not responding in a timely fashion. Try increasing timeout.
SOLUTION;
    }
}
```

When the application throws such an exception,
the error renderer would display the name and the solution if the debug mode is on.
