# Entry scripts

Entry scripts are the first step in the application bootstrapping process. An application (either
Web application or console application) has a single entry script. End users make requests to
entry scripts which instantiate application instances and forward the requests to them.

Entry scripts for Web applications must be stored under Web-accessible directories so that they
can be accessed by end users. They're often named as `index.php`, but can also use any other names,
provided Web servers can locate them.

Entry script for console application is `./yii`.

Entry scripts mainly perform the following work with the help of `ApplicationRunner`:

* Register [Composer autoloader](https://getcomposer.org/doc/01-basic-usage.md#autoloading);
* Obtain configuration;
* Use configuration to initialize a dependency injection container;
* Get an instance of the request.
* Pass it to `Application` to handle and get a response from it.
* With the help of an emitter that transforms a response object into an actual HTTP response that's sent to the client browser.

## Web Applications <span id="web-applications"></span>

The following is the code in the entry script for the application template:

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


## Console Applications <span id="console-applications"></span>

Similarly, the following is the code for the entry script of a console application:

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

## Alternative runtimes

For alternative runtimes such as RoadRunner or Swoole, special entry scripts should be used. See:

- [Using Yii with RoadRunner](../tutorial/using-yii-with-roadrunner.md)
- [Using Yii with Swoole](../tutorial/using-yii-with-swoole.md)
