# Aggiornamento dalla versione 2.0

> Se non hai mai utilizzato Yii 2.0, puoi saltare questa sezione e passare direttamente alla sezione “[Per iniziare](../start/prerequisites.md)”.
>

Yii3 keeps many Yii ideas, but it is not a drop-in replacement for Yii
2.0. It uses PHP 8 features, PSR interfaces, dependency injection, explicit
package composition, and a different application template. Use your Yii 2.0
experience to design a new Yii3 application deliberately instead of trying
to reproduce the old application structure.

For source applications, compare against:

- [yiisoft/yii2-app-basic](https://github.com/yiisoft/yii2-app-basic)
- [yiisoft/yii2-app-advanced](https://github.com/yiisoft/yii2-app-advanced)

For the target structure, compare against:

- [yiisoft/app](https://github.com/yiisoft/app)
- [Yii3 guide](../index.md)

Before starting, [check maintenance policy and end-of-life dates for Yii
2.0](https://www.yiiframework.com/release-cycle).  Keeping a mature Yii 2.0
application on Yii 2.0 can be a valid choice. A Yii3 project is most useful
when you want the new package ecosystem, stricter typing, PSR middleware,
and a more explicit architecture.

## Recommended approach

Think of the work as building a Yii3 application that is informed by the old
one. The old project tells you which routes, forms, database tables,
business rules, and user workflows matter. The Yii3 project should decide
again where these responsibilities belong.

Build it in vertical slices:

1. Create a new Yii3 application with `yiisoft/app`.
2. Configure Composer autoloading and add only the code needed for the slice
   you are building.
3. Define configuration and routes before writing actions.
4. Build one request flow at a time: route, action, input model, service,
   persistence, view, assets, tests.
5. Keep the Yii 2.0 application running until each flow is verified in Yii3.

Avoid moving the whole directory tree first. Yii3's defaults are
intentionally different, and a mechanical copy tends to preserve Yii 2.0
service-locator assumptions. Prefer small, reviewed decisions over carrying
old structure forward because it is familiar.

## Prepare the Yii 2.0 application

Useful preparation can happen before the Yii3 application is ready. These
refactorings improve the Yii 2.0 project itself and make the later rewrite
less dependent on hidden framework state:

- Replace `Yii::$app` access in reusable code with constructor arguments
  where practical. If a full dependency injection refactoring is too large,
  keep `Yii::$app` calls near controllers and widgets, then pass values and
  services to lower-level code explicitly.
- Introduce repositories or query services for database reads that are
  currently scattered across controllers, views, widgets, and Active Record
  methods. Yii3 does not require Active Record for persistence, so a
  repository boundary gives you a natural place to change the implementation
  later.
- Separate business rules from framework infrastructure. Domain code that
  does not extend Yii classes, read global application state, or render
  views is much easier to reuse or rewrite.
- Move reusable behavior into Yii 2.0 components or services instead of
  keeping it inside large controllers and Active Record classes. Yii3
  services are configured and injected differently, but the responsibility
  boundary is similar.
- Add tests around routes and workflows you plan to rebuild first. They
  become the executable specification for the Yii3 slice.

For example, instead of reading post archive data directly from several
controllers or widgets, create a small service that describes the
application need:

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

The Yii3 implementation may still use Active Record, or it may use
`yiisoft/db` queries. The important point is that controllers and views no
longer need to know that detail.

## Things to learn before starting

Some Yii3 application-template choices are worth learning before you start
moving features:

- [Docker](https://www.docker.com/get-started/). The default Yii3
  application template includes Docker configuration.  Using it gives each
  application its own repeatable environment and reduces differences between
  local development and production.
- [Environment
  variables](https://en.wikipedia.org/wiki/Environment_variable). Yii3
  templates commonly use them for environment-specific settings and secrets,
  especially in Docker-based deployments. This follows the same idea as
  [12-factor app configuration](https://12factor.net/config).
- [Actions](../structure/action.md). Yii3 does not require controller
  inheritance. A route can point to any callable, and the default template
  uses invokable action classes.
- [Application structure](../structure/overview.md). Yii3's default
  structure is different from Yii 2.0. The structure is flexible, but start
  with the Yii3 template and change it only when the application needs it.

## Requisiti PHP

Yii3 application templates require PHP 8.2 or above. As a result,
application code can use language features that were not common in Yii 2.0
applications:

- [Dichiarazioni dei
  tipi](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Dichiarazioni del tipo di
  ritorno](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Visibilità delle costanti di
  classe](https://www.php.net/manual/en/language.oop5.constants.php)
- [Argomenti
  denominati](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)
- [Classi
  anonime](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generatori](https://www.php.net/manual/en/language.generators.php)
- [Funzioni
  variadiche](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)
- [Proprietà in sola
  lettura](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.readonly-properties)
- [Classi in sola
  lettura](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.readonly)
- [Promozione delle proprietà del
  costruttore](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion)
- [Attributi](https://www.php.net/manual/en/language.attributes.php)

Run static analysis and tests on Yii 2.0 before reusing code in Yii3. Code
with explicit types, small services, and few implicit `Yii::$app`
dependencies is easier to understand and easier to place in the new
application.

## Project structure

Yii 2.0 applications commonly keep framework roles in top-level directories:

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

The Yii 2.0 advanced template splits the same roles by application:

```text
backend/
common/
console/
frontend/
```

The current Yii3 application template is organized around source code,
configuration, public files, and runtime files:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Typical mappings to consider are:

| Yii 2.0 basic | Yii 2.0 advanced | Yii3 |
|---------------|------------------|------|
| `controllers/` | `frontend/controllers/`, `backend/controllers/` | `src/Web/*/Action.php` or controller-like classes |
| `models/` | `common/models/`, app-specific models | `src/Domain`, `src/Shared`, `src/Web/*`, or `src/Db` by responsibility |
| `views/` | `frontend/views/`, `backend/views/` | templates near the feature, for example `src/Web/HomePage/template.php` |
| `views/layouts/` | app layout directories | layout classes/templates, for example `src/Web/Shared/Layout/Main` |
| `assets/` | app asset bundles | `assets/` for source files and `src/Web/.../*Asset.php` for bundles |
| `web/` | `frontend/web/`, `backend/web/` | `public/` |
| `commands/` | `console/controllers/` | `src/Console/*Command.php` |
| `config/*.php` | app and common config files | `config/common`, `config/web`, `config/console`, `config/environments` |

There is no single required layout. The important change is that Yii3
applications should group code by responsibility and make dependencies
explicit. If you are coming from the advanced template, treat `frontend` and
`backend` as separate web contexts. Shared domain code can live in
`src/Shared` or in application-specific packages.

## Composer and autoloading

Yii 2.0 applications usually require `vendor/autoload.php` and
`vendor/yiisoft/yii2/Yii.php` in `web/index.php`.  Yii3 applications require
only Composer's autoloader and application bootstrap code.

Configure your application namespace with PSR-4:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Then rebuild Composer autoload files:

```shell
composer dump-autoload
```

Install Yii3 packages intentionally. Yii3 is split into focused packages, so
features such as database access, forms, validation, assets, data widgets,
authentication, and caching are separate Composer dependencies.

## Configuration and services

In Yii 2.0, many services are configured as application components and
accessed through the service locator:

```php
$cache = Yii::$app->cache;
$db = Yii::$app->db;
$url = Yii::$app->urlManager->createUrl(['post/view', 'id' => $id]);
```

In Yii3, services are configured for the container and injected where they
are needed:

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

Move configuration in groups:

- aliases to `config/common/aliases.php`;
- route definitions to `config/common/routes.php`;
- shared service definitions to `config/common/di/*.php`;
- web-only service definitions to `config/web/di/*.php`;
- console parameters and commands to `config/console/*.php`;
- shared parameters to `config/common/params.php`;
- environment overrides to `config/environments`.

The default template's `di-console` group reuses shared definitions from
`config/common/di/*.php`. If you need console-only container definitions,
add the corresponding files to the `di-console` group in
`config/configuration.php` and rebuild the merge plan.

See [Configuration](../concept/configuration.md),
[Aliases](../concept/aliases.md), and [Dependency injection
container](../concept/di-container.md).

## Entry script and bootstrap

A Yii 2.0 basic entry script commonly creates the application directly:

```php
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/../config/web.php';

(new yii\web\Application($config))->run();
```

In Yii3, use the application template entry script as the source of
truth. It loads Composer and bootstraps the configured application
runner. Avoid recreating the old `yii\web\Application` pattern in
`public/index.php`; put configuration in config files and dependencies in
the container.

See [Entry scripts](../structure/entry-script.md) and [Application
workflow](../start/workflow.md).

## Controllers, actions, and routing

Yii 2.0 routes usually point to controller action methods:

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

Yii3 does not require controller base classes. The current application
template uses invokable action classes:

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

Routes are explicit:

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

When redesigning a controller flow, list all Yii 2.0 actions and create
named routes for the flows you still need.  Then implement each flow as an
invokable class or a controller-like service. Constructor injection replaces
calls to `Yii::$app` and controller properties.

See [Actions](../structure/action.md),
[Middleware](../structure/middleware.md), and [Routing and URL
generation](../runtime/routing.md).

## Requests, responses, sessions, and cookies

Yii 2.0 actions often read request data and write response data through
application components:

```php
$id = Yii::$app->request->get('id');
Yii::$app->session->setFlash('success', 'Saved.');

return $this->redirect(['post/view', 'id' => $id]);
```

Yii3 uses PSR-7 request and response objects and injectable services:

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

Design request handling early because it affects forms, filters, REST
endpoints, redirects, and tests.

See [Request](../runtime/request.md), [Response](../runtime/response.md),
[Sessions](../runtime/sessions.md), and [Cookies](../runtime/cookies.md).

## Views, layouts, assets, and URLs

In Yii 2.0, controller rendering finds files under `views/{controller}` and
layouts under `views/layouts`:

```php
return $this->render('view', [
    'model' => $model,
]);
```

In Yii3, the template path is explicit in the action:

```php
return $this->viewRenderer->render(__DIR__ . '/view', [
    'post' => $post,
]);
```

A Yii3 template receives a `Yiisoft\View\WebView` instance as `$this`:

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

Asset bundles move from `yii\web\AssetBundle` to
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

Register assets in a layout or view via the asset manager:

```php
$assetManager->register(MainAsset::class);

$this->addCssFiles($assetManager->getCssFiles());
$this->addJsFiles($assetManager->getJsFiles());
```

Replace `yii\helpers\Url` and `Yii::$app->urlManager` usage with named routes and
`Yiisoft\Router\UrlGeneratorInterface`:

```php
$url = $urlGenerator->generate('post/view', ['id' => $post->getId()]);
```

See [View](../views/view.md), [Assets](../views/asset.md), [Scripts, styles
and metatags](../views/script-style-meta.md), and [Template
engines](../views/template-engines.md).

## Forms and validation

Yii 2.0 frequently combines form data, labels, validation, and sometimes
persistence in a `yii\base\Model` or `yii\db\ActiveRecord` class:

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

Yii3 separates these concerns. Use `yiisoft/form-model` for form data and
metadata, and `yiisoft/validator` for rules:

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

For form rendering, replace `yii\widgets\ActiveForm` with `yiisoft/form`
fields and form model integration. For input hydration, prefer the
form-model and hydrator packages instead of mass-assigning arbitrary request
data to persistence objects.

See [Working with forms](../start/forms.md), [Validating
input](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form), and
[yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record and persistence

There are two common Yii3 choices for code that used Yii 2.0 Active Record
classes.

The first path is architectural: move business logic to services and domain
objects, then use repositories for persistence. This is recommended when the
Yii 2.0 model contains validation, form scenarios, authorization checks,
mailing, file uploads, and database access in the same class.

The second path is incremental: represent the database model with
[yiisoft/active-record](https://github.com/yiisoft/active-record). This is
closer to Yii 2.0 and can be significantly faster when your Active Record
classes mostly describe tables and relations.

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

Yii3 Active Record:

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

Do not move Yii 2.0 `rules()` directly into the Active Record class. In
Yii3, validation belongs to validator rules, form models, command objects,
or services:

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

Then copy validated data into the record or pass it to an application
service:

```php
$post = new Post();
$post->setTitle($input->title);
$post->save();
```

When deciding what to reuse, check each Active Record method:

- table mapping and relations can usually move to `yiisoft/active-record`;
- validation should move to `yiisoft/validator`;
- form labels and hints should move to `yiisoft/form-model`;
- search models should become query/data-reader services;
- business workflows should become services;
- events should use PSR-14 events or package-specific events;
- direct `Yii::$app->db` usage should become injected database dependencies.

Yii 2.0 migrations and Yii3 `yiisoft/db-migration` migrations are not
compatible. Start a new migration history or create structure dumps for the
current schema, then use Yii3 migrations for future schema changes.

See [Working with databases](../start/databases.md),
[Migrations](../databases/db-migrations.md), and
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## GridView and data widgets

Yii 2.0 `GridView` is commonly used with `ActiveDataProvider`:

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

Yii3 uses
[yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview). It renders
data from a data reader and uses fluent widget configuration:

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

For sorting, pagination, filtering, and action URLs, wire the widget to Yii
Router:

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

A Yii 2.0 search model usually becomes a query service that:

1. reads filter and sort parameters from the request;
2. validates them with `yiisoft/validator`;
3. builds a database query or repository query;
4. exposes a data reader to GridView.

See [Using htmx for partial
reloads](../../cookbook/using-htmx-for-partial-reloads.md) for a complete
Yii3 GridView workflow and [yii-dataview GridView
docs](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## Filters, middleware, and access control

Yii 2.0 controller filters and behaviors usually look like this:

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

In Yii3, request processing is middleware-based. Move cross-cutting concerns
such as authentication, authorization, body parsing, locale negotiation,
CSRF checks, and error handling to middleware or dedicated services. Keep
actions focused on the request flow they implement.

See [Middleware](../structure/middleware.md),
[Authentication](../security/authentication.md), and
[Authorization](../security/authorization.md).

## Console commands

Yii 2.0 console commands extend `yii\console\Controller`:

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

Yii3 console commands are services in `src/Console`:

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

Move command dependencies to constructor injection and register commands in
console configuration.

See [Console applications](../tutorial/console-applications.md).

## API REST

Yii 2.0 REST controllers, serializers, and response formatters do not move
directly to Yii3. Start from PSR-7 responses and explicit routing. Build one
resource at a time:

1. define routes for collection and item operations;
2. inject request, persistence, serializer, and response factory
   dependencies;
3. validate input with `yiisoft/validator`;
4. return JSON responses through Yii3 response helpers or PSR-7 factories;
5. move authentication and rate limiting to middleware.

See [Response](../runtime/response.md),
[Authentication](../security/authentication.md), and
[Authorization](../security/authorization.md).

## Testing

Do not postpone tests until the whole Yii3 application is done. For each new
request flow, add:

- unit tests for services and validators;
- functional tests for actions and middleware;
- end-to-end tests for critical browser flows;
- static analysis for stricter type checks.

Yii3 code is more explicit, so tests should assert services directly instead
of constructing large application component arrays.

See [Testing overview](../testing/overview.md), [Unit
tests](../testing/unit.md), [Functional tests](../testing/functional.md),
and [End-to-end tests](../testing/end-to-end.md).

## Refactoring Yii 2.0 code before reusing it

These changes are useful even if the old application stays on Yii 2.0 for a
while:

- Replace `Yii::$app` access in domain code with constructor arguments.
- Move queries out of controllers and views into repositories or query
  services.
- Move business workflows out of Active Record classes.
- Separate form models from persistence models.
- Add return types and parameter types.
- Replace route arrays scattered in views with named route constants or
  helper methods.
- Add tests around each flow before rebuilding it in Yii3.

The less framework state your Yii 2.0 code assumes, the easier it is to
understand what should be reused and what should be redesigned for Yii3.
