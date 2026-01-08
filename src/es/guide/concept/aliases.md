# Alias

Los alias son utilizados para representar rutas o URLs de manera que no
tengas que escribir explícitamente rutas absolutas o URLs en tu
proyecto. Un alias debe comenzar con el signo `@` para ser diferenciado de
una ruta normal de archivo y de URLs. Los alias definidos
sin el `@` del principio, serán prefijados con el signo `@`.

Default Yii application has some aliases pre-defined in
`config/params.php`. For example, the alias `@public` represents the web
root path; `@baseUrl` represents the base URL for the currently running Web
application.

## Definir Alias <span id="defining-aliases"></span>

Puedes definir un alias mediante la aplicación en `config/params.php`:

```php
return [
    // ...

    'aliases' => [
        // un alias de una ruta de archivos
        '@foo' => '/path/to/foo',

        // un alias de un URL
        '@bar' => 'http://www.example.com',

        // un alias de un archivo en concreto que contiene la clase \foo\Bar
        '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
    ]
];
```

> [!Nota]
> Una ruta de archivo o URL en alias *no* se refiere necesariamente a un archivo o recurso existente.

Dado un alias, puedes derivar un nuevo alias anexando una barra diagonal `/`
seguida por uno o varios segmentos de la ruta.
Por ejemplo, `@foo` es un alias de raíz, mientras que `@foo/bar/file.php` es
un alias derivado.

Puedes definir un alias usando otro alias (ya sea un alias de raíz o
derivado):

```php
'@foobar' => '@foo/bar',
```

The `yiisoft/aliases` parameter initializes `Aliases` service from
[`yiisoft/aliases`](https://github.com/yiisoft/aliases) package.  You can
set extra aliases in runtime by using the service:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Using aliases in configuration <span id="using-aliases-in-configuration"></span>

It's preferred to resolve aliases at the configuration level, so services
get URLs and paths as ready to use strings:

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

## Resolución de Alias <span id="resolving-aliases"></span>

Puedes utilizar el servicio `Aliases` para resolver un alias o un alias
derivado a la ruta de archivo o URL que representa:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // https://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

La ruta de archivo/URL representado por un alias derivado está determinado
por la sustitución de la parte de su alias raíz con su correspondiente
ruta/Url en el alias derivado.

> [!NOTE]
> El método `get()` no comprueba si la ruta/URL resultante hacer referencia a un archivo o recurso existente.


Un alias de raíz puede contener carácteres `/`.
El método `get()` es lo suficientemente inteligente para saber qué parte de
un alias es un alias de raíz y por lo tanto determinar correctamente la
correspondiente ruta de archivo o URL. Por ejemplo:

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

Si `@foo/bar` no está definido como un alias de raíz, la última declaración
mostraría `/path/to/foo/bar/file.php`.


## Alias Predefinidos <span id="predefined-aliases"></span>

[Yii application](https://github.com/yiisoft/app) predefines a set of
aliases to reference commonly used file paths and URLs:

- `@root`, la ruta base de la aplicación que se está ejecutando actualmente.
- `@assets` - application's public directory where it publishes assets.
- `@assetsUrl` - URL of base directory with published assets.
- `@baseUrl` - the base URL of the currently running Web
  application. Defaults to `/`.
- `@npm` - node packages directory.
- `@bower` - bower packages directory.
- `@vendor`, la carpeta `vendor` de Composer.
- `@public` - application's publicly accessible directory that with
  `index.php`.
- `@runtime`, la ruta de ejecución de la aplicación en ejecución. Por
  defecto`@root/runtime`.
- `@layout` - the directory with layouts.
- `@resources` - directory with views, asset sources and other resources.
- `@views` - application view templates base directory.
