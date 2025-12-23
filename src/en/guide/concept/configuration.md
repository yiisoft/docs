# Configuration

There are many ways to configure your application. We will focus on concepts used in
the [default project template](https://github.com/yiisoft/app).

Yii3 configs are part of the application. You can change many aspects of how the application works by editing
configuration under `config/`.

## Config plugin

In the application template [yiisoft/config](https://github.com/yiisoft/config) is used. Since writing all application
configurations from scratch is a tedious process, many packages offer default configs, and the plugin helps with
copying these into the application.

To offer default configs, `composer.json` of the package has to have `config-plugin` section.
When installing or updating packages with Composer, the plugin reads `config-plugin` sections for each dependency,
copies files themselves to application `config/packages/` if they don't yet exist and writes a merge plan to
`config/packages/merge_plan.php`. The merge plan defines how to merge the configs into a single big array
ready to be passed to [DI container](di-container.md).

Take a look at what's in the "yiisoft/app" `composer.json` by default:

```json
"config-plugin-options": {
  "output-directory": "config/packages"
},
"config-plugin": {
    "common": "config/common/*.php",
    "params": [
        "config/params.php",
        "?config/params-local.php"
    ],
    "web": [
        "$common",
        "config/web/*.php"
    ],
    "console": [
        "$common",
        "config/console/*.php"
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
    "providers": "config/providers.php",
    "providers-web": [
        "$providers",
        "config/providers-web.php"
    ],
    "providers-console": [
        "$providers",
        "config/providers-console.php"
    ],
    "routes": "config/routes.php"
},
```

There are many named configs defined. For each name, there is a configuration.

A string means that the plugin takes config as is and merges it with same-named configs from packages you require.
That happens if these packages have `config-plugin` in their `composer.json`. 

The array means that the plugin will merge many files in the order they're specified.

`?` at the beginning of the file path indicated that the file may be absent. In this case, it's skipped.

`$` at the beginning of the name means a reference to another named config.

`params` is a bit special because it's reserved for application parameters. These are automatically available
as `$params` in all other configuration files.

You can learn more about config plugin features [from its documentation](https://github.com/yiisoft/config/blob/master/README.md).

## Config files

Now, as you know how the plugin assembles configs, look at `config` directory:

```
common/
    application-parameters.php
    i18n.php
    router.php
console/
packages/
    yiisoft/
    dist.lock
    merge_plan.php
web/
    application.php
    psr17.php
events.php
events-console.php
events-web.php
params.php
providers.php
providers-console.php
providers-web.php
routes.php
```

### Container configuration

The application consists of a set of services registered in a [dependency container](di-container.md). The config files
that responsible for direct dependency container configuration are under `common/`, `console/` and `web/` directories.
We use `web/` for config specific to web application and `console/` for config specific to console commands. Both web and
console are sharing configuration under `common/`.

```php
<?php

declare(strict_types=1);

use App\ApplicationParameters;

/** @var array $params */

return [
    ApplicationParameters::class => [
        'class' => ApplicationParameters::class,
        'charset()' => [$params['app']['charset']],
        'name()' => [$params['app']['name']],
    ],
];
```

Config plugin passes special `$params` variable to all config files.
The code passes its values to the service.

The guide on ["Dependency injection and container"](di-container.md) describes
the configuration format and the idea of dependency injection in detail.

For convenience, there is a naming convention for custom string keys:

1. Prefix package name such as `yiisoft/cache-file/custom-definition`.
2. In case configuration are for the application itself, skip package prefix, such as `custom-definition`.

### Service providers

As an alternative to registering dependencies directly, you can use service providers. Basically, these are classes that
given parameters are configuring and registering services within the container. Similar to three dependency configuration
files described, there are three configs for specifying service providers: `providers-console.php` for console
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
        'class' => CacheProvider::class,
        '__construct()' => [
            $params['yiisoft/cache-file']['file-cache']['path'],
        ],
    ],
    // ...
```

In this config keys are provider names. By convention these are `vendor/package-name/provider-name`. Values are provider
class names. These classes could be either created in the project itself or provided by a package.

If you need to configure some options for a service, similar to direct container configuration, take values
from `$params` and pass them to providers.

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

final readonly class CacheProvider extends ServiceProvider
{
    public function __construct(
        private string $cachePath = '@runtime/cache'
    )
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
    Route::get('/')->action([SiteController::class, 'index'])->name('site/index')
];
``` 

Read more about it in ["Routes"](../runtime/routing.md).

### Events

Many services emit certain events that you can attach to.
You could do that via three config files: `events-web.php` for web application events,
`events-console.php` for console events and `events.php` for both.
The configuration is an array where keys are event names and values are an array of handlers:

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
        
        // Any definition of an invokable class may be here while your `$container->has('the definition)` 
        'di-alias'
    ],
];
```

Read more about it in ["Events"](events.md).


### Parameters

Parameters, `config/params.php` store configuration values that are used in other config files to configuring services
and service providers.

> [!TIP]
> Don't use parameters, constants or environment variables directly in your application, configure
> services instead.

Default application `params.php` looks like the following:

```php
<?php

declare(strict_types=1);

use App\Command\Hello;
use App\ViewInjection\ContentViewInjection;
use App\ViewInjection\LayoutViewInjection;
use Yiisoft\Definitions\Reference;
use Yiisoft\Yii\View\CsrfViewInjection;

return [
    'app' => [
        'charset' => 'UTF-8',
        'locale' => 'en',
        'name' => 'My Project',
    ],

    'yiisoft/aliases' => [
        'aliases' => [
            '@root' => dirname(__DIR__),
            '@assets' => '@root/public/assets',
            '@assetsUrl' => '/assets',
            '@baseUrl' => '/',
            '@message' => '@root/resources/message',
            '@npm' => '@root/node_modules',
            '@public' => '@root/public',
            '@resources' => '@root/resources',
            '@runtime' => '@root/runtime',
            '@vendor' => '@root/vendor',
            '@layout' => '@resources/views/layout',
            '@views' => '@resources/views',
        ],
    ],

    'yiisoft/yii-view' => [
        'injections' => [
            Reference::to(ContentViewInjection::class),
            Reference::to(CsrfViewInjection::class),
            Reference::to(LayoutViewInjection::class),
        ],
    ],

    'yiisoft/yii-console' => [
        'commands' => [
            'hello' => Hello::class,
        ],
    ],
];
```

For convenience, there is a naming convention about parameters:

1. Group parameters package name such as `yiisoft/cache-file`.
2. In case parameters are for the application itself, as in `app`, skip package prefix.
3. In case there are many services in the package, such as `file-target` and `file-rotator` in `yiisoft/log-target-file`
   package, group parameters by service name.
4. Use `enabled` as parameter name to be able to disable or enable a service, such as `yiisoft/yii-debug`.

### Package configs

Config plugin described copy default package configurations to `packages/` directory. Once copied you
own the configs, so you can adjust these as you like. `yiisoft/` in the default template stands for package vendor. Since
only `yiisoft` packages are in template, there's a single directory. `merge_plan.php` is used in runtime to get the order
on how configs are merged.
Note that for config keys there should be a single source of truth.
One config can't override values of another config.

`dist.lock` is used by the plugin to keep track of changes and display diff between current config and example one. 
