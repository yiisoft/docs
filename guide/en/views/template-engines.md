# Template engines

Yii3 supports multiple template engines through a flexible renderer system. By default, PHP is used as the
template engine, but you can easily add support for other engines like Twig or create your own custom renderers.

## PHP Template Engine

The PHP template engine is the default and requires no additional setup. It provides full access to PHP's
capabilities while maintaining a clean separation between logic and presentation.

### Basic Syntax

A typical PHP template in a Yii3 application looks like this:

```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\User $user
 * @var \App\Entity\Post[] $posts
 * @var string $title
 */
?>
<div class="user-posts">
    <h1><?= Html::encode($title) ?></h1>
    <p>Posts by <?= Html::encode($user->getName()) ?>:</p>
    
    <?php if (empty($posts)): ?>
        <p class="no-posts">No posts found.</p>
    <?php else: ?>
        <div class="posts-list">
            <?php foreach ($posts as $post): ?>
                <article class="post">
                    <h2><?= Html::encode($post->getTitle()) ?></h2>
                    <p class="meta">
                        Published on <?= $post->getPublishedAt()->format('F j, Y') ?>
                    </p>
                    <div class="content">
                        <?= Html::encode($post->getExcerpt()) ?>
                    </div>
                    <a href="<?= Html::encode($post->getUrl()) ?>" class="read-more">
                        Read more
                    </a>
                </article>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
```

### Key Features

**Variable Type Hints**: Always declare variable types in the DocBlock at the top of your template. This provides
IDE autocompletion and helps catch errors:

```php
/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\User $user
 * @var string $title
 * @var bool $isAdmin
 */
```

**HTML Encoding**: Always encode output to prevent XSS attacks:

```php
<!-- Safe output -->
<?= Html::encode($user->getName()) ?>

<!-- URL encoding -->
<a href="<?= Html::encode($linkUrl) ?>">Link</a>

<!-- Trusted HTML (use carefully) -->
<?= $trustedHtmlContent ?>
```

**Control Structures**: Use alternative syntax for better readability:

```php
<?php if ($condition): ?>
    <div>Content when true</div>
<?php else: ?>
    <div>Content when false</div>
<?php endif; ?>

<?php foreach ($items as $item): ?>
    <div><?= Html::encode($item->name) ?></div>
<?php endforeach; ?>
```

### Rendering Sub-views

You can render partial views from within your templates:

```php
<?php

declare(strict_types=1);

/**
 * @var \Yiisoft\View\WebView $this
 * @var \App\Entity\Post[] $posts
 * @var \App\Entity\User $currentUser
 */
?>
<div class="blog">
    <!-- Render sidebar -->
    <?= $this->render('_sidebar', [
        'user' => $currentUser,
        'recentPosts' => array_slice($posts, 0, 5),
    ]) ?>
    
    <!-- Render main content -->
    <main class="content">
        <?php foreach ($posts as $post): ?>
            <?= $this->render('_post_item', ['post' => $post]) ?>
        <?php endforeach; ?>
    </main>
</div>
```

### Using Blocks

Blocks allow you to define content in views that can be used in layouts:

```php
<?php
// In your view file
$this->setBlock('breadcrumbs', 
    '<nav><a href="/">Home</a> > <a href="/blog">Blog</a> > ' . Html::encode($post->getTitle()) . '</nav>'
);

$this->setBlock('meta_description', $post->getMetaDescription());
?>

<article>
    <h1><?= Html::encode($post->getTitle()) ?></h1>
    <!-- ... rest of content ... -->
</article>
```

Then in your layout:

```php
<?php if ($this->hasBlock('meta_description')): ?>
    <meta name="description" content="<?= Html::encode($this->getBlock('meta_description')) ?>">
<?php endif; ?>

<body>
    <?php if ($this->hasBlock('breadcrumbs')): ?>
        <div class="breadcrumbs"><?= $this->getBlock('breadcrumbs') ?></div>
    <?php endif; ?>
    
    <?= $content ?>
</body>
```

## Twig Template Engine

Twig is a modern template engine that provides a more designer-friendly syntax. To use Twig in your Yii3 application,
you need to install the Twig extension.

### Installation

```bash
composer require yiisoft/view-twig
```

### Configuration

Configure Twig renderer in your application configuration:

**config/web/params.php**
```php
return [
    'yiisoft/view' => [
        'basePath' => '@views',
        'renderers' => [
            'twig' => [
                '__class' => \Yiisoft\View\Twig\ViewRenderer::class,
                '__construct()' => [
                    'environment' => \DI\get(\Twig\Environment::class),
                ],
            ],
        ],
    ],
];
```

**config/web/di.php**
```php
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

return [
    Environment::class => static function () {
        $loader = new FilesystemLoader('@views');
        $environment = new Environment($loader, [
            'cache' => '@runtime/cache/twig',
            'debug' => true,
        ]);
        
        return $environment;
    },
];
```

### Twig Syntax

Once configured, you can create `.twig` template files:

**views/site/about.twig**
```twig
{# Variable type hints for IDE support #}
{# @var user \App\Entity\User #}
{# @var posts \App\Entity\Post[] #}

<div class="user-profile">
    <h1>{{ user.name }}</h1>
    <p>Email: {{ user.email }}</p>
    
    {% if posts is not empty %}
        <h2>Recent Posts</h2>
        <ul class="posts">
            {% for post in posts %}
                <li>
                    <h3>{{ post.title }}</h3>
                    <p>{{ post.excerpt }}</p>
                    <time>{{ post.publishedAt|date('F j, Y') }}</time>
                </li>
            {% endfor %}
        </ul>
    {% else %}
        <p>No posts available.</p>
    {% endif %}
</div>
```

### Twig Features

**Automatic Escaping**: Twig automatically escapes variables for HTML context:

```twig
{# Automatically escaped #}
<h1>{{ title }}</h1>

{# Raw output (use carefully) #}
<div>{{ content|raw }}</div>
```

**Filters and Functions**: Twig provides many built-in filters and functions:

```twig
{# Date formatting #}
<time>{{ post.createdAt|date('Y-m-d H:i') }}</time>

{# String manipulation #}
<p>{{ description|truncate(100) }}</p>

{# URL generation #}
<a href="{{ path('user.profile', {'id': user.id}) }}">Profile</a>
```

**Template Inheritance**: Twig supports template inheritance:

**views/layout/main.twig**
```twig
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Default Title{% endblock %}</title>
</head>
<body>
    <main>
        {% block content %}{% endblock %}
    </main>
</body>
</html>
```

**views/site/about.twig**
```twig
{% extends "layout/main.twig" %}

{% block title %}About Us{% endblock %}

{% block content %}
    <h1>About Our Company</h1>
    <p>Welcome to our website!</p>
{% endblock %}
```

### Rendering Twig Templates

Use Twig templates the same way as PHP templates:

```php
// In your controller
public function about(): ResponseInterface
{
    return $this->viewRenderer->render('about.twig', [
        'user' => $this->getCurrentUser(),
        'posts' => $this->getRecentPosts(),
    ]);
}
```

## Custom Template Engines

You can create custom template engines by implementing the `TemplateRendererInterface`:

```php
<?php

declare(strict_types=1);

namespace App\View;

use Yiisoft\View\TemplateRendererInterface;

final class MarkdownRenderer implements TemplateRendererInterface
{
    public function __construct(
        private MarkdownParserInterface $parser,
    ) {}

    public function render(string $template, array $parameters = []): string
    {
        $content = file_get_contents($template);
        
        // Replace placeholders with parameters
        foreach ($parameters as $key => $value) {
            $content = str_replace("{{$key}}", (string) $value, $content);
        }
        
        return $this->parser->parse($content);
    }
}
```

Register your custom renderer:

```php
// In configuration
'yiisoft/view' => [
    'renderers' => [
        'md' => App\View\MarkdownRenderer::class,
    ],
],
```

Now you can use `.md` template files:

**views/content/help.md**
```markdown
# Help: {{title}}

Welcome, {{username}}!

This is a markdown template with **bold** and *italic* text.

- Feature 1
- Feature 2
- Feature 3
```

## Choosing the Right Template Engine

**Use PHP templates when:**
- You need maximum flexibility and performance
- Your team is comfortable with PHP
- You want to leverage existing PHP knowledge
- You need complex logic in templates (though this should be minimized)

**Use Twig templates when:**
- You want stricter separation between logic and presentation
- You work with designers who prefer cleaner syntax
- You need automatic escaping and security features
- You want template inheritance and advanced features

**Use custom templates when:**
- You have specific requirements not met by PHP or Twig
- You're working with specialized content formats
- You need integration with external template systems

## Best Practices

1. **Keep templates simple**: Move complex logic to controllers or services
2. **Always escape output**: Prevent XSS attacks by properly escaping variables
3. **Use meaningful names**: Name your templates and variables clearly
4. **Organize templates**: Group related templates in subdirectories
5. **Document variables**: Always add type hints for better IDE support
6. **Avoid business logic**: Keep business logic in models and services

> [!NOTE]
> [← Views](view.md) |
> [View injections →](view-injections.md)
