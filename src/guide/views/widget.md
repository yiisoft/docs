# Widgets

Widgets are reusable, self-contained components that encapsulate complex HTML generation logic.
They provide a clean way to create configurable UI elements that can be used across different views
and applications. Yii3 provides a flexible widget system through the `yiisoft/widget` package.

## Installation

The widget functionality is provided by the `yiisoft/widget` package:

```bash
composer require yiisoft/widget
```

For ready-made widgets (like forms, navigation, etc.), you can also install:

```bash
composer require yiisoft/yii-widgets
```

These packages are included by default in the `yiisoft/app` application template.

## Basic Concepts

### Widget Class

A widget is a PHP class that extends the abstract `Widget` class and implements a `render()` method
that returns HTML content as a string.

### Widget Factory

The `WidgetFactory` is responsible for creating widget instances and can inject dependencies
through the DI container.

### Widget Configuration

Widgets can be configured with properties and methods, making them highly customizable
and reusable across different contexts.

## Creating Custom Widgets

### Simple Widget

Here's a basic widget that displays an alert message:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use Yiisoft\Html\Html;
use Yiisoft\Widget\Widget;

final class AlertWidget extends Widget
{
    private string $message = '';
    private string $type = 'info';
    private bool $closeable = false;

    public function message(string $message): self
    {
        $new = clone $this;
        $new->message = $message;
        return $new;
    }

    public function type(string $type): self
    {
        $new = clone $this;
        $new->type = $type;
        return $new;
    }

    public function closeable(bool $closeable = true): self
    {
        $new = clone $this;
        $new->closeable = $closeable;
        return $new;
    }

    protected function render(): string
    {
        if (empty($this->message)) {
            return '';
        }

        $classes = ['alert', 'alert-' . $this->type];
        
        if ($this->closeable) {
            $classes[] = 'alert-dismissible';
        }

        $content = Html::encode($this->message);
        
        if ($this->closeable) {
            $content .= Html::button('×', [
                'type' => 'button',
                'class' => 'btn-close',
                'data-bs-dismiss' => 'alert',
            ]);
        }

        return Html::div($content, ['class' => implode(' ', $classes)]);
    }
}
```

### Using the Widget

```php
<?php

declare(strict_types=1);

use App\Widget\AlertWidget;

/**
 * @var \Yiisoft\View\WebView $this
 */
?>

<div class="page-content">
    <?= AlertWidget::widget()
        ->message('Operation completed successfully!')
        ->type('success')
        ->closeable() ?>
    
    <?= AlertWidget::widget()
        ->message('Please review the form errors below.')
        ->type('danger') ?>
</div>
```

### Widget with Dependencies

Widgets can use dependency injection for services:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use App\Service\UserService;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Widget\Widget;

final class UserMenuWidget extends Widget
{
    public function __construct(
        private UserService $userService,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    protected function render(): string
    {
        $currentUser = $this->userService->getCurrentUser();
        
        if ($currentUser === null) {
            return $this->renderLoginLink();
        }

        return $this->renderUserMenu($currentUser);
    }

    private function renderLoginLink(): string
    {
        return Html::a('Login', $this->urlGenerator->generate('login'), [
            'class' => 'btn btn-primary',
        ]);
    }

    private function renderUserMenu($user): string
    {
        $items = [
            Html::a('Profile', $this->urlGenerator->generate('user.profile'), [
                'class' => 'dropdown-item',
            ]),
            Html::a('Settings', $this->urlGenerator->generate('user.settings'), [
                'class' => 'dropdown-item',
            ]),
            '<div class="dropdown-divider"></div>',
            Html::a('Logout', $this->urlGenerator->generate('logout'), [
                'class' => 'dropdown-item',
            ]),
        ];

        return Html::div(
            Html::button(
                Html::encode($user->getName()) . ' <span class="caret"></span>',
                [
                    'class' => 'btn btn-secondary dropdown-toggle',
                    'type' => 'button',
                    'data-bs-toggle' => 'dropdown',
                ]
            ) .
            Html::div(implode('', $items), ['class' => 'dropdown-menu']),
            ['class' => 'dropdown']
        );
    }
}
```

## Widget Factory Setup

### Bootstrap Configuration

Initialize the widget factory in your application bootstrap:

**config/bootstrap.php**
```php
<?php

declare(strict_types=1);

use Yiisoft\Widget\WidgetFactory;

/**
 * @var \Psr\Container\ContainerInterface $container
 */

// Widget factory defaults
$widgetDefaults = [
    App\Widget\AlertWidget::class => [
        'type()' => ['info'],
        'closeable()' => [true],
    ],
    App\Widget\CardWidget::class => [
        'headerClass()' => ['card-header bg-primary text-white'],
    ],
];

WidgetFactory::initialize($container, $widgetDefaults);
```

### DI Container Configuration

**config/web/di.php**
```php
use App\Widget\AlertWidget;
use App\Widget\UserMenuWidget;

return [
    // Widget configurations can be defined here if needed
    AlertWidget::class => static fn() => new AlertWidget(),
    
    UserMenuWidget::class => static fn(
        App\Service\UserService $userService,
        Yiisoft\Router\UrlGeneratorInterface $urlGenerator
    ) => new UserMenuWidget($userService, $urlGenerator),
];
```

## Advanced Widget Examples

### Data List Widget

A widget that displays a list of items with pagination:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use Yiisoft\Data\Paginator\PaginatorInterface;
use Yiisoft\Html\Html;
use Yiisoft\Widget\Widget;

final class DataListWidget extends Widget
{
    private ?PaginatorInterface $paginator = null;
    private ?callable $itemRenderer = null;
    private string $containerClass = 'data-list';
    private string $itemClass = 'data-item';
    private string $emptyText = 'No items found.';

    public function paginator(PaginatorInterface $paginator): self
    {
        $new = clone $this;
        $new->paginator = $paginator;
        return $new;
    }

    public function itemRenderer(callable $renderer): self
    {
        $new = clone $this;
        $new->itemRenderer = $renderer;
        return $new;
    }

    public function containerClass(string $class): self
    {
        $new = clone $this;
        $new->containerClass = $class;
        return $new;
    }

    public function itemClass(string $class): self
    {
        $new = clone $this;
        $new->itemClass = $class;
        return $new;
    }

    public function emptyText(string $text): self
    {
        $new = clone $this;
        $new->emptyText = $text;
        return $new;
    }

    protected function render(): string
    {
        if ($this->paginator === null) {
            return '';
        }

        $items = $this->paginator->read();
        
        if (empty($items)) {
            return Html::div($this->emptyText, ['class' => 'empty-message']);
        }

        $itemsHtml = '';
        foreach ($items as $item) {
            $content = $this->itemRenderer 
                ? ($this->itemRenderer)($item)
                : Html::encode((string) $item);
                
            $itemsHtml .= Html::div($content, ['class' => $this->itemClass]);
        }

        return Html::div($itemsHtml, ['class' => $this->containerClass]);
    }
}
```

Usage:

```php
<?php

use App\Widget\DataListWidget;

/**
 * @var \Yiisoft\Data\Paginator\PaginatorInterface $postPaginator
 */
?>

<?= DataListWidget::widget()
    ->paginator($postPaginator)
    ->containerClass('posts-list row')
    ->itemClass('col-md-4 mb-3')
    ->itemRenderer(function ($post) {
        return $this->render('_post_card', ['post' => $post]);
    }) ?>
```

### Form Widget

A widget that simplifies form rendering:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use Yiisoft\Form\FormModelInterface;
use Yiisoft\Html\Html;
use Yiisoft\Widget\Widget;

final class FormWidget extends Widget
{
    private ?FormModelInterface $model = null;
    private string $action = '';
    private string $method = 'POST';
    private array $options = [];
    private array $fields = [];

    public function model(FormModelInterface $model): self
    {
        $new = clone $this;
        $new->model = $model;
        return $new;
    }

    public function action(string $action): self
    {
        $new = clone $this;
        $new->action = $action;
        return $new;
    }

    public function method(string $method): self
    {
        $new = clone $this;
        $new->method = $method;
        return $new;
    }

    public function options(array $options): self
    {
        $new = clone $this;
        $new->options = $options;
        return $new;
    }

    public function field(string $attribute, array $options = []): self
    {
        $new = clone $this;
        $new->fields[$attribute] = $options;
        return $new;
    }

    protected function render(): string
    {
        if ($this->model === null) {
            return '';
        }

        $formOptions = array_merge([
            'action' => $this->action,
            'method' => $this->method,
            'class' => 'form',
        ], $this->options);

        $content = '';
        foreach ($this->fields as $attribute => $options) {
            $content .= $this->renderField($attribute, $options);
        }

        return Html::form($content, $formOptions);
    }

    private function renderField(string $attribute, array $options): string
    {
        $label = $options['label'] ?? ucfirst($attribute);
        $type = $options['type'] ?? 'text';
        $class = $options['class'] ?? 'form-control';

        $field = Html::div(
            Html::label($label, null, ['class' => 'form-label']) .
            Html::input($type, $attribute, $this->getModelValue($attribute), [
                'class' => $class,
                'id' => $attribute,
            ]),
            ['class' => 'mb-3']
        );

        return $field;
    }

    private function getModelValue(string $attribute): mixed
    {
        return $this->model->getAttributeValue($attribute);
    }
}
```

### Breadcrumb Widget

A widget for navigation breadcrumbs:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Widget\Widget;

final class BreadcrumbWidget extends Widget
{
    private array $items = [];
    private string $separator = '';
    private array $options = [];

    public function __construct(
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function items(array $items): self
    {
        $new = clone $this;
        $new->items = $items;
        return $new;
    }

    public function separator(string $separator): self
    {
        $new = clone $this;
        $new->separator = $separator;
        return $new;
    }

    public function options(array $options): self
    {
        $new = clone $this;
        $new->options = $options;
        return $new;
    }

    protected function render(): string
    {
        if (empty($this->items)) {
            return '';
        }

        $links = [];
        $itemCount = count($this->items);
        
        foreach ($this->items as $index => $item) {
            if ($index === $itemCount - 1) {
                // Last item (current page) - no link
                $links[] = Html::span($item['label'], ['class' => 'breadcrumb-item active']);
            } else {
                // Regular breadcrumb item with link
                $url = isset($item['url']) 
                    ? (is_array($item['url']) 
                        ? $this->urlGenerator->generate($item['url'][0], $item['url'][1] ?? [])
                        : $item['url'])
                    : '#';
                    
                $links[] = Html::span(
                    Html::a($item['label'], $url),
                    ['class' => 'breadcrumb-item']
                );
            }
        }

        $options = array_merge(['class' => 'breadcrumb'], $this->options);

        return Html::nav(
            Html::ol(implode('', $links), ['class' => 'breadcrumb']),
            $options
        );
    }
}
```

## Widget Best Practices

### Configuration Pattern

Use immutable configuration methods:

```php
public function someProperty($value): self
{
    $new = clone $this;
    $new->someProperty = $value;
    return $new;
}
```

### Validation

Validate widget configuration in the render method:

```php
protected function render(): string
{
    if (empty($this->items)) {
        throw new InvalidArgumentException('Items cannot be empty.');
    }
    
    // ... render logic
}
```

### HTML Encoding

Always encode user data:

```php
protected function render(): string
{
    return Html::div(Html::encode($this->userContent), [
        'class' => 'user-content',
    ]);
}
```

### Asset Management

Register widget-specific assets:

```php
<?php

declare(strict_types=1);

namespace App\Widget;

use App\Asset\ChartWidgetAsset;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Widget\Widget;

final class ChartWidget extends Widget
{
    public function __construct(
        private AssetManager $assetManager,
    ) {}

    protected function render(): string
    {
        // Register required assets
        $this->assetManager->register(ChartWidgetAsset::class);
        
        // Render widget content
        return $this->renderChart();
    }
}
```

## Using Widgets in Layouts

Widgets are particularly useful in layouts for common UI elements:

**views/layout/main.php**
```php
<?php

declare(strict_types=1);

use App\Widget\NavigationWidget;
use App\Widget\FooterWidget;
use App\Widget\UserMenuWidget;

/**
 * @var \Yiisoft\View\WebView $this
 * @var string $content
 */
?>
<!DOCTYPE html>
<html>
<head>
    <!-- head content -->
</head>
<body>
    <header>
        <?= NavigationWidget::widget() ?>
        <?= UserMenuWidget::widget() ?>
    </header>
    
    <main>
        <?= $content ?>
    </main>
    
    <footer>
        <?= FooterWidget::widget() ?>
    </footer>
</body>
</html>
```

## Testing Widgets

### Unit Testing

Test widget rendering logic:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Widget;

use App\Widget\AlertWidget;
use PHPUnit\Framework\TestCase;

final class AlertWidgetTest extends TestCase
{
    public function testRenderWithMessage(): void
    {
        $widget = AlertWidget::widget()
            ->message('Test message')
            ->type('success');
            
        $output = $widget->render();
        
        $this->assertStringContainsString('Test message', $output);
        $this->assertStringContainsString('alert-success', $output);
    }
    
    public function testRenderEmpty(): void
    {
        $widget = AlertWidget::widget();
        $output = $widget->render();
        
        $this->assertEmpty($output);
    }
}
```

## Common Widget Patterns

### Conditional Rendering

```php
protected function render(): string
{
    if (!$this->shouldRender()) {
        return '';
    }
    
    return $this->doRender();
}

private function shouldRender(): bool
{
    return !empty($this->items) && $this->isVisible;
}
```

### Template-based Rendering

```php
protected function render(): string
{
    return $this->renderTemplate('widget-template', [
        'items' => $this->items,
        'options' => $this->options,
    ]);
}

private function renderTemplate(string $template, array $data): string
{
    // Use a view renderer to render template files
    return $this->viewRenderer->renderPartialAsString($template, $data);
}
```

### Event Integration

```php
protected function render(): string
{
    $event = new BeforeWidgetRender($this);
    $this->eventDispatcher->dispatch($event);
    
    $content = $this->doRender();
    
    $afterEvent = new AfterWidgetRender($this, $content);
    $this->eventDispatcher->dispatch($afterEvent);
    
    return $afterEvent->getContent();
}
```

Widgets provide a powerful way to create reusable, configurable UI components in Yii3 applications.
They help maintain clean separation of concerns and make your views more maintainable and testable.
