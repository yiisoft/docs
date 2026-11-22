# Módulos

Un módulo es una parte de la aplicación agrupada en torno a un contexto de
negocio o a una funcionalidad reutilizable. En Yii es una frontera de
diseño, no una clase base obligatoria. Un módulo puede ser:

- código de la aplicación dentro del espacio de nombres `App\`;
- un [paquete de Composer](package.md) instalado en `vendor/`;
- código que empieza en la aplicación y más adelante se extrae a un paquete.

Usa un módulo cuando un grupo de acciones, servicios de dominio,
repositorios, manejadores de eventos, vistas, assets, comandos y
configuración relacionada cambia a la vez y tiene un nombre con sentido para
el negocio.

Por ejemplo, un módulo de blog puede vivir en una aplicación así:

```
src/
    Blog/
        Post/
            Post.php
            PostRepositoryInterface.php
            InMemoryPostRepository.php
        Web/
            IndexAction.php
            index.php
```

Más adelante, la misma estructura puede convertirse en un paquete de
Composer cambiando el espacio de nombres y añadiendo los metadatos y los
archivos de configuración del paquete. Consulta [Diseñar paquetes para
aplicaciones Yii](designing-packages.md) para los detalles específicos de
los paquetes.

## Fronteras de los módulos

Agrupa el código de un módulo primero por contexto y después por tipo
técnico. Esto se parece al enfoque de [porciones
verticales](../../cookbook/organizing-code/structuring-by-use-case-with-vertical-slices.md),
pero a la escala más amplia de la estructura de la aplicación. Es preferible
`App\Blog\Post\PostRepositoryInterface` a un
`App\Repository\PostRepositoryInterface` global cuando el repositorio solo
pertenece a las publicaciones del blog.

Trata las clases de un módulo como API pública solo cuando se espere que
otro módulo las use. Las buenas clases de API pública suelen ser:

- comandos o consultas que expresan un caso de uso;
- DTO u objetos de valor que se pasan entre módulos;
- interfaces para servicios a los que otro módulo puede llamar;
- eventos emitidos por el módulo.

Mantén las clases de implementación privadas dentro del espacio de nombres
del módulo. Otros módulos no deben depender directamente de
`App\Blog\Post\InMemoryPostRepository` ni de una acción de
controlador. Deben depender de una interfaz, de una clase de caso de uso o
de un evento.

## Interfaces entre módulos

Pon cada interfaz donde corresponda el contrato:

- Si la interfaz describe una capacidad que proporciona un módulo, colócala
  en ese módulo. Por ejemplo, `App\Blog\Post\PostRepositoryInterface`
  pertenece al módulo de blog porque describe cómo se leen las publicaciones
  del blog.
- Si la interfaz describe lo que un módulo necesita del mundo exterior,
  colócala en el módulo que la consume. Por ejemplo,
  `App\Order\Customer\CustomerVerifierInterface` pertenece al módulo de
  pedidos si los pedidos solo necesitan una comprobación de sí o no sobre el
  cliente. El módulo de clientes, un adaptador de la aplicación o un paquete
  pueden proporcionar la implementación.

Así las dependencias quedan explícitas. Un módulo puede depender del
contrato público de otro módulo, pero no debe acceder a las clases de
implementación internas de otro módulo.

Primero, define la interfaz en el módulo:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Post;

interface PostRepositoryInterface
{
    /**
     * @return list<Post>
     */
    public function findLatest(): array;
}
```

Pon la implementación en el mismo módulo y asocia la interfaz a ella:

```php
<?php

declare(strict_types=1);

use App\Blog\Post\InMemoryPostRepository;
use App\Blog\Post\PostRepositoryInterface;

return [
    PostRepositoryInterface::class => InMemoryPostRepository::class,
];
```

En la plantilla de aplicación predeterminada, pon este archivo en
`config/common/di/`, por ejemplo `config/common/di/blog.php`. La plantilla
carga `config/common/di/*.php` en el grupo de configuración compartido `di`,
así que la asociación está disponible para los puntos de entrada web y de
consola.

## Acciones web

Las acciones pertenecen al módulo cuando son el punto de entrada web del
comportamiento del módulo:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Web;

use App\Blog\Post\PostRepositoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class IndexAction
{
    public function __construct(
        private PostRepositoryInterface $posts,
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/index', [
            'posts' => $this->posts->findLatest(),
        ]);
    }
}
```

Mantén en la acción el análisis de la solicitud y la creación de la
respuesta. Mantén las decisiones de negocio en las clases de dominio del
módulo o en los servicios de casos de uso.

## Rutas

En una aplicación pequeña, añade las rutas del módulo directamente a
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
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

    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

Usa nombres de rutas con el prefijo del módulo, como `blog/index`, para
evitar colisiones.

Si la aplicación tiene muchos módulos, puedes dar a cada módulo su propio
archivo de configuración de rutas. Cambia el grupo `routes` en
`config/configuration.php`:

```php
'routes' => [
    'common/routes.php',
    'common/routes/*.php',
],
```

Después, crea `config/common/routes/blog.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

Después de cambiar `config/configuration.php` o de añadir archivos que
coincidan con un comodín de configuración, vuelve a generar el plan de
fusión:

```sh
composer yii-config-rebuild
```

## Configuración de los módulos

Los módulos de la aplicación usan los mismos grupos de configuración que los
paquetes. La diferencia está en dónde reside la configuración:

- la configuración de los módulos de la aplicación reside en la aplicación
  raíz, dentro de `config/`;
- la configuración de los módulos distribuidos como paquetes reside en el
  paquete y se declara en `extra.config-plugin`.

Las ubicaciones habituales de la configuración de los módulos de la
aplicación son:

```
config/
    common/
        di/
            blog.php
        routes/
            blog.php
        params.php
    console/
        params.php
    web/
        params.php
```

Pon las definiciones de servicios compartidas en `common/di/`. Pon las
definiciones exclusivas de la web en `web/di/`. Pon los parámetros o
registros de comandos exclusivos de la consola en `console/params.php`.

Cuando un módulo crezca lo suficiente como para ser reutilizable, traslada
sus clases PHP a un paquete de Composer, mueve sus archivos de configuración
al directorio `config/` del paquete y decláralos en el `composer.json` del
paquete:

```json
{
    "extra": {
        "config-plugin": {
            "di": "config/di.php",
            "routes": "config/routes.php"
        }
    }
}
```

Así, la aplicación puede sobrescribir los valores predeterminados del
paquete en sus propios archivos de configuración.

## Comunicación entre módulos

Elige el acoplamiento más pequeño que permita el comportamiento:

- Usa la inyección por constructor con una interfaz para una llamada
  síncrona directa.
- Usa un evento cuando el productor no deba saber quién reacciona a algo que
  ha ocurrido.
- Usa un servicio de la aplicación o una clase de caso de uso cuando la
  orquestación no pertenezca a ninguno de los dos módulos.
- Usa un paquete cuando el módulo deba reutilizarse en más de una
  aplicación.

Evita las llamadas al localizador de servicios y el estado global dentro de
las clases de los módulos. Deja que las acciones, los comandos y los
servicios reciban sus dependencias a través de los constructores, para que
las fronteras de los módulos sigan siendo visibles en el código y se puedan
probar de forma aislada.
