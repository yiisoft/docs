# Алиасы (псевдонимы)

You can use aliases to represent file paths or URLs so that you don't have to hard-code absolute paths or URLs in your
project. An alias must start with the `@` character to be differentiated from normal file paths and URLs. Alias defined
without leading `@` will be prefixed with `@` character.

Вы можете использовать псевдонимы для представления путей к файлам или URL-адресов, чтобы вам не приходилось жестко 
указывать абсолютные пути или URL-адреса в вашем проекте. Каждый псевдоним должен начинаться с символа `@`, чтобы 
отличаться от обычных файловых путей или URL. Алиас, определенный без предшествующего `@` будет префиксироваться 
с помощью символа `@`.

Default Yii application has some aliases pre-defined in `config/params.php`. For example, the alias `@public` represents
the web root path; `@baseUrl` represents the base URL for the currently running Web application.

По умолчанию Yii-приложение имеет несколько алисов, предопределенных в `config/params.php`. Например, алиас `@public`
представляет корневой путь для web; `@baseUrl` представляет базовый URL для запущенного в текущий момент Web-приложения.

## Defining Aliases <span id="defining-aliases"></span>

## Определение псевдонимов <span id="defining-aliases"></span>

You can define an alias via application's `config/params.php`:

Вы можете определить какой-либо псевдоним через `config/params.php` приложения:

```php
return [
    // ...
    
    'yiisoft/aliases' => [
        'aliases' => [
            // ...
        
            // an alias of a file path
            '@foo' => '/path/to/foo',
        
            // an alias of a URL
            '@bar' => 'http://www.example.com',
        
            // an alias of a concrete file that contains a \foo\Bar class 
            '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
        ],
    ],
];
```

> Note: The file path or URL bein1g aliased may *not* necessarily refer to an existing file or resource.

> Замечание: Псевдонимизированный файловый путь или URL *не обязательно* может ссылаться на существующий файл или 
> ресурс.

Given a defined alias, you may derive a new alias by appending a slash `/` followed with one or more path segments.
For example, `@foo` is a root alias, while `@foo/bar/file.php` is a derived alias.

Учитывая определенный псевдоним, вы можете создать новый, добавив слэш `/`, за которым следует один или несколько 
сегментов пути. Например, `@foo` - это корневой псевдоним, а `@foo/bar/file.php` - производный псевдоним.

You can define an alias using another alias (either root or derived):

Вы можете определить псевдоним, используя другой псевдоним (корневой или производный):

```php
'@foobar' => '@foo/bar', 
```

The `yiisoft/aliases` parameter initializes `Aliases` service from [`yiisoft/aliases` package](https://github.com/yiisoft/aliases).
You can set extra aliases in runtime by using the service:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Using aliases in configuration

It's preferred to resolve aliases at configuration level, so services get URLs and paths as ready to use strings: 

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

## Resolving aliases <span id="resolving-aliases"></span>

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

> Note: The `get()` method doesn't check whether the resulting path/URL refers to an existing file or resource.


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

If `@foo/bar` isn't defined as a root alias, the last statement would display `/path/to/foo/bar/file.php`.


## Predefined Aliases <span id="predefined-aliases"></span>

[Yii application](https://github.com/yiisoft/app) predefines a set of aliases to reference commonly used file paths and URLs:

- `@root` - the base directory of the currently running application.
- `@assets` - application's public directory where it publishes assets.
- `@assetsUrl` - URL of base directory with published assets.
- `@baseUrl` - the base URL of the currently running Web application. Defaults to `/`.
- `@npm` - node packages directory.
- `@bower` - bower packages directory.
- `@vendor` - Composer's `vendor` directory.
- `@public` - application's publicly accessible directory that with `index.php`.
- `@runtime` - the runtime path of the currently running application. Defaults to `@root/runtime`.
- `@layout` - the directory with layouts.
- `@resources` - directory with views, asset sources and other resources.
- `@views` - application view templates base directory.
