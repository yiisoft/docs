# Using Yii with Swoole

[Swoole](https://www.swoole.co.uk/) is a PHP network framework distributed as a PECL extension. It allows you built-in async,
multiple threads I/O modules. Developers can use sync or async, coroutine API to write the applications.

In the context of Yii, it allows running request handlers as workers. Each worker may handle multiple requests.
Such an operation mode is often called [event loop](using-with-event-loop.md) and allows not to re-initialize a framework
for each request that improves performance significantly. 

## Installation

Swoole works on Linux and macOS and can be installed via pecl:

```bash
pecl install swoole
```

## Putting up a server

Since Swoole doesn't have built-in PSR-7 support, you need a package fixing so:

```php
composer require ilexn/swoole-convent-psr7
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

$server = new Swoole\HTTP\Server('0.0.0.0', 9501);

$server->on('start', static function (Swoole\Http\Server $server) use ($application) {
    $application->start();
    echo "Swoole http server is started at http://127.0.0.1:9501\n";
});

$server->on('request', static function (Swoole\Http\Request $request, Swoole\Http\Response $response) use ($serverRequestFactory, $application, $container) {
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
