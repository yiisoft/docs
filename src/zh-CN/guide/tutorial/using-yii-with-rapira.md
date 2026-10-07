# Using Yii with Rapira

[Rapira](https://rapira.rs/) is a PHP application server written in Rust that embeds the PHP interpreter.
The [Yii Rapira runner](https://github.com/yiisoft/yii-runner-rapira) supports its classic, worker, and dispatcher modes.
Worker and dispatcher modes initialize the application once per worker and reuse it for subsequent requests.
See [Using Yii with event loop](using-with-event-loop.md) for the implications of keeping the application in memory.

## 安装

The runner requires PHP 8.4–8.5. Install the Rapira binary following the
[Rapira installation
instructions](https://rapira.rs/docs/intro/installation), using a PHP
version supported by the runner.  The Composer packages provide the Yii
integration; the server binary must be installed separately.

Install the runner and its contract package in your Yii application:

```shell
composer require yiisoft/yii-runner-rapira:@dev rapira/contract:@dev
```

These stability flags allow the development versions used by the runner's
installation instructions.

## 配置

The following example assumes an application based on `yiisoft/app` or
`yiisoft/app-api`, with `App\Environment` and `src/bootstrap.php` provided
by the template.

### Worker entry script

Create `worker.php` in the application root:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Log\LogLevel;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Runner\Rapira\RapiraApplicationRunner;

$root = __DIR__;

require_once $root . '/src/bootstrap.php';

$runner = new RapiraApplicationRunner(
    rootPath: $root,
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
        new PlainTextRenderer(),
    ),
);
$runner->run();
```

The runner creates the container, starts the application, converts incoming
requests to PSR-7 requests, and emits responses. It detects the Rapira
execution mode, so the same entry script can be used with all three modes.

### Server configuration

Create `rapira.toml` next to `worker.php`:

```toml
[http]
listen = "127.0.0.1:8000"

[http.pool]
entrypoint = "worker.php"
mode = "worker"
max_requests = 1000
```

This configuration listens on the loopback interface and recycles each
worker after 1,000 requests.  For serving files from `public`, follow
Rapira's [static file configuration](https://rapira.rs/docs/static-files).
See the [configuration reference](https://rapira.rs/docs/configuration) for
the other server and pool settings.

## 启动服务器

Run the following command from the application root:

```shell
rapira serve rapira.toml
```

Open `http://127.0.0.1:8000` to access the application. Restart the server
after changing application code or configuration.

## Execution modes

Set `mode` in the `[http.pool]` section of `rapira.toml` to choose how
requests are processed:

- `classic` initializes the application for each request, similarly to
  PHP-FPM.
- `worker` keeps the application in memory and receives requests through
  PHP's SAPI superglobals.
- `dispatcher` keeps the application in memory and receives request objects
  through Rapira's dispatcher API.  The Yii runner processes these requests
  sequentially within each worker.

See [Rapira execution modes](https://rapira.rs/docs/execution-modes) for
details.

## 关于 Worker 作用域

In worker and dispatcher modes, services may retain state between
requests. The runner calls `Yiisoft\Di\StateResetter::reset()` after each
request, but you must configure resetters for your own stateful services.
See the [Yii DI
documentation](https://github.com/yiisoft/di#resetting-services-state).

The `max_requests` setting limits how long a worker lives; it does not
replace resetting request-specific state.

## Additional configuration

`RapiraApplicationRunner` uses the application templates' web configuration
groups by default. Its constructor accepts alternative groups, configuration
directories, and a temporary error handler. Use `withConfig()` to supply a
custom configuration instance or `withContainer()` to supply a PSR-11
container. See the [runner
documentation](https://github.com/yiisoft/yii-runner-rapira#configuration)
for examples.
