# Using Yii with FrankenPHP

[FrankenPHP](https://frankenphp.dev/) is an application server for PHP with Caddy built in. It can run Yii in 
[worker mode](using-with-event-loop.md), allowing the framework bootstrap to happen once per worker instead of
once per request.

## Installation

Install the FrankenPHP runner package with Composer:

```shell
composer require yiisoft/yii-runner-frankenphp
```

FrankenPHP works especially well in containerized deployments and is the runtime used by the Yii application
templates Docker setup described in [Docker in application templates](docker.md).

## Configuration

First, configure the worker entry script.

### Worker entry script

Create `/worker.php` in the project root:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Log\LogLevel;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Runner\FrankenPHP\FrankenPHPApplicationRunner;

$root = __DIR__;

require_once $root . '/src/bootstrap.php';

if (Environment::appC3()) {
    $c3 = $root . '/c3.php';
    if (file_exists($c3)) {
        require_once $c3;
    }
}

$runner = new FrankenPHPApplicationRunner(
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

The runner bootstraps the application once and then keeps processing requests in worker mode. Unlike classic
`public/index.php`, this script is not executed per request.

### Server configuration

FrankenPHP is configured through a `Caddyfile`. For production, it may look like the following:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
        }
    }
}
```

This configuration tells FrankenPHP to serve the `public` directory and handle all requests with `worker.php`.
Static assets are still served from `public`, while PHP requests are processed through the long-running worker.

For development, add `watch` so FrankenPHP reloads workers when PHP files change:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
            watch /app/**/*.php
        }
    }
}
```

### Docker setup in Yii application templates

Yii application templates already ship with a FrankenPHP-based Docker setup. To switch the application to worker mode,
update the files inside the Docker layout instead of relying on `public/index.php`.

Create `/worker.php` in the project root as shown above, then update the Caddy configuration used by the container.
For development, edit `docker/dev/Caddyfile`:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
            watch /app/**/*.php
        }
    }
}
```

For production, use the same configuration without `watch` in `docker/Caddyfile`:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
        }
    }
}
```

The templates use `dunglas/frankenphp` as the base image in `docker/Dockerfile`, mount the project into `/app`
in development, and pass runtime configuration through environment files such as `docker/dev/.env` and
`docker/prod/.env`. The default value of `SERVER_NAME` in these files is `:80`, which matches the examples above.

After changing `worker.php` and the relevant `Caddyfile`, rebuild the image and restart the environment:

```shell
make build
make up
```

In production, rebuild and deploy the production image using the project's production Docker workflow.

If you switch fully to worker mode, `public/index.php` and `yiisoft/yii-runner-http` are no longer needed.

## Starting a server

The exact start command depends on how you run FrankenPHP:

- In the Yii application templates, run `make build` and `make up` after updating `worker.php` and the relevant `Caddyfile`.
- In a custom setup, start FrankenPHP with the Caddy configuration that points to your application `Caddyfile`.

## On worker scope

- Each worker's memory is isolated from other workers.
- A single worker handles multiple requests, so services created inside it may keep state between requests.
- At each iteration of the event loop, every stateful service should be reset.

For the general implications of long-running workers, see [Using Yii with event loop](using-with-event-loop.md).

## Worker mode notes

- Use the `MAX_REQUESTS` environment variable to limit how many requests a worker handles before restart.
- Reset stateful services after each request. See [Yii DI `StateResetter` documentation](https://github.com/yiisoft/di#resetting-services-state).

## Additional configuration

`FrankenPHPApplicationRunner` is configured by default for Yii application templates and follows the
[config groups convention](https://github.com/yiisoft/docs/blob/master/022-config-groups.md).

The constructor allows overriding the default bootstrap, events, DI, params, and error-handler configuration.
You can also provide a custom config instance with `withConfig()` and a custom container with `withContainer()`.
