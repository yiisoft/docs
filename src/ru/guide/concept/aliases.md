# Псевдонимы (алиасы)

Вы можете использовать псевдонимы для представления путей к файлам или
URL-адресов, чтобы вам не приходилось жестко указывать абсолютные пути или
URL-адреса в вашем проекте. Каждый псевдоним должен начинаться с символа
`@`, чтобы отличаться от обычных файловых путей или URL. Алиас, определенный
без предшествующего `@` будет префиксироваться с помощью символа `@`.

По умолчанию Yii-приложение имеет несколько алисов, предопределенных в
`config/params.php`. Например, алиас `@public` представляет корневой путь
для web; `@baseUrl` представляет базовый URL для запущенного в текущий
момент Web-приложения.

## Определение псевдонимов <span id="defining-aliases"></span>

Вы можете определить какой-либо псевдоним через `config/params.php`
приложения:

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

> Примечание: Псевдонимизированный файловый путь или URL *не обязательно* может ссылаться на существующий файл или 
> ресурс.

Учитывая определенный псевдоним, вы можете создать новый, добавив слэш `/`,
за которым следует один или несколько
сегментов пути. Например, `@foo` - это корневой псевдоним, а
`@foo/bar/file.php` - производный псевдоним.

Вы можете определить псевдоним, используя другой псевдоним (корневой или
производный):

```php
'@foobar' => '@foo/bar', 
```

Параметр `yiisoft/aliases` инициализирует сервис `Aliases` из пакета
[`yiisoft/aliases`](https://github.com/yiisoft/aliases). Используя этот
сервис, вы можете установить дополнительные псевдонимы во время работы
приложения:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Использование псевдонимов в конфигурации <span id="using-aliases-in-configuration"></span>

Предпочтительно разрешать псевдонимы на уровне конфигурации, чтобы сервисы
получали URL-адреса и пути как готовые к
использованию строки:

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

## Разрешение псевдонимов <span id="resolving-aliases"></span>

Вы можете использовать сервис `Aliases`, чтобы преобразовать псевдоним или
производный псевдоним в путь к файлу или URL,
который он представляет:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // http://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

Путь/URL, представленный производным псевдонимом, определяется путем замены
части корневого псевдонима на
соответствующий путь/URL в производном псевдониме.

> Примечание: Метод `get()` не проверяет, относится ли результирующий путь/URL-адрес к существующему файлу или ресурсу.


Псевдоним root также может содержать символы косой черты `/`. Метод `get()`
достаточно интеллектуален, чтобы определить,
какая часть псевдонима является корневым псевдонимом, и, таким образом,
правильно определить путь к соответствующему
файлу или URL-адрес:

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

Если бы `@foo/bar` не был бы определен как корневой псевдоним, то последний
оператор отобразил бы
`/path/to/foo/bar/file.php`.


## Предопределенные псевдонимы <span id="predefined-aliases"></span>

[Yii приложение](https://github.com/yiisoft/app) предопределяет набор
псевдонимов, чтобы ссылаться на часто используемые
файловые пути и URL-адреса:

- `@root` - базовая директория для приложения запущенного в текущий момент.
- `@assets` - публичная директория приложения, где оно публикует ресурсы
  (assets).
- `@assetsUrl` - URL базовой директории с опубликованными ресурсами.
- `@baseUrl` - базовый URL запущенного в текущий момент Web приложения. По
  умолчанию - `/`.
- `@npm` - директория пакетов Node JS.
- `@bower` - директория пакетов Bower.
- `@vendor` - директория `vendor` Composer'а .
- `@public` - публично доступная директория приложения, которая содержит
  `index.php`.
- `@runtime` - путь времени выполнения текущего запущенного приложения. По
  умолчанию - `@root/runtime`.
- `@layout` - директория с макетами.
- `@resources` - директория с представлениями, исходниками ресурсов (asset)
  и другими ресурсами.
- `@views` - базовая директория шаблонов представлений приложения.
