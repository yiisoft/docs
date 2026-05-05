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

use Psr\Http\Message\ServerRequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UploadedFileFactoryInterface;
use Psr\Http\Message\UriFactoryInterface;
use Yiisoft\Di\Container;
use Yiisoft\Di\ContainerConfig;
use Yiisoft\Yii\Web\Application;
use Yiisoft\Config\Config;

ini_set('display_errors', 'stderr');

define('YII_ENV', getenv('env') ?: 'production');
require_once dirname(__DIR__) . '/vendor/autoload.php';

$config = new Config(
    dirname(__DIR__),
    '/config/packages',
    null,
    [
        'params',
        'events',
        'events-web',
        'events-console',
    ]
);

$containerConfig = ContainerConfig::create()
    ->withDefinitions($config->get('web'))
    ->withProviders($config->get('providers-web'));
$container = new Container($containerConfig);

$bootstrapList = $config->get('bootstrap-web');
foreach ($bootstrapList as $callback) {
    if (!(is_callable($callback))) {
        $type = is_object($callback) ? get_class($callback) : gettype($callback);

        throw new \RuntimeException("Bootstrap callback must be callable, $type given.");
    }
    $callback($container);
}

$application = $container->get(Application::class);

$serverRequestFactory = new \Ilex\SwoolePsr7\SwooleServerRequestConverter(
    $container->get(ServerRequestFactoryInterface::class),
    $container->get(UriFactoryInterface::class),
    $container->get(UploadedFileFactoryInterface::class),
    $container->get(StreamFactoryInterface::class)
);

$server = new Swoole\Http\Server('0.0.0.0', 9501);

$server->on('start', static function (Swoole\Http\Server $server) use ($application) {
    $application->start();
    echo "Swoole http server is started at http://127.0.0.1:9501\n";
});

$server->on('request', static function (
    Swoole\Http\Request $request,
    Swoole\Http\Response $response,
) use ($serverRequestFactory, $application, $container) {
    $psr7Response = null;
    try {
        $requestContainer = clone $container;
        $psr7Request = $serverRequestFactory->createFromSwoole($request);
        $psr7Response = $application->handle($psr7Request);
    
        $converter = new \Ilex\SwoolePsr7\SwooleResponseConverter($response);
        $converter->send($psr7Response);
    } catch (\Throwable $t) {
        // TODO: render it properly
        $response->end($t->getMessage());
    } finally {
        $application->afterEmit($psr7Response ?? null);
        $container->get(\Yiisoft\Di\StateResetter::class)->reset();
        $container = $requestContainer;    
    }
});

$server->on('shutdown', static function (Swoole\Http\Server $server) use ($application) {
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
