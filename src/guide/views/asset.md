# Assets

Asset management is crucial for modern web applications. Assets include CSS stylesheets, JavaScript files, images,
fonts, and other static resources. Yii3 provides a comprehensive asset management system through the `yiisoft/assets`
package that handles dependencies, optimization, and deployment of these resources.

## Installation

The asset management functionality is provided by the `yiisoft/assets` package:

```bash
composer require yiisoft/assets
```

This package is included by default in the `yiisoft/app` application template.

## Basic Concepts

### Asset Bundles

An asset bundle is a collection of related asset files (CSS, JavaScript, images) that are logically grouped together.
Asset bundles can depend on other bundles, allowing for proper dependency management.

### Asset Manager

The Asset Manager is responsible for:
- Resolving asset bundle dependencies
- Publishing assets from protected directories to web-accessible locations
- Combining and minifying assets (when configured)
- Generating proper URLs for assets

## Creating Asset Bundles

### Basic Asset Bundle

Here's a simple asset bundle definition:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
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

### Asset Bundle Properties

**Path Configuration:**
- `$basePath` - Physical path where asset files are located
- `$baseUrl` - Web-accessible URL path for assets
- `$sourcePath` - Source directory for assets that need to be published

**Asset Files:**
- `$css` - Array of CSS files
- `$js` - Array of JavaScript files  

**Dependencies:**
- `$depends` - Array of other asset bundles this bundle depends on

**Options:**
- `$jsOptions` - HTML attributes for JavaScript tags
- `$cssOptions` - HTML attributes for CSS link tags

### Advanced Asset Bundle

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class AdminAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    // CSS files with media queries
    public array $css = [
        'css/admin/main.css',
        ['css/admin/print.css', 'media' => 'print'],
        ['css/admin/mobile.css', 'media' => 'screen and (max-width: 768px)'],
    ];
    
    // JavaScript files with attributes
    public array $js = [
        'js/admin/core.js',
        ['js/admin/charts.js', 'defer' => true],
        ['js/admin/analytics.js', 'async' => true],
    ];
    
    // Global options for all JS files in this bundle
    public array $jsOptions = [
        'data-admin' => 'true',
    ];
    
    // Global options for all CSS files in this bundle
    public array $cssOptions = [
        'data-bundle' => 'admin',
    ];
    
    public array $depends = [
        MainAsset::class,
        ChartJsAsset::class,
    ];
}
```

## Using Asset Bundles

### In Controllers

Register asset bundles in your controllers or views:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\Asset\MainAsset;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class SiteController
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private AssetManager $assetManager,
    ) {}

    public function index(): ResponseInterface
    {
        // Register the asset bundle
        $this->assetManager->register(MainAsset::class);
        
        return $this->viewRenderer->render('index', [
            'title' => 'Home Page',
        ]);
    }
    
    public function admin(): ResponseInterface
    {
        // Register multiple asset bundles
        $this->assetManager->register([
            MainAsset::class,
            AdminAsset::class,
        ]);
        
        return $this->viewRenderer->render('admin/dashboard');
    }
}
```

### In Views

You can also register assets directly in views:

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

// Register product-specific assets
$assetManager->register(ProductAsset::class);
?>

<div class="product-page">
    <h1><?= Html::encode($product['name']) ?></h1>
    <!-- Product content -->
</div>
```

### With WebView Integration

The recommended approach is to integrate with WebView for automatic asset rendering:

```php
<?php

declare(strict_types=1);

use App\Asset\MainAsset;

/**
 * @var \Yiisoft\View\WebView $this
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Register assets
$assetManager->register(MainAsset::class);

// Add all registered assets to the view
$this->addCssFiles($assetManager->getCssFiles());
$this->addCssStrings($assetManager->getCssStrings());
$this->addJsFiles($assetManager->getJsFiles());
$this->addJsStrings($assetManager->getJsStrings());
$this->addJsVars($assetManager->getJsVars());
?>

<div class="page-content">
    <!-- Your page content -->
</div>
```

## Asset Publishing

### Source Path Publishing

When assets are located in non-web-accessible directories (like vendor packages), they need to be published:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class VendorAsset extends AssetBundle
{
    // Source directory (not web accessible)
    public string $sourcePath = '@vendor/company/package/assets';
    
    // Will be published to web-accessible directory
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'styles.css',
    ];
    
    public array $js = [
        'script.js',
    ];
}
```

### Custom Publishing

You can also manually publish directories:

```php
/**
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Publish a directory
$publishedPath = $assetManager->publish('@vendor/company/package/assets');

// Get the published URL
$publishedUrl = $assetManager->getPublishedUrl('@vendor/company/package/assets');
```

## Third-party Library Assets

### jQuery Asset Bundle

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class JqueryAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $js = [
        'js/jquery-3.6.0.min.js',
    ];
    
    // Or use CDN
    public array $jsOptions = [
        'integrity' => 'sha256-...',
        'crossorigin' => 'anonymous',
    ];
}
```

### Bootstrap Asset Bundle

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class BootstrapAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'css/bootstrap.min.css',
    ];
    
    public array $js = [
        'js/bootstrap.bundle.min.js',
    ];
    
    public array $depends = [
        JqueryAsset::class, // Bootstrap requires jQuery
    ];
}
```

### CDN Assets

For CDN-hosted assets, you can specify full URLs:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class CdnAsset extends AssetBundle
{
    public array $css = [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
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

## Asset Configuration

### Application Configuration

Configure asset management in your application configuration:

**config/web/params.php**
```php
return [
    'yiisoft/assets' => [
        // Base path for published assets
        'basePath' => '@webroot/assets',
        
        // Base URL for assets
        'baseUrl' => '@web/assets',
        
        // Asset converter configuration
        'converter' => [
            'commands' => [
                'scss' => ['sass', '{from}', '{to}', '--style=compressed'],
                'ts' => ['tsc', '{from}', '--outFile', '{to}'],
            ],
        ],
    ],
];
```

### Environment-specific Assets

Configure different assets for different environments:

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $css = [];
    public array $js = [];
    
    public function __construct()
    {
        if (YII_ENV_DEV) {
            // Development assets (unminified)
            $this->css = ['css/main.css', 'css/debug.css'];
            $this->js = ['js/main.js', 'js/debug.js'];
        } else {
            // Production assets (minified)
            $this->css = ['css/main.min.css'];
            $this->js = ['js/main.min.js'];
        }
    }
}
```

## Asset Optimization

### Asset Combination

Combine multiple CSS or JavaScript files into single files:

```php
/**
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Enable asset combination
$assetManager->setCombine(true);

// Set combination options
$assetManager->setCombineOptions([
    'css' => true,  // Combine CSS files
    'js' => true,   // Combine JavaScript files
]);
```

### Asset Compression

Configure asset compression for production:

```php
// In your asset manager configuration
'converter' => [
    'commands' => [
        'css' => ['cleancss', '{from}', '-o', '{to}'],
        'js' => ['uglifyjs', '{from}', '-o', '{to}', '--compress', '--mangle'],
    ],
],
```

## Working with Asset Converter

### SCSS/SASS Compilation

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class ScssAsset extends AssetBundle
{
    public string $sourcePath = '@app/assets/scss';
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $css = [
        'main.scss', // Will be converted to main.css
        'components.scss',
    ];
}
```

### TypeScript Compilation

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class TypeScriptAsset extends AssetBundle
{
    public string $sourcePath = '@app/assets/ts';
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $js = [
        'main.ts', // Will be converted to main.js
        'utils.ts',
    ];
}
```

## Practical Examples

### Complete Application Asset Structure

```
assets/
├── css/
│   ├── main.css           # Main application styles
│   ├── admin.css          # Admin-specific styles
│   └── mobile.css         # Mobile-specific styles
├── js/
│   ├── main.js            # Main application JavaScript
│   ├── admin.js           # Admin functionality
│   └── vendor/            # Third-party libraries
│       ├── jquery.min.js
│       └── bootstrap.min.js
├── images/
│   ├── logo.png
│   └── icons/
└── fonts/
    ├── main.woff2
    └── main.woff
```

### Complete Asset Bundle Setup

```php
<?php

declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

// Base asset bundle
final class AppAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
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

// Admin-specific bundle
final class AdminAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
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

// Mobile-specific bundle  
final class MobileAsset extends AssetBundle
{
    public string $basePath = '@assets';
    public string $baseUrl = '@assetsUrl';
    
    public array $css = [
        ['css/mobile.css', 'media' => 'screen and (max-width: 768px)'],
    ];
    
    public array $depends = [
        AppAsset::class,
    ];
}
```

## Best Practices

1. **Organize by functionality**: Group related assets into logical bundles
2. **Manage dependencies**: Properly declare dependencies between bundles
3. **Use meaningful names**: Name your asset bundles clearly
4. **Environment optimization**: Use minified assets in production
5. **CDN consideration**: Use CDN for popular libraries when appropriate
6. **Version your assets**: Include version numbers in filenames for cache busting
7. **Minimize HTTP requests**: Combine related assets when possible
8. **Optimize file sizes**: Compress and minify assets for production

## Troubleshooting

### Common Issues

**Asset not found:**
- Check that the asset file exists in the specified path
- Verify `$basePath` and `$baseUrl` are configured correctly
- Ensure assets are published if using `$sourcePath`

**Dependencies not loading:**
- Verify the dependency bundles are properly registered
- Check for circular dependencies
- Ensure dependency bundles are correctly configured

**Assets not appearing in HTML:**
- Make sure you're calling `$this->addCssFiles()` and `$this->addJsFiles()` in your layout
- Verify that `$this->head()`, `$this->beginBody()`, and `$this->endBody()` are called in the layout

**Permission issues:**
- Check that the web server has write permissions to the assets directory
- Verify the published assets directory is web-accessible
