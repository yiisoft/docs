# Widgets

Widgets são componentes reutilizáveis e autocontidos que encapsulam uma
lógica complexa de geração de HTML.  Eles oferecem uma forma limpa de criar
elementos de interface configuráveis, que podem ser usados em diferentes
views e aplicações. O Yii3 oferece um sistema de widgets flexível por meio
do pacote `yiisoft/widget`.

## Instalação

A funcionalidade de widgets vem do pacote `yiisoft/widget`:

```bash
composer require yiisoft/widget
```

Para widgets prontos (como formulários, navegação etc.), você também pode
instalar:

```bash
composer require yiisoft/yii-widgets
```

Esses pacotes já vêm incluídos por padrão no template de aplicação
`yiisoft/app`.

## Conceitos básicos

### Classe do widget

Um widget é uma classe PHP que estende a classe abstrata `Widget` e
implementa um método `render()` que devolve o conteúdo HTML como string.

### Widget factory

A `WidgetFactory` é responsável por criar as instâncias dos widgets e pode
injetar dependências por meio do container de DI.

### Configuração de widgets

Os widgets podem ser configurados com propriedades e métodos, o que os torna
altamente personalizáveis e reutilizáveis em diferentes contextos.

## Criando widgets próprios

### Widget simples

Este é um widget básico que exibe uma mensagem de alerta:

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

### Usando o widget

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

### Widget com dependências

Os widgets podem usar injeção de dependência para receber serviços:

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

## Configuração da widget factory

### Configuração de bootstrap

Inicialize a widget factory no bootstrap da sua aplicação:

**config/bootstrap.php**
```php
<?php

declare(strict_types=1);

use Yiisoft\Widget\WidgetFactory;

/**
 * @var \Psr\Container\ContainerInterface $container
 */

// Valores padrão da widget factory
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

### Configuração do container de DI

**config/web/di.php**
```php
use App\Widget\AlertWidget;
use App\Widget\UserMenuWidget;

return [
    // Configurações de widgets podem ser definidas aqui, se necessário
    AlertWidget::class => static fn() => new AlertWidget(),
    
    UserMenuWidget::class => static fn(
        App\Service\UserService $userService,
        Yiisoft\Router\UrlGeneratorInterface $urlGenerator
    ) => new UserMenuWidget($userService, $urlGenerator),
];
```

## Exemplos avançados de widgets

### Widget de lista de dados

Um widget que exibe uma lista de itens com paginação:

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

Uso:

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

### Widget de formulário

Um widget que simplifica a renderização de formulários:

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

### Widget de breadcrumb

Um widget para breadcrumbs de navegação:

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
                // Último item (página atual) - sem link
                $links[] = Html::span($item['label'], ['class' => 'breadcrumb-item active']);
            } else {
                // Item de breadcrumb comum, com link
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

## Boas práticas com widgets

### Padrão de configuração

Use métodos de configuração imutáveis:

```php
public function someProperty($value): self
{
    $new = clone $this;
    $new->someProperty = $value;
    return $new;
}
```

### Validação

Valide a configuração do widget no método render:

```php
protected function render(): string
{
    if (empty($this->items)) {
        throw new InvalidArgumentException('Items cannot be empty.');
    }
    
    // ... lógica de renderização
}
```

### Codificação de HTML

Sempre codifique os dados vindos do usuário:

```php
protected function render(): string
{
    return Html::div(Html::encode($this->userContent), [
        'class' => 'user-content',
    ]);
}
```

### Gerenciamento de assets

Registre os assets específicos do widget:

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
        // Registra os assets necessários
        $this->assetManager->register(ChartWidgetAsset::class);
        
        // Renderiza o conteúdo do widget
        return $this->renderChart();
    }
}
```

## Usando widgets em layouts

Os widgets são especialmente úteis em layouts, para elementos de interface
comuns:

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
    <!-- conteúdo do head -->
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

## Testando widgets

### Testes unitários

Teste a lógica de renderização do widget:

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

## Padrões comuns de widgets

### Renderização condicional

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

### Renderização baseada em template

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
    // Usa um view renderer para renderizar arquivos de template
    return $this->viewRenderer->renderPartialAsString($template, $data);
}
```

### Integração com eventos

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

Os widgets oferecem uma forma eficaz de criar componentes de interface
reutilizáveis e configuráveis em aplicações Yii3.  Eles ajudam a manter uma
separação clara de responsabilidades e deixam suas views mais fáceis de
manter e testar.
