# Using Yii in third-party applications

Sometimes a project already has an entry point owned by another framework, CMS, or legacy application, but you still
want to reuse Yii services: configuration, DI definitions, domain services, logging, mailers, database connections, or
console-oriented application code.

Yii3 has no global application singleton. Bootstrap the Yii container explicitly and pass the services you need to the
third-party code.

## Bootstrap the Yii container

Create a small adapter in the host application, for example `bootstrap-yii-services.php`:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Container\ContainerInterface;
use Yiisoft\Config\Config;
use Yiisoft\Config\ConfigInterface;
use Yiisoft\Config\ConfigPaths;
use Yiisoft\Config\Modifier\RecursiveMerge;
use Yiisoft\Config\Modifier\ReverseMerge;
use Yiisoft\Di\Container;
use Yiisoft\Di\ContainerConfig;

function yiiContainer(string $yiiRoot): ContainerInterface
{
    require_once $yiiRoot . '/src/bootstrap.php';

    $paramsGroup = 'params-console';
    $eventsGroups = ['events-console', 'events'];

    $config = new Config(
        paths: new ConfigPaths($yiiRoot, 'config', 'vendor'),
        environment: Environment::appEnv(),
        modifiers: [
            ReverseMerge::groups(...$eventsGroups),
            RecursiveMerge::groups($paramsGroup, 'params', ...$eventsGroups),
        ],
        paramsGroup: $paramsGroup,
    );

    $containerConfig = ContainerConfig::create()
        ->withValidate(Environment::appDebug())
        ->withDefinitions(array_merge(
            $config->get('di-console'),
            [ConfigInterface::class => $config],
        ))
        ->withProviders($config->get('di-providers-console'))
        ->withDelegates($config->get('di-delegates-console'));

    if ($config->has('di-tags-console')) {
        $containerConfig = $containerConfig->withTags($config->get('di-tags-console'));
    }

    $container = new Container($containerConfig);

    foreach ($config->get('bootstrap-console') as $callback) {
        if (!is_callable($callback)) {
            throw new RuntimeException(sprintf(
                'Bootstrap callback must be callable, "%s" given.',
                get_debug_type($callback),
            ));
        }

        $callback($container);
    }

    return $container;
}
```

The adapter builds only the Yii configuration and DI container, then runs the configured bootstrap callbacks. It does not
create or run a Yii application runner, so the third-party application keeps ownership of the entry point and process
lifecycle.

Use console configuration groups when you need common services and console-safe services. Use web groups instead only
when you intentionally need web-specific definitions from the `di-web` group, such as PSR-17 HTTP factories or web
middleware dependencies.

## Get Yii services from the host application

Use the adapter from the third-party application:

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;

require_once __DIR__ . '/path/to/yii-app/vendor/autoload.php';
require_once __DIR__ . '/bootstrap-yii-services.php';

$container = yiiContainer(__DIR__ . '/path/to/yii-app');

/** @var ApplicationParams $params */
$params = $container->get(ApplicationParams::class);

echo $params->name;
```

In real integrations, prefer getting your own application services instead of framework infrastructure. For example,
expose `InvoiceSender`, `ReportBuilder`, or `CatalogImporter` from Yii and call that service from the host application.

## Keep boundaries explicit

Avoid mixing request lifecycles. Let the host application continue to own its HTTP request and response. Let Yii provide
services that do not assume Yii is handling the current request.

Good candidates for reuse:

- domain services;
- repositories and database connections;
- mailers and notification services;
- loggers;
- validators;
- queue producers;
- command-like application services.

Avoid pulling in Yii actions, middleware stacks, sessions, CSRF middleware, or view rendering unless the host application
explicitly delegates that whole responsibility to Yii.

## Configuration groups

The default application template separates configuration by group:

- `di` is shared by web and console entry points;
- `di-console` is console-specific and includes `di` in the template;
- `di-web` is web-specific and includes `di`;
- `params-console` and `params-web` extend common `params`.

Choose the smallest group that contains the services you need. If the host application only needs domain services, keep
those definitions in `config/common/di/*.php` so both Yii and the third-party app can use them without web-only
dependencies.

After changing `config/configuration.php`, rebuild the merge plan:

```shell
composer yii-config-rebuild
```

## Error handling and logging

The host application should remain responsible for top-level error handling. Catch exceptions at the integration
boundary when the host app needs to convert them into its own response or error format.

Yii services can still use `Psr\Log\LoggerInterface`. Configure the Yii logger to write to the same destination as the
host application or bridge both applications to the same PSR-3 logger.

## Long-running host processes

If the third-party application is a worker, daemon, or event-loop server, avoid mutable shared state in services. Yii
services resolved from the container are shared by default, so design them as stateless services or create a fresh
container for each isolated job when stateful dependencies are unavoidable.
