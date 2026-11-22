# Diseñar paquetes para aplicaciones Yii

Esta página describe cómo diseñar un paquete de Composer que añade
comportamiento a una aplicación Yii mediante configuración. Úsala cuando tu
paquete necesite registrar servicios, rutas, eventos, comandos, assets,
migraciones, traducciones o un tema.

Para instalar y actualizar paquetes en una aplicación, consulta [Usar
paquetes](package.md).

## Metadatos de Composer

Cada paquete debe tener un archivo `composer.json` en su directorio
raíz. Como mínimo, define un nombre de paquete, las dependencias, la
autocarga y, si el paquete se integra con una aplicación Yii, los metadatos
de configuración de Yii.

Usa un nombre de paquete con el formato `vendor-name/project-name`:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "description": "Blog integration for Yii applications",
    "require": {
        "php": ">=8.2",
        "yiisoft/router": "^4.0"
    },
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    }
}
```

Usa restricciones de dependencias estables para las versiones
estables. Evita usar `yiisoft` como nombre de vendor, porque está reservado
para los paquetes de Yii.

Si tu paquete requiere una aplicación Yii, añadir el prefijo `yii-` al
nombre del proyecto puede dejarlo claro en Packagist.

## Estructura del paquete

Un paquete preparado para Yii es un paquete de Composer normal con clases
PHP, archivos de recursos opcionales y archivos de configuración
opcionales. Mantén la configuración en un directorio predecible y haz
explícita la API pública:

```
composer.json
config/
    params.php
    di.php
    di-providers.php
    routes.php
    events.php
    params-web.php
    params-console.php
    di-console.php
src/
    ...
assets/
    ...
migrations/
    ...
messages/
    ...
views/
    ...
```

Usa solo los archivos que necesite tu paquete. Por ejemplo, un paquete con
comandos de consola pero sin rutas web no necesita `routes.php`.

## Metadatos del plugin de configuración

Las aplicaciones Yii usan
[yiisoft/config](https://github.com/yiisoft/config) para descubrir la
configuración de los paquetes. Declara los archivos de configuración del
paquete en la sección `extra.config-plugin` de `composer.json`:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    },
    "extra": {
        "config-plugin": {
            "params": "config/params.php",
            "di": "config/di.php",
            "di-providers": "config/di-providers.php",
            "routes": "config/routes.php",
            "events": "config/events.php",
            "params-web": "config/params-web.php",
            "params-console": "config/params-console.php",
            "di-console": "config/di-console.php"
        }
    }
}
```

Cada clave de `config-plugin` es un nombre de grupo de configuración y cada
valor es una ruta relativa a la raíz del paquete.

Usa los grupos comunes, web y de consola de forma coherente:

- `params`, `di`, `di-providers`, `di-delegates`, `events` y `bootstrap` se
  aplican tanto a los puntos de entrada web como a los de consola.
- `params-web`, `di-web`, `di-providers-web`, `events-web`, `bootstrap-web`
  y `routes` se aplican a los puntos de entrada web.
- `params-console`, `di-console`, `di-providers-console`, `events-console` y
  `bootstrap-console` se aplican a los puntos de entrada de consola.

Si tu paquete define un nuevo grupo de configuración, documenta cómo debe
cargarlo una aplicación. Cuando te integres con servicios de Yii, es
preferible usar los grupos estándar, porque las plantillas de aplicación y
los paquetes de Yii ya usan esos nombres.

Cuando los usuarios instalan, actualizan o eliminan paquetes, o regeneran
los archivos de autocarga de Composer, el plugin de configuración vuelve a
generar el plan de fusión que Yii lee en tiempo de ejecución. Si los
usuarios editan manualmente la configuración de su paquete raíz, pídeles que
ejecuten:

```sh
composer yii-config-rebuild
```

## Parámetros

Pon las opciones predeterminadas en `config/params.php`. Agrupa los
parámetros del paquete bajo el nombre del paquete de Composer para evitar
colisiones:

```php
<?php

declare(strict_types=1);

return [
    'vendor/blog' => [
        'postsPerPage' => 20,
        'cacheTtl' => 3600,
    ],
];
```

Los desarrolladores de aplicaciones pueden sobrescribir estos valores en sus
propios `config/common/params.php`, `config/web/params.php`,
`config/console/params.php` o en los archivos de parámetros específicos de
cada entorno.

No leas variables de entorno ni estado global desde el código del paquete
cuando un parámetro pueda expresar esa elección. Usa parámetros para
configurar servicios mediante definiciones DI o proveedores de servicios.

## Definiciones DI

Usa `config/di.php`, `config/di-web.php` o `config/di-console.php` para las
definiciones directas del contenedor:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;

/** @var array $params */

return [
    PostRepositoryInterface::class => [
        'class' => PostRepository::class,
        '__construct()' => [
            'cacheTtl' => $params['vendor/blog']['cacheTtl'],
        ],
    ],
];
```

Es preferible usar definiciones DI directas cuando la configuración describe
claramente un único servicio.

## Proveedores de servicios DI

Usa un proveedor DI cuando el registro forme una unidad reutilizable: varios
servicios relacionados, alias, definiciones de factorías o extensiones.

Registra los proveedores en `config/di-providers.php`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Provider\BlogProvider;

return [
    'vendor/blog/post-repository' => BlogProvider::class,
];
```

Declara el grupo en `composer.json`:

```json
"extra": {
    "config-plugin": {
        "di-providers": "config/di-providers.php"
    }
}
```

Un proveedor puede devolver varias definiciones de servicios y
extensiones. Coloca la clase del proveedor en
`src/Provider/BlogProvider.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Provider;

use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Vendor\Blog\CachedPostRepository;
use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;
use Yiisoft\Di\ServiceProviderInterface;

final class BlogProvider implements ServiceProviderInterface
{
    public function getDefinitions(): array
    {
        return [
            PostRepository::class => PostRepository::class,
            PostRepositoryInterface::class => static fn (
                ContainerInterface $container
            ): CachedPostRepository => new CachedPostRepository(
                $container->get(PostRepository::class),
                $container->get(LoggerInterface::class),
            ),
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

## Rutas

Los paquetes web pueden añadir rutas mediante `config/routes.php`, declarado
como el grupo `routes`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Web\Post\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')->routes(
        Route::get('')
            ->action(IndexAction::class)
            ->name('vendor/blog/index'),
    ),
];
```

Los nombres de las rutas deben llevar como prefijo el del paquete. Así se
evitan colisiones con las rutas de la aplicación y con las de otros
paquetes.

Mantén las rutas del paquete pequeñas y fáciles de sobrescribir. Si una
aplicación necesita control total sobre las URL, documenta las acciones y
deja que la aplicación defina sus propias rutas.

## Eventos

Usa `config/events.php`, `config/events-web.php` o
`config/events-console.php` para asociar los manejadores del paquete a
eventos:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Event\PostPublished;
use Vendor\Blog\EventHandler\ClearPostListCache;

return [
    PostPublished::class => [
        ClearPostListCache::class,
    ],
];
```

Los manejadores pueden ser closures, callables, objetos invocables, nombres
de clases invocables o alias DI admitidos por la configuración del
despachador de eventos. Para los manejadores de paquetes, es preferible usar
nombres de clase, porque las aplicaciones pueden sobrescribir sus
dependencias a través del contenedor.

## Assets

Si tu paquete incluye CSS, JavaScript, imágenes o fuentes, define paquetes
de assets como clases PHP. Por ejemplo, coloca esta clase en
`src/Asset/BlogAsset.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Asset;

use Yiisoft\Assets\AssetBundle;

final class BlogAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    public ?string $sourcePath = __DIR__ . '/../../assets';

    public array $css = [
        'blog.css',
    ];

    public array $js = [
        'blog.js',
    ];
}
```

Los usuarios pueden registrar el paquete de assets desde una vista, un
widget, una inyección de vista o una acción:

```php
$assetManager->register(BlogAsset::class);
```

Usa `$sourcePath` para los archivos incluidos en el paquete. Usa `$basePath`
y `$baseUrl` como el destino público en el que el gestor de assets los
publica.

## Migraciones

Los paquetes que necesiten cambios en el esquema de la base de datos deben
incluir migraciones y añadir su espacio de nombres o su ruta a los
parámetros de `yiisoft/db-migration`.

Para migraciones con espacio de nombres:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourceNamespaces' => [
            'Vendor\\Blog\\Migration',
        ],
    ],
];
```

Para migraciones basadas en rutas:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourcePaths' => [
            __DIR__ . '/../migrations',
        ],
    ],
];
```

Pon esto en `config/params-console.php` y decláralo como `params-console` en
`composer.json`.

Esto solo aporta las ubicaciones de las migraciones del paquete. Para poder
ejecutar los comandos de migración, la aplicación sigue necesitando tener
instalado `yiisoft/db-migration` y una conexión a la base de datos
configurada.

Las migraciones de un paquete deben permanecer estables una vez
publicado. No edites una migración que los usuarios ya puedan haber
aplicado. En su lugar, añade una migración nueva.

## Traducciones

Si el paquete tiene mensajes dirigidos al usuario, asígnale una categoría de
traducción propia y registra una fuente de categoría en `config/di.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Translator\CategorySource;
use Yiisoft\Translator\IntlMessageFormatter;
use Yiisoft\Translator\Message\Php\MessageSource;

return [
    'translation.vendor-blog' => [
        'definition' => static function (): CategorySource {
            $messageSource = new MessageSource(__DIR__ . '/../messages');

            return new CategorySource(
                'vendor-blog',
                $messageSource,
                new IntlMessageFormatter(),
                $messageSource,
            );
        },
        'tags' => ['translation.categorySource'],
    ],
];
```

Guarda los mensajes por idioma (locale) y categoría:

```
messages/
    en-US/
        vendor-blog.php
    de/
        vendor-blog.php
```

Usa la categoría explícita al traducir:

```php
$translator->translate('post.created', category: 'vendor-blog');
```

## Temas

Un paquete puede incluir archivos de vista y assets para un tema. No lo
actives desde la configuración del paquete de terceros. En su lugar,
documenta la configuración de la aplicación raíz necesaria para
activarlo. En la plantilla de aplicación, esto va en
`config/web/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/view' => [
        'theme' => [
            'pathMap' => [
                '@views' => '@vendor/vendor/blog/views',
            ],
            'basePath' => '@vendor/vendor/blog/assets',
            'baseUrl' => '@assetsUrl/vendor-blog',
        ],
    ],
];
```

Los temas sustituyen las rutas de las vistas según un mapa de
rutas. Documenta qué rutas de vistas de la aplicación sustituye tu tema y
qué URL de assets debe publicar o exponer la aplicación.

No establezcas `yiisoft/view.theme` directamente en la configuración del
paquete de terceros. `yiisoft/view` ya define esa clave, y no se permiten
claves duplicadas en la misma capa de configuración.

Si tu paquete solo proporciona archivos de tema opcionales, no actives el
tema por defecto. Proporciona los archivos de vista, el paquete de assets y
un fragmento de parámetros documentado para que la aplicación pueda
activarlo si lo desea.

## Comandos de consola

Los paquetes de consola pueden añadir comandos de Symfony Console mediante
`config/params-console.php`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Command\ReindexCommand;

return [
    'yiisoft/yii-console' => [
        'commands' => [
            'blog/reindex' => ReindexCommand::class,
        ],
    ],
];
```

Los nombres de los comandos deben llevar como prefijo el del
paquete. Inyecta las dependencias de los comandos por constructor y
regístralas mediante DI.

## Sobrescrituras de la aplicación

La configuración del paquete es la capa predeterminada. La aplicación puede
sobrescribirla en la configuración de su paquete raíz. Diseña teniéndolo en
cuenta:

- Usa claves de parámetros, nombres de rutas, identificadores de manejadores
  de eventos y alias DI con el prefijo del paquete.
- Mantén la configuración predeterminada pequeña y documentada.
- Evita hacer trabajo irreversible durante el registro de servicios.
- Pon las integraciones opcionales en archivos de configuración o
  proveedores separados cuando requieran paquetes de Composer opcionales.
- Prueba el paquete dentro de una aplicación Yii mínima para que el plugin
  de configuración, el contenedor DI, las rutas, los comandos de consola,
  las migraciones, las traducciones y los assets se pongan a prueba en
  conjunto.

Cuando un usuario necesita personalizar la configuración de un paquete,
normalmente no necesita copiar el archivo de configuración del
paquete. Puede redefinir parcialmente las claves necesarias en la
configuración de la aplicación.

Después de cambiar las asignaciones de los grupos de configuración, debe
volver a generar el plan de fusión con:

```sh
composer yii-config-rebuild
```

## Publicar paquetes

Antes de etiquetar una versión, prueba el paquete por sí solo y dentro de
una aplicación Yii mínima. Incluye un `README.md`, un `CHANGELOG.md` y un
`UPGRADE.md` cuando los cambios de comportamiento o de configuración
requieran explicación.

Usa el [versionado semántico](https://semver.org) para las versiones
públicas. Tras la primera versión, no edites migraciones que los usuarios ya
puedan haber aplicado; en su lugar, añade migraciones nuevas.
