# Assets

O gerenciamento de assets é essencial em aplicações web modernas. Assets
incluem folhas de estilo CSS, arquivos JavaScript, imagens, fontes e outros
recursos estáticos. O Yii3 oferece um sistema completo de gerenciamento de
assets por meio do pacote `yiisoft/assets`, que cuida das dependências, da
otimização e da publicação desses recursos.

## Instalação

A funcionalidade de gerenciamento de assets vem do pacote `yiisoft/assets`:

```bash
composer require yiisoft/assets
```

Esse pacote já vem incluído por padrão no template de aplicação
`yiisoft/app`.

## Conceitos básicos

### Asset bundles

Um asset bundle é um conjunto de arquivos de asset relacionados (CSS,
JavaScript, imagens) agrupados logicamente.  Asset bundles podem depender de
outros bundles, o que permite gerenciar as dependências corretamente.

### Asset Manager

O Asset Manager é responsável por: - Resolver as dependências dos asset
bundles - Publicar assets de diretórios protegidos em locais acessíveis pela
web - Combinar e minificar assets (quando configurado)  - Gerar as URLs
corretas dos assets

## Criando asset bundles

### Asset bundle básico

Esta é uma definição simples de asset bundle:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'css/main.css',
        'css/responsive.css',
    ];
    
    public array $js = [
        'js/main.js',
        'js/utils.js',
    ];
    
    public array $depends = [
        BootstrapAsset::class,
        JqueryAsset::class,
    ];
}
```

### Propriedades do asset bundle

**Configuração de caminhos:**
- `$basePath` (`string|null`) - Caminho físico onde ficam os arquivos de asset acessíveis pela web.
- `$baseUrl` (`string|null`) - Caminho da URL acessível pela web para os assets.
- `$sourcePath` (`string|null`) - Diretório de origem dos assets que precisam ser publicados.
- `$cdn` (`bool`) - Indica se o bundle usa exclusivamente arquivos de CDN.

**Arquivos de asset:**
- `$css` - Array de arquivos CSS
- `$js` - Array de arquivos JavaScript  

**Dependências:**
- `$depends` - Array de outros asset bundles dos quais este bundle depende

**Opções:**
- `$jsOptions` - Atributos HTML das tags de JavaScript
- `$cssOptions` - Atributos HTML das tags link de CSS

### Asset bundle avançado

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class AdminAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    // Arquivos CSS com media queries
    public array $css = [
        'css/admin/main.css',
        ['css/admin/print.css', 'media' => 'print'],
        ['css/admin/mobile.css', 'media' => 'screen and (max-width: 768px)'],
    ];
    
    // Arquivos JavaScript com atributos
    public array $js = [
        'js/admin/core.js',
        ['js/admin/charts.js', 'defer' => true],
        ['js/admin/analytics.js', 'async' => true],
    ];
    
    // Opções globais para todos os arquivos JS deste bundle
    public array $jsOptions = [
        'data-admin' => 'true',
    ];
    
    // Opções globais para todos os arquivos CSS deste bundle
    public array $cssOptions = [
        'data-bundle' => 'admin',
    ];
    
    public array $depends = [
        MainAsset::class,
        ChartJsAsset::class,
    ];
}
```

## Usando asset bundles

### Em controllers

Registre os asset bundles nos seus controllers ou views:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\Asset\MainAsset;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final class SiteController
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
        private AssetManager $assetManager,
    ) {}

    public function index(): ResponseInterface
    {
        // Registra o asset bundle
        $this->assetManager->register(MainAsset::class);
        
        return $this->viewRenderer->render('index', [
            'title' => 'Home Page',
        ]);
    }
    
    public function admin(): ResponseInterface
    {
        // Registra vários asset bundles
        $this->assetManager->registerMany([
            MainAsset::class,
            AdminAsset::class,
        ]);
        
        return $this->viewRenderer->render('admin/dashboard');
    }
}
```

### Em views

Você também pode registrar assets diretamente nas views:

```php
<?php

declare(strict_types=1);

use App\Asset\ProductAsset;
use Yiisoft\Assets\AssetManager;

/**
 * @var \Yiisoft\View\WebView $this
 * @var AssetManager $assetManager
 * @var array $product
 */

// Registra os assets específicos do produto
$assetManager->register(ProductAsset::class);
?>

<div class="product-page">
    <h1><?= Html::encode($product['name']) ?></h1>
    <!-- Conteúdo do produto -->
</div>
```

### Com integração à WebView

A abordagem recomendada é integrar com a WebView para que os assets sejam
renderizados automaticamente:

```php
<?php

declare(strict_types=1);

use App\Asset\MainAsset;

/**
 * @var \Yiisoft\View\WebView $this
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Registra os assets
$assetManager->register(MainAsset::class);

// Adiciona todos os assets registrados à view
$this->addCssFiles($assetManager->getCssFiles());
$this->addCssStrings($assetManager->getCssStrings());
$this->addJsFiles($assetManager->getJsFiles());
$this->addJsStrings($assetManager->getJsStrings());
$this->addJsVars($assetManager->getJsVars());
?>

<div class="page-content">
    <!-- Conteúdo da sua página -->
</div>
```

## Publicação de assets

### Publicação a partir do source path

Quando os assets ficam em diretórios não acessíveis pela web (como pacotes
do vendor), eles precisam ser publicados:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class VendorAsset extends AssetBundle
{
    // Diretório de origem (não acessível pela web)
    public ?string $sourcePath = '@vendor/company/package/assets';
    
    // Será publicado em um diretório acessível pela web
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'styles.css',
    ];
    
    public array $js = [
        'script.js',
    ];
}
```

### Publicação personalizada

Você também pode publicar diretórios manualmente:

```php
/**
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Publica um diretório
$publishedPath = $assetManager->publish('@vendor/company/package/assets');

// Obtém a URL publicada
$publishedUrl = $assetManager->getPublishedUrl('@vendor/company/package/assets');
```

## Assets de bibliotecas de terceiros

### Asset bundle do jQuery

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class JqueryAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';

    public array $js = [
        'js/jquery-3.6.0.min.js',
    ];
}
```

### Asset bundle do Bootstrap

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class BootstrapAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'css/bootstrap.min.css',
    ];
    
    public array $js = [
        'js/bootstrap.bundle.min.js',
    ];
    
    public array $depends = [
        JqueryAsset::class, // O Bootstrap exige o jQuery
    ];
}
```

### Assets em CDN

Para assets hospedados em CDN, defina `$cdn` como `true`. O asset manager
vai pular a publicação local e as verificações de arquivos locais para esse
bundle.

Se todos os arquivos de asset forem URLs absolutas, deixe `$basePath`,
`$baseUrl` e `$sourcePath` sem valor. Se todos os arquivos vierem da mesma
URL base da CDN, defina `$baseUrl` com essa URL e use caminhos relativos em
`$css` e `$js`. `$basePath` e `$sourcePath` não são necessários em bundles
só de CDN.

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class BootstrapCdnAsset extends AssetBundle
{
    public bool $cdn = true;

    public array $css = [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    ];

    public array $cssOptions = [
        'integrity' => 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
        'crossorigin' => 'anonymous',
    ];

    public array $js = [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    ];

    public array $jsOptions = [
        'integrity' => 'sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p',
        'crossorigin' => 'anonymous',
    ];
}
```

## Configuração de assets

### Configuração da aplicação

Configure o gerenciamento de assets na configuração da sua aplicação:

**config/web/params.php**
```php
return [
    'yiisoft/assets' => [
        // Caminho base dos assets publicados
        'basePath' => '@webroot/assets',
        
        // URL base dos assets
        'baseUrl' => '@web/assets',
        
        // Configuração do conversor de assets
        'converter' => [
            'commands' => [
                'scss' => ['sass', '{from}', '{to}', '--style=compressed'],
                'ts' => ['tsc', '{from}', '--outFile', '{to}'],
            ],
        ],
    ],
];
```

### Assets por ambiente

Configure assets diferentes para cada ambiente:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [];
    public array $js = [];
    
    public function __construct()
    {
        if (YII_ENV_DEV) {
            // Assets de desenvolvimento (não minificados)
            $this->css = ['css/main.css', 'css/debug.css'];
            $this->js = ['js/main.js', 'js/debug.js'];
        } else {
            // Assets de produção (minificados)
            $this->css = ['css/main.min.css'];
            $this->js = ['js/main.min.js'];
        }
    }
}
```

## Otimização de assets

### Combinação de assets

Combine vários arquivos CSS ou JavaScript em arquivos únicos:

```php
/**
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Habilita a combinação de assets
$assetManager->setCombine(true);

// Define as opções de combinação
$assetManager->setCombineOptions([
    'css' => true,  // Combina os arquivos CSS
    'js' => true,   // Combina os arquivos JavaScript
]);
```

### Compressão de assets

Configure a compressão de assets para produção:

```php
// Na configuração do seu asset manager
'converter' => [
    'commands' => [
        'css' => ['cleancss', '{from}', '-o', '{to}'],
        'js' => ['uglifyjs', '{from}', '-o', '{to}', '--compress', '--mangle'],
    ],
],
```

## Trabalhando com o conversor de assets

### Compilação de SCSS/SASS

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class ScssAsset extends AssetBundle
{
    public ?string $sourcePath = '@app/assets/scss';
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'main.scss', // Será convertido em main.css
        'components.scss',
    ];
}
```

### Compilação de TypeScript

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class TypeScriptAsset extends AssetBundle
{
    public ?string $sourcePath = '@app/assets/ts';
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $js = [
        'main.ts', // Será convertido em main.js
        'utils.ts',
    ];
}
```

## Exemplos práticos

### Estrutura completa de assets da aplicação

```
assets/
├── css/
│   ├── main.css           # Estilos principais da aplicação
│   ├── admin.css          # Estilos da área admin
│   └── mobile.css         # Estilos para mobile
├── js/
│   ├── main.js            # JavaScript principal da aplicação
│   ├── admin.js           # Funcionalidades da área admin
│   └── vendor/            # Bibliotecas de terceiros
│       ├── jquery.min.js
│       └── bootstrap.min.js
├── images/
│   ├── logo.png
│   └── icons/
└── fonts/
    ├── main.woff2
    └── main.woff
```

### Configuração completa de asset bundles

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

// Asset bundle base
final class AppAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'css/main.css',
    ];
    
    public array $js = [
        'js/main.js',
    ];
    
    public array $depends = [
        JqueryAsset::class,
    ];
}

// Bundle específico da área admin
final class AdminAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'css/admin.css',
    ];
    
    public array $js = [
        'js/admin.js',
    ];
    
    public array $depends = [
        AppAsset::class,
        BootstrapAsset::class,
    ];
}

// Bundle específico para mobile  
final class MobileAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    
    public array $css = [
        ['css/mobile.css', 'media' => 'screen and (max-width: 768px)'],
    ];
    
    public array $depends = [
        AppAsset::class,
    ];
}
```

## Boas práticas

1. **Organize por funcionalidade**: agrupe assets relacionados em bundles
   lógicos
2. **Gerencie as dependências**: declare corretamente as dependências entre
   bundles
3. **Use nomes significativos**: dê nomes claros aos seus asset bundles
4. **Otimize por ambiente**: use assets minificados em produção
5. **Considere uma CDN**: use CDN para bibliotecas populares quando fizer
   sentido
6. **Versione seus assets**: inclua números de versão nos nomes dos arquivos
   para invalidar o cache
7. **Reduza as requisições HTTP**: combine assets relacionados quando
   possível
8. **Otimize o tamanho dos arquivos**: comprima e minifique os assets para
   produção

## Solução de problemas

### Problemas comuns

**Asset não encontrado:**
- Verifique se o arquivo de asset existe no caminho especificado
- Confira se `$basePath` e `$baseUrl` estão configurados corretamente
- Garanta que os assets foram publicados se você usa `$sourcePath`

**Dependências não carregam:**
- Confira se os bundles de dependência estão registrados corretamente
- Verifique se há dependências circulares
- Garanta que os bundles de dependência estão configurados corretamente

**Assets não aparecem no HTML:**
- Verifique se você chama `$this->addCssFiles()` e `$this->addJsFiles()` no seu layout
- Confira se `$this->head()`, `$this->beginBody()` e `$this->endBody()` são chamados no layout

**Problemas de permissão:**
- Verifique se o servidor web tem permissão de escrita no diretório de assets
- Confira se o diretório de assets publicados é acessível pela web
