# Using htmx for partial page reloads

[htmx](https://htmx.org/) lets links and forms request HTML fragments and swap them into the current page. In a Yii
application, this works well for grids: sorting, filtering, and pagination can update only the grid while the rest of
the page stays in place.

This recipe uses `GridView` as an example because it has links and forms
that naturally benefit from partial reloads.  The same pattern works for any
widget or page fragment: render the fragment separately, add htmx attributes
to the controls that should refresh it, and return only that fragment for
htmx requests.

## Install GridView

Install the data view package if the application doesn't use it yet:

```shell
composer require yiisoft/yii-dataview
```

## Load htmx

The simplest setup is loading htmx from a CDN. Create
`src/Web/Shared/Layout/Main/HtmxAsset.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class HtmxAsset extends AssetBundle
{
    public bool $cdn = true;

    public array $js = [
        'https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.min.js',
    ];

    public array $jsOptions = [
        'integrity' => 'sha384-H5SrcfygHmAuTDZphMHqBJLc3FhssKjG7w/CeCpFReSfwBWDTKpkzPP8c+cLsK+V',
        'crossorigin' => 'anonymous',
    ];
}
```

When updating the htmx version, update the URL and `integrity` value
together.

For production applications, consider serving htmx from your application
assets to avoid depending on a third-party CDN.  Download `htmx.min.js` into
`assets/main/js/htmx.min.js` and use a local asset bundle:

```php
<?php

declare(strict_types=1);

namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class HtmxAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $js = [
        'js/htmx.min.js',
    ];
}
```

Add the bundle to the main layout asset:

```php
<?php

declare(strict_types=1);

namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $css = [
        'site.css',
    ];

    public array $depends = [
        BootstrapAsset::class,
        HtmxAsset::class,
    ];
}
```

## Create the reloadable part

Start with a regular page that renders a grid. In a clean `yiisoft/app`
project, this means adding an action, a view template, and a widget that
renders the grid. The first version doesn't need htmx. It should work as a
normal full page.

Create `src/Web/Users/Index/UsersGrid.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Users\Index;

use Yiisoft\Data\Paginator\PaginatorInterface;
use Yiisoft\Data\Reader\Iterable\IterableDataReader;
use Yiisoft\Widget\Widget;
use Yiisoft\Yii\DataView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\GridView;
use Yiisoft\Yii\DataView\Pagination\OffsetPagination;
use Yiisoft\Yii\DataView\Pagination\PaginationWidgetInterface;

final class UsersGrid extends Widget
{
    public function render(): string
    {
        /** @var PaginationWidgetInterface<PaginatorInterface> */
        $pagination = OffsetPagination::widget();

        return GridView::widget()
            ->containerAttributes([
                'id' => 'UsersGridView',
                'class' => 'mt-4 position-relative',
            ])
            ->dataReader($this->dataReader())
            ->pageSizeConstraint(5)
            ->paginationWidget($pagination)
            ->columns(
                new DataColumn('id', header: 'ID', filter: true),
                new DataColumn('login', header: 'Login', filter: true),
                new DataColumn('name', header: 'Name', filter: true),
                new DataColumn('status', header: 'Status', filter: true),
            )
            ->render();
    }

    private function dataReader(): IterableDataReader
    {
        return new IterableDataReader([
            ['id' => 1, 'login' => 'admin', 'name' => 'Alice Adams', 'status' => 'Active'],
            ['id' => 2, 'login' => 'editor', 'name' => 'Eve Editor', 'status' => 'Active'],
            ['id' => 3, 'login' => 'author', 'name' => 'Arthur Author', 'status' => 'Active'],
            ['id' => 4, 'login' => 'reviewer', 'name' => 'Rita Reviewer', 'status' => 'Inactive'],
            ['id' => 5, 'login' => 'support', 'name' => 'Sam Support', 'status' => 'Active'],
            ['id' => 6, 'login' => 'guest', 'name' => 'Grace Guest', 'status' => 'Inactive'],
        ]);
    }
}
```

For a real application, replace `dataReader()` with a reader backed by a
database query or repository. Keep the widget responsible for rendering the
grid fragment.

Create `src/Web/Users/Index/template.php`:

```php
<?php

declare(strict_types=1);

use App\Web\Users\Index\UsersGrid;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 */

$this->setTitle('Users');
?>
<h1>Users</h1>

<?= UsersGrid::widget() ?>
```

Create `src/Web/Users/Index/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Users\Index;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template');
    }
}
```

Add the action to `config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::get('/users')
                ->action(Web\Users\Index\Action::class)
                ->name('users/index'),
        ),
];
```

Open `/users` and make sure sorting, filtering, and pagination work with
full page reloads first.

## Add htmx attributes to the grid

Now update `UsersGrid` so the grid controls request a fragment and swap it
into `#UsersGridView`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Users\Index;

use Yiisoft\Data\Paginator\PaginatorInterface;
use Yiisoft\Data\Reader\Iterable\IterableDataReader;
use Yiisoft\Widget\Widget;
use Yiisoft\Yii\DataView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\GridView;
use Yiisoft\Yii\DataView\Pagination\OffsetPagination;
use Yiisoft\Yii\DataView\Pagination\PaginationWidgetInterface;

final class UsersGrid extends Widget
{
    public function render(): string
    {
        $htmxLoadAttributes = [
            'hx-indicator' => '#UsersGridView',
            'hx-target' => '#UsersGridView',
            'hx-replace-url' => 'true',
            'hx-swap' => 'outerHTML',
        ];

        /** @var PaginationWidgetInterface<PaginatorInterface> */
        $pagination = OffsetPagination::widget()->addLinkAttributes([
            'hx-boost' => 'true',
            ...$htmxLoadAttributes,
        ]);

        return GridView::widget()
            ->containerAttributes([
                'id' => 'UsersGridView',
                'class' => 'mt-4 position-relative',
            ])
            ->dataReader($this->dataReader())
            ->pageSizeConstraint(5)
            ->sortableLinkAttributes([
                'hx-boost' => 'true',
                ...$htmxLoadAttributes,
            ])
            ->filterFormAttributes([
                'hx-boost' => 'true',
                ...$htmxLoadAttributes,
            ])
            ->paginationWidget($pagination)
            ->columns(
                new DataColumn('id', header: 'ID', filter: true),
                new DataColumn('login', header: 'Login', filter: true),
                new DataColumn('name', header: 'Name', filter: true),
                new DataColumn('status', header: 'Status', filter: true),
            )
            ->render();
    }

    private function dataReader(): IterableDataReader
    {
        return new IterableDataReader([
            ['id' => 1, 'login' => 'admin', 'name' => 'Alice Adams', 'status' => 'Active'],
            ['id' => 2, 'login' => 'editor', 'name' => 'Eve Editor', 'status' => 'Active'],
            ['id' => 3, 'login' => 'author', 'name' => 'Arthur Author', 'status' => 'Active'],
            ['id' => 4, 'login' => 'reviewer', 'name' => 'Rita Reviewer', 'status' => 'Inactive'],
            ['id' => 5, 'login' => 'support', 'name' => 'Sam Support', 'status' => 'Active'],
            ['id' => 6, 'login' => 'guest', 'name' => 'Grace Guest', 'status' => 'Inactive'],
        ]);
    }
}
```

The important part is the shared `$htmxLoadAttributes` array:

- `hx-boost="true"` makes the grid links and filter form send htmx requests.
- `hx-target="#UsersGridView"` tells htmx which element to replace.
- `hx-swap="outerHTML"` replaces the whole grid container with the response.
- `hx-replace-url="true"` keeps the browser URL in sync with the current
  sort, filter, and page.
- `hx-indicator="#UsersGridView"` marks the grid as the loading indicator
  element while the request is active.

The target selector and the container `id` must match. In this example, both
use `UsersGridView`.

## Return partial HTML for htmx requests

htmx sends the `HX-Request` header with its requests.

In the action, return only the widget when the header is present:

```php
<?php

declare(strict_types=1);

namespace App\Web\Users\Index;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\DataResponse\ResponseFactory\HtmlResponseFactory;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
        private HtmlResponseFactory $htmlResponseFactory,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $response = $request->getHeaderLine('HX-Request') === 'true'
            ? $this->htmlResponseFactory->createResponse(UsersGrid::widget())
            : $this->viewRenderer->render(__DIR__ . '/template');

        return $response->withAddedHeader('Vary', 'HX-Request');
    }
}
```

The `Vary` header matters when a browser, proxy, or CDN caches
responses. The same URL can return a full page without `HX-Request` and a
fragment with `HX-Request: true`, so caches must keep these responses
separate.

## Try it

Open the list page and use sorting, filtering, or pagination. The browser
URL should change, and only the grid HTML should be replaced.

In the browser developer tools, the htmx requests should include the
`HX-Request` header. Their responses should contain only the grid container.

Use the same pattern for other widgets or page fragments:

1. Put the reloadable HTML into a widget or another small renderer.
2. Add htmx attributes to the links and forms that should refresh it.
3. Return the fragment for htmx requests and the full page for regular
   requests.
