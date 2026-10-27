# Scripts, estilos e meta tags

Aplicações web modernas exigem um gerenciamento cuidadoso de estilos CSS,
código JavaScript e meta tags HTML.  O Yii3 oferece um sistema completo para
registrar e organizar esses recursos por meio da classe `WebView`, que faz
parte do pacote `yiisoft/view`.

## Visão geral

A classe `WebView` estende a classe básica `View` com funcionalidades
específicas para a web, permitindo que você:

- Registre arquivos CSS e estilos inline
- Registre arquivos JavaScript e scripts inline
- Gerencie meta tags e link tags HTML
- Controle a posição em que os recursos são renderizados
- Lide com dependências entre recursos

## Gerenciamento de CSS

### Registrando arquivos CSS

Você pode registrar arquivos CSS para incluí-los nas suas páginas HTML:

```php
<?php

declare(strict_types=1);

use Yiisoft\View\WebView;

/**
 * @var WebView $this
 */

// Registra um arquivo CSS
$this->registerCssFile('/css/styles.css');

// Registra um arquivo CSS com atributos
$this->registerCssFile('/css/print.css', WebView::POSITION_HEAD, [
    'media' => 'print',
]);

// Registra um arquivo CSS com uma chave personalizada para evitar duplicatas
$this->registerCssFile('/css/theme.css', WebView::POSITION_HEAD, [], 'theme-css');
```

### Registrando CSS inline

Para estilos CSS inline, use o método `registerCss()`:

```php
// Registra CSS inline
$this->registerCss('
    .highlight {
        background-color: yellow;
        font-weight: bold;
    }
    .error {
        color: red;
        border: 1px solid red;
    }
', WebView::POSITION_HEAD);

// Com atributos personalizados
$this->registerCss('
    @media print {
        .no-print { display: none; }
    }
', WebView::POSITION_HEAD, ['id' => 'print-styles']);
```

### CSS a partir de arquivos

Você também pode registrar o conteúdo CSS de arquivos externos:

```php
// Lê o CSS de um arquivo e o registra como CSS inline
$this->registerCssFromFile('/path/to/dynamic-styles.css', WebView::POSITION_HEAD, [
    'id' => 'dynamic-styles',
]);
```

### Usando tags style

Para ter mais controle, você pode usar tags style do HTML diretamente:

```php
use Yiisoft\Html\Html;

$styleTag = Html::style('
    .custom-button {
        background: linear-gradient(45deg, #blue, #purple);
        border: none;
        color: white;
        padding: 10px 20px;
    }
', ['id' => 'custom-button-styles']);

$this->registerStyleTag($styleTag, WebView::POSITION_HEAD);
```

## Gerenciamento de JavaScript

### Registrando arquivos JavaScript

Inclua arquivos JavaScript externos com `registerJsFile()`:

```php
// Registra um arquivo JavaScript
$this->registerJsFile('/js/main.js');

// Registra com atributos (carregamento assíncrono)
$this->registerJsFile('/js/analytics.js', WebView::POSITION_END, [
    'async' => true,
]);

// Registra com o atributo defer
$this->registerJsFile('/js/interactive.js', WebView::POSITION_END, [
    'defer' => true,
]);

// Registra a partir de uma CDN
$this->registerJsFile('https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', 
    WebView::POSITION_END, [], 'jquery');
```

### Registrando JavaScript inline

Adicione código JavaScript inline com `registerJs()`:

```php
// Registra JavaScript inline
$this->registerJs('
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Page loaded!");
        initializeComponents();
    });
', WebView::POSITION_END);

// Registra JavaScript que deve rodar quando o DOM estiver pronto
$this->registerJs('
    function showAlert(message) {
        alert(message);
    }
', WebView::POSITION_READY);
```

### Variáveis JavaScript

Passe dados do PHP para o JavaScript com `registerJsVar()`:

```php
// Registra variáveis JavaScript
$this->registerJsVar('apiUrl', 'https://api.example.com');
$this->registerJsVar('currentUser', [
    'id' => $user->getId(),
    'name' => $user->getName(),
    'isAdmin' => $user->isAdmin(),
]);
$this->registerJsVar('config', [
    'debug' => $this->isDebugMode(),
    'locale' => $this->getLocale(),
]);
```

Isso gera um código JavaScript como este:

```html
<script>
var apiUrl = "https://api.example.com";
var currentUser = {"id":123,"name":"John Doe","isAdmin":false};
var config = {"debug":true,"locale":"en-US"};
</script>
```

### Usando tags script

Para ter mais controle sobre as tags script:

```php
use Yiisoft\Html\Html;

$scriptTag = Html::script('
    window.myApp = {
        init: function() {
            console.log("App initialized");
        }
    };
', ['type' => 'module']);

$this->registerScriptTag($scriptTag, WebView::POSITION_END);
```

## Constantes de posição

Os recursos podem ser posicionados em diferentes pontos do documento HTML:

```php
use Yiisoft\View\WebView;

// Na seção <head>
WebView::POSITION_HEAD

// No início do <body>
WebView::POSITION_BEGIN  

// No fim do <body> (antes de </body>)
WebView::POSITION_END

// Quando o DOM estiver pronto (equivalente ao document.ready do jQuery)
WebView::POSITION_READY

// Quando a página terminar de carregar (equivalente ao window.onload)
WebView::POSITION_LOAD
```

Exemplo de layout mostrando onde cada posição é renderizada:

```php
<?php

declare(strict_types=1);

/**
 * @var \Yiisoft\View\WebView $this
 */
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html>
<head>
    <!-- Recursos de POSITION_HEAD são renderizados aqui -->
    <?php $this->head() ?>
</head>
<body>
    <!-- Recursos de POSITION_BEGIN são renderizados aqui -->
    <?php $this->beginBody() ?>
    
    <main>
        <?= $content ?>
    </main>
    
    <!-- Recursos de POSITION_END, POSITION_READY e POSITION_LOAD são renderizados aqui -->
    <?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

## Meta tags

### Meta tags básicas

Registre meta tags para SEO e informações da página:

```php
// Registra meta tags usando a sintaxe de array
$this->registerMeta(['name' => 'description', 'content' => 'Page description']);
$this->registerMeta(['name' => 'keywords', 'content' => 'yii, php, framework']);
$this->registerMeta(['name' => 'author', 'content' => 'John Doe']);
$this->registerMeta(['name' => 'robots', 'content' => 'index, follow']);

// Viewport para design responsivo
$this->registerMeta(['name' => 'viewport', 'content' => 'width=device-width, initial-scale=1']);

// Tags Open Graph para redes sociais
$this->registerMeta(['property' => 'og:title', 'content' => 'Page Title']);
$this->registerMeta(['property' => 'og:description', 'content' => 'Page description']);
$this->registerMeta(['property' => 'og:image', 'content' => 'https://example.com/image.jpg']);
```

### Usando objetos de meta tag

Para ter mais controle, use o helper `Html::meta()`:

```php
use Yiisoft\Html\Html;

// Cria meta tags com o helper Html
$this->registerMetaTag(
    Html::meta()
        ->name('description')
        ->content('This is a comprehensive guide to Yii3 views')
);

$this->registerMetaTag(
    Html::meta()
        ->httpEquiv('refresh')
        ->content('300') // Atualiza a cada 5 minutos
);
```

### Evitando meta tags duplicadas

Use chaves para evitar meta tags duplicadas:

```php
// Primeiro registro
$this->registerMeta([
    'name' => 'description',
    'content' => 'Original description'
], 'description');

// Este sobrescreve o anterior
$this->registerMeta([
    'name' => 'description', 
    'content' => 'Updated description'
], 'description');
```

## Link tags

### Link tags básicas

Registre vários tipos de link tags:

```php
// Favicon
$this->registerLink([
    'rel' => 'icon',
    'type' => 'image/png',
    'href' => '/favicon.png',
]);

// Feed RSS
$this->registerLink([
    'rel' => 'alternate',
    'type' => 'application/rss+xml',
    'title' => 'RSS Feed',
    'href' => '/feed.rss',
]);

// URL canônica
$this->registerLink([
    'rel' => 'canonical',
    'href' => 'https://example.com/canonical-url',
]);

// Pré-carregamento de recursos
$this->registerLink([
    'rel' => 'preload',
    'href' => '/fonts/main.woff2',
    'as' => 'font',
    'type' => 'font/woff2',
    'crossorigin' => 'anonymous',
]);
```

### Usando objetos de link tag

```php
use Yiisoft\Html\Html;

// Folha de estilo CSS
$this->registerLinkTag(
    Html::link('/css/main.css', [
        'rel' => 'stylesheet',
    ])
);

// Prefetch de DNS
$this->registerLinkTag(
    Html::link('https://fonts.googleapis.com', [
        'rel' => 'dns-prefetch',
    ])
);
```

## Exemplos práticos

### Configuração completa de uma página

Veja como montar uma página completa com todos os tipos de recursos:

```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var string $title
 * @var string $description
 * @var array $product
 */

// Define o título da página
$this->setTitle($title);

// Meta tags
$this->registerMeta(['name' => 'description', 'content' => $description]);
$this->registerMeta(['name' => 'keywords', 'content' => 'ecommerce, products, online shop']);

// Tags Open Graph
$this->registerMeta(['property' => 'og:title', 'content' => $title]);
$this->registerMeta(['property' => 'og:description', 'content' => $description]);
$this->registerMeta(['property' => 'og:image', 'content' => $product['image']]);

// Arquivos CSS
$this->registerCssFile('/css/product.css');
$this->registerCssFile('/css/responsive.css', WebView::POSITION_HEAD, [
    'media' => 'screen and (max-width: 768px)',
]);

// Arquivos JavaScript
$this->registerJsFile('/js/product-gallery.js', WebView::POSITION_END);
$this->registerJsFile('/js/shopping-cart.js', WebView::POSITION_END);

// Variáveis JavaScript
$this->registerJsVar('productData', $product);
$this->registerJsVar('cartApiUrl', '/api/cart');

// JavaScript inline
$this->registerJs('
    document.addEventListener("DOMContentLoaded", function() {
        initProductGallery();
        initShoppingCart();
    });
', WebView::POSITION_END);

// Estilos específicos da página
$this->registerCss('
    .product-special {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        padding: 20px;
        border-radius: 10px;
    }
', WebView::POSITION_HEAD);
?>

<div class="product-page">
    <!-- O conteúdo da sua página vai aqui -->
</div>
```

### Carregamento condicional de recursos

Carregue recursos de acordo com condições:

```php
<?php

declare(strict_types=1);

/**
 * @var WebView $this
 * @var bool $isDarkMode
 * @var bool $isAdmin
 * @var string $userRole
 */

// Carrega o CSS específico do tema
if ($isDarkMode) {
    $this->registerCssFile('/css/dark-theme.css');
} else {
    $this->registerCssFile('/css/light-theme.css');
}

// Recursos específicos da área admin
if ($isAdmin) {
    $this->registerCssFile('/css/admin-toolbar.css');
    $this->registerJsFile('/js/admin-functions.js');
}

// Configuração JavaScript baseada no papel do usuário
$this->registerJsVar('userPermissions', [
    'canEdit' => in_array($userRole, ['admin', 'editor']),
    'canDelete' => $userRole === 'admin',
    'canPublish' => in_array($userRole, ['admin', 'publisher']),
]);
?>
```

## Boas práticas

1. **Use as posições adequadas**: coloque o CSS em `POSITION_HEAD` e o
   JavaScript em `POSITION_END`
2. **Reduza os recursos inline**: prefira arquivos externos, que aproveitam
   melhor o cache
3. **Use chaves contra duplicatas**: evite recursos duplicados com chaves
   significativas
4. **Otimize o carregamento**: use os atributos `async` e `defer` para
   JavaScript não crítico
5. **Agrupe recursos relacionados**: mantenha juntos os arquivos CSS e JS
   relacionados
6. **Use CDNs com critério**: equilibre desempenho e confiabilidade
7. **Valide as meta tags**: garanta que as meta tags de SEO estejam
   definidas corretamente
8. **Pense na segurança**: tenha cuidado com scripts inline e políticas de
   CSP

## Trabalhando com asset bundles

Para um gerenciamento de assets mais complexo, considere usar asset bundles:

```php
// Registra um asset bundle (explicado em detalhes no guia de Assets)
$assetBundle = $this->assetManager->register(MainAsset::class);

// Adiciona todos os arquivos CSS do bundle
$this->addCssFiles($this->assetManager->getCssFiles());

// Adiciona todos os arquivos JavaScript do bundle  
$this->addJsFiles($this->assetManager->getJsFiles());
```
