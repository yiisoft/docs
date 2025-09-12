# Views

Yii3 views could be used by requiring the `yiisoft/view` package:

```sh
composer require yiisoft/view
```

The package provides template rendering abstraction supporting layout-view-subview hierarchy, custom renderers
with PHP-based as default, and more.

Usage is the following:

```php
```

If you're building a web application, you should require the `yiisoft/yii-view-renderer` package as well:

```sh
composer require yiisoft/yii-view-renderer
```

It provides some extra web-specific functionality and adds compatibility with PSR-7 interfaces and could be used like
the following:

```php
<?php

declare(strict_types=1);

namespace App\Controller\HomePage;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
    ) {}

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template', [
            'name' => 'Sergei',
            'surname' => 'Predvoditelev',
        ]);
    }
}
```

In both cases a template file should be supplied. The template syntax depends on the template engine used.

> [!NOTE]
> [Template engines →](template-engines.md)
