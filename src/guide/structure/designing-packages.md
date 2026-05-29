# Designing packages for Yii applications

This page describes how to design a Composer package that adds behavior to a Yii application through configuration.
Use it when your package needs to register services, routes, events, commands, assets, migrations, translations,
or a theme.

## Package layout

A Yii-aware package is a regular Composer package with PHP classes, optional resource files, and optional config files.
Keep the configuration in a predictable directory and make the public API explicit:

```
composer.json
config/
    params.php
    di.php
    routes.php
    events.php
    params-console.php
    di-console.php
src/
    ...
assets/
    ...
migrations/
    ...
messages/
    ...
views/
    ...
```

Use only the files your package needs. For example, a package with console commands but no web routes does not need
`routes.php`.

## Config plugin metadata

Yii applications use [yiisoft/config](https://github.com/yiisoft/config) to discover package configuration.
Declare the config files in the `extra.config-plugin` section of `composer.json`:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    },
    "extra": {
        "config-plugin-options": {
            "source-directory": "config"
        },
        "config-plugin": {
            "params": "params.php",
            "di": "di.php",
            "routes": "routes.php",
            "events": "events.php",
            "params-console": "params-console.php",
            "di-console": "di-console.php"
        }
    }
}
```

`source-directory` is relative to the package root. Each `config-plugin` key is a config group name and each value is
a path relative to `source-directory`.

Use the common, web, and console groups consistently:

- `params`, `di`, `di-providers`, `di-delegates`, `events`, and `bootstrap` apply to both web and console entry points.
- `params-web`, `di-web`, `di-providers-web`, `events-web`, `bootstrap-web`, and `routes` apply to web entry points.
- `params-console`, `di-console`, `di-providers-console`, `events-console`, and `bootstrap-console` apply to console
  entry points.

If your package defines a new config group, document how an application should load that group. Prefer the standard
groups when you integrate with Yii services because application templates and Yii packages already use these names.

After users install, update, remove, or dump Composer autoload files, the config plugin rebuilds the merge plan that
Yii reads at runtime. If users edit their root package configuration manually, ask them to run:

```sh
composer yii-config-rebuild
```

## Parameters

Put default options in `params.php`. Group package parameters under the Composer package name to avoid collisions:

```php
<?php

declare(strict_types=1);

return [
    'vendor/blog' => [
        'postsPerPage' => 20,
        'cacheTtl' => 3600,
    ],
];
```

Application developers can override these values in their own `config/common/params.php`,
`config/web/params.php`, `config/console/params.php`, or environment-specific parameter files.

Do not read environment variables or global state from package code when a parameter can express the choice. Use
parameters to configure services through DI definitions or service providers.

## DI definitions

Use `di.php`, `di-web.php`, or `di-console.php` for direct container definitions:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;

/** @var array $params */

return [
    PostRepositoryInterface::class => [
        'class' => PostRepository::class,
        '__construct()' => [
            'cacheTtl' => $params['vendor/blog']['cacheTtl'],
        ],
    ],
];
```

Prefer direct DI definitions when the configuration describes one service clearly.

## DI service providers

Use a DI provider when registration is code: several related services, optional classes, aliases, decorators,
or environment checks.

Register providers in a provider config group:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Provider\BlogProvider;

return [
    'vendor/blog/provider' => BlogProvider::class,
];
```

Declare the group in `composer.json`:

```json
"extra": {
    "config-plugin-options": {
        "source-directory": "config"
    },
    "config-plugin": {
        "di-providers": "di-providers.php"
    }
}
```

A provider can register several services:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Provider;

use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;
use Yiisoft\Di\Container;
use Yiisoft\Di\Support\ServiceProvider;

final class BlogProvider extends ServiceProvider
{
    public function register(Container $container): void
    {
        $container->set(PostRepositoryInterface::class, PostRepository::class);
    }
}
```

## Routes

Web packages can add routes through the `routes` group:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Web\Post\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')->routes(
        Route::get('')
            ->action(IndexAction::class)
            ->name('vendor/blog/index'),
    ),
];
```

Route names should be package-prefixed. This avoids collisions with application routes and with routes from other
packages.

Keep package routes small and overridable. If an application needs full control over URLs, document the actions and
let the application define its own routes.

## Events

Use the `events`, `events-web`, or `events-console` group to attach package handlers to events:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Event\PostPublished;
use Vendor\Blog\EventHandler\ClearPostListCache;

return [
    PostPublished::class => [
        ClearPostListCache::class,
    ],
];
```

Handlers can be closures, callables, invokable objects, invokable class names, or DI aliases supported by the event
dispatcher configuration. Prefer class names for package handlers because applications can override their dependencies
through the container.

## Assets

If your package ships CSS, JavaScript, images, or fonts, define asset bundles as PHP classes:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Asset;

use Yiisoft\Assets\AssetBundle;

final class BlogAsset extends AssetBundle
{
    public ?string $sourcePath = __DIR__ . '/../../assets';

    public array $css = [
        'blog.css',
    ];

    public array $js = [
        'blog.js',
    ];
}
```

Users can register the bundle from a view, widget, view injection, or action:

```php
$assetManager->register(BlogAsset::class);
```

Use `$sourcePath` for files shipped inside the package. Use `$basePath` and `$baseUrl` only when the files are already
in a public web directory.

## Migrations

Packages that need database schema changes should ship migrations and add their namespace or path to
`yiisoft/db-migration` parameters.

For namespaced migrations:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourceNamespaces' => [
            'Vendor\\Blog\\Migration',
        ],
    ],
];
```

For path-based migrations:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourcePaths' => [
            __DIR__ . '/../migrations',
        ],
    ],
];
```

Put this in `params-console.php` and declare it as `params-console` in `composer.json`.

Package migrations must be stable after release. Do not edit a migration that users may already have applied. Add a
new migration instead.

## Translations

If the package has user-facing messages, give it a dedicated translation category and register a category source:

```php
<?php

declare(strict_types=1);

use Yiisoft\Translator\CategorySource;
use Yiisoft\Translator\IntlMessageFormatter;
use Yiisoft\Translator\Message\Php\MessageSource;

return [
    'translation.vendor-blog' => [
        'definition' => static function (): CategorySource {
            $messageSource = new MessageSource(__DIR__ . '/../messages');

            return new CategorySource(
                'vendor-blog',
                $messageSource,
                new IntlMessageFormatter(),
                $messageSource,
            );
        },
        'tags' => ['translation.categorySource'],
    ],
];
```

Store messages by locale and category:

```
messages/
    en-US/
        vendor-blog.php
    de/
        vendor-blog.php
```

Use the explicit category when translating:

```php
$translator->translate('post.created', category: 'vendor-blog');
```

## Themes

A package can ship view files and assets for a theme. Yii view configuration keeps theme settings under
`yiisoft/view.theme`, so a theme package can provide default parameters:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/view' => [
        'theme' => [
            'pathMap' => [
                '@views' => __DIR__ . '/../views',
            ],
            'basePath' => __DIR__ . '/../assets',
            'baseUrl' => '@assetsUrl/vendor-blog',
        ],
    ],
];
```

Themes replace view paths according to a path map. Document which application view paths your theme replaces and which
asset URL must be published or exposed by the application.

If your package only provides optional theme files, do not make the theme active by default. Provide the view files,
asset bundle, and a documented parameter snippet so the application can opt in.

## Console commands

Console packages can add Symfony Console commands through `params-console`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Command\ReindexCommand;

return [
    'yiisoft/yii-console' => [
        'commands' => [
            'blog/reindex' => ReindexCommand::class,
        ],
    ],
];
```

Command names should be package-prefixed. Keep command dependencies constructor-injected and registered through DI.

## Application overrides

Package configuration is the default layer. The application can override it in its root package configuration.
Design for that:

- Use package-prefixed parameter keys, route names, event handler IDs, and DI aliases.
- Keep default configuration small and documented.
- Avoid doing irreversible work during service registration.
- Put optional integrations in separate config files or providers when they require optional Composer packages.
- Test the package inside a minimal Yii application so the config plugin, DI container, routes, console commands,
  migrations, translations, and assets are exercised together.

When a user needs to customize a package config file, they can copy it into the application with:

```sh
composer yii-config-copy
```

After changing config group mappings, they should rebuild the merge plan with:

```sh
composer yii-config-rebuild
```
