# Alias

Los alias son utilizados para representar rutas o URLs de manera que no tengas que escribir explícitamente rutas absolutas o URLs en tu
proyecto. Un alias debe comenzar con el signo `@` para ser diferenciado de una ruta normal de archivo y de URLs. Los alias definidos
sin el `@` del principio, serán prefijados con el signo `@`.

Yii incluye varios alias predefinidos en `config/params.php`. Por ejemplo, el alias `@src` representa la ruta de instalación de la aplicación en la carpeta `src`; `@web` representa la URL base para la aplicación Web ejecutándose.

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

> Nota: Una ruta de archivo o URL en alias *no* se refiere necesariamente a un archivo o recurso existente.

Dado un alias, puedes derivar un nuevo alias anexando una barra diagonal `/` seguida por uno o varios segmentos de la ruta.
Por ejemplo, `@foo` es un alias de raíz, mientras que `@foo/bar/file.php` es un alias derivado.

Puedes definir un alias usando otro alias (ya sea un alias de raíz o derivado):

```php
'@foobar' => '@foo/bar',
```

El parámetro `aliases` inicializa el servicio `Aliases` desde el [paquete `yiisoft/aliases`](https://github.com/yiisoft/aliases).
Puedes agregar alias adicionales en tiempo de ejecución usando el servicio:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Resolución de Alias <span id="resolving-aliases"></span>

Puedes utilizar el servicio `Aliases` para resolver un alias o un alias derivado a la ruta de archivo o URL que representa:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // http://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

La ruta de archivo/URL representado por un alias derivado está determinado por la sustitución de la parte de su alias raíz con su correspondiente ruta/Url en el alias derivado.

> Nota: El método `get()` no comprueba si la ruta/URL resultante hacer referencia a un archivo o recurso existente.

A root alias may also contain slash `/` characters. The `get()` method
is intelligent enough to tell, which part of an alias is a root alias and thus correctly determines
the corresponding file path or URL:

Un alias de raíz puede contener carácteres `/`.
El método `get()` es lo suficientemente inteligente para saber qué parte de un alias es un alias de raíz y por lo tanto determinar correctamente la correspondiente ruta de archivo o URL. Por ejemplo:

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

Si `@foo/bar` no está definido como un alias de raíz, la última declaración mostraría `/path/to/foo/bar/file.php`.


## Alias Predefinidos <span id="predefined-aliases"></span>

Yii predefine un conjunto de alias para aliviar la necesidad de hacer referencia a rutas de archivo o URLs que son utilizadas regularmente:

- `@root`, la ruta base de la aplicación que se está ejecutando actualmente.
- `@vendor`, la carpeta `vendor` de Composer.
- `@public`, el directorio raíz Web de la aplicación Web se está ejecutando actualmente.
- `@runtime`, la ruta de ejecución de la aplicación en ejecución. Por defecto`@root/runtime`.
- `@web`, la URL base de la aplicación web se ejecuta actualmente.

## Alias en extensiones <span id="package-aliases"></span>

Un alias se define automáticamente por cada [extensión](structure-extensions.md) que ha sido instalada a través de Composer.
El alias es nombrado tras el `namespace` de raíz de la extensión instalada tal y como está declarada en su archivo `composer.json`,
y representa el directorio raíz de la extensión. Por ejemplo, si instalas la extensión `yiisoft/yii2-jui`, tendrás
automáticamente definido el alias `@yii/jui` durante la etapa [bootstrapping](runtime-bootstrapping.md) de la aplicación:

```php
Yii::setAlias('@yii/jui', 'VendorPath/yiisoft/yii2-jui');
```