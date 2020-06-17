# Aliases

You can use aliases to represent file paths or URLs so that you don't have to hard-code absolute paths or URLs in your
project. An alias must start with the `@` character to be differentiated from normal file paths and URLs. Alias defined
without leading `@` will be prefixed with `@` character.

Default Yii application has some aliases pre-defined in `config/params.php`. For example, the alias `@src` represents
the installation path of application `src` directory; `@web` represents the base URL for the currently running Web application.

## Defining Aliases <span id="defining-aliases"></span>

You can define an alias via application's `config/params.php`:

```php
return [
    // ...

    'aliases' => [
        // an alias of a file path
        '@foo' => '/path/to/foo',
    
        // an alias of a URL
        '@bar' => 'http://www.example.com',
    
        // an alias of a concrete file that contains a \foo\Bar class 
        '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
    ]
];
```

> Note: The file path or URL being aliased may *not* necessarily refer to an existing file or resource.

Given a defined alias, you may derive a new alias by appending a slash `/` followed with one or more path segments.
For example, `@foo` is a root alias, while `@foo/bar/file.php` is a derived alias.

You can define an alias using another alias (either root or derived):

```php
'@foobar' => '@foo/bar', 
```

The `aliases` parameter initializes `Aliases` service from [`yiisoft/aliases` package](https://github.com/yiisoft/aliases).
You can set additional aliases in runtime by using the service:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Resolving Aliases <span id="resolving-aliases"></span>

You can use `Aliases` service to resolve an alias or derived alias into the file path or URL it represents:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // http://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

The path/URL represented by a derived alias is determined by replacing the root alias part with its corresponding
path/URL in the derived alias.

> Note: The `get()` method does not check whether the resulting path/URL refers to an existing file or resource.


A root alias may also contain slash `/` characters. The `get()` method
is intelligent enough to tell, which part of an alias is a root alias and thus correctly determines
the corresponding file path or URL:

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

If `@foo/bar` is not defined as a root alias, the last statement would display `/path/to/foo/bar/file.php`.


## Predefined Aliases <span id="predefined-aliases"></span>

[Yii application](https://github.com/yiisoft/app) predefines a set of aliases to easily reference commonly used file paths and URLs:

- `@root` - the base directory of the currently running application.
- `@assets` -  application's public assets directory where assets are published to.
- `@assetsUrl` - URL of base directory with published assets.
- `@npm` - node packages directory.
- `@bower` - bower packages directory.
- `@vendor` - Composer's `vendor` directory.
- `@public` - application's publicly accessible directory that contains `index.php`.
- `@runtime` - the runtime path of the currently running application. Defaults to `@root/runtime`.
- `@web` - the base URL of the currently running Web application. Defaults to `/`.
- `@resources` - directory where views, assets sources and other resources are located.
- `@views` - application view templates base directory.

## Package Aliases <span id="package-aliases"></span>

Composer places installed package under `vendor/authorName/packageName` so there is no need for special
alias for each package. Instead, you can use `@vendor/authorName/packageName` to refer to package directory. 
