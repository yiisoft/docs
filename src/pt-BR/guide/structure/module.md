# Modules

A module is an application part grouped around a business context or a
reusable feature. In Yii, this is a design boundary, not a required base
class. A module can be:

- application code under the `App\` namespace;
- a [Composer package](package.md) installed into `vendor/`;
- code that starts in the application and is later extracted into a package.

Use a module when a group of actions, domain services, repositories, event
handlers, views, assets, commands, and related configuration changes
together and has a name that makes sense to the business.

For example, a blog module can live in an application as:

```
src/
    Blog/
        Post/
            Post.php
            PostRepositoryInterface.php
            InMemoryPostRepository.php
        Web/
            IndexAction.php
            index.php
```

The same structure can later become a Composer package by changing the
namespace and adding package metadata and configuration files. See
[Designing packages](designing-packages.md) for package-specific details.

## Module boundaries

Keep module code together by context first and by technical type
second. This is close to the [vertical
slices](../../cookbook/organizing-code/structuring-by-use-case-with-vertical-slices.md)
approach, but at a larger application-structure boundary. Prefer
`App\Blog\Post\PostRepositoryInterface` over a global
`App\Repository\PostRepositoryInterface` when the repository belongs to blog
posts only.

Treat module classes as a public API only when another module is expected to
use them. Good public API classes are usually:

- commands or queries that express a use case;
- DTOs or value objects passed between modules;
- interfaces for services another module may call;
- events emitted by the module.

Keep implementation classes private to the module namespace. Other modules
should not depend on `App\Blog\Post\InMemoryPostRepository` or a controller
action directly. They should depend on an interface, a use case class, or an
event.

## Interfaces between modules

Put an interface where the contract belongs:

- If the interface describes a capability provided by a module, place it in
  that module. For example, `App\Blog\Post\PostRepositoryInterface` belongs
  to the blog module because it describes how blog posts are read.
- If the interface describes what a module needs from the outside world,
  place it in the consuming module. For example,
  `App\Order\Customer\CustomerVerifierInterface` belongs to the order module
  if orders only need a yes-or-no customer check. The customer module, an
  application adapter, or a package can provide the implementation.

This keeps dependencies explicit. A module can depend on another module's
public contract, but it should not reach into another module's internal
implementation classes.

First, define the interface in the module:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Post;

interface PostRepositoryInterface
{
    /**
     * @return list<Post>
     */
    public function findLatest(): array;
}
```

Put the implementation in the same module and bind the interface to it:

```php
<?php

declare(strict_types=1);

use App\Blog\Post\InMemoryPostRepository;
use App\Blog\Post\PostRepositoryInterface;

return [
    PostRepositoryInterface::class => InMemoryPostRepository::class,
];
```

In the default application template, put this file under
`config/common/di/`, for example `config/common/di/blog.php`. The template
loads `config/common/di/*.php` into the shared `di` configuration group, so
the binding is available to web and console entry points.

## Web actions

Actions belong to the module when they are the web entry point for module
behavior:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Web;

use App\Blog\Post\PostRepositoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class IndexAction
{
    public function __construct(
        private PostRepositoryInterface $posts,
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/index', [
            'posts' => $this->posts->findLatest(),
        ]);
    }
}
```

Keep request parsing and response creation in the action. Keep business
decisions in the module's domain classes or use case services.

## Routes

For a small application, add module routes directly to
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
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

    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

Use module-prefixed route names, such as `blog/index`, to avoid collisions.

If the application has many modules, you can give each module its own route
config file. Change the `routes` group in `config/configuration.php`:

```php
'routes' => [
    'common/routes.php',
    'common/routes/*.php',
],
```

Then create `config/common/routes/blog.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

After changing `config/configuration.php` or adding files matched by a
config wildcard, rebuild the merge plan:

```sh
composer yii-config-rebuild
```

## Module configuration

Application modules use the same configuration groups as packages. The
difference is where the configuration lives:

- application module configuration lives in the root application under
  `config/`;
- package module configuration lives in the package and is declared in
  `extra.config-plugin`.

Common locations for application module configuration are:

```
config/
    common/
        di/
            blog.php
        routes/
            blog.php
        params.php
    console/
        params.php
    web/
        params.php
```

Put shared service definitions in `common/di/`. Put web-only definitions in
`web/di/`. Put console-only parameters or command registrations in
`console/params.php`.

When a module grows enough to become reusable, move its PHP classes to a
Composer package, move its configuration files to the package `config/`
directory, and declare them in the package `composer.json`:

```json
{
    "extra": {
        "config-plugin": {
            "di": "config/di.php",
            "routes": "config/routes.php"
        }
    }
}
```

The application can then override package defaults in its own config files.

## Cross-module communication

Choose the smallest coupling that supports the behavior:

- Use constructor injection with an interface for a direct synchronous call.
- Use an event when the producer should not know who reacts to something
  that happened.
- Use an application service or use case class when orchestration belongs
  outside both modules.
- Use a package when the module must be reused by more than one application.

Avoid service locator calls and global state inside module classes. Let
actions, commands, and services receive their dependencies through
constructors so module boundaries stay visible in code and testable in
isolation.
