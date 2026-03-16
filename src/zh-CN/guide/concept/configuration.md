# 配置

有很多方法可以配置您的应用程序。我们将重点关注 [默认项目模板](https://github.com/yiisoft/app) 中使用的概念。

Yii3 配置是应用程序的一部分。您可以通过编辑 `config/` 下的配置来更改应用程序工作方式的许多方面。

## 配置插件

在应用程序模板中使用了
[yiisoft/config](https://github.com/yiisoft/config)。由于从头开始编写所有应用程序配置是一个繁琐的过程，许多包提供默认配置，插件帮助将这些配置复制到应用程序中。

要提供默认配置，包的 `composer.json` 必须有 `config-plugin` 部分。在使用 Composer
安装或更新包时，插件会读取每个依赖项的 `config-plugin` 部分，如果文件尚不存在，则将文件本身复制到应用程序
`config/packages/`，并将合并计划写入
`config/packages/merge_plan.php`。合并计划定义了如何将配置合并到一个准备传递给 [DI
容器](di-container.md) 的大数组中。

看看默认情况下 "yiisoft/app" `composer.json` 中有什么：

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

定义了许多命名配置。对于每个名称，都有一个配置。

字符串意味着插件按原样获取配置并将其与您需要的包中的同名配置合并。如果这些包的 `composer.json` 中有
`config-plugin`，就会发生这种情况。

数组意味着插件将按指定的顺序合并多个文件。

文件路径开头的 `?` 表示文件可能不存在。在这种情况下，它会被跳过。

名称开头的 `$` 表示对另一个命名配置的引用。

`params` 有点特殊，因为它是为应用程序参数保留的。这些参数在所有其他配置文件中自动作为 `$params` 可用。

您可以 [从其文档](https://github.com/yiisoft/config/blob/master/README.md)
中了解有关配置插件功能的更多信息。

## 配置文件

现在，当您知道插件如何组装配置时，请查看 `config` 目录：

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

### 容器配置

应用程序由在 [依赖容器](di-container.md) 中注册的一组服务组成。负责直接依赖容器配置的配置文件位于
`common/`、`console/` 和 `web/` 目录下。我们使用 `web/` 用于特定于 Web 应用程序的配置，使用
`console/` 用于特定于控制台命令的配置。Web 和控制台都共享 `common/` 下的配置。

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

配置插件将特殊的 `$params` 变量传递给所有配置文件。代码将其值传递给服务。

["依赖注入和容器"](di-container.md) 指南详细描述了配置格式和依赖注入的思想。

为方便起见，自定义字符串键有一个命名约定：

1. 前缀包名称，例如 `yiisoft/cache-file/custom-definition`。
2. 如果配置是针对应用程序本身的，请跳过包前缀，例如 `custom-definition`。

### 服务提供者

作为直接注册依赖项的替代方法，您可以使用服务提供者。基本上，这些是给定参数配置并在容器中注册服务的类。与所描述的三个依赖配置文件类似，有三个用于指定服务提供者的配置：`providers-console.php`
用于控制台命令，`providers-web.php` 用于 Web 应用程序，`providers.php` 用于两者：

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

在此配置中，键是提供者名称。按照惯例，这些是
`vendor/package-name/provider-name`。值是提供者类名。这些类可以在项目本身中创建，也可以由包提供。

如果您需要为服务配置一些选项，类似于直接容器配置，从 `$params` 中获取值并将它们传递给提供者。

提供者应该实现一个方法，`public function register(Container $container):
void`。在此方法中，您需要使用 `set()` 方法将服务添加到容器。下面是缓存服务的提供者：

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

### 路由

您可以在 `config/routes.php` 中配置 Web 应用程序如何响应某些 URL：

```php
use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')->action([SiteController::class, 'index'])->name('site/index')
];
``` 

在 ["路由"](../runtime/routing.md) 中阅读更多相关内容。

### 事件

许多服务会发出您可以附加的某些事件。您可以通过三个配置文件来执行此操作：`events-web.php` 用于 Web
应用程序事件，`events-console.php` 用于控制台事件，`events.php`
用于两者。配置是一个数组，其中键是事件名称，值是处理程序数组：

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

在 ["事件"](events.md) 中阅读更多相关内容。


### 参数

参数 `config/params.php` 存储用于配置服务和服务提供者的其他配置文件中使用的配置值。

> [!TIP]
> 不要在应用程序中直接使用参数、常量或环境变量，而是配置
> 服务。

默认应用程序 `params.php` 如下所示：

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

为方便起见，关于参数有一个命名约定：

1. 按包名称分组参数，例如 `yiisoft/cache-file`。
2. 如果参数是针对应用程序本身的，如 `app`，请跳过包前缀。
3. 如果包中有许多服务，例如 `yiisoft/log-target-file` 包中的 `file-target` 和
   `file-rotator`，请按服务名称分组参数。
4. 使用 `enabled` 作为参数名称以能够禁用或启用服务，例如 `yiisoft/yii-debug`。

### 包配置

所描述的配置插件将默认包配置复制到 `packages/` 目录。一旦复制，您就拥有了配置，因此您可以根据需要调整这些配置。默认模板中的
`yiisoft/` 代表包供应商。由于模板中只有 `yiisoft` 包，因此只有一个目录。`merge_plan.php`
在运行时用于获取配置合并的顺序。请注意，对于配置键，应该有一个单一的真实来源。一个配置不能覆盖另一个配置的值。

`dist.lock` 由插件用于跟踪更改并显示当前配置与示例配置之间的差异。
