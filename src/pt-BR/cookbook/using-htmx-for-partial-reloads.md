# Usando htmx para recarregar partes da página

O [htmx](https://htmx.org/) permite que links e formulários requisitem fragmentos de HTML e os troquem na página atual. Em uma
aplicação Yii, isso funciona bem para grids: ordenação, filtros e paginação podem atualizar só o grid enquanto o resto
da página continua no lugar.

Esta receita usa o `GridView` como exemplo porque ele tem links e
formulários que se beneficiam naturalmente de recargas parciais.  O mesmo
padrão funciona para qualquer widget ou fragmento de página: renderize o
fragmento separadamente, adicione atributos do htmx aos controles que devem
atualizá-lo e retorne apenas esse fragmento nas requisições do htmx.

## Instale o GridView

Instale o pacote de data view, se a aplicação ainda não o usa:

```shell
composer require yiisoft/yii-dataview
```

## Carregue o htmx

A configuração mais simples é carregar o htmx de uma CDN. Crie
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

Ao atualizar a versão do htmx, atualize a URL e o valor de `integrity`
juntos.

Em aplicações de produção, considere servir o htmx a partir dos assets da
sua aplicação para não depender de uma CDN de terceiros.  Baixe o
`htmx.min.js` para `assets/main/js/htmx.min.js` e use um asset bundle local:

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

Adicione o bundle ao asset do layout principal:

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

## Crie a parte recarregável

Comece com uma página comum que renderiza um grid. Em um projeto
`yiisoft/app` limpo, isso significa adicionar uma action, um template de
view e um widget que renderiza o grid. A primeira versão não precisa de
htmx. Ela deve funcionar como uma página completa normal.

Crie `src/Web/Users/Index/UsersGrid.php`:

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

Em uma aplicação real, substitua `dataReader()` por um reader baseado em uma
consulta ao banco de dados ou em um repositório. Mantenha o widget
responsável por renderizar o fragmento do grid.

Crie `src/Web/Users/Index/template.php`:

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

Crie `src/Web/Users/Index/Action.php`:

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

Adicione a action em `config/common/routes.php`:

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

Abra `/users` e verifique primeiro se a ordenação, os filtros e a paginação
funcionam com recarga completa da página.

## Adicione atributos do htmx ao grid

Agora atualize o `UsersGrid` para que os controles do grid requisitem um
fragmento e o troquem em `#UsersGridView`:

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

A parte importante é o array compartilhado `$htmxLoadAttributes`:

- `hx-boost="true"` faz os links e o formulário de filtro do grid enviarem
  requisições htmx.
- `hx-target="#UsersGridView"` diz ao htmx qual elemento substituir.
- `hx-swap="outerHTML"` substitui todo o container do grid pela resposta.
- `hx-replace-url="true"` mantém a URL do navegador sincronizada com a
  ordenação, o filtro e a página atuais.
- `hx-indicator="#UsersGridView"` marca o grid como o elemento indicador de
  carregamento enquanto a requisição está ativa.

O seletor de destino e o `id` do container precisam coincidir. Neste
exemplo, ambos usam `UsersGridView`.

## Retorne HTML parcial para requisições do htmx

O htmx envia o header `HX-Request` nas suas requisições.

Na action, retorne apenas o widget quando o header estiver presente:

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

O header `Vary` importa quando um navegador, proxy ou CDN faz cache das
respostas. A mesma URL pode retornar uma página completa sem `HX-Request` e
um fragmento com `HX-Request: true`, então os caches precisam manter essas
respostas separadas.

## Experimente

Abra a página da lista e use a ordenação, os filtros ou a paginação. A URL
do navegador deve mudar, e apenas o HTML do grid deve ser substituído.

Nas ferramentas de desenvolvedor do navegador, as requisições do htmx devem
incluir o header `HX-Request`. As respostas devem conter apenas o container
do grid.

Use o mesmo padrão para outros widgets ou fragmentos de página:

1. Coloque o HTML recarregável em um widget ou em outro pequeno
   renderizador.
2. Adicione atributos do htmx aos links e formulários que devem atualizá-lo.
3. Retorne o fragmento para requisições do htmx e a página completa para
   requisições comuns.
