# Using htmx for partial page reloads

[htmx](https://htmx.org/) lets links and forms request HTML fragments and swap them into the current page. In a Yii
application this works well for grids: sorting, filtering, and pagination can update only the grid while the rest of the
page stays in place.

This recipe shows the pattern used by the
[Yii demo diary application](https://github.com/yiisoft/demo-diary/pull/54): load htmx, extract the grid into a widget,
add htmx attributes to the grid controls, and return only the widget HTML for htmx requests.

## Load htmx

Create an asset bundle for htmx:

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Site\Layout;

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

When updating the htmx version, update the URL and `integrity` value together. If the application doesn't use a CDN,
download `htmx.min.js` and register it from an application asset directory instead.

Add the bundle to the main layout asset:

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Site\Layout;

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

## Extract the reloadable part

Put the grid into its own widget. The widget must render the complete HTML fragment that htmx will replace.

The example below uses `yiisoft/yii-dataview` `GridView`. Replace `UserDataReader`, `User`, and the columns with the
reader and columns from your application.

```php
<?php

declare(strict_types=1);

namespace App\UseCase\Users\List;

use App\Shared\UrlGenerator;
use App\UseCase\Users\List\DataReader\User;
use App\UseCase\Users\List\DataReader\UserDataReader;
use Yiisoft\Data\Paginator\PaginatorInterface;
use Yiisoft\Html\Html;
use Yiisoft\Widget\Widget;
use Yiisoft\Yii\DataView\GridView\Column\ActionButton;
use Yiisoft\Yii\DataView\GridView\Column\ActionColumn;
use Yiisoft\Yii\DataView\GridView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\GridView;
use Yiisoft\Yii\DataView\Pagination\OffsetPagination;
use Yiisoft\Yii\DataView\Pagination\PaginationWidgetInterface;

final class UsersList extends Widget
{
    public function __construct(
        private readonly UrlGenerator $urlGenerator,
        private readonly UserDataReader $userDataReader,
    ) {
    }

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
            ->dataReader($this->userDataReader)
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
                new DataColumn(
                    'id',
                    header: 'ID',
                    filter: true,
                ),
                new DataColumn(
                    'login',
                    filter: true,
                ),
                new DataColumn(
                    'name',
                    filter: true,
                ),
                new DataColumn(
                    'status',
                    content: static fn(User $user) => $user->status->label(),
                ),
                new ActionColumn(
                    before: '<div class="btn-group">',
                    after: '</div>',
                    buttons: [
                        new ActionButton(
                            Html::i()->class('bi bi-pencil'),
                            fn(User $user) => $this->urlGenerator->generate('user/update', ['id' => $user->id]),
                            title: 'Update',
                        ),
                    ],
                ),
            )
            ->render();
    }
}
```

The important part is the shared `$htmxLoadAttributes` array:

- `hx-boost="true"` makes the grid links and filter form send htmx requests.
- `hx-target="#UsersGridView"` tells htmx which element to replace.
- `hx-swap="outerHTML"` replaces the whole grid container with the response.
- `hx-replace-url="true"` keeps the browser URL in sync with the current sort, filter, and page.
- `hx-indicator="#UsersGridView"` marks the grid as the loading indicator element while the request is active.

The target selector and the container `id` must match. In this example, both use `UsersGridView`.

## Render the widget in the full page

In the full page template, render regular page content and put the reloadable widget where the grid belongs:

```php
<?php

declare(strict_types=1);

use App\Presentation\Site\Layout\Breadcrumbs\Breadcrumb;
use App\Shared\UrlGenerator;
use App\UseCase\Users\List\UsersList;
use Yiisoft\Html\Html;
use Yiisoft\Html\NoEncode;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var UrlGenerator $urlGenerator
 */

$this->setTitle('Users');
$this->addToParameter('breadcrumbs', new Breadcrumb('Users'));
?>
<div class="d-flex justify-content-between align-items-center">
    <h1>Users</h1>
    <?= Html::a(
        NoEncode::string('<i class="bi bi-person-plus me-1"></i> Create user'),
        $urlGenerator->generate('user/create'),
        ['class' => 'btn btn-outline-primary btn-sm'],
    ) ?>
</div>
<?= UsersList::widget() ?>
```

The first page load still returns a complete page with layout, title, breadcrumbs, and actions.

## Return partial HTML for htmx requests

htmx sends the `HX-Request` header with its requests.

In the action, return only the widget when the header is present:

```php
<?php

declare(strict_types=1);

namespace App\UseCase\Users\List;

use App\Presentation\Site\ResponseFactory\ResponseFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class Action
{
    public function __construct(
        private ResponseFactory $responseFactory,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $response = $request->getHeaderLine('HX-Request') === 'true'
            ? $this->responseFactory->createHtmlResponse(UsersList::widget())
            : $this->responseFactory->render(__DIR__ . '/template.php');

        return $response->withAddedHeader('Vary', 'HX-Request');
    }
}
```

The `Vary` header matters when a browser, proxy, or CDN caches responses. The same URL can return a full page without
`HX-Request` and a fragment with `HX-Request: true`, so caches must keep these responses separate.

If your response factory doesn't have a method for raw HTML, add one with `HtmlResponseFactory`:

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Site\ResponseFactory;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\DataResponse\ResponseFactory\HtmlResponseFactory;
use Yiisoft\Http\Status;

final readonly class ResponseFactory
{
    public function __construct(
        private HtmlResponseFactory $htmlResponseFactory,
        // Other dependencies.
    ) {
    }

    public function createHtmlResponse(
        mixed $data = null,
        int $code = Status::OK,
        string $reasonPhrase = '',
    ): ResponseInterface {
        return $this->htmlResponseFactory->createResponse($data, $code, $reasonPhrase);
    }
}
```

## Try it

Open the list page and use sorting, filtering, or pagination. The browser URL should change, and only the grid HTML
should be replaced.

In the browser developer tools, the htmx requests should include the `HX-Request` header. Their responses should contain
only the grid container.

Use the same pattern for other page fragments:

1. Put the reloadable HTML into a widget or another small renderer.
2. Add htmx attributes to the links and forms that should refresh it.
3. Return the fragment for htmx requests and the full page for regular requests.
