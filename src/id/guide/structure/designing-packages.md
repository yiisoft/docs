# Designing packages for Yii applications

This page describes how to design a Composer package that adds behavior to a
Yii application through configuration.  Use it when your package needs to
register services, routes, events, commands, assets, migrations,
translations, or a theme.

For installing and updating packages in an application, see [Using
packages](package.md).

## Composer metadata

Each package must have a `composer.json` file in its root directory. At
minimum, define a package name, dependencies, autoloading, and Yii config
metadata when the package integrates with a Yii application.

Use a package name in the `vendor-name/project-name` format:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "description": "Blog integration for Yii applications",
    "require": {
        "php": ">=8.2",
        "yiisoft/router": "^4.0"
    },
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    }
}
```

Use stable dependency constraints for stable releases. Avoid using `yiisoft`
as your vendor name because it is reserved for Yii packages.

If your package requires a Yii application, prefixing the project name with
`yii-` can make that clear on Packagist.

## Package layout

A Yii-aware package is a regular Composer package with PHP classes, optional
resource files, and optional config files.  Keep the configuration in a
predictable directory and make the public API explicit:

```
composer.json
config/
    params.php
    di.php
    di-providers.php
    routes.php
    events.php
    params-web.php
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

Use only the files your package needs. For example, a package with console
commands but no web routes does not need `routes.php`.

## Config plugin metadata

Yii applications use [yiisoft/config](https://github.com/yiisoft/config) to
discover package configuration.  Declare package config files in the
`extra.config-plugin` section of `composer.json`:

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
        "config-plugin": {
            "params": "config/params.php",
            "di": "config/di.php",
            "di-providers": "config/di-providers.php",
            "routes": "config/routes.php",
            "events": "config/events.php",
            "params-web": "config/params-web.php",
            "params-console": "config/params-console.php",
            "di-console": "config/di-console.php"
        }
    }
}
```

Each `config-plugin` key is a config group name and each value is a path
relative to the package root.

Use the common, web, and console groups consistently:

- `params`, `di`, `di-providers`, `di-delegates`, `events`, and `bootstrap`
  apply to both web and console entry points.
- `params-web`, `di-web`, `di-providers-web`, `events-web`, `bootstrap-web`,
  and `routes` apply to web entry points.
- `params-console`, `di-console`, `di-providers-console`, `events-console`,
  and `bootstrap-console` apply to console entry points.

If your package defines a new config group, document how an application
should load that group. Prefer the standard groups when you integrate with
Yii services because application templates and Yii packages already use
these names.

After users install, update, remove, or dump Composer autoload files, the
config plugin rebuilds the merge plan that Yii reads at runtime. If users
edit their root package configuration manually, ask them to run:

```sh
composer yii-config-rebuild
```

## Parameter

Put default options in `config/params.php`. Group package parameters under
the Composer package name to avoid collisions:

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

Application developers can override these values in their own
`config/common/params.php`, `config/web/params.php`,
`config/console/params.php`, or environment-specific parameter files.

Do not read environment variables or global state from package code when a
parameter can express the choice. Use parameters to configure services
through DI definitions or service providers.

## DI definitions

Use `config/di.php`, `config/di-web.php`, or `config/di-console.php` for
direct container definitions:

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

Prefer direct DI definitions when the configuration describes one service
clearly.

## DI service providers

Use a DI provider when registration belongs together as a reusable unit:
several related services, aliases, factory definitions, or extensions.

Register providers in `config/di-providers.php`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Provider\BlogProvider;

return [
    'vendor/blog/post-repository' => BlogProvider::class,
];
```

Declare the group in `composer.json`:

```json
"extra": {
    "config-plugin": {
        "di-providers": "config/di-providers.php"
    }
}
```

A provider can return several service definitions and extensions. Place the
provider class in `src/Provider/BlogProvider.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Provider;

use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Vendor\Blog\CachedPostRepository;
use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;
use Yiisoft\Di\ServiceProviderInterface;

final class BlogProvider implements ServiceProviderInterface
{
    public function getDefinitions(): array
    {
        return [
            PostRepository::class => PostRepository::class,
            PostRepositoryInterface::class => static fn (
                ContainerInterface $container
            ): CachedPostRepository => new CachedPostRepository(
                $container->get(PostRepository::class),
                $container->get(LoggerInterface::class),
            ),
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

## Rute

Web packages can add routes through `config/routes.php`, declared as the
`routes` group:

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

Route names should be package-prefixed. This avoids collisions with
application routes and with routes from other packages.

Keep package routes small and overridable. If an application needs full
control over URLs, document the actions and let the application define its
own routes.

## Event

Use `config/events.php`, `config/events-web.php`, or
`config/events-console.php` to attach package handlers to events:

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

Handlers can be closures, callables, invokable objects, invokable class
names, or DI aliases supported by the event dispatcher configuration. Prefer
class names for package handlers because applications can override their
dependencies through the container.

## Assets

If your package ships CSS, JavaScript, images, or fonts, define asset
bundles as PHP classes. For example, place this class in
`src/Asset/BlogAsset.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Asset;

use Yiisoft\Assets\AssetBundle;

final class BlogAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    public ?string $sourcePath = __DIR__ . '/../../assets';

    public array $css = [
        'blog.css',
    ];

    public array $js = [
        'blog.js',
    ];
}
```

Users can register the bundle from a view, widget, view injection, or
action:

```php
$assetManager->register(BlogAsset::class);
```

Use `$sourcePath` for files shipped inside the package. Use `$basePath` and
`$baseUrl` as the public target where the asset manager publishes them.

## Migrations

Packages that need database schema changes should ship migrations and add
their namespace or path to `yiisoft/db-migration` parameters.

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

Put this in `config/params-console.php` and declare it as `params-console`
in `composer.json`.

This only contributes package migration locations. The application still
needs `yiisoft/db-migration` installed and a database connection configured
before migration commands can run.

Package migrations must be stable after release. Do not edit a migration
that users may already have applied. Add a new migration instead.

## Translations

If the package has user-facing messages, give it a dedicated translation
category and register a category source in `config/di.php`:

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

A package can ship view files and assets for a theme. Do not activate it
from vendor package configuration. Instead, document the root application
configuration needed to enable it. For the application template, this
belongs in `config/web/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/view' => [
        'theme' => [
            'pathMap' => [
                '@views' => '@vendor/vendor/blog/views',
            ],
            'basePath' => '@vendor/vendor/blog/assets',
            'baseUrl' => '@assetsUrl/vendor-blog',
        ],
    ],
];
```

Themes replace view paths according to a path map. Document which
application view paths your theme replaces and which asset URL must be
published or exposed by the application.

Do not set `yiisoft/view.theme` directly in vendor package
configuration. `yiisoft/view` already defines that key, and duplicate keys
in the same configuration layer are not allowed.

If your package only provides optional theme files, do not make the theme
active by default. Provide the view files, asset bundle, and a documented
parameter snippet so the application can opt in.

## Console commands

Console packages can add Symfony Console commands through
`config/params-console.php`:

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

Command names should be package-prefixed. Keep command dependencies
constructor-injected and registered through DI.

## Application overrides

Package configuration is the default layer. The application can override it
in its root package configuration.  Design for that:

- Use package-prefixed parameter keys, route names, event handler IDs, and
  DI aliases.
- Keep default configuration small and documented.
- Avoid doing irreversible work during service registration.
- Put optional integrations in separate config files or providers when they
  require optional Composer packages.
- Test the package inside a minimal Yii application so the config plugin, DI
  container, routes, console commands, migrations, translations, and assets
  are exercised together.

When a user needs to customize package configuration, they usually do not
need to copy the package config file. They can partially redefine the needed
keys in the application configuration.

After changing config group mappings, they should rebuild the merge plan
with:

```sh
composer yii-config-rebuild
```

## Releasing packages

Before tagging a release, test the package by itself and inside a minimal
Yii application. Include a `README.md`, `CHANGELOG.md`, and `UPGRADE.md`
when behavior or configuration changes require explanation.

Use [semantic versioning](https://semver.org) for public releases. After the
first release, do not edit migrations that users may already have applied;
add new migrations instead.
