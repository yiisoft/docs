# Konfigurasi

Ada banyak cara untuk mengonfigurasi aplikasi Anda. Kita akan fokus pada
konsep yang digunakan dalam [template proyek
default](https://github.com/yiisoft/app).

Yii3 configs are part of the application. You can change many aspects of how
the application works by editing configuration under `config/` directory.

## Plugin konfigurasi

The application template uses
[yiisoft/config](https://github.com/yiisoft/config) as a composer plugin to
assemble configs.

Packages provide default configurations through defined [config
groups](https://github.com/yiisoft/config#config-groups)  in the
`config-plugin` key in the `extra` section of the `composer.json`:

```json
"extra": {
    "config-plugin-options": {
        "source-directory": "config",
    },
    "config-plugin": {
        "params": "params.php",
        "web": "web.php"
    }
}
```

After Composer updates autoload files, such as during `dump-autoload`,
`install`, `require`, `update`, or `remove`, the plugin scans installed
packages for configurations and writes a merge plan to
`config/.merge-plan.php`.  The merge plan declares the order of merging
found configurations into the final configuration to be passed to [DI
container](di-container.md).

At runtime, `Yiisoft\Config\Config` loads the defined config groups
according to that merge plan.  Configs are read in three layers:

1. Vendor package configs with default values.
2. Root package configs from the application `config/` directory.
3. Environment-specific configs from the application.

> [!WARNING]
> Config keys with the same name are not allowed within a single layer.

The application template stores configurations in a PHP file instead of
inline JSON:

```json
"extra": {
    "config-plugin-file": "config/configuration.php"
}
```

That file returns the same keys you could otherwise define in
`composer.json`: `config-plugin`, `config-plugin-options`, and
`config-plugin-environments`.

```php
use App\Environment;

return [
    'config-plugin-options' => [
        'source-directory' => 'config',
    ],
    'config-plugin' => [
        'params' => 'common/params.php',
        'params-web' => [
            '$params',
            'web/params.php',
        ],
        'params-console' => [
            '$params',
            'console/params.php',
        ],
        'bootstrap' => 'common/bootstrap.php',
        'bootstrap-web' => '$bootstrap',
        'bootstrap-console' => '$bootstrap',
        'di' => 'common/di/*.php',
        'di-web' => [
            '$di',
            'web/di/*.php',
        ],
        'di-console' => '$di',
        'di-delegates' => [],
        'di-delegates-console' => '$di-delegates',
        'di-delegates-web' => '$di-delegates',
        'di-providers' => [],
        'di-providers-web' => '$di-providers',
        'di-providers-console' => '$di-providers',
        'events' => [],
        'events-web' => '$events',
        'events-console' => '$events',
        'routes' => 'common/routes.php',
    ],
    'config-plugin-environments' => [
        Environment::DEV => [
            'params' => [
                'environments/dev/params.php',
            ],
        ],
        Environment::TEST => [
            'params' => [
                'environments/test/params.php',
            ],
        ],
        Environment::PROD => [
            'params' => [
                'environments/prod/params.php',
            ],
        ],
    ],
];
```

Config group names are mapping keys. Their values are file paths relative to
the `source-directory` option, which defaults to the directory containing
`composer.json`.

- A string value loads one file.
- An array loads and merges multiple files in the given order.
- `?` marks an optional file.
- `*` marks a wildcard path.
- `$group` references another config group to be merged.

The `params` group is special: its values are available as `$params` in
other config files by default.

You can read more in the [yiisoft/config
documentation](https://github.com/yiisoft/config/blob/master/README.md).

## Berkas konfigurasi

Now, as you know how the plugin assembles configs, look at the `config/`
directory structure used by the default application template:

```
common/
    bootstrap.php
    params.php
    routes.php
    di/
        *.php
console/
    params.php
environments/
    dev/
        params.php
    prod/
        params.php
    test/
        params.php
web/
    params.php
    di/
        *.php
.merge-plan.php
configuration.php
```

This structure follows the groups defined in `config/configuration.php`:

- `params`, `params-web`, and `params-console` load parameter files from
  `common/`, `web/`, and `console/`.
- `di` and `di-web` load container definitions from `common/di/` and
  `web/di/`.
- `routes` and `bootstrap` load `common/routes.php` and
  `common/bootstrap.php`.
- `config-plugin-environments` adds environment-specific parameter files
  from `environments/dev/`, `environments/test/`, and `environments/prod/`.

At runtime, `.merge-plan.php` stores the assembled merge plan generated from
`configuration.php`.

### Konfigurasi container

The application consists of services registered in a [dependency
container](di-container.md). In the default template, direct container
definitions live in `config/common/di/*.php` and `config/web/di/*.php`.

Definitions from `common/di/` are shared by web and console entry
points. The `di-web` group adds web-specific definitions from `web/di/`. The
`di-console` group currently reuses the shared `di` definitions without
extra files.

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;

/** @var array $params */

return [
    ApplicationParams::class => [
        '__construct()' => [
            'name' => $params['application']['name'],
            'charset' => $params['application']['charset'],
            'locale' => $params['application']['locale'],
        ],
    ],
];
```

Config plugin passes the special `$params` variable to all config files. The
definition uses it to configure services.

Panduan tentang ["Dependency injection and container"](di-container.md)
menjelaskan format konfigurasi dan gagasan dependency injection secara
rinci.

Untuk kenyamanan, ada konvensi penamaan untuk kunci string kustom:

1. Awali dengan nama paket seperti `yiisoft/cache-file/custom-definition`.
2. Jika konfigurasi untuk aplikasi itu sendiri, lewati prefiks paket,
   mis. `custom-definition`.

### Service provider

As an alternative to registering dependencies directly, you can use service
providers. A service provider is a class that returns a reusable set of
container definitions and extensions.

The default template exposes three config groups for service providers:
`di-providers`, `di-providers-web`, and `di-providers-console`. In the
template they are initialized as empty arrays in `config/configuration.php`,
and you can later populate them inline or switch them to load values from
files.

Prefer direct container configuration for application services with a simple
definition: a class name, an interface implementation, constructor arguments
from `$params`, or a closure that creates a single service.

Use a service provider when the registration itself is a reusable unit:

- A package registers several related services, aliases, or extensions.
- A service registration also needs supporting definitions.
- The same registration should be reused in several applications.
- Registration depends on optional classes or environment-specific
  decisions.

Use a factory class when construction logic belongs to one service. A
factory returns an object. A service provider returns definitions for
several related services.

```php
/* @var array $params */

// ...
use App\Provider\CacheProvider;
use App\Provider\MiddlewareProvider;
// ...

return [
    // ...
    'yiisoft/yii-web/middleware' => MiddlewareProvider::class,
    'yiisoft/cache/cache' => new CacheProvider($params['yiisoft/cache-file']['file-cache']['path']),
    // ...
];
```

In this config keys are provider names. By convention these are
`vendor/package-name/provider-name`. Values are provider class names or
provider instances. These classes could be either created in the project
itself or provided by a package.

Jika Anda perlu mengonfigurasi beberapa opsi untuk sebuah layanan, mirip
dengan konfigurasi container langsung, ambil nilai dari `$params` dan
teruskan ke provider.

Provider should implement `Yiisoft\Di\ServiceProviderInterface`. Below is a
provider for a cache service:

```php
use Psr\Container\ContainerInterface;
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;
use Yiisoft\Cache\File\FileCache;
use Yiisoft\Di\ServiceProviderInterface;

final readonly class CacheProvider implements ServiceProviderInterface
{
    public function __construct(
        private string $cachePath = '@runtime/cache'
    )
    {
    }

    public function getDefinitions(): array
    {
        return [
            CacheInterface::class => function (ContainerInterface $container) {
                $aliases = $container->get(Aliases::class);

                return new FileCache($aliases->get($this->cachePath));
            },
            YiiCacheInterface::class => Cache::class,
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

### Rute

You can configure how the web application responds to certain URLs in
`config/common/routes.php`:

```php
use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
        ),
];
``` 

Baca lebih lanjut tentang ini di ["Routes"](../runtime/routing.md).

### Event

Many services emit certain events that you can attach to.  The default
template defines three event config groups in `config/configuration.php`:
`events`, `events-web`, and `events-console`. They are empty by default, but
you can populate them inline or point them to event config files.

The configuration is an array where keys are event names and values are
arrays of handlers:

```php
return [
    EventName::class => [
        // Just a regular closure, it will be called from the Dispatcher "as is".
        static fn (EventName $event) => someStuff($event),
        
        // A regular closure with an extra dependency. All the parameters after the first one (the event itself)
        // will be resolved from your DI container within `yiisoft/injector`.
        static fn (EventName $event, DependencyClass $dependency) => someStuff($event),
        
        // An example with a regular callable. If the `staticMethodName` method has some dependencies,
        // they will be resolved the same way as in the earlier example.
        [SomeClass::class, 'staticMethodName'],
        
        // Non-static methods are allowed too. In this case, `SomeClass` will be instantiated by your DI container.
        [SomeClass::class, 'methodName'],
        
        // An object of a class with the `__invoke` method implemented
        new InvokableClass(),
        
        // In this case, the `InvokableClass` with the `__invoke` method will be instantiated by your DI container
        InvokableClass::class,
        
        // Any invokable class definition may be here as long as `$container->has('the definition')` is true.
        'di-alias'
    ],
];
```

Baca lebih lanjut di ["Events"](events.md).


### Parameter

Base parameters are stored in `config/common/params.php`. They are then
extended by `config/web/params.php`, `config/console/params.php`, and
environment-specific files under `config/environments/`.

> [!TIP]
> Don't use parameters, constants, or environment variables directly in your application, configure
> services instead.

The default application `common/params.php` looks like the following:

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Definitions\Reference;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\CsrfViewInjection;

return [
    'application' => require __DIR__ . '/application.php',

    'yiisoft/aliases' => [
        'aliases' => require __DIR__ . '/aliases.php',
    ],

    'yiisoft/view' => [
        'basePath' => null,
        'parameters' => [
            'assetManager' => Reference::to(AssetManager::class),
            'applicationParams' => Reference::to(ApplicationParams::class),
            'aliases' => Reference::to(Aliases::class),
            'urlGenerator' => Reference::to(UrlGeneratorInterface::class),
            'currentRoute' => Reference::to(CurrentRoute::class),
        ],
    ],

    'yiisoft/yii-view-renderer' => [
        'viewPath' => null,
        'layout' => '@src/Web/Shared/Layout/Main/layout.php',
        'injections' => [
            Reference::to(CsrfViewInjection::class),
        ],
    ],
];
```

Untuk kenyamanan, ada konvensi penamaan mengenai parameter:

1. Kelompokkan parameter berdasarkan nama paket seperti
   `yiisoft/cache-file`.
2. In case parameters are for the application itself, as in `application`,
   skip package prefix.
3. Jika ada banyak layanan dalam paket, seperti `file-target` dan
   `file-rotator` dalam paket `yiisoft/log-target-file`, kelompokkan
   parameter berdasarkan nama layanan.
4. Gunakan `enabled` sebagai nama parameter agar Anda dapat menonaktifkan
   atau mengaktifkan layanan, mis. `yiisoft/yii-debug`.

### Konfigurasi paket

Config plugin does not copy vendor package configs automatically. It loads
them directly from `vendor/` as the vendor layer and combines them with the
root package and environment-specific layers.

If you want to customize a package config file in your application, use the
`yii-config-copy` Composer command to copy it into your `config/` directory,
usually under `config/packages/`. Once copied, the file becomes part of the
root package layer, so it can override vendor defaults.

The merge plan stored in `.merge-plan.php` defines how config groups are
assembled. If you add new config files or directories and update the root
package configuration, rebuild the merge plan with `composer
yii-config-rebuild`.
