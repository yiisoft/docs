# 在 Yii 中使用 RoadRunner

[RoadRunner](https://roadrunner.dev/) 是一个由 Golang 驱动的应用服务器，可以与 PHP 良好集成。它将 PHP 作为 worker 运行，
每个 worker 可以处理多个请求。这种操作模式通常称为
[事件循环](using-with-event-loop.md)，无需为每个请求重新初始化框架，
从而显著提升性能。

## 安装

RoadRunner 支持 Linux、macOS 和 Windows。安装它的最佳方式是使用 Composer：

```
composer require yiisoft/yii-runner-roadrunner
```

安装完成后，运行：

```
./vendor/bin/rr get
```

这将下载可直接使用的 RoadRunner 服务器 `rr` 二进制文件。

## 配置

首先，我们需要配置服务器本身。创建 `/.rr.yaml` 并添加以下配置：

```yaml
server:
  command: "php worker.php"
  env:
    YII_ENV: prod
    YII_DEBUG: false

rpc:
  listen: tcp://127.0.0.1:6001

http:
  address: :8080
  pool:
    debug: false # set to true for local development only
    supervisor:
      max_worker_memory: 192
  middleware: [static, gzip, headers, sendfile]
  static:
    dir:   "public"
    forbid: [".php", ".htaccess"]
  headers:
    response:
      "Cache-Control": "no-cache"

logs:
  mode: production
  level: warn
```

> [!INFO]
> 了解更多关于 TLS、HTTP/2、HTTP/3 配置和其他中间件的信息，请参阅 [RoadRunner 文档](https://docs.roadrunner.dev/docs/http/http)。

我们指定入口脚本为 `worker.php`，服务器监听 8080 端口，`public` 目录中的文件（除 `.php` 和 `.htaccess`
外）以静态方式提供服务。`max_worker_memory` 是一个软限制：如果 worker 超过 192
MB，它将在完成当前请求后重启。此外，我们还发送了一个额外的响应头。

创建 `/worker.php`：

```php
<?php

declare(strict_types=1);

use Yiisoft\Yii\Runner\RoadRunner\RoadRunnerApplicationRunner;

ini_set('display_errors', 'stderr');

require_once __DIR__ . '/preload.php';

(new RoadRunnerApplicationRunner(__DIR__, $_ENV['YII_DEBUG'], $_ENV['YII_ENV']))->run();
```

## 启动服务器

要启动服务器，请执行以下命令：

```
./rr serve
```

## 关于 Worker 作用域

- 每个 worker 的作用域与其他 worker 隔离，内存不共享。
- 单个 worker 服务多个请求，请求之间共享作用域。
- 在事件循环的每次迭代中，所有依赖状态的服务都应进行重置。
