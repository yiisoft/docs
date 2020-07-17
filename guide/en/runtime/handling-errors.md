# Handling errors

Yii web includes a built-in [[\Yiisoft\Yii\Web\ErrorHandler\ErrorHandler|error handler]] which makes error handling
a much more pleasant experience than before. In particular, the Yii error handler does the following to improve error handling:

* All non-fatal PHP errors (e.g. warnings, notices) are converted into catchable exceptions.
* Exceptions and fatal PHP errors, even out of memory ones, are displayed with detailed call stack information
and source code lines in verbose mode.
* Supports different error response formats.

## Using error handler <span id="using-error-handler"></span>

The error handler consists of two parts. One part is `Yiisoft\Yii\Web\ErrorHandler\ErrorCatcher` middleware that,
when registered, catches exceptions that appear during middleware stack execution and passes them to the handler.
Another part is the error handler itself that is catching fatal errors, exceptions occurring outside of the middleware stack,
converts warnings and notices to exceptions and more.

The error handler is registered by an application and its configuration by default comes from the container. 
You may configure it in the application configuration, `config/web.php` like the following:

```php
use \Yiisoft\Yii\Web\ErrorHandler\ErrorHandler;
use \Yiisoft\Yii\Web\ErrorHandler\ThrowableRendererInterface;
use \Psr\Log\LoggerInterface;
use \Yiisoft\Yii\Web\ErrorHandler\HtmlRenderer;
use Psr\Container\ContainerInterface;

return [
    
    ErrorHandler::class => function (ContainerInterface $container) {
        $logger = $container->get(LoggerInterface::class);
        $defaultRenderer = $container->get(ThrowableRendererInterface::class);
        $errorHandler = new ErrorHandler($logger, $defaultRenderer);
        return $errorHandler;

        // or the following for production environments
        // return $errorHandler->withoutExposedDetails();
    },
    HtmlRenderer::class => function (ContainerInterface $container) {
        return (new HtmlRenderer())
            ->withMaxSourceLines(20);
    },
];
```

With the above configuration, the number of source code lines to be displayed in exception at HTML pages will be up to 20.

As aforementioned, the error handler turns all non-fatal PHP errors into catchable exceptions. This means you can
use the following code to deal with PHP errors:

```php
try {
    10/0;
} catch (\Exception $e) {
    Yii::warning("Division by zero.");
}

// execution continues...
```

## Friendly exceptions <span id="customizing-error-display"></span>

Yii error renderer supports [friendly exceptions](https://github.com/yiisoft/friendly-exception) that allows you to
make error handling even more pleasant experience for your team. The idea is to provide a readable name and possible
solutions to the problem:

```php
use Yiisoft\FriendlyException\FriendlyExceptionInterface;

class RequestTimeoutException extends \RuntimeException implements FriendlyExceptionInterface
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

When such exception is thrown, error renderer would display the name and the solution if verbose mode is turned on.

## Customizing error display <span id="customizing-error-display"></span>

TODO

### Using error actions <span id="using-error-actions"></span>

TODO


### Customizing error response format <span id="error-format"></span>

The error catcher chooses how to render an exception based on accept HTTP header. If it is `text/html` or any unknown
content type, it will use the error or exception view to display errors. For other mime types, the error handler will
choose different rendering that is registered within the error catcher. By default, JSON, XML and plain text are supported.
                                                          
You may customize the error response format by providing your own instance of `Yiisoft\Yii\Web\ErrorHandler\ThrowableRendererInterface`
when registering error catcher middleware. That is typically done in `MiddlewareProvider` of your application:

```php

declare(strict_types=1);

namespace App\Provider;

use Psr\Container\ContainerInterface;
use Yiisoft\Di\Container;
use Yiisoft\Di\Support\ServiceProvider;
use Yiisoft\Router\Middleware\Router;
use Yiisoft\Yii\Web\MiddlewareDispatcher;
use Yiisoft\Yii\Web\ErrorHandler\ErrorCatcher;
use Yiisoft\Yii\Web\Middleware\Csrf;
use Yiisoft\Yii\Web\Middleware\SubFolder;
use Yiisoft\Yii\Web\Session\SessionMiddleware;

final class MiddlewareProvider extends ServiceProvider
{
    public function register(Container $container): void
    {
        $container->set(MiddlewareDispatcher::class, static function (ContainerInterface $container) {

            $errorCatcher = $container->get(ErrorCatcher::class);
            $errorCatcher->withRenderer('application/myformat', new MyFormatErrorRenderer());

            return (new MiddlewareDispatcher($container))
                ->addMiddleware($container->get(Router::class))
                ->addMiddleware($container->get(SubFolder::class))
                ->addMiddleware($container->get(SessionMiddleware::class))
                ->addMiddleware($container->get(Csrf::class))
                ->addMiddleware($errorCatcher);
        });
    }
}
```
