# Using Yii with Swoole

[Swoole](https://www.swoole.com/) is a PHP extension for event-driven, coroutine-based network applications. It
includes an HTTP server, coroutine APIs, and runtime hooks for common blocking I/O functions.

Swoole allows Yii request handlers to run as workers. Each worker may handle multiple requests.
Such an operation mode is often called [event loop](using-with-event-loop.md) and allows not re-initializing a framework
for each request that improves performance significantly.

## Installation

Swoole supports Linux, macOS, Cygwin, and WSL. Install the extension through PECL:

```bash
pecl install swoole
```

If PECL doesn't enable the extension automatically, add it to your `php.ini`:

```ini
extension=swoole.so
```

Check that PHP loads the extension:

```bash
php --ri swoole
```

The Swoole project also provides a [Docker image](https://github.com/swoole/docker-swoole) and documents source builds
with optional features such as OpenSSL, sockets, MySQL, PostgreSQL, and curl hooks.

## Putting up a server

Swoole passes `Swoole\Http\Request` and `Swoole\Http\Response` objects to request callbacks. Yii handles PSR-7
requests and responses, so add a converter package:

```shell
composer require ilexn/swoole-convert-psr7
```

Create an entry script, `server.php`:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Ilex\SwoolePsr7\SwooleResponseConverter;
use Ilex\SwoolePsr7\SwooleServerRequestConverter;
use Psr\Http\Message\ServerRequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UploadedFileFactoryInterface;
use Psr\Http\Message\UriFactoryInterface;
use Psr\Log\LogLevel;
use Swoole\Http\Server;
use Swoole\HTTP\Request;
use Swoole\HTTP\Response;
use Yiisoft\Di\StateResetter;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Middleware\ErrorCatcher;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Http\Application;
use Yiisoft\Yii\Http\Handler\ThrowableHandler;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

ini_set('display_errors', 'stderr');

require_once __DIR__ . '/src/bootstrap.php';

$runner = new HttpApplicationRunner(
    rootPath: __DIR__,
    debug: Environment::appDebug(),
    checkEvents: Environment::appDebug(),
    environment: Environment::appEnv(),
    temporaryErrorHandler: new ErrorHandler(
        new Logger(
            [
                (new StreamTarget())->setLevels([
                    LogLevel::EMERGENCY,
                    LogLevel::ERROR,
                    LogLevel::WARNING,
                ]),
            ],
        ),
        new HtmlRenderer(),
    ),
);

$container = $runner->getContainer();
$application = $container->get(Application::class);
$errorCatcher = $container->get(ErrorCatcher::class);
$stateResetter = $container->get(StateResetter::class);

$serverRequestFactory = new SwooleServerRequestConverter(
    $container->get(ServerRequestFactoryInterface::class),
    $container->get(UriFactoryInterface::class),
    $container->get(UploadedFileFactoryInterface::class),
    $container->get(StreamFactoryInterface::class)
);

$server = new Server('0.0.0.0', 9501);

$server->on('start', static function (Server $server) use ($application) {
    $application->start();
    echo "Swoole http server is started at http://127.0.0.1:9501\n";
});

$server->on('request', static function (
    Request  $request,
    Response $response
) use ($serverRequestFactory, $application, $errorCatcher, $stateResetter) {
    try {
        $psr7Request = $serverRequestFactory->createFromSwoole($request);
        $psr7Response = $application->handle($psr7Request);
        (new SwooleResponseConverter($response))->send($psr7Response);
    } catch (Throwable $throwable) {
        $handler = new ThrowableHandler($throwable);
        $psr7Response = $errorCatcher->process($request, $handler);
        (new SwooleResponseConverter($response))->send($psr7Response);
    }
    $application->afterEmit($psr7Response);
    $stateResetter->reset();
});

$server->on('shutdown', static function (Server $server) use ($application) {
    $application->shutdown();
});

$server->start();
```

## Starting a server

To start a server, execute the following command:

```
php server.php
```

## On scope

A scope is shared, so at each iteration of the event loop every service that depends on state should be reset.
