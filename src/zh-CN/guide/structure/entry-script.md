# 入口脚本

入口脚本是应用程序引导过程的第一步。每个应用程序（无论是 Web
应用程序还是控制台应用程序）都只有一个入口脚本。最终用户向入口脚本发起请求，入口脚本负责实例化应用程序并将请求转发给它。

Web 应用程序的入口脚本必须存储在 Web 可访问目录下，以便最终用户能够访问。文件名通常为 `index.php`，但也可以使用其他名称，只要
Web 服务器能够找到即可。

控制台应用程序的入口脚本为 `./yii`。

入口脚本借助 `ApplicationRunner` 主要完成以下工作：

* 注册 [Composer
  自动加载器](https://getcomposer.org/doc/01-basic-usage.md#autoloading)；
* 获取配置；
* 使用配置初始化依赖注入容器；
* 获取请求实例。
* 将请求传递给 `Application` 处理并获取响应。
* 借助发射器将响应对象转换为实际的 HTTP 响应并发送给客户端浏览器。

## Web 应用程序 <span id="web-applications"></span>

以下是应用程序模板中入口脚本的代码：

```php
<?php

declare(strict_types=1);

use App\ApplicationRunner;

// PHP built-in server routing.
if (PHP_SAPI === 'cli-server') {
    // Serve static files as is.
    if (is_file(__DIR__ . $_SERVER['REQUEST_URI'])) {
        return false;
    }

    // Explicitly set for URLs with dot.
    $_SERVER['SCRIPT_NAME'] = '/index.php';
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

$runner = new ApplicationRunner();
// Development mode:
$runner->debug();
// Run application:
$runner->run();
```


## 控制台应用程序 <span id="console-applications"></span>

类似地，以下是控制台应用程序入口脚本的代码：

```php
#!/usr/bin/env php
<?php

declare(strict_types=1);

use Psr\Container\ContainerInterface;
use Yiisoft\Config\Config;
use Yiisoft\Di\Container;
use Yiisoft\Di\ContainerConfig;
use Yiisoft\Yii\Console\Application;
use Yiisoft\Yii\Console\Output\ConsoleBufferedOutput;

define('YII_ENV', getenv('env') ?: 'production');

require_once 'vendor/autoload.php';

$config = new Config(
    __DIR__,
    '/config/packages',
);

$containerConfig = ContainerConfig::create()
    ->withDefinitions($config->get('console'))
    ->withProviders($config->get('providers-console'));
$container = new Container($containerConfig);

/** @var ContainerInterface $container */
$container = $container->get(ContainerInterface::class);

$application = $container->get(Application::class);
$exitCode = 1;

try {
    $application->start();
    $exitCode = $application->run(null, new ConsoleBufferedOutput());
} catch (\Error $error) {
    $application->renderThrowable($error, new ConsoleBufferedOutput());
} finally {
    $application->shutdown($exitCode);
    exit($exitCode);
}
```

## 其他运行时

For alternative runtimes such as FrankenPHP, RoadRunner, or Swoole, special
entry scripts should be used. See:

- [Using Yii with FrankenPHP](../tutorial/using-yii-with-frankenphp.md)
- [在 RoadRunner 中使用 Yii](../tutorial/using-yii-with-roadrunner.md)
- [在 Swoole 中使用 Yii](../tutorial/using-yii-with-swoole.md)
