# Template engines

Yii3 supports multiple template engines through a flexible renderer system. By default, PHP is used as the
template engine, but you can easily add support for other engines like Twig or create your own custom renderers.

PHP templates were described in the "[View](view.md)" guide section. 

## Twig Template Engine

Twig is a modern template engine that provides a more designer-friendly syntax. To use Twig in your Yii3 application,
you need to install the Twig extension.

```bash
composer require yiisoft/view-twig
```

Now you can use `.twig` templates. For example, `views/site/about.twig`:

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
use Yiisoft\Container\Reference;

// In configuration
'yiisoft/view' => [
    'renderers' => [
        'md' => Reference::to(App\View\MarkdownRenderer::class),
    ],
],
```

Now you can use `.md` template files:

**views/content/help.md**
```markdown
# Help: {{title}}

Welcome, {{username}}!

This is a Markdown template with **bold** and *italic* text.

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
