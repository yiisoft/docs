# Actualizar desde la versión 1.1

> Si no has usado Yii 1.1, puedes saltarte esta sección e ir directamente a la sección
> "[primeros pasos](../start/prerequisites.md)".

Yii3 no es una actualización incremental de Yii 1.1. Yii 2.0 fue una
reescritura completa, y Yii3 vuelve a cambiar la arquitectura: paquetes de
Composer, espacios de nombres, PHP 8, interfaces PSR, inyección de
dependencias, rutas explícitas, middleware y paquetes independientes para
funcionalidades que en Yii 1.1 venían integradas en el framework.

Plantéatelo como la construcción de una nueva aplicación Yii3 aprovechando
tu experiencia con Yii 1.1. Reutiliza el conocimiento del dominio, el
esquema de la base de datos, los flujos de trabajo de los usuarios y una
parte del código tras refactorizarlo. No intentes reproducir en Yii3 la
estructura de la aplicación Yii 1.1. Una conversión directa a base de buscar
y reemplazar no es realista.

Para más contexto, lee la sección [Actualizar desde la versión
1.1](https://www.yiiframework.com/doc/guide/2.0/en/intro-upgrade-from-v1) de
la guía de Yii 2.0. Explica la primera gran ruptura con Yii 1.1: Composer,
espacios de nombres, configuración de objetos, cambios en las vistas,
valores de retorno de los controladores, widgets, assets, helpers,
formularios, constructor de consultas, Active Record y gestión de URL. Yii3
se basa en muchos de esos cambios y hace más explícitas las dependencias.

## Enfoque recomendado

Elige uno de estos caminos:

- Construye directamente una nueva aplicación Yii3 cuando la aplicación Yii
  1.1 sea pequeña o ya estés reescribiendo los flujos de solicitud.
- Traslada primero los conceptos de Yii 1.1 a Yii 2.0 cuando el equipo
  necesite un salto conceptual más pequeño.
- Mantén Yii 1.1 en funcionamiento y reconstruye en Yii3 los flujos críticos
  uno a uno.

Para la mayoría de las aplicaciones de larga duración, la tercera opción es
la menos arriesgada. Crea una aplicación Yii3, conéctala a la misma base de
datos y construye porciones verticales: ruta, acción, validación de la
entrada, persistencia, vista, assets y pruebas. Cada porción debe ser código
Yii3 idiomático, aunque se base en el comportamiento de la aplicación Yii
1.1.

## Preparar la aplicación Yii 1.1

Parte de la preparación útil puede hacerse antes de que la aplicación Yii3
esté lista. Estas refactorizaciones hacen que el comportamiento antiguo sea
más fácil de entender y reducen la cantidad de estado del framework Yii 1.1
que pasa al código nuevo:

- Elimina el acceso directo a `Yii::app()` del código reutilizable cuando
  sea viable. Si una refactorización completa es demasiado grande, mantén
  las llamadas a `Yii::app()` cerca de los controladores, widgets y
  comandos, y pasa explícitamente los valores y servicios al código de nivel
  inferior.
- Introduce repositorios o servicios de consulta para las lecturas de la
  base de datos que ahora están repartidas entre controladores, vistas,
  métodos de `CActiveRecord` y widgets. Yii3 puede usar Active Record, pero
  no lo exige para todas las tareas de persistencia.
- Separa las reglas de negocio de la infraestructura del framework. El
  código que no extiende `CComponent`, no lee el estado global de la
  aplicación ni renderiza vistas es más fácil de reutilizar como
  especificación para el código de Yii3.
- Saca el comportamiento reutilizable de los controladores grandes y las
  clases Active Record y llévalo a componentes de aplicación de Yii 1.1 o a
  servicios simples. Los servicios de Yii3 se configuran e inyectan de otra
  manera, pero el reparto de responsabilidades es similar.
- Añade pruebas o comprobaciones de caracterización para las rutas y los
  flujos de trabajo que planeas reconstruir primero. Se convertirán en la
  especificación ejecutable de la porción de Yii3.

Por ejemplo, en lugar de leer los datos del histórico de publicaciones
directamente desde varios controladores o widgets, crea un pequeño servicio
que describa la necesidad de la aplicación:

```php
class PostRepository extends CComponent
{
    public function getArchive()
    {
        // ...
    }

    public function getTopForFrontPage($limit = 10)
    {
        // ...
    }
}
```

La implementación de Yii3 puede usar `yiisoft/active-record`, `yiisoft/db` u
otra capa de persistencia. Lo importante es que los controladores y las
vistas ya no necesiten conocer ese detalle.

## Qué aprender antes de empezar

Algunas decisiones de la plantilla de aplicación de Yii3 probablemente sean
nuevas si vienes de un código base de Yii 1.1:

- [Composer](https://getcomposer.org/). Las aplicaciones y los paquetes de
  Yii3 se instalan mediante Composer y se cargan con la autocarga PSR-4.
- [Espacios de
  nombres](https://www.php.net/manual/en/language.namespaces.php). Las
  clases de Yii3 usan espacios de nombres en lugar de los prefijos de clase
  y los alias de ruta al estilo de Yii 1.1 para cargar las clases.
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
  predeterminada de Yii3 es distinta de la de Yii 1.1. Empieza con la
  plantilla de Yii3 y cámbiala solo cuando la aplicación lo necesite.

## PHP, Composer y espacios de nombres

Las aplicaciones Yii 1.1 suelen basarse en código de la época de PHP 5, en
prefijos de clase como `CController` y en la autocarga por nombre de
clase. Las aplicaciones Yii3 requieren un PHP moderno y la autocarga de
Composer.

Yii 1.1:

```php
class SiteController extends CController
{
}
```

Yii3:

```php
namespace App\Web\HomePage;

final readonly class Action
{
}
```

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

Ejecuta:

```shell
composer dump-autoload
```

Al reutilizar una clase, dale un espacio de nombres, añade tipos estrictos,
sustituye las clases base de Yii 1.1 e inyecta las dependencias en lugar de
leerlas del estado global de la aplicación. Si estos cambios hacen que la
clase resulte forzada, usa la clase antigua como especificación y escribe en
su lugar una nueva clase de Yii3.

## Estructura del proyecto

Una aplicación Yii 1.1 suele usar:

```text
protected/
  commands/
  components/
  config/
  controllers/
  extensions/
  messages/
  migrations/
  models/
  views/
themes/
webroot/
```

La plantilla de aplicación actual de Yii3 usa:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Las correspondencias habituales que conviene tener en cuenta son:

| Yii 1.1 | Yii3 |
|---------|------|
| `protected/controllers` | `src/Web/*/Action.php` o servicios similares a controladores |
| `protected/models` | `src/Domain`, `src/Shared`, `src/Db` o modelos de formulario, según la responsabilidad |
| `protected/views` | plantillas junto a la funcionalidad, por ejemplo `src/Web/HomePage/template.php` |
| `protected/views/layouts` | plantillas de layout y assets dentro de `src/Web/Shared/Layout` |
| `protected/components` | servicios configurados en el contenedor de inyección de dependencias |
| `protected/extensions` | paquetes de Composer o paquetes locales |
| `protected/commands` | `src/Console/*Command.php` |
| `protected/messages` | archivos de mensajes del traductor |
| `protected/config` | `config/common`, `config/web`, `config/console`, `config/environments` |
| `webroot` | `public` |

No recrees `protected` en Yii3. Pon el código fuente PHP en `src`, los
archivos públicos en `public`, los archivos generados y de tiempo de
ejecución en `runtime`, y la configuración en `config`.

## Configuración y componentes de la aplicación

La configuración de Yii 1.1 suele ser un único array grande:

```php
return [
    'basePath' => dirname(__DIR__),
    'components' => [
        'db' => [
            'connectionString' => 'mysql:host=localhost;dbname=app',
            'username' => 'root',
            'password' => '',
        ],
        'urlManager' => [
            'urlFormat' => 'path',
            'rules' => [
                'post/<id:\d+>' => 'post/view',
            ],
        ],
    ],
];
```

En Yii3, la configuración se divide según su finalidad y los servicios se
conectan a través del contenedor:

- los alias, en `config/common/aliases.php`;
- los parámetros, en `config/common/params.php` y en los archivos de
  entorno;
- las definiciones de servicios compartidas, en `config/common/di/*.php`;
- las definiciones de servicios exclusivas de la web, en
  `config/web/di/*.php`;
- las rutas, en `config/common/routes.php`;
- los comandos de consola, en `config/console/*.php`.

El grupo DI de consola de la plantilla predeterminada reutiliza las
definiciones compartidas de `config/common/di/*.php`. Si necesitas
definiciones del contenedor exclusivas de la consola, añade sus archivos al
grupo `di-console` en `config/configuration.php` y vuelve a generar el plan
de fusión.

Sustituye `Yii::app()->componentName` por servicios inyectados en el constructor:

```php
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class PostRepository
{
    public function __construct(
        private ConnectionInterface $db,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }
}
```

Consulta [Configuración](../concept/configuration.md),
[Alias](../concept/aliases.md) e [Inyección de dependencias y
contenedor](../concept/di-container.md).

## Script de entrada

Los scripts de entrada de Yii 1.1 suelen cargar `yii.php` y crear una
aplicación web:

```php
require_once __DIR__ . '/../framework/yii.php';

Yii::createWebApplication($config)->run();
```

Los scripts de entrada de Yii3 cargan Composer y arrancan la aplicación
configurada. Parte del archivo `public/index.php` de `yiisoft/app` y ajusta
la configuración en lugar de construir la aplicación manualmente en el
script de entrada.

Consulta [Scripts de entrada](../structure/entry-script.md) y [Flujo de
trabajo de la aplicación](../start/workflow.md).

## Controladores, acciones y rutas

Los controladores de Yii 1.1 extienden `CController`, y las acciones son
métodos con nombres del tipo `actionName`:

```php
class PostController extends CController
{
    public function actionView($id)
    {
        $post = Post::model()->findByPk($id);

        if ($post === null) {
            throw new CHttpException(404);
        }

        $this->render('view', ['post' => $post]);
    }
}
```

Yii3 no exige heredar de un controlador. La plantilla actual usa clases de
acción invocables:

```php
namespace App\Web\Post\View;

use App\Post\PostRepository;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private CurrentRoute $currentRoute,
        private PostRepository $posts,
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        $post = $this->posts->findById((int) $this->currentRoute->getArgument('id'));

        return $this->viewRenderer->render(__DIR__ . '/template', [
            'post' => $post,
        ]);
    }
}
```

La ruta es explícita:

```php
use App\Web\Post\View;
use Yiisoft\Router\Route;

return [
    Route::get('/post/{id:\d+}')
        ->action(View\Action::class)
        ->name('post/view'),
];
```

Define las rutas antes que el cuerpo de las acciones. Así tendrás una lista
de comprobación de los flujos de solicitud que has decidido conservar en la
aplicación Yii3.

Consulta [Acciones](../structure/action.md),
[Middleware](../structure/middleware.md) y [Enrutamiento y generación de
URL](../runtime/routing.md).

## Solicitudes, respuestas, redirecciones, sesiones y cookies

El código de Yii 1.1 suele leer y escribir a través de `Yii::app()`:

```php
$id = Yii::app()->request->getParam('id');
Yii::app()->user->setFlash('success', 'Saved.');
$this->redirect(['post/view', 'id' => $id]);
```

Yii3 usa objetos de solicitud y respuesta PSR-7 y servicios inyectables. La
entrada de la solicitud está disponible en `ServerRequestInterface`; las
redirecciones, las sesiones, las cookies y las respuestas son dependencias
explícitas.

Consulta [Solicitud](../runtime/request.md),
[Respuesta](../runtime/response.md), [Sesiones](../runtime/sessions.md) y
[Cookies](../runtime/cookies.md).

## Vistas y layouts

Las vistas de Yii 1.1 usan `$this` como contexto del controlador o del
widget. Los layouts y las vistas parciales se renderizan mediante métodos
del controlador:

```php
<?php
/* @var $this PostController */
/* @var $post Post */
?>

<h1><?php echo CHtml::encode($post->title); ?></h1>
```

En las plantillas de Yii3, `$this` es una instancia de
`Yiisoft\View\WebView`:

```php
use Yiisoft\Html\Html;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var Post $post
 */

$this->setTitle($post->getTitle());
?>

<h1><?= Html::encode($post->getTitle()) ?></h1>
```

Traslada la lógica de vista específica del controlador a la acción o a un
presentador (presenter). Pasa solo los datos que necesita la plantilla.

Consulta [Vistas](../views/view.md), [Inyecciones de
vista](../views/view-injections.md) y [Motores de
plantillas](../views/template-engines.md).

## Assets y scripts de cliente

Las aplicaciones Yii 1.1 suelen usar `CClientScript`, temas y la publicación
de assets propia de cada extensión:

```php
Yii::app()->clientScript->registerCssFile('/css/site.css');
Yii::app()->clientScript->registerScriptFile('/js/site.js');
```

Yii3 usa paquetes de assets de `yiisoft/assets`:

```php
namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $css = ['site.css'];
    public array $js = ['site.js'];
}
```

Registra los paquetes mediante el gestor de assets en los layouts o las
vistas.

Consulta [Assets](../views/asset.md) y [Scripts, estilos y
metaetiquetas](../views/script-style-meta.md).

## Modelos, formularios y validación

Yii 1.1 tiene `CModel`, `CFormModel` y `CActiveRecord`. Es habitual que una
sola clase de modelo contenga los datos de entrada, las etiquetas, las
reglas de validación, la persistencia en la base de datos y la lógica de
negocio.

Yii3 funciona mejor cuando estas responsabilidades están separadas:

- datos y etiquetas del formulario: `yiisoft/form-model`;
- reglas de validación: `yiisoft/validator`;
- renderizado de formularios: `yiisoft/form`;
- persistencia: repositorios, `yiisoft/db` o `yiisoft/active-record`;
- flujos de negocio: servicios de la aplicación.

Modelo de formulario de Yii 1.1:

```php
class ContactForm extends CFormModel
{
    public $name;
    public $email;

    public function rules()
    {
        return [
            ['name, email', 'required'],
            ['email', 'email'],
        ];
    }
}
```

Modelo de formulario de Yii3:

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

Consulta [Trabajar con formularios](../start/forms.md), [Validar la
entrada](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form) y
[yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record

Active Record de Yii 1.1 usa `CActiveRecord::model()` y atributos dinámicos:

```php
class Post extends CActiveRecord
{
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    public function tableName()
    {
        return '{{post}}';
    }

    public function rules()
    {
        return [
            ['title, body', 'required'],
            ['title', 'length', 'max' => 255],
        ];
    }
}
```

La opción incremental en Yii3 es
[yiisoft/active-record](https://github.com/yiisoft/active-record):

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

Traslada `rules()` de Yii 1.1 a un modelo de formulario, a reglas del
validador o a un servicio. Mantén Active Record centrado en la persistencia:
mapeo de tablas, propiedades, relaciones y operaciones de base de datos.

En aplicaciones más complejas, plantéate sustituir el código que depende
mucho de Active Record por repositorios y objetos de dominio. Al principio
supone más trabajo, pero evita arrastrar a la nueva aplicación el
acoplamiento entre formularios y persistencia de Yii 1.1.

Consulta [Trabajar con bases de datos](../start/databases.md),
[Migraciones](../databases/db-migrations.md) y
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## Consultas a la base de datos y migraciones

El código de Yii 1.1 puede usar `CDbCriteria`, `CDbCommand`,
`CActiveDataProvider` y proveedores de datos de `CGridView`. En Yii3, usa
`yiisoft/db` para el acceso a la base de datos y la construcción de
consultas, y `yiisoft/data` / `yiisoft/yii-dataview` para los lectores de
datos y los widgets.

Las migraciones no son compatibles entre Yii 1.1 y Yii3. En una aplicación
existente, crea una línea base a partir del esquema actual y usa las
migraciones de Yii3 para los cambios nuevos.

Consulta [Trabajar con bases de datos](../start/databases.md) y
[Migraciones](../databases/db-migrations.md).

## GridView y widgets de datos

En Yii 1.1, `CGridView` suele configurarse con `CActiveDataProvider`:

```php
$this->widget('zii.widgets.grid.CGridView', [
    'dataProvider' => $dataProvider,
    'columns' => [
        'id',
        'title',
        [
            'class' => 'CButtonColumn',
        ],
    ],
]);
```

Yii3 usa [yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview):

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
        new DataColumn('title'),
        new ActionColumn(),
    );
```

Sustituye el antiguo proveedor de datos por un servicio de consulta que
devuelva un lector de datos. Modela los filtros como reglas del validador y
como parámetros de ruta o de consulta.

Consulta [Usar htmx para recargas
parciales](../../cookbook/using-htmx-for-partial-reloads.md) y la
[documentación de GridView de
yii-dataview](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## Gestión de URL

Yii 1.1:

```php
echo CHtml::link('View', ['post/view', 'id' => $post->id]);
$url = Yii::app()->createUrl('post/view', ['id' => $post->id]);
```

Yii3:

```php
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;

$url = $urlGenerator->generate('post/view', ['id' => $post->getId()]);

echo Html::a('View', $url)->render();
```

Es preferible usar rutas con nombre. Facilitan el diseño y el mantenimiento
de las vistas y de las columnas de acción de GridView.

Consulta [Enrutamiento y generación de URL](../runtime/routing.md).

## Filtros, control de acceso y autenticación

Los filtros de controlador de Yii 1.1 son métodos del controlador o clases
de filtro:

```php
public function filters()
{
    return [
        'accessControl',
    ];
}
```

Yii3 usa middleware y paquetes especializados. Saca de los controladores la
autenticación, la autorización, CSRF, la detección del idioma (locale) y el
análisis del cuerpo de la solicitud, y llévalos a middlewares o servicios.

Consulta [Middleware](../structure/middleware.md),
[Autenticación](../security/authentication.md) y
[Autorización](../security/authorization.md).

## Widgets, helpers y extensiones

Los widgets y helpers de Yii 1.1 suelen depender de clases base específicas
de Yii, como `CWidget` y `CHtml`, y de la autocarga de extensiones. En Yii3:

- sustituye las llamadas a helpers por `yiisoft/html`, `yiisoft/arrays`,
  `yiisoft/strings` o helpers de la aplicación;
- sustituye las extensiones por paquetes de Composer;
- reconstruye los widgets personalizados con `yiisoft/widget` o con
  servicios/plantillas simples;
- sustituye los widgets de jQuery UI y Bootstrap por paquetes frontend
  actuales o por paquetes de widgets de Yii3 cuando existan.

Consulta [Widgets](../views/widget.md).

## Aplicaciones de consola

Los comandos de consola de Yii 1.1 extienden `CConsoleCommand`:

```php
class ReportCommand extends CConsoleCommand
{
    public function actionSend()
    {
    }
}
```

Los comandos de consola de Yii3 son comandos de Symfony Console configurados
como servicios:

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
        return Command::SUCCESS;
    }
}
```

Consulta [Aplicaciones de consola](../tutorial/console-applications.md).

## Internacionalización

Los archivos de mensajes de Yii 1.1 en `protected/messages` normalmente
pueden conservarse a nivel conceptual, pero la configuración cambia. Yii3
usa paquetes de traducción y fuentes de mensajes explícitas. Traslada los
archivos de mensajes a la estructura que espera el paquete de mensajes del
traductor elegido e inyecta los servicios de traducción donde se necesiten.

Consulta [Internacionalización](../tutorial/i18n.md).

## Qué refactorizar antes de reutilizar

Estas refactorizaciones de Yii 1.1 hacen que el comportamiento antiguo sea
más fácil de entender y de reutilizar:

- aísla las consultas a la base de datos de los controladores;
- elimina el acceso directo a `Yii::app()` del código de dominio;
- saca la validación de Active Record cuando describa la entrada de la
  solicitud y no invariantes de la base de datos;
- sustituye las acciones de controlador grandes por servicios;
- documenta todas las rutas y reglas de URL;
- añade pruebas para los flujos que planeas reconstruir primero;
- actualiza la sintaxis de PHP de forma gradual si el entorno de ejecución
  antiguo lo permite.

El objetivo no es que Yii 1.1 se parezca a Yii3. El objetivo es reducir el
acoplamiento oculto antes de que el código cruce la frontera del framework.
