# Configuration

There are multiple ways to configure your application. We will focus on concepts used in
the [default project template](https://github.com/yiisoft/app).

## Assembling configs

In the application template [yiisoft/composer-config-plugin](https://github.com/yiisoft/composer-config-plugin) is used.
What the plugin does is collecting configs specified in all dependencies `composer.json`, `config-plugin` section and
merging them on `composer dump-autoload`, `composer update` or `composer install`. Then it writes resulting configs
to a directory that is used by the application in runtime. Usually it is `vendor/yiisoft/composer-config-plugin-output`.

Let's take a look at what is in the template by default:

```json
"extra": {
    "config-plugin": {
        "common": "config/common.php",
        "params": [
            "config/params.php",
            "?config/params-local.php"
        ],
        "web": [
            "$common",
            "config/web.php"
        ],
        "console": [
            "$common",
            "config/console.php"
        ],
        "providers": "config/providers.php",
        "providers-web": [
            "$providers",
            "config/providers-web.php"
        ],
        "providers-console": [
            "$providers",
            "config/providers-console.php"
        ],
        "events": "config/events.php",
        "events-web": [
            "$events",
            "config/events-web.php"
        ],
        "events-console": [
            "$events",
            "config/events-console.php"
        ],
        "routes": "config/routes.php"
    }
},
```

There are multiple named configs defined. For each name there is a configuration.

A string means that the plugin takes config as is and merges it with same-named configs from packages you require.
That happens if these packages have `config-plugin` in their `composer.json`. 

Array means that the plugin will merge multiple files in the order they are specified.

`?` at the beginning of the file path indicated that the file may be absent. In this case it is skipped.

`$` at the beginning of the name means a reference to another named config.

`params` config is a bit special because it is reserved for application parameters. These are automatically available
as `$params` in all other configuration files.

You can learn more about config plugin features [from its documentation](https://github.com/yiisoft/composer-config-plugin/blob/master/README.md).

## Config files

Now as we know how the plugin assembles configs, let's look at what is each file in `config` directory for:

```
common.php
console.php
events-console.php
events-web.php
events.php
params.php
providers-console.php
providers-web.php
providers.php
routes.php
web.php
```

### Container configuration

The application consists of a set of services registered in [dependency container](di-container.md). The config files
that responsible for direct dependency container configuration are `common.php`, `console.php` and `web.php`.
We use web for config specific to web application and console for config specific to console commands. Both web and
console are sharing common configuration.

```php
use App\ApplicationParameters;

/* @var array $params */

return [
    ApplicationParameters::class => static function () use ($params) {
        return (new ApplicationParameters())
            ->charset($params['app']['charset'])
            ->language($params['app']['language'])
            ->name($params['app']['name']);
    },
];
```

As we already mentioned, config plugin passes special `$params` variable to all config files. We are reading all the
configuration values from it and passing these values to our service.

The guide on ["Dependency injection and container"](di-container.md) describes
the configuration format and the concept of dependency injection in detail.


### Service providers

Additional to registering dependencies directly, we are using service providers. Basically these are classes that
given parameters are configuring and registering services within the container. Similar to three dependency configuration
files described above, we use three configs for specifying service providers: `providers-console.php` for console
commands, `providers-web.php` for web application and `providers.php` for both:

```php
/* @var array $params */

// ...
use App\Provider\CacheProvider;
use App\Provider\MiddlewareProvider;
// ...

return [
    // ...
    'yiisoft/yii-web/middleware' => MiddlewareProvider::class,
    'yiisoft/cache/cache' =>  [
        '__class' => CacheProvider::class,
        '__construct()' => [
            $params['yiisoft/cache-file']['file-cache']['path'],
        ],
    ],
    // ...
```

In this config keys are provider names. By convention these are `vendor/package-name/provider-name`. Values are provider
class names. These classes could be either created in the project itself or provided by a package.

If you need to configure some options for a service, similar to direct container configuration, we are taking values
from `$params` and passing them to providers.

Provider should implement a single method, `public function register(Container $container): void`. In this method you
need to add a service to container using `set()` method. Below is a provider for a cache service:

```php
use Psr\Container\ContainerInterface;
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;
use Yiisoft\Cache\File\FileCache;
use Yiisoft\Di\Container;
use Yiisoft\Di\Support\ServiceProvider;

final class CacheProvider extends ServiceProvider
{
    private string $cachePath;

    public function __construct(string $cachePath = '@runtime/cache')
    {
        $this->cachePath = $cachePath;
    }

    public function register(Container $container): void
    {
        $container->set(CacheInterface::class, function (ContainerInterface $container) {
            $aliases = $container->get(Aliases::class);

            return new FileCache($aliases->get($this->cachePath));
        });

        $container->set(YiiCacheInterface::class, Cache::class);
    }
}
```

### Routes

You can configure how web application responds to certain URLs in `config/routes.php`:

```php
use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/', [SiteController::class, 'index'])->name('site/index')
];
``` 

Read more about it in ["Routes"](../runtime/routing.md).

### Events

Many services emit certain events that you can attach to. That could be done via three config files: `events-web.php`
for web applicaiton events, `events-console.php` for console events and `events.php` for both.

Read more about it in ["Events"](events.md).


### Parameters

Parameters, `config/params.php` store configuration values that are used in other config files to configure services
and service providers.

> Tip: Do not use parameters, constants or environment variables directly in your application, configure
> services instead.

Default application `params.php` looks like the following:

```php
<?php

declare(strict_types=1);

use Psr\Log\LogLevel;

return [
    'aliases' => [
        '@root' => dirname(__DIR__),
        '@assets' => '@root/public/assets',
        '@assetsUrl' => '/assets',
        '@npm' => '@root/node_modules',
        '@public' => '@root/public',
        '@resources' => '@root/resources',
        '@runtime' => '@root/runtime',
        '@views' => '@root/resources/views'
    ],

    'yiisoft/cache-file' => [
        'file-cache' => [
            'path' => '@runtime/cache'
        ],
    ],

    'yiisoft/log-target-file' => [
        'file-target' => [
            'file' => '@runtime/logs/app.log',
            'levels' => [
                LogLevel::EMERGENCY,
                LogLevel::ERROR,
                LogLevel::WARNING,
                LogLevel::INFO,
                LogLevel::DEBUG,
            ],
        ],
        'file-rotator' => [
            'maxfilesize' => 10,
            'maxfiles' => 5,
            'filemode' => null,
            'rotatebycopy' => null
        ],
    ],

    'yiisoft/yii-web' => [
        'session' => [
            'options' => ['cookie_secure' => 0],
            'handler' => null
        ],
    ],

    'yiisoft/yii-debug' => [
        'enabled' => true
    ],

    'app' => [
        'charset' => 'UTF-8',
        'language' => 'en',
        'name' => 'My Project',
    ],
];
```

For convenience, there is a naming convention about parameters:

1. Group parameters package name such as `yiisoft/cache-file`.
2. In case parameters are for the application itself, as in `app`, skip package prefix.
2. In case there are multiple services in the package, such as `file-target` and `file-rotator` in `yiisoft/log-target-file`
   package, group parameters by service name.
3. In case a service could be disabled or enabled, such as `yiisoft/yii-debug`, use `enabled` as parameter name.
