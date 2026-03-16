# 在 Swoole 中使用 Yii

[Swoole](https://www.swoole.co.uk/) 是一个以 PECL 扩展形式发布的 PHP 网络框架，内置了异步、
多线程 I/O 模块。开发者可以使用同步或异步、协程 API 来编写应用程序。

在 Yii 的使用场景中，Swoole 允许将请求处理器作为 worker 运行，每个 worker
可处理多个请求。这种运行模式通常称为[事件循环](using-with-event-loop.md)，无需为每个请求重新初始化框架，从而显著提升性能。

## 安装

Swoole 支持 Linux 和 macOS，可通过 pecl 安装：

```bash
pecl install swoole
```

## 搭建服务器

由于 Swoole 没有内置的 PSR-7 支持，需要安装一个补充包：

```php
composer require ilexn/swoole-convent-psr7
```

创建入口脚本 `server.php`：

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

## 启动服务器

要启动服务器，请执行以下命令：

```
php server.php
```

## 关于作用域

作用域是共享的，因此在事件循环的每次迭代中，所有依赖状态的服务都应进行重置。
