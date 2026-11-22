# Actualizar desde la versión 2.0

> Si no has usado Yii 2.0, puedes saltarte esta sección e ir directamente a la sección
> "[primeros pasos](../start/prerequisites.md)".

Yii3 conserva muchas ideas de Yii, pero no es un sustituto directo de Yii
2.0. Usa funcionalidades de PHP 8, interfaces PSR, inyección de
dependencias, composición explícita de paquetes y una plantilla de
aplicación diferente. Aprovecha tu experiencia con Yii 2.0 para diseñar de
forma deliberada una nueva aplicación Yii3, en lugar de intentar reproducir
la estructura de la aplicación antigua.

Para la aplicación de origen, toma como referencia:

- [yiisoft/yii2-app-basic](https://github.com/yiisoft/yii2-app-basic)
- [yiisoft/yii2-app-advanced](https://github.com/yiisoft/yii2-app-advanced)

Para la estructura de destino, toma como referencia:

- [yiisoft/app](https://github.com/yiisoft/app)
- [Guía de Yii3](../index.md)

Antes de empezar, [consulta la política de mantenimiento y las fechas de fin
de vida de Yii 2.0](https://www.yiiframework.com/release-cycle). Mantener en
Yii 2.0 una aplicación Yii 2.0 madura puede ser una opción válida. Un
proyecto Yii3 resulta más útil cuando quieres el nuevo ecosistema de
paquetes, un tipado más estricto, middleware PSR y una arquitectura más
explícita.

## Enfoque recomendado

Plantéate el trabajo como la construcción de una aplicación Yii3 que se
apoya en lo aprendido con la antigua. El proyecto antiguo te dice qué rutas,
formularios, tablas de la base de datos, reglas de negocio y flujos de
trabajo de los usuarios importan. El proyecto Yii3 debe decidir de nuevo
dónde van esas responsabilidades.

Constrúyela por porciones verticales:

1. Crea una nueva aplicación Yii3 con `yiisoft/app`.
2. Configura la autocarga de Composer y añade solo el código necesario para
   la porción que estás construyendo.
3. Define la configuración y las rutas antes de escribir las acciones.
4. Construye un flujo de solicitud cada vez: ruta, acción, modelo de
   entrada, servicio, persistencia, vista, assets y pruebas.
5. Mantén la aplicación Yii 2.0 en funcionamiento hasta haber verificado
   cada flujo en Yii3.

Evita trasladar primero todo el árbol de directorios. Los valores
predeterminados de Yii3 son distintos a propósito, y una copia mecánica
tiende a conservar las suposiciones de Yii 2.0 basadas en el localizador de
servicios. Es preferible tomar decisiones pequeñas y revisadas que arrastrar
la estructura antigua solo porque resulta familiar.

## Preparar la aplicación Yii 2.0

Parte de la preparación útil puede hacerse antes de que la aplicación Yii3
esté lista. Estas refactorizaciones mejoran el propio proyecto Yii 2.0 y
hacen que la reescritura posterior dependa menos del estado oculto del
framework:

- Sustituye el acceso a `Yii::$app` en el código reutilizable por argumentos
  del constructor cuando sea viable. Si una refactorización completa hacia
  la inyección de dependencias es demasiado grande, mantén las llamadas a
  `Yii::$app` cerca de los controladores y widgets, y pasa explícitamente
  los valores y servicios al código de nivel inferior.
- Introduce repositorios o servicios de consulta para las lecturas de la
  base de datos que ahora están repartidas entre controladores, vistas,
  widgets y métodos de Active Record. Yii3 no exige Active Record para la
  persistencia, así que la frontera de un repositorio te da un lugar natural
  para cambiar la implementación más adelante.
- Separa las reglas de negocio de la infraestructura del framework. El
  código de dominio que no extiende clases de Yii, no lee el estado global
  de la aplicación ni renderiza vistas es mucho más fácil de reutilizar o
  reescribir.
- Traslada el comportamiento reutilizable a componentes o servicios de Yii
  2.0 en lugar de mantenerlo dentro de controladores grandes y clases Active
  Record. Los servicios de Yii3 se configuran e inyectan de otra manera,
  pero el reparto de responsabilidades es similar.
- Añade pruebas para las rutas y los flujos de trabajo que planeas
  reconstruir primero. Se convertirán en la especificación ejecutable de la
  porción de Yii3.

Por ejemplo, en lugar de leer los datos del histórico de publicaciones
directamente desde varios controladores o widgets, crea un pequeño servicio
que describa la necesidad de la aplicación:

```php
final class PostRepository
{
    public function getArchive(): array
    {
        // ...
    }

    public function getTopForFrontPage(int $limit = 10): array
    {
        // ...
    }
}
```

La implementación de Yii3 puede seguir usando Active Record, o puede usar
consultas de `yiisoft/db`. Lo importante es que los controladores y las
vistas ya no necesiten conocer ese detalle.

## Qué aprender antes de empezar

Merece la pena conocer algunas decisiones de la plantilla de aplicación de
Yii3 antes de empezar a trasladar funcionalidades:

- [Docker](https://www.docker.com/get-started/). La plantilla de aplicación
  predeterminada de Yii3 incluye configuración de Docker. Usarla proporciona
  a cada aplicación su propio entorno reproducible y reduce las diferencias
  entre el desarrollo local y producción.
- [Variables de
  entorno](https://en.wikipedia.org/wiki/Environment_variable). Las
  plantillas de Yii3 suelen usarlas para los ajustes específicos de cada
  entorno y para los secretos, sobre todo en despliegues basados en
  Docker. Sigue la misma idea que la [configuración de las aplicaciones de
  12 factores](https://12factor.net/config).
- [Acciones](../structure/action.md). Yii3 no exige heredar de un
  controlador. Una ruta puede apuntar a cualquier callable, y la plantilla
  predeterminada usa clases de acción invocables.
- [Estructura de la aplicación](../structure/overview.md). La estructura
  predeterminada de Yii3 es distinta de la de Yii 2.0. La estructura es
  flexible, pero empieza con la plantilla de Yii3 y cámbiala solo cuando la
  aplicación lo necesite.

## Requisitos de PHP

Las plantillas de aplicación de Yii3 requieren PHP 8.2 o superior. Por ello,
el código de la aplicación puede usar funcionalidades del lenguaje que no
eran habituales en las aplicaciones Yii 2.0:

- [Declaraciones de
  tipo](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Declaraciones de tipo de
  retorno](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Visibilidad de las constantes de
  clase](https://www.php.net/manual/en/language.oop5.constants.php)
- [Argumentos con
  nombre](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)
- [Clases
  anónimas](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generadores](https://www.php.net/manual/en/language.generators.php)
- [Funciones
  variádicas](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)
- [Propiedades de solo
  lectura](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.readonly-properties)
- [Clases de solo
  lectura](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.readonly)
- [Promoción de propiedades en el
  constructor](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion)
- [Atributos](https://www.php.net/manual/en/language.attributes.php)

Ejecuta el análisis estático y las pruebas en Yii 2.0 antes de reutilizar
código en Yii3. El código con tipos explícitos, servicios pequeños y pocas
dependencias implícitas de `Yii::$app` es más fácil de entender y de ubicar
en la nueva aplicación.

## Estructura del proyecto

Las aplicaciones Yii 2.0 suelen organizar los roles del framework en
directorios de primer nivel:

```text
assets/
commands/
config/
controllers/
models/
runtime/
views/
web/
widgets/
```

La plantilla avanzada de Yii 2.0 divide esos mismos roles por aplicación:

```text
backend/
common/
console/
frontend/
```

La plantilla de aplicación actual de Yii3 se organiza en torno al código
fuente, la configuración, los archivos públicos y los archivos de tiempo de
ejecución:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Las correspondencias habituales que conviene tener en cuenta son:

| Yii 2.0 básica | Yii 2.0 avanzada | Yii3 |
|---------------|------------------|------|
| `controllers/` | `frontend/controllers/`, `backend/controllers/` | `src/Web/*/Action.php` o clases similares a controladores |
| `models/` | `common/models/`, modelos específicos de cada aplicación | `src/Domain`, `src/Shared`, `src/Web/*` o `src/Db`, según la responsabilidad |
| `views/` | `frontend/views/`, `backend/views/` | plantillas junto a la funcionalidad, por ejemplo `src/Web/HomePage/template.php` |
| `views/layouts/` | directorios de layouts de cada aplicación | clases/plantillas de layout, por ejemplo `src/Web/Shared/Layout/Main` |
| `assets/` | paquetes de assets de cada aplicación | `assets/` para los archivos fuente y `src/Web/.../*Asset.php` para los paquetes |
| `web/` | `frontend/web/`, `backend/web/` | `public/` |
| `commands/` | `console/controllers/` | `src/Console/*Command.php` |
| `config/*.php` | archivos de configuración comunes y de cada aplicación | `config/common`, `config/web`, `config/console`, `config/environments` |

No hay una única estructura obligatoria. El cambio importante es que las
aplicaciones Yii3 deben agrupar el código por responsabilidad y hacer
explícitas las dependencias. Si vienes de la plantilla avanzada, trata
`frontend` y `backend` como contextos web independientes. El código de
dominio compartido puede estar en `src/Shared` o en paquetes específicos de
la aplicación.

## Composer y autocarga

Las aplicaciones Yii 2.0 suelen incluir `vendor/autoload.php` y
`vendor/yiisoft/yii2/Yii.php` en `web/index.php`. Las aplicaciones Yii3 solo
incluyen el cargador automático de Composer y el código de arranque de la
aplicación.

Configura el espacio de nombres de tu aplicación con PSR-4:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Después, vuelve a generar los archivos de autocarga de Composer:

```shell
composer dump-autoload
```

Instala los paquetes de Yii3 de forma deliberada. Yii3 está dividido en
paquetes especializados, así que funcionalidades como el acceso a bases de
datos, los formularios, la validación, los assets, los widgets de datos, la
autenticación y la caché son dependencias de Composer independientes.

## Configuración y servicios

En Yii 2.0, muchos servicios se configuran como componentes de la aplicación
y se accede a ellos a través del localizador de servicios:

```php
$cache = Yii::$app->cache;
$db = Yii::$app->db;
$url = Yii::$app->urlManager->createUrl(['post/view', 'id' => $id]);
```

En Yii3, los servicios se configuran para el contenedor y se inyectan allí
donde se necesitan:

```php
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class PostService
{
    public function __construct(
        private ConnectionInterface $db,
        private CacheInterface $cache,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }
}
```

Traslada la configuración por grupos:

- los alias, a `config/common/aliases.php`;
- las definiciones de rutas, a `config/common/routes.php`;
- las definiciones de servicios compartidas, a `config/common/di/*.php`;
- las definiciones de servicios exclusivas de la web, a
  `config/web/di/*.php`;
- los parámetros y comandos de consola, a `config/console/*.php`;
- los parámetros compartidos, a `config/common/params.php`;
- las sobrescrituras por entorno, a `config/environments`.

El grupo `di-console` de la plantilla predeterminada reutiliza las
definiciones compartidas de `config/common/di/*.php`. Si necesitas
definiciones del contenedor exclusivas de la consola, añade los archivos
correspondientes al grupo `di-console` en `config/configuration.php` y
vuelve a generar el plan de fusión.

Consulta [Configuración](../concept/configuration.md),
[Alias](../concept/aliases.md) e [Inyección de dependencias y
contenedor](../concept/di-container.md).

## Script de entrada y arranque

Un script de entrada de la plantilla básica de Yii 2.0 suele crear la
aplicación directamente:

```php
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/../config/web.php';

(new yii\web\Application($config))->run();
```

En Yii3, toma como referencia el script de entrada de la plantilla de
aplicación. Carga Composer y arranca el ejecutor (runner) de la aplicación
configurado. Evita recrear el antiguo patrón `yii\web\Application` en
`public/index.php`; pon la configuración en los archivos de configuración y
las dependencias en el contenedor.

Consulta [Scripts de entrada](../structure/entry-script.md) y [Flujo de
trabajo de la aplicación](../start/workflow.md).

## Controladores, acciones y enrutamiento

En Yii 2.0, las rutas suelen apuntar a métodos de acción de controladores:

```php
namespace app\controllers;

use yii\web\Controller;

final class SiteController extends Controller
{
    public function actionIndex(): string
    {
        return $this->render('index');
    }
}
```

Yii3 no requiere clases base de controlador. La plantilla de aplicación
actual usa clases de acción invocables:

```php
namespace App\Web\HomePage;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template');
    }
}
```

Las rutas son explícitas:

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

Al rediseñar el flujo de un controlador, enumera todas las acciones de Yii
2.0 y crea rutas con nombre para los flujos que todavía necesites. Después,
implementa cada flujo como una clase invocable o como un servicio similar a
un controlador. La inyección por constructor sustituye a las llamadas a
`Yii::$app` y a las propiedades del controlador.

Consulta [Acciones](../structure/action.md),
[Middleware](../structure/middleware.md) y [Enrutamiento y generación de
URL](../runtime/routing.md).

## Solicitudes, respuestas, sesiones y cookies

Las acciones de Yii 2.0 suelen leer los datos de la solicitud y escribir los
de la respuesta a través de componentes de la aplicación:

```php
$id = Yii::$app->request->get('id');
Yii::$app->session->setFlash('success', 'Saved.');

return $this->redirect(['post/view', 'id' => $id]);
```

Yii3 usa objetos de solicitud y respuesta PSR-7 y servicios inyectables:

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class SavePostAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $id = (int) ($request->getQueryParams()['id'] ?? 0);
        $url = $this->urlGenerator->generate('post/view', ['id' => $id]);

        return $this->responseFactory
            ->createResponse(Status::SEE_OTHER)
            ->withHeader('Location', $url);
    }
}
```

Diseña pronto el manejo de las solicitudes, porque afecta a los formularios,
los filtros, los endpoints REST, las redirecciones y las pruebas.

Consulta [Solicitud](../runtime/request.md),
[Respuesta](../runtime/response.md), [Sesiones](../runtime/sessions.md) y
[Cookies](../runtime/cookies.md).

## Vistas, layouts, assets y URL

En Yii 2.0, el renderizado del controlador busca los archivos en
`views/{controller}` y los layouts en `views/layouts`:

```php
return $this->render('view', [
    'model' => $model,
]);
```

En Yii3, la ruta de la plantilla es explícita en la acción:

```php
return $this->viewRenderer->render(__DIR__ . '/view', [
    'post' => $post,
]);
```

Una plantilla de Yii3 recibe una instancia de `Yiisoft\View\WebView` como
`$this`:

```php
use App\Shared\ApplicationParams;
use Yiisoft\Html\Html;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var ApplicationParams $applicationParams
 * @var string $title
 */

$this->setTitle($title . ' - ' . $applicationParams->name);
?>

<h1><?= Html::encode($title) ?></h1>
```

Los paquetes de assets pasan de `yii\web\AssetBundle` a
`Yiisoft\Assets\AssetBundle`:

```php
namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $css = [
        'site.css',
    ];
}
```

Registra los assets en un layout o una vista mediante el gestor de assets:

```php
$assetManager->register(MainAsset::class);

$this->addCssFiles($assetManager->getCssFiles());
$this->addJsFiles($assetManager->getJsFiles());
```

Sustituye el uso de `yii\helpers\Url` y `Yii::$app->urlManager` por rutas con nombre y
`Yiisoft\Router\UrlGeneratorInterface`:

```php
$url = $urlGenerator->generate('post/view', ['id' => $post->getId()]);
```

Consulta [Vistas](../views/view.md), [Assets](../views/asset.md), [Scripts,
estilos y metaetiquetas](../views/script-style-meta.md) y [Motores de
plantillas](../views/template-engines.md).

## Formularios y validación

Yii 2.0 a menudo combina los datos del formulario, las etiquetas, la
validación y, a veces, la persistencia en una clase `yii\base\Model` o
`yii\db\ActiveRecord`:

```php
final class ContactForm extends \yii\base\Model
{
    public $name;
    public $email;

    public function rules(): array
    {
        return [
            [['name', 'email'], 'required'],
            ['email', 'email'],
        ];
    }
}
```

Yii3 separa estas responsabilidades. Usa `yiisoft/form-model` para los datos
y metadatos del formulario, y `yiisoft/validator` para las reglas:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Email;
use Yiisoft\Validator\Rule\Required;

final class ContactForm extends FormModel
{
    #[Required]
    public ?string $name = null;

    #[Required]
    #[Email]
    public ?string $email = null;
}
```

Para renderizar formularios, sustituye `yii\widgets\ActiveForm` por los
campos de `yiisoft/form` y su integración con los modelos de
formulario. Para hidratar la entrada, es preferible usar los paquetes
form-model e hydrator en lugar de asignar de forma masiva datos arbitrarios
de la solicitud a objetos de persistencia.

Consulta [Trabajar con formularios](../start/forms.md), [Validar la
entrada](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form) y
[yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record y persistencia

Hay dos opciones habituales en Yii3 para el código que usaba clases Active
Record de Yii 2.0.

El primer camino es arquitectónico: traslada la lógica de negocio a
servicios y objetos de dominio, y después usa repositorios para la
persistencia. Es lo recomendable cuando el modelo de Yii 2.0 contiene en la
misma clase validación, escenarios de formulario, comprobaciones de
autorización, envío de correo, subida de archivos y acceso a la base de
datos.

El segundo camino es incremental: representa el modelo de la base de datos
con [yiisoft/active-record](https://github.com/yiisoft/active-record). Se
parece más a Yii 2.0 y puede ser bastante más rápido cuando tus clases
Active Record se limitan sobre todo a describir tablas y relaciones.

Yii 2.0:

```php
final class Post extends \yii\db\ActiveRecord
{
    public static function tableName(): string
    {
        return '{{%post}}';
    }

    public function rules(): array
    {
        return [
            [['title', 'body'], 'required'],
            ['title', 'string', 'max' => 255],
        ];
    }
}
```

Active Record de Yii3:

```php
use Yiisoft\ActiveRecord\ActiveRecord;

final class Post extends ActiveRecord
{
    protected int $id;
    protected string $title;
    protected string $body;

    public function tableName(): string
    {
        return '{{%post}}';
    }

    public function getId(): ?int
    {
        return $this->id ?? null;
    }

    public function getTitle(): ?string
    {
        return $this->title ?? null;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }
}
```

No traslades `rules()` de Yii 2.0 directamente a la clase Active Record. En
Yii3, la validación corresponde a las reglas del validador, los modelos de
formulario, los objetos de comando o los servicios:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Length;
use Yiisoft\Validator\Rule\Required;

final class PostInput extends FormModel
{
    #[Required]
    #[Length(max: 255)]
    public ?string $title = null;

    #[Required]
    public ?string $body = null;
}
```

Después, copia los datos validados en el registro o pásalos a un servicio de
la aplicación:

```php
$post = new Post();
$post->setTitle($input->title);
$post->save();
```

Para decidir qué reutilizar, revisa cada método de Active Record:

- el mapeo de tablas y las relaciones normalmente pueden pasar a
  `yiisoft/active-record`;
- la validación debe pasar a `yiisoft/validator`;
- las etiquetas y los textos de ayuda de los formularios deben pasar a
  `yiisoft/form-model`;
- los modelos de búsqueda deben convertirse en servicios de consulta o de
  lectura de datos;
- los flujos de negocio deben convertirse en servicios;
- los eventos deben usar eventos PSR-14 o eventos específicos del paquete;
- el uso directo de `Yii::$app->db` debe convertirse en dependencias de base
  de datos inyectadas.

Las migraciones de Yii 2.0 y las migraciones de `yiisoft/db-migration` de
Yii3 no son compatibles. Empieza un nuevo historial de migraciones o crea
volcados de la estructura del esquema actual y, después, usa las migraciones
de Yii3 para los futuros cambios del esquema.

Consulta [Trabajar con bases de datos](../start/databases.md),
[Migraciones](../databases/db-migrations.md) y
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## GridView y widgets de datos

En Yii 2.0, `GridView` se usa habitualmente con `ActiveDataProvider`:

```php
use yii\grid\GridView;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'filterModel' => $searchModel,
    'columns' => [
        'id',
        'title',
        'created_at:datetime',
        ['class' => 'yii\grid\ActionColumn'],
    ],
]);
```

Yii3 usa
[yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview). Renderiza
datos a partir de un lector de datos (data reader) y usa una configuración
fluida del widget:

```php
use Yiisoft\Data\Reader\ReadableDataInterface;
use Yiisoft\Yii\DataView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\Column\ActionColumn;
use Yiisoft\Yii\DataView\GridView\GridView;

/**
 * @var ReadableDataInterface $dataReader
 */

echo GridView::widget()
    ->dataReader($dataReader)
    ->columns(
        new DataColumn('id'),
        new DataColumn('title', header: 'Title'),
        new DataColumn('created_at', header: 'Created'),
        new ActionColumn(),
    );
```

Para la ordenación, la paginación, el filtrado y las URL de las acciones,
conecta el widget con Yii Router:

```php
use Yiisoft\Yii\DataView\YiiRouter\ActionColumnUrlConfig;
use Yiisoft\Yii\DataView\YiiRouter\ActionColumnUrlCreator;
use Yiisoft\Yii\DataView\YiiRouter\UrlCreator;
use Yiisoft\Yii\DataView\YiiRouter\UrlParameterProvider;

echo GridView::widget()
    ->dataReader($dataReader)
    ->urlParameterProvider(new UrlParameterProvider($currentRoute))
    ->urlCreator(new UrlCreator($urlGenerator))
    ->columns(
        new DataColumn('id'),
        new DataColumn('title'),
        new ActionColumn(
            urlCreator: new ActionColumnUrlCreator($urlGenerator, $currentRoute),
            urlConfig: new ActionColumnUrlConfig(baseRouteName: 'post'),
        ),
    );
```

Un modelo de búsqueda de Yii 2.0 suele convertirse en un servicio de
consulta que:

1. lee los parámetros de filtrado y ordenación de la solicitud;
2. los valida con `yiisoft/validator`;
3. construye una consulta a la base de datos o al repositorio;
4. expone un lector de datos al GridView.

Consulta [Usar htmx para recargas
parciales](../../cookbook/using-htmx-for-partial-reloads.md) para ver un
flujo completo de GridView en Yii3, y la [documentación de GridView de
yii-dataview](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## Filtros, middleware y control de acceso

Los filtros y comportamientos (behaviors) de los controladores de Yii 2.0
suelen tener este aspecto:

```php
public function behaviors(): array
{
    return [
        'access' => [
            'class' => \yii\filters\AccessControl::class,
            'rules' => [
                ['allow' => true, 'roles' => ['@']],
            ],
        ],
    ];
}
```

En Yii3, el procesamiento de las solicitudes se basa en middleware. Traslada
las responsabilidades transversales, como la autenticación, la autorización,
el análisis del cuerpo de la solicitud, la negociación del idioma (locale),
las comprobaciones CSRF y el manejo de errores, a middlewares o servicios
dedicados. Mantén las acciones centradas en el flujo de solicitud que
implementan.

Consulta [Middleware](../structure/middleware.md),
[Autenticación](../security/authentication.md) y
[Autorización](../security/authorization.md).

## Comandos de consola

Los comandos de consola de Yii 2.0 extienden `yii\console\Controller`:

```php
final class ReportController extends \yii\console\Controller
{
    public function actionSend(): int
    {
        // ...
        return self::EXIT_CODE_NORMAL;
    }
}
```

Los comandos de consola de Yii3 son servicios en `src/Console`:

```php
namespace App\Console;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'report/send')]
final class SendReportCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // ...
        return Command::SUCCESS;
    }
}
```

Traslada las dependencias de los comandos a la inyección por constructor y
registra los comandos en la configuración de consola.

Consulta [Aplicaciones de consola](../tutorial/console-applications.md).

## API REST

Los controladores REST, los serializadores y los formateadores de respuesta
de Yii 2.0 no se trasladan directamente a Yii3. Parte de respuestas PSR-7 y
de un enrutamiento explícito. Construye un recurso cada vez:

1. define las rutas para las operaciones sobre colecciones y sobre
   elementos;
2. inyecta las dependencias de solicitud, persistencia, serialización y
   factoría de respuestas;
3. valida la entrada con `yiisoft/validator`;
4. devuelve respuestas JSON mediante los helpers de respuesta de Yii3 o
   factorías PSR-7;
5. traslada la autenticación y la limitación de la tasa de solicitudes a
   middleware.

Consulta [Respuesta](../runtime/response.md),
[Autenticación](../security/authentication.md) y
[Autorización](../security/authorization.md).

## Pruebas

No dejes las pruebas para cuando toda la aplicación Yii3 esté
terminada. Para cada nuevo flujo de solicitud, añade:

- pruebas unitarias para los servicios y los validadores;
- pruebas funcionales para las acciones y los middlewares;
- pruebas de extremo a extremo para los flujos críticos en el navegador;
- análisis estático para comprobaciones de tipos más estrictas.

El código de Yii3 es más explícito, así que las pruebas deben verificar
directamente los servicios en lugar de construir grandes arrays de
componentes de la aplicación.

Consulta [Pruebas](../testing/overview.md), [Pruebas
unitarias](../testing/unit.md), [Pruebas
funcionales](../testing/functional.md) y [Pruebas de extremo a
extremo](../testing/end-to-end.md).

## Refactorizar el código de Yii 2.0 antes de reutilizarlo

Estos cambios son útiles aunque la aplicación antigua siga en Yii 2.0
durante un tiempo:

- Sustituye el acceso a `Yii::$app` en el código de dominio por argumentos
  del constructor.
- Saca las consultas de los controladores y las vistas y llévalas a
  repositorios o servicios de consulta.
- Saca los flujos de negocio de las clases Active Record.
- Separa los modelos de formulario de los modelos de persistencia.
- Añade tipos de retorno y tipos de parámetros.
- Sustituye los arrays de rutas dispersos por las vistas por constantes de
  rutas con nombre o métodos auxiliares.
- Añade pruebas para cada flujo antes de reconstruirlo en Yii3.

Cuanto menos estado del framework presuponga tu código de Yii 2.0, más fácil
será entender qué debe reutilizarse y qué debe rediseñarse para Yii3.
