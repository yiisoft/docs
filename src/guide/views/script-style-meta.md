# Scripts, styles and meta tags

Modern web applications require careful management of CSS styles, JavaScript code, and HTML meta tags.
Yii3 provides a comprehensive system for registering and organizing these resources through the `WebView` class,
which is part of the `yiisoft/view` package.

## Overview

The `WebView` class extends the basic `View` class with web-specific functionality, allowing you to:

- Register CSS files and inline styles
- Register JavaScript files and inline scripts  
- Manage HTML meta tags and link tags
- Control the position where resources are rendered
- Handle dependencies between resources

## CSS management

### Registering CSS Files

You can register CSS files to be included in your HTML pages:

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

### Registering Inline CSS

For inline CSS styles, use the `registerCss()` method:

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

### CSS from Files

You can also register CSS content from external files:

```php
// Read CSS from a file and register as inline CSS
$this->registerCssFromFile('/path/to/dynamic-styles.css', WebView::POSITION_HEAD, [
    'id' => 'dynamic-styles',
]);
```

### Using Style Tags

For more control, you can use HTML style tags directly:

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

## JavaScript management

### Registering JavaScript Files

Include external JavaScript files using `registerJsFile()`:

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

### Registering Inline JavaScript

Add inline JavaScript code with `registerJs()`:

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

### JavaScript Variables

Pass PHP data to JavaScript using `registerJsVar()`:

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

This generates JavaScript code like:

```html
<script>
var apiUrl = "https://api.example.com";
var currentUser = {"id":123,"name":"John Doe","isAdmin":false};
var config = {"debug":true,"locale":"en-US"};
</script>
```

### Using Script Tags

For more control over script tags:

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

## Position Constants

Resources can be positioned at different locations in the HTML document:

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

Example layout showing where each position is rendered:

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

## Meta tags

### Basic Meta Tags

Register meta tags for SEO and page information:

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

### Using Meta Tag Objects

For more control, use the `Html::meta()` helper:

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

### Preventing Duplicate Meta Tags

Use keys to prevent duplicate meta tags:

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

## Link tags

### Basic Link Tags

Register various types of link tags:

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

### Using Link Tag Objects

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

## Practical Examples

### Complete Page Setup

Here's how you might set up a complete page with all types of resources:

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

### Conditional Resource Loading

Load resources based on conditions:

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

## Best Practices

1. **Use appropriate positions**: Place CSS in `POSITION_HEAD`, JavaScript at `POSITION_END`
2. **Minimize inline resources**: Prefer external files for better caching
3. **Use keys for duplicates**: Prevent duplicate resources with meaningful keys
4. **Optimize loading**: Use `async` and `defer` attributes for non-critical JavaScript
5. **Group related resources**: Keep related CSS and JS files together
6. **Use CDNs wisely**: Balance performance with reliability
7. **Validate meta tags**: Ensure proper SEO meta tags are set
8. **Consider security**: Be careful with inline scripts and CSP policies

## Working with Asset Bundles

For more complex asset management, consider using asset bundles:

```php
// Register an asset bundle (covered in detail in the Assets guide)
$assetBundle = $this->assetManager->register(MainAsset::class);

// Add all CSS files from the bundle
$this->addCssFiles($this->assetManager->getCssFiles());

// Add all JavaScript files from the bundle  
$this->addJsFiles($this->assetManager->getJsFiles());
```
