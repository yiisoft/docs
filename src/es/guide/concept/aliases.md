# Alias

Los alias son utilizados para representar rutas o URLs de manera que no
tengas que escribir explícitamente rutas absolutas o URLs en tu
proyecto. Un alias debe comenzar con el signo `@` para ser diferenciado de
una ruta normal de archivo y de URLs. Los alias definidos
sin el `@` del principio, serán prefijados con el signo `@`.

La aplicación Yii predeterminada tiene algunos alias predefinidos en
`config/params.php`. Por ejemplo, el alias `@public` representa la ruta de
la raíz web y `@baseUrl` representa la URL base de la aplicación web que se
está ejecutando.

## Definir alias

Puedes definir un alias mediante la aplicación en `config/params.php`:

```php
return [
    // ...
    
    'yiisoft/aliases' => [
        'aliases' => [
            // ...
        
            // un alias de una ruta de archivo
            '@foo' => '/path/to/foo',
        
            // un alias de una URL
            '@bar' => 'https://www.example.com',
        
            // un alias de un archivo concreto que contiene la clase \foo\Bar 
            '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
        ],
    ],
];
```

> [!NOTE]
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

El parámetro `yiisoft/aliases` inicializa el servicio `Aliases` del paquete
[`yiisoft/aliases`](https://github.com/yiisoft/aliases). Puedes establecer
alias adicionales en tiempo de ejecución usando el servicio:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Usar alias en la configuración

Es preferible resolver los alias en la configuración, para que los servicios
reciban las URL y las rutas como cadenas listas para usar:

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

## Resolver alias

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
> El método `get()` no comprueba si la ruta/URL resultante hace referencia a un archivo o recurso existente.


Un alias de raíz también puede contener caracteres `/`. El método `get()` es
lo suficientemente inteligente para saber qué parte de un alias es un alias
de raíz y por lo tanto determinar correctamente la correspondiente ruta de
archivo o URL. Por ejemplo:

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


## Alias predefinidos

La [aplicación Yii](https://github.com/yiisoft/app) predefine un conjunto de
alias para referirse a las rutas de archivos y URL de uso habitual:

- `@root`, la ruta base de la aplicación que se está ejecutando actualmente.
- `@assets`, el directorio público de la aplicación donde se publican los
  assets.
- `@assetsUrl`, la URL del directorio base con los assets publicados.
- `@baseUrl`, la URL base de la aplicación web que se está ejecutando. Por
  defecto, `/`.
- `@npm`, el directorio de paquetes de Node.
- `@bower`, el directorio de paquetes de Bower.
- `@vendor`, la carpeta `vendor` de Composer.
- `@public`, el directorio de la aplicación accesible públicamente que
  contiene `index.php`.
- `@runtime`, la ruta de ejecución de la aplicación en ejecución. Por
  defecto, `@root/runtime`.
- `@layout`, el directorio con los layouts.
- `@resources`, el directorio con las vistas, las fuentes de los assets y
  otros recursos.
- `@views`, el directorio base de las plantillas de vista de la aplicación.
