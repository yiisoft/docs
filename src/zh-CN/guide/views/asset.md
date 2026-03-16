# 资源

资源管理对现代 Web 应用程序至关重要。资源包括 CSS 样式表、JavaScript 文件、图像、字体及其他静态资源。Yii3 通过
`yiisoft/assets` 包提供了一套完整的资源管理系统，用于处理这些资源的依赖、优化和部署。

## 安装

资源管理功能由 `yiisoft/assets` 包提供：

```bash
composer require yiisoft/assets
```

该包默认包含在 `yiisoft/app` 应用程序模板中。

## 基本概念

### 资源包

资源包是一组相关资源文件（CSS、JavaScript、图像）的集合，它们在逻辑上被组合在一起。资源包可以依赖其他包，从而实现适当的依赖关系管理。

### 资源管理器

资源管理器负责：- 解析资源包依赖 - 将资源从受保护目录发布到 Web 可访问的位置 - 合并和压缩资源（当配置时）- 生成资源的正确 URL

## 创建资源包

### 基本资源包

下面是一个简单的资源包定义：

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

### 资源包属性

**路径配置：**
- `$basePath` - 资源文件的物理路径
- `$baseUrl` - 资源的 Web 可访问 URL 路径
- `$sourcePath` - 需要发布的资源的源目录

**资源文件：**
- `$css` - CSS 文件数组
- `$js` - JavaScript 文件数组  

**依赖：**
- `$depends` - 此包所依赖的其他资源包数组

**选项：**
- `$jsOptions` - JavaScript 标签的 HTML 属性
- `$cssOptions` - CSS link 标签的 HTML 属性

### 高级资源包

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

## 使用资源包

### 在控制器中

在控制器或视图中注册资源包：

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

### 在视图中

你也可以直接在视图中注册资源：

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

### 与 WebView 集成

推荐的方式是与 WebView 集成，以自动渲染资源：

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

## 资源发布

### 源路径发布

当资源位于不可通过 Web 访问的目录（如 vendor 包）时，需要发布它们：

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

### 自定义发布

你也可以手动发布目录：

```php
/**
 * @var \Yiisoft\Assets\AssetManager $assetManager
 */

// Publish a directory
$publishedPath = $assetManager->publish('@vendor/company/package/assets');

// Get the published URL
$publishedUrl = $assetManager->getPublishedUrl('@vendor/company/package/assets');
```

## 第三方库资源

### jQuery 资源包

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

### Bootstrap 资源包

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

### CDN 资源

对于托管在 CDN 上的资源，可以指定完整 URL：

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

## 资源配置

### 应用程序配置

在应用程序配置中配置资源管理：

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

### 特定环境的资源

为不同环境配置不同的资源：

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

## 资源优化

### 资源合并

将多个 CSS 或 JavaScript 文件合并为单个文件：

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

### 资源压缩

为生产环境配置资源压缩：

```php
// In your asset manager configuration
'converter' => [
    'commands' => [
        'css' => ['cleancss', '{from}', '-o', '{to}'],
        'js' => ['uglifyjs', '{from}', '-o', '{to}', '--compress', '--mangle'],
    ],
],
```

## 使用资源转换器

### SCSS/SASS 编译

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

### TypeScript 编译

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

## 实践示例

### 完整应用程序资源结构

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

### 完整资源包配置

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

## 最佳实践

1. **按功能组织**：将相关资源归入逻辑包
2. **管理依赖**：正确声明包之间的依赖关系
3. **使用有意义的名称**：清晰地命名资源包
4. **环境优化**：在生产环境中使用压缩资源
5. **考虑 CDN**：在适当时对常用库使用 CDN
6. **版本化资源**：在文件名中包含版本号以清除缓存
7. **减少 HTTP 请求**：尽可能合并相关资源
8. **优化文件大小**：为生产环境压缩和最小化资源

## 故障排除

### 常见问题

**资源未找到：**
- 检查资源文件是否存在于指定路径中
- 验证 `$basePath` 和 `$baseUrl` 是否配置正确
- 如果使用 `$sourcePath`，确保资源已发布

**依赖未加载：**
- 验证依赖包是否已正确注册
- 检查是否存在循环依赖
- 确保依赖包已正确配置

**资源未出现在 HTML 中：**
- 确保在布局中调用了 `$this->addCssFiles()` 和 `$this->addJsFiles()`
- 验证布局中是否调用了 `$this->head()`、`$this->beginBody()` 和 `$this->endBody()`

**权限问题：**
- 检查 Web 服务器是否具有资源目录的写入权限
- 验证已发布的资源目录是否可通过 Web 访问
