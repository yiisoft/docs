# 脚本、样式与 meta 标签

现代 Web 应用程序需要对 CSS 样式、JavaScript 代码和 HTML meta 标签进行精细管理。Yii3 通过
`yiisoft/view` 包中的 `WebView` 类提供了一套完整的系统，用于注册和组织这些资源。

## 概述

`WebView` 类在基础 `View` 类的基础上扩展了 Web 特有的功能，使你可以：

- 注册 CSS 文件和内联样式
- 注册 JavaScript 文件和内联脚本
- 管理 HTML meta 标签和 link 标签
- 控制资源的渲染位置
- 处理资源之间的依赖关系

## CSS 管理

### 注册 CSS 文件

你可以注册需要包含在 HTML 页面中的 CSS 文件：

```php
<?php

declare(strict_types=1);

use Yiisoft\View\WebView;

/**
 * @var WebView $this
 */

// Register a CSS file
$this->registerCssFile('/css/styles.css');

// Register CSS file with attributes
$this->registerCssFile('/css/print.css', WebView::POSITION_HEAD, [
    'media' => 'print',
]);

// Register CSS file with custom key to avoid duplicates
$this->registerCssFile('/css/theme.css', WebView::POSITION_HEAD, [], 'theme-css');
```

### 注册内联 CSS

对于内联 CSS 样式，使用 `registerCss()` 方法：

```php
// Register inline CSS
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

// With custom attributes
$this->registerCss('
    @media print {
        .no-print { display: none; }
    }
', WebView::POSITION_HEAD, ['id' => 'print-styles']);
```

### 从文件注册 CSS

你也可以从外部文件读取 CSS 内容并注册为内联样式：

```php
// Read CSS from a file and register as inline CSS
$this->registerCssFromFile('/path/to/dynamic-styles.css', WebView::POSITION_HEAD, [
    'id' => 'dynamic-styles',
]);
```

### 使用 Style 标签

如需更精细的控制，可以直接使用 HTML style 标签：

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

## JavaScript 管理

### 注册 JavaScript 文件

使用 `registerJsFile()` 引入外部 JavaScript 文件：

```php
// Register a JavaScript file
$this->registerJsFile('/js/main.js');

// Register with attributes (async loading)
$this->registerJsFile('/js/analytics.js', WebView::POSITION_END, [
    'async' => true,
]);

// Register with defer attribute
$this->registerJsFile('/js/interactive.js', WebView::POSITION_END, [
    'defer' => true,
]);

// Register from CDN
$this->registerJsFile('https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', 
    WebView::POSITION_END, [], 'jquery');
```

### 注册内联 JavaScript

使用 `registerJs()` 添加内联 JavaScript 代码：

```php
// Register inline JavaScript
$this->registerJs('
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Page loaded!");
        initializeComponents();
    });
', WebView::POSITION_END);

// Register JavaScript that should run when DOM is ready
$this->registerJs('
    function showAlert(message) {
        alert(message);
    }
', WebView::POSITION_READY);
```

### JavaScript 变量

使用 `registerJsVar()` 将 PHP 数据传递给 JavaScript：

```php
// Register JavaScript variables
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

这将生成如下 JavaScript 代码：

```html
<script>
var apiUrl = "https://api.example.com";
var currentUser = {"id":123,"name":"John Doe","isAdmin":false};
var config = {"debug":true,"locale":"en-US"};
</script>
```

### 使用 Script 标签

如需对 script 标签进行更精细的控制：

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

## 位置常量

资源可以定位到 HTML 文档的不同位置：

```php
use Yiisoft\View\WebView;

// In the <head> section
WebView::POSITION_HEAD

// At the beginning of <body>
WebView::POSITION_BEGIN  

// At the end of <body> (before </body>)
WebView::POSITION_END

// When DOM is ready (jQuery document.ready equivalent)
WebView::POSITION_READY

// When page is fully loaded (window.onload equivalent)
WebView::POSITION_LOAD
```

以下布局示例展示了各位置的渲染位置：

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
    <!-- POSITION_HEAD resources rendered here -->
    <?php $this->head() ?>
</head>
<body>
    <!-- POSITION_BEGIN resources rendered here -->
    <?php $this->beginBody() ?>
    
    <main>
        <?= $content ?>
    </main>
    
    <!-- POSITION_END, POSITION_READY, POSITION_LOAD resources rendered here -->
    <?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

## Meta 标签

### 基本 Meta 标签

为 SEO 和页面信息注册 meta 标签：

```php
// Register meta tags using array syntax
$this->registerMeta(['name' => 'description', 'content' => 'Page description']);
$this->registerMeta(['name' => 'keywords', 'content' => 'yii, php, framework']);
$this->registerMeta(['name' => 'author', 'content' => 'John Doe']);
$this->registerMeta(['name' => 'robots', 'content' => 'index, follow']);

// Viewport for responsive design
$this->registerMeta(['name' => 'viewport', 'content' => 'width=device-width, initial-scale=1']);

// Open Graph tags for social media
$this->registerMeta(['property' => 'og:title', 'content' => 'Page Title']);
$this->registerMeta(['property' => 'og:description', 'content' => 'Page description']);
$this->registerMeta(['property' => 'og:image', 'content' => 'https://example.com/image.jpg']);
```

### 使用 Meta 标签对象

如需更精细的控制，使用 `Html::meta()` 辅助方法：

```php
use Yiisoft\Html\Html;

// Create meta tags with the Html helper
$this->registerMetaTag(
    Html::meta()
        ->name('description')
        ->content('This is a comprehensive guide to Yii3 views')
);

$this->registerMetaTag(
    Html::meta()
        ->httpEquiv('refresh')
        ->content('300') // Refresh every 5 minutes
);
```

### 防止重复 Meta 标签

使用键名防止 meta 标签重复注册：

```php
// First registration
$this->registerMeta([
    'name' => 'description',
    'content' => 'Original description'
], 'description');

// This will override the previous one
$this->registerMeta([
    'name' => 'description', 
    'content' => 'Updated description'
], 'description');
```

## Link 标签

### 基本 Link 标签

注册各类 link 标签：

```php
// Favicon
$this->registerLink([
    'rel' => 'icon',
    'type' => 'image/png',
    'href' => '/favicon.png',
]);

// RSS feed
$this->registerLink([
    'rel' => 'alternate',
    'type' => 'application/rss+xml',
    'title' => 'RSS Feed',
    'href' => '/feed.rss',
]);

// Canonical URL
$this->registerLink([
    'rel' => 'canonical',
    'href' => 'https://example.com/canonical-url',
]);

// Preload resources
$this->registerLink([
    'rel' => 'preload',
    'href' => '/fonts/main.woff2',
    'as' => 'font',
    'type' => 'font/woff2',
    'crossorigin' => 'anonymous',
]);
```

### 使用 Link 标签对象

```php
use Yiisoft\Html\Html;

// CSS stylesheet
$this->registerLinkTag(
    Html::link('/css/main.css', [
        'rel' => 'stylesheet',
    ])
);

// DNS prefetch
$this->registerLinkTag(
    Html::link('https://fonts.googleapis.com', [
        'rel' => 'dns-prefetch',
    ])
);
```

## 实践示例

### 完整页面配置

以下示例展示如何为页面配置所有类型的资源：

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

// Set page title
$this->setTitle($title);

// Meta tags
$this->registerMeta(['name' => 'description', 'content' => $description]);
$this->registerMeta(['name' => 'keywords', 'content' => 'ecommerce, products, online shop']);

// Open Graph tags
$this->registerMeta(['property' => 'og:title', 'content' => $title]);
$this->registerMeta(['property' => 'og:description', 'content' => $description]);
$this->registerMeta(['property' => 'og:image', 'content' => $product['image']]);

// CSS files
$this->registerCssFile('/css/product.css');
$this->registerCssFile('/css/responsive.css', WebView::POSITION_HEAD, [
    'media' => 'screen and (max-width: 768px)',
]);

// JavaScript files
$this->registerJsFile('/js/product-gallery.js', WebView::POSITION_END);
$this->registerJsFile('/js/shopping-cart.js', WebView::POSITION_END);

// JavaScript variables
$this->registerJsVar('productData', $product);
$this->registerJsVar('cartApiUrl', '/api/cart');

// Inline JavaScript
$this->registerJs('
    document.addEventListener("DOMContentLoaded", function() {
        initProductGallery();
        initShoppingCart();
    });
', WebView::POSITION_END);

// Page-specific styles
$this->registerCss('
    .product-special {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        padding: 20px;
        border-radius: 10px;
    }
', WebView::POSITION_HEAD);
?>

<div class="product-page">
    <!-- Your page content here -->
</div>
```

### 条件资源加载

根据条件加载资源：

```php
<?php

declare(strict_types=1);

/**
 * @var WebView $this
 * @var bool $isDarkMode
 * @var bool $isAdmin
 * @var string $userRole
 */

// Load theme-specific CSS
if ($isDarkMode) {
    $this->registerCssFile('/css/dark-theme.css');
} else {
    $this->registerCssFile('/css/light-theme.css');
}

// Admin-specific resources
if ($isAdmin) {
    $this->registerCssFile('/css/admin-toolbar.css');
    $this->registerJsFile('/js/admin-functions.js');
}

// Role-based JavaScript configuration
$this->registerJsVar('userPermissions', [
    'canEdit' => in_array($userRole, ['admin', 'editor']),
    'canDelete' => $userRole === 'admin',
    'canPublish' => in_array($userRole, ['admin', 'publisher']),
]);
?>
```

## 最佳实践

1. **使用合适的位置**：将 CSS 放在 `POSITION_HEAD`，JavaScript 放在 `POSITION_END`
2. **减少内联资源**：优先使用外部文件以获得更好的缓存效果
3. **使用键名去重**：通过有意义的键名防止资源重复注册
4. **优化加载**：对非关键 JavaScript 使用 `async` 和 `defer` 属性
5. **分组管理相关资源**：将相关的 CSS 和 JS 文件放在一起
6. **合理使用 CDN**：在性能与可靠性之间取得平衡
7. **验证 meta 标签**：确保正确设置 SEO 所需的 meta 标签
8. **注意安全性**：谨慎处理内联脚本与 CSP 策略

## 使用资源包

对于更复杂的资源管理需求，可以考虑使用资源包：

```php
// Register an asset bundle (covered in detail in the Assets guide)
$assetBundle = $this->assetManager->register(MainAsset::class);

// Add all CSS files from the bundle
$this->addCssFiles($this->assetManager->getCssFiles());

// Add all JavaScript files from the bundle  
$this->addJsFiles($this->assetManager->getJsFiles());
```
