# Configuración

Hay muchas formas de configurar tu aplicación. Nos centraremos en los
conceptos que usa la [plantilla de proyecto
predeterminada](https://github.com/yiisoft/app).

Las configuraciones de Yii3 forman parte de la aplicación. Puedes cambiar
muchos aspectos del funcionamiento de la aplicación editando la
configuración del directorio `config/`.

## Plugin de configuración

La plantilla de aplicación usa
[yiisoft/config](https://github.com/yiisoft/config) como plugin de Composer
para ensamblar las configuraciones.

Los paquetes proporcionan configuraciones predeterminadas mediante [grupos
de configuración](https://github.com/yiisoft/config#config-groups) definidos
en la clave `config-plugin` de la sección `extra` de `composer.json`:

```json
"extra": {
    "config-plugin-options": {
        "source-directory": "config",
    },
    "config-plugin": {
        "params": "params.php",
        "web": "web.php"
    }
}
```

Cada vez que Composer actualiza los archivos de autocarga, por ejemplo
durante `dump-autoload`, `install`, `require`, `update` o `remove`, el
plugin examina los paquetes instalados en busca de configuraciones y escribe
un plan de fusión en `config/.merge-plan.php`. El plan de fusión declara el
orden en que se fusionan las configuraciones encontradas para obtener la
configuración final que se pasa al [contenedor DI](di-container.md).

En tiempo de ejecución, `Yiisoft\Config\Config` carga los grupos de
configuración definidos según ese plan de fusión. Las configuraciones se
leen en tres capas:

1. Configuraciones de los paquetes de terceros (vendor), con los valores
   predeterminados.
2. Configuraciones del paquete raíz, del directorio `config/` de la
   aplicación.
3. Configuraciones de la aplicación específicas de cada entorno.

> [!WARNING]
> No se permiten claves de configuración con el mismo nombre dentro de una misma capa.

La plantilla de aplicación guarda las configuraciones en un archivo PHP en
lugar de escribirlas directamente en JSON:

```json
"extra": {
    "config-plugin-file": "config/configuration.php"
}
```

Ese archivo devuelve las mismas claves que, de otro modo, podrías definir en
`composer.json`: `config-plugin`, `config-plugin-options` y
`config-plugin-environments`.

```php
use App\Environment;

return [
    'config-plugin-options' => [
        'source-directory' => 'config',
    ],
    'config-plugin' => [
        'params' => 'common/params.php',
        'params-web' => [
            '$params',
            'web/params.php',
        ],
        'params-console' => [
            '$params',
            'console/params.php',
        ],
        'bootstrap' => 'common/bootstrap.php',
        'bootstrap-web' => '$bootstrap',
        'bootstrap-console' => '$bootstrap',
        'di' => 'common/di/*.php',
        'di-web' => [
            '$di',
            'web/di/*.php',
        ],
        'di-console' => '$di',
        'di-delegates' => [],
        'di-delegates-console' => '$di-delegates',
        'di-delegates-web' => '$di-delegates',
        'di-providers' => [],
        'di-providers-web' => '$di-providers',
        'di-providers-console' => '$di-providers',
        'events' => [],
        'events-web' => '$events',
        'events-console' => '$events',
        'routes' => 'common/routes.php',
    ],
    'config-plugin-environments' => [
        Environment::DEV => [
            'params' => [
                'environments/dev/params.php',
            ],
        ],
        Environment::TEST => [
            'params' => [
                'environments/test/params.php',
            ],
        ],
        Environment::PROD => [
            'params' => [
                'environments/prod/params.php',
            ],
        ],
    ],
];
```

Los nombres de los grupos de configuración son las claves del array. Sus
valores son rutas de archivo relativas a la opción `source-directory`, que
por defecto es el directorio que contiene `composer.json`.

- Un valor de tipo cadena carga un solo archivo.
- Un array carga y fusiona varios archivos en el orden indicado.
- `?` marca un archivo opcional.
- `*` marca una ruta con comodines.
- `$group` hace referencia a otro grupo de configuración que se fusionará.

El grupo `params` es especial: por defecto, sus valores están disponibles
como `$params` en los demás archivos de configuración.

Más información en la [documentación de
yiisoft/config](https://github.com/yiisoft/config/blob/master/README.md).

## Archivos de configuración

Ahora que sabes cómo ensambla el plugin las configuraciones, echa un vistazo
a la estructura del directorio `config/` que usa la plantilla de aplicación
predeterminada:

```
common/
    bootstrap.php
    params.php
    routes.php
    di/
        *.php
console/
    params.php
environments/
    dev/
        params.php
    prod/
        params.php
    test/
        params.php
web/
    params.php
    di/
        *.php
.merge-plan.php
configuration.php
```

Esta estructura sigue los grupos definidos en `config/configuration.php`:

- `params`, `params-web` y `params-console` cargan los archivos de
  parámetros de `common/`, `web/` y `console/`.
- `di` y `di-web` cargan las definiciones del contenedor de `common/di/` y
  `web/di/`.
- `routes` y `bootstrap` cargan `common/routes.php` y
  `common/bootstrap.php`.
- `config-plugin-environments` añade los archivos de parámetros específicos
  de cada entorno de `environments/dev/`, `environments/test/` y
  `environments/prod/`.

En tiempo de ejecución, `.merge-plan.php` almacena el plan de fusión
ensamblado que se genera a partir de `configuration.php`.

### Configuración del contenedor

La aplicación se compone de servicios registrados en un [contenedor de
dependencias](di-container.md). En la plantilla predeterminada, las
definiciones directas del contenedor están en `config/common/di/*.php` y
`config/web/di/*.php`.

Las definiciones de `common/di/` se comparten entre los puntos de entrada
web y de consola. El grupo `di-web` añade definiciones específicas de la web
desde `web/di/`. Actualmente, el grupo `di-console` reutiliza las
definiciones compartidas de `di` sin archivos adicionales.

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;

/** @var array $params */

return [
    ApplicationParams::class => [
        '__construct()' => [
            'name' => $params['application']['name'],
            'charset' => $params['application']['charset'],
            'locale' => $params['application']['locale'],
        ],
    ],
];
```

El plugin de configuración pasa la variable especial `$params` a todos los
archivos de configuración. La definición la usa para configurar servicios.

La guía ["Inyección de dependencias y contenedor"](di-container.md) describe
en detalle el formato de configuración y la idea de la inyección de
dependencias.

Por comodidad, existe una convención de nombres para las claves de cadena
personalizadas:

1. Usa el nombre del paquete como prefijo, por ejemplo
   `yiisoft/cache-file/custom-definition`.
2. Si la configuración es de la propia aplicación, omite el prefijo del
   paquete, por ejemplo `custom-definition`.

### Proveedores de servicios

Como alternativa a registrar las dependencias directamente, puedes usar
proveedores de servicios. Un proveedor de servicios es una clase que
devuelve un conjunto reutilizable de definiciones y extensiones del
contenedor.

La plantilla predeterminada expone tres grupos de configuración para
proveedores de servicios: `di-providers`, `di-providers-web` y
`di-providers-console`. En la plantilla se inicializan como arrays vacíos en
`config/configuration.php`, y más adelante puedes rellenarlos directamente o
hacer que carguen sus valores desde archivos.

Para los servicios de la aplicación con una definición sencilla, es
preferible la configuración directa del contenedor: un nombre de clase, la
implementación de una interfaz, argumentos del constructor tomados de
`$params` o un closure que crea un único servicio.

Usa un proveedor de servicios cuando el propio registro sea una unidad
reutilizable:

- Un paquete registra varios servicios, alias o extensiones relacionados.
- El registro de un servicio necesita además definiciones auxiliares.
- El mismo registro debe reutilizarse en varias aplicaciones.
- El registro depende de clases opcionales o de decisiones específicas de
  cada entorno.

Usa una clase factoría cuando la lógica de construcción pertenezca a un
único servicio. Una factoría devuelve un objeto. Un proveedor de servicios
devuelve definiciones para varios servicios relacionados.

```php
/* @var array $params */

// ...
use App\Provider\CacheProvider;
use App\Provider\MiddlewareProvider;
// ...

return [
    // ...
    'yiisoft/yii-web/middleware' => MiddlewareProvider::class,
    'yiisoft/cache/cache' => new CacheProvider($params['yiisoft/cache-file']['file-cache']['path']),
    // ...
];
```

En esta configuración, las claves son nombres de proveedores. Por
convención, tienen la forma `vendor/package-name/provider-name`. Los valores
son nombres de clases de proveedores o instancias de proveedores. Estas
clases pueden crearse en el propio proyecto o venir de un paquete.

Si necesitas configurar algunas opciones de un servicio, igual que con la
configuración directa del contenedor, toma los valores de `$params` y
pásalos a los proveedores.

Un proveedor debe implementar `Yiisoft\Di\ServiceProviderInterface`. A
continuación se muestra un proveedor para un servicio de caché:

```php
use Psr\Container\ContainerInterface;
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;
use Yiisoft\Cache\File\FileCache;
use Yiisoft\Di\ServiceProviderInterface;

final readonly class CacheProvider implements ServiceProviderInterface
{
    public function __construct(
        private string $cachePath = '@runtime/cache'
    )
    {
    }

    public function getDefinitions(): array
    {
        return [
            CacheInterface::class => function (ContainerInterface $container) {
                $aliases = $container->get(Aliases::class);

                return new FileCache($aliases->get($this->cachePath));
            },
            YiiCacheInterface::class => Cache::class,
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

### Rutas

Puedes configurar cómo responde la aplicación web a determinadas URL en
`config/common/routes.php`:

```php
use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
        ),
];
``` 

Más información en ["Enrutamiento y generación de
URL"](../runtime/routing.md).

### Eventos

Muchos servicios emiten determinados eventos a los que puedes
suscribirte. La plantilla predeterminada define tres grupos de configuración
de eventos en `config/configuration.php`: `events`, `events-web` y
`events-console`. Están vacíos por defecto, pero puedes rellenarlos
directamente o hacer que apunten a archivos de configuración de eventos.

La configuración es un array cuyas claves son nombres de eventos y cuyos
valores son arrays de manejadores:

```php
return [
    EventName::class => [
        // Un closure normal; el despachador (Dispatcher) lo llamará "tal cual".
        static fn (EventName $event) => someStuff($event),
        
        // Un closure normal con una dependencia adicional. Todos los parámetros posteriores al primero (el propio evento)
        // se resolverán desde tu contenedor DI mediante `yiisoft/injector`.
        static fn (EventName $event, DependencyClass $dependency) => someStuff($event),
        
        // Un ejemplo con un callable normal. Si el método `staticMethodName` tiene dependencias,
        // se resolverán del mismo modo que en el ejemplo anterior.
        [SomeClass::class, 'staticMethodName'],
        
        // También se permiten métodos no estáticos. En este caso, tu contenedor DI creará la instancia de `SomeClass`.
        [SomeClass::class, 'methodName'],
        
        // Un objeto de una clase que implementa el método `__invoke`
        new InvokableClass(),
        
        // En este caso, tu contenedor DI creará la instancia de `InvokableClass`, que tiene el método `__invoke`
        InvokableClass::class,
        
        // Aquí puede ir cualquier definición de clase invocable, siempre que `$container->has('the definition')` sea true.
        'di-alias'
    ],
];
```

Más información en ["Eventos"](events.md).


### Parámetros

Los parámetros base se guardan en `config/common/params.php`. Después los
amplían `config/web/params.php`, `config/console/params.php` y los archivos
específicos de cada entorno dentro de `config/environments/`.

> [!TIP]
> No uses parámetros, constantes ni variables de entorno directamente en tu aplicación; en su lugar,
> configura servicios.

El archivo `common/params.php` de la aplicación predeterminada tiene este
aspecto:

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Definitions\Reference;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\CsrfViewInjection;

return [
    'application' => require __DIR__ . '/application.php',

    'yiisoft/aliases' => [
        'aliases' => require __DIR__ . '/aliases.php',
    ],

    'yiisoft/view' => [
        'basePath' => null,
        'parameters' => [
            'assetManager' => Reference::to(AssetManager::class),
            'applicationParams' => Reference::to(ApplicationParams::class),
            'aliases' => Reference::to(Aliases::class),
            'urlGenerator' => Reference::to(UrlGeneratorInterface::class),
            'currentRoute' => Reference::to(CurrentRoute::class),
        ],
    ],

    'yiisoft/yii-view-renderer' => [
        'viewPath' => null,
        'layout' => '@src/Web/Shared/Layout/Main/layout.php',
        'injections' => [
            Reference::to(CsrfViewInjection::class),
        ],
    ],
];
```

Por comodidad, existe una convención de nombres para los parámetros:

1. Agrupa los parámetros por nombre de paquete, por ejemplo
   `yiisoft/cache-file`.
2. Si los parámetros son de la propia aplicación, como en `application`,
   omite el prefijo del paquete.
3. Si el paquete tiene varios servicios, como `file-target` y `file-rotator`
   en el paquete `yiisoft/log-target-file`, agrupa los parámetros por nombre
   de servicio.
4. Usa `enabled` como nombre de parámetro para poder activar o desactivar un
   servicio, como en `yiisoft/yii-debug`.

### Configuraciones de paquetes

El plugin de configuración no copia automáticamente las configuraciones de
los paquetes de terceros. Las carga directamente desde `vendor/` como capa
de terceros (vendor) y las combina con la capa del paquete raíz y las capas
específicas de cada entorno.

Si quieres personalizar el archivo de configuración de un paquete en tu
aplicación, usa el comando de Composer `yii-config-copy` para copiarlo a tu
directorio `config/`, normalmente dentro de `config/packages/`. Una vez
copiado, el archivo pasa a formar parte de la capa del paquete raíz, por lo
que puede sobrescribir los valores predeterminados de los paquetes de
terceros.

El plan de fusión almacenado en `.merge-plan.php` define cómo se ensamblan
los grupos de configuración. Si añades nuevos archivos o directorios de
configuración y actualizas la configuración del paquete raíz, vuelve a
generar el plan de fusión con `composer yii-config-rebuild`.
