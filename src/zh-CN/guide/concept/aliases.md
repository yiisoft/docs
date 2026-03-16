# 别名

您可以使用别名来表示文件路径或 URL，这样您就不必在项目中硬编码绝对路径或 URL。别名必须以 `@` 字符开头，以便与普通文件路径和 URL
区分开来。定义时没有前导 `@` 的别名将自动添加 `@` 字符前缀。

默认的 Yii 应用程序在 `config/params.php` 中预定义了一些别名。例如，别名 `@public` 表示 Web
根路径；`@baseUrl` 表示当前运行的 Web 应用程序的基础 URL。

## 定义别名 <span id="defining-aliases"></span>

您可以通过应用程序的 `config/params.php` 定义别名：

```php
return [
    // ...
    
    'yiisoft/aliases' => [
        'aliases' => [
            // ...
        
            // an alias of a file path
            '@foo' => '/path/to/foo',
        
            // an alias of a URL
            '@bar' => 'https://www.example.com',
        
            // an alias of a concrete file that contains a \foo\Bar class 
            '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
        ],
    ],
];
```

> [!NOTE]
> 被别名化的文件路径或 URL *不一定*指向现有的文件或资源。

给定一个已定义的别名，您可以通过附加斜杠 `/` 后跟一个或多个路径段来派生新别名。例如，`@foo` 是根别名，而
`@foo/bar/file.php` 是派生别名。

您可以使用另一个别名（根别名或派生别名）来定义别名：

```php
'@foobar' => '@foo/bar', 
```

`yiisoft/aliases` 参数从
[`yiisoft/aliases`](https://github.com/yiisoft/aliases) 包初始化 `Aliases`
服务。您可以在运行时使用该服务设置额外的别名：

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## 在配置中使用别名 <span id="using-aliases-in-configuration"></span>

最好在配置级别解析别名，这样服务就可以获得可直接使用的 URL 和路径字符串：

```php
<?php

declare(strict_types=1);

use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\File\FileCache;

/* @var $params array */

return [
    FileCache::class => static fn (Aliases $aliases) => new FileCache(
        $aliases->get($params['yiisoft/cache-file']['fileCache']['path'])
    ),
];
```

## 解析别名 <span id="resolving-aliases"></span>

您可以使用 `Aliases` 服务将别名或派生别名解析为它所代表的文件路径或 URL：

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // https://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

派生别名所代表的 path/URL 是通过将派生别名中的根别名部分替换为其对应的 path/URL 来确定的。

> [!NOTE]
> `get()` 方法不检查结果 path/URL 是否指向现有的文件或资源。


根别名也可以包含斜杠 `/` 字符。`get()` 方法足够智能，可以判断别名的哪一部分是根别名，从而正确确定相应的文件路径或 URL：

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@foo', '/path/to/foo');
    $aliases->set('@foo/bar', '/path2/bar');

    $aliases->get('@foo/test/file.php'); // /path/to/foo/test/file.php
    $aliases->get('@foo/bar/file.php'); // /path2/bar/file.php
} 
```

如果 `@foo/bar` 未定义为根别名，最后一条语句将显示 `/path/to/foo/bar/file.php`。


## 预定义别名 <span id="predefined-aliases"></span>

[Yii 应用程序](https://github.com/yiisoft/app) 预定义了一组别名来引用常用的文件路径和 URL：

- `@root` - 当前运行应用程序的基础目录。
- `@assets` - 应用程序发布资源的公共目录。
- `@assetsUrl` - 已发布资源的基础目录的 URL。
- `@baseUrl` - 当前运行的 Web 应用程序的基础 URL。默认为 `/`。
- `@npm` - node 包目录。
- `@bower` - bower 包目录。
- `@vendor` - Composer 的 `vendor` 目录。
- `@public` - 应用程序的公共可访问目录，包含 `index.php`。
- `@runtime` - 当前运行应用程序的运行时路径。默认为 `@root/runtime`。
- `@layout` - 布局目录。
- `@resources` - 包含视图、资源源文件和其他资源的目录。
- `@views` - 应用程序视图模板基础目录。
