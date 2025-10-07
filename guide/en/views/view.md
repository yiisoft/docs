# Views

Views are responsible for presenting data to end users. In Yii3, views are typically PHP files that contain
presentation logic and HTML markup. The view system provides a flexible way to organize your presentation layer
and supports features like layouts, partial views, and template engines.

## Installation

For basic view functionality, you need the `yiisoft/view` package:

```sh
composer require yiisoft/view
```

For web applications, you should also install the `yiisoft/yii-view-renderer` package which provides
PSR-7 compatibility and web-specific features:

```sh
composer require yiisoft/yii-view-renderer
```

These packages are included by default in the `yiisoft/app` application template.

## Basic Concepts

### View Files

A view file is a PHP script that contains presentation logic. In the `yiisoft/app` template, view files are typically 
stored alongside their controllers (e.g., `src/Web/HomePage/template.php` or `src/Controller/Echo/template.php`). 
Here's a simple view file example:

**src/Web/About/template.php**
```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var string $title
 * @var string $content
 */
?>
<h1><?= Html::encode($title) ?></h1>
<div class="content">
    <?= Html::encode($content) ?>
</div>
```

### ViewRenderer in Controllers

In a typical web application using the `yiisoft/app` template, you use the `ViewRenderer` class to render views
from your controllers:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class SiteController
{
    public function __construct(
        private ViewRenderer $viewRenderer,
    ) {}

    public function about(): ResponseInterface
    {
        return $this->viewRenderer->render('about', [
            'title' => 'About Us',
            'content' => 'Welcome to our website!',
        ]);
    }
}
```

### View Context and Paths

In the `yiisoft/app` template, view files are typically stored alongside their controllers. When using `ViewRenderer`, 
you can specify the view path relative to the controller directory or use absolute paths:

You can also specify absolute paths or use different path formats:

```php
// Relative to current controller directory
$this->viewRenderer->render('about');

// Absolute path from views root
$this->viewRenderer->render('//site/about');

// Relative to current view (when rendering from within another view)
$this->viewRenderer->render('./partial');

// Parent directory
$this->viewRenderer->render('../shared/header');
```

## Working with Layouts

### Default Layout

Most web applications use a common layout for all pages. In the `yiisoft/app` template,
layouts are stored in `src/Web/Shared/Layout/Main/` directory. You can set a default layout:

**config/common/params.php**
```php
return [
    'yiisoft/yii-view-renderer' => [
        'viewPath' => null,
        'layout' => '@src/Web/Shared/Layout/Main/layout.php',
    ],
];
```

### Layout Structure

A typical layout file looks like this:

**src/Web/Shared/Layout/Main/layout.php**
```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var string $content
 * @var string $title
 */
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Html::encode($title) ?></title>
    <?php $this->head() ?>
</head>
<body>
    <?php $this->beginBody() ?>
    <header>
        <nav>
            <!-- Navigation menu -->
        </nav>
    </header>
    
    <main>
        <?= $content ?>
    </main>
    
    <footer>
        <p>&copy; 2024 My Application</p>
    </footer>
    <?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

### Rendering Without Layout

Sometimes you need to render a view without a layout (for example, for AJAX responses):

```php
public function ajaxContent(): ResponseInterface
{
    return $this->viewRenderer
        ->withLayout(null)
        ->render('ajax-content', ['data' => $data]);
}

// Or use the renderPartial method
public function ajaxContent(): ResponseInterface
{
    return $this->viewRenderer->renderPartial('ajax-content', ['data' => $data]);
}
```

## Passing Data to Views

### View Parameters

Data is passed to views through an associative array as the second parameter to the render method:

```php
return $this->viewRenderer->render('user/profile', [
    'user' => $user,
    'posts' => $posts,
    'isAdmin' => $currentUser->isAdmin(),
]);
```

In the view, these become regular PHP variables:

```php
<?php

declare(strict_types=1);

/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\User $user
 * @var \App\Entity\Post[] $posts
 * @var bool $isAdmin
 */
?>
<h1>Profile: <?= Html::encode($user->getName()) ?></h1>
<?php if ($isAdmin): ?>
    <p>Admin panel available</p>
<?php endif; ?>
```

### View Injections

View injections allow you to automatically inject common data into all views. This is useful for site-wide
data like user information, navigation menus, or configuration values.

```php
final class CommonViewInjection implements CommonParametersInjectionInterface
{
    public function __construct(
        private UserService $userService,
        private ConfigService $config,
    ) {}

    public function getCommonParameters(): array
    {
        return [
            'currentUser' => $this->userService->getCurrentUser(),
            'siteName' => $this->config->get('site.name'),
            'version' => $this->config->get('app.version'),
        ];
    }
}
```

## Nested Views and Partials

### Rendering Sub-views

You can render other views from within a view using the `$this->render()` method:

```php
<?php

declare(strict_types=1);

/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\Post[] $posts
 */
?>
<div class="posts">
    <?php foreach ($posts as $post): ?>
        <?= $this->render('_post_item', ['post' => $post]) ?>
    <?php endforeach; ?>
</div>
```

**src/Web/Post/_item.php**
```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\Post $post
 */
?>
<article class="post">
    <h2><?= Html::encode($post->getTitle()) ?></h2>
    <p><?= Html::encode($post->getExcerpt()) ?></p>
    <time><?= $post->getCreatedAt()->format('Y-m-d') ?></time>
</article>
```

### Using Blocks

Blocks allow you to define content in one view and display it in another, typically in layouts:

```php
// In a view file
<?php $this->setBlock('sidebar', $this->render('_sidebar', ['items' => $sidebarItems])) ?>

// In the layout file
<?php if ($this->hasBlock('sidebar')): ?>
    <aside><?= $this->getBlock('sidebar') ?></aside>
<?php endif; ?>
```

## Rendering as String

If you need the rendered content as a string instead of a PSR-7 response:

```php
public function getEmailContent(): string
{
    return $this->viewRenderer->renderAsString('email/welcome', [
        'user' => $user,
    ]);
}
```

## View Events

The view system triggers events during the rendering process that you can listen to:

```php
use Yiisoft\View\Event\WebView\BeforeRender;
use Yiisoft\View\Event\WebView\AfterRender;

// Example event listener
final class ViewEventListener
{
    public function onBeforeRender(BeforeRender $event): void
    {
        // Add global CSS class based on view name
        if (str_contains($event->getFile(), 'admin/')) {
            $event->getView()->registerCssClass('admin-view');
        }
    }

    public function onAfterRender(AfterRender $event): void
    {
        // Log rendering time
        $this->logger->info('View rendered', [
            'view' => $event->getFile(),
            'time' => $event->getRenderTime(),
        ]);
    }
}
```

## Security Considerations

Always escape output to prevent XSS attacks:

```php
<?php

use Yiisoft\Html\Html;

/**
 * @var string $userInput
 * @var string $trustedHtml
 */
?>

<!-- Escape user input -->
<p><?= Html::encode($userInput) ?></p>

<!-- For trusted HTML, use without encoding -->
<div><?= $trustedHtml ?></div>

<!-- For URLs -->
<a href="<?= Html::encode($url) ?>">Link</a>

<!-- For attributes -->
<input type="text" value="<?= Html::encode($value) ?>">
```

For HTML content that needs to allow some tags, consider using HTML Purifier:

```php
use Yiisoft\Html\Html;

$cleanHtml = Html::sanitize($untrustedHtml, [
    'allowed_tags' => ['p', 'br', 'strong', 'em'],
]);
```

## View File Organization

In the `yiisoft/app` template, organize your view files following these conventions:

```
src/
├── Web/
│   ├── Shared/
│   │   └── Layout/
│   │       └── Main/
│   │           ├── layout.php      # Main layout
│   │           └── MainAsset.php   # Layout assets
│   ├── HomePage/
│   │   └── template.php            # Homepage view
│   ├── About/
│   │   └── template.php            # About page view
│   ├── Contact/
│   │   └── template.php            # Contact page view
│   └── User/
│       ├── Profile/
│       │   └── template.php        # User profile view
│       └── Edit/
│           └── template.php        # Edit profile view
```

Use underscore prefix (`_`) for partial views that are intended to be rendered from within other views.

> [!NOTE]
> [Template engines →](template-engines.md) |
> [View injections →](view-injections.md)
