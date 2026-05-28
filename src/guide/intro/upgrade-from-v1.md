# Upgrading from Version 1.1

> If you haven't used Yii 1.1, you can skip this section and get directly to
> "[getting started](../start/prerequisites.md)" section.

Yii3 is not an incremental upgrade from Yii 1.1. Yii 2.0 was a full rewrite, and Yii3 changes the architecture again:
Composer packages, namespaces, PHP 8, PSR interfaces, dependency injection, explicit routes, middleware, and separate
packages for features that were built into the framework in Yii 1.1.

Treat this as building a new Yii3 application with the benefit of Yii 1.1 experience. Reuse the domain knowledge,
database schema, user workflows, and selected code after refactoring. Do not try to reproduce the Yii 1.1 application
structure in Yii3. A direct search-and-replace conversion is not realistic.

For additional background, read the Yii 2.0 guide section
[Upgrading from Version 1.1](https://www.yiiframework.com/doc/guide/2.0/en/intro-upgrade-from-v1). It explains the
first major break from Yii 1.1: Composer, namespaces, object configuration, view changes, controller return values,
widgets, assets, helpers, forms, query builder, Active Record, and URL management. Yii3 builds on many of those changes
and makes dependencies more explicit.

## Recommended approach

Choose one of these paths:

- Build a new Yii3 application directly when the Yii 1.1 application is small or you are already rewriting request
  flows.
- Move Yii 1.1 concepts to Yii 2.0 first when the team needs a smaller conceptual step.
- Keep Yii 1.1 running and rebuild critical flows in Yii3 one by one.

For most long-lived applications, the third option is the least risky. Create a Yii3 application, connect it to the
same database, and build vertical slices: route, action, input validation, persistence, view, assets, and tests.
Each slice should be idiomatic Yii3, even when it is based on behavior from the Yii 1.1 application.

## PHP, Composer, and namespaces

Yii 1.1 applications commonly rely on PHP 5-era code, class prefixes such as `CController`, and autoloading by class
name. Yii3 applications require modern PHP and Composer autoloading.

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

Run:

```shell
composer dump-autoload
```

When reusing a class, give it a namespace, add strict types, replace Yii 1.1 base classes, and inject dependencies
instead of reading them from global application state. If these changes make the class awkward, use the old class as a
specification and write a new Yii3 class instead.

## Project structure

A Yii 1.1 application often uses:

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

The current Yii3 application template uses:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Typical mappings to consider are:

| Yii 1.1 | Yii3 |
|---------|------|
| `protected/controllers` | `src/Web/*/Action.php` or controller-like services |
| `protected/models` | `src/Domain`, `src/Shared`, `src/Db`, or form models by responsibility |
| `protected/views` | templates near the feature, for example `src/Web/HomePage/template.php` |
| `protected/views/layouts` | layout templates and assets under `src/Web/Shared/Layout` |
| `protected/components` | services configured in the dependency injection container |
| `protected/extensions` | Composer packages or local packages |
| `protected/commands` | `src/Console/*Command.php` |
| `protected/messages` | translator message files |
| `protected/config` | `config/common`, `config/web`, `config/console`, `config/environments` |
| `webroot` | `public` |

Do not recreate `protected` in Yii3. Put PHP source under `src`, public files under `public`, generated/runtime files
under `runtime`, and configuration under `config`.

## Configuration and application components

Yii 1.1 configuration is usually one large array:

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

In Yii3, configuration is split by purpose and services are wired through the container:

- aliases in `config/common/aliases.php`;
- parameters in `config/common/params.php` and environment files;
- shared service definitions in `config/common/di/*.php`;
- web-only service definitions in `config/web/di/*.php`;
- routes in `config/common/routes.php`;
- console commands in `config/console`.

The default template's console DI group reuses shared definitions from `config/common/di/*.php`. If you need
console-only container definitions, add files for them to the `di-console` group in `config/configuration.php` and
rebuild the merge plan.

Replace `Yii::app()->componentName` with constructor-injected services:

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

See [Configuration](../concept/configuration.md), [Aliases](../concept/aliases.md), and
[Dependency injection container](../concept/di-container.md).

## Entry script

Yii 1.1 entry scripts commonly load `yii.php` and create a web application:

```php
require_once __DIR__ . '/../framework/yii.php';

Yii::createWebApplication($config)->run();
```

Yii3 entry scripts load Composer and bootstrap the configured application. Start with the `public/index.php` file from
`yiisoft/app` and adjust configuration instead of building the application manually in the entry script.

See [Entry scripts](../structure/entry-script.md) and [Application workflow](../start/workflow.md).

## Controllers, actions, and routes

Yii 1.1 controllers extend `CController`, and actions are methods named `actionName`:

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

Yii3 does not require controller inheritance. The current template uses invokable action classes:

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

The route is explicit:

```php
use App\Web\Post\View;
use Yiisoft\Router\Route;

return [
    Route::get('/post/{id:\d+}')
        ->action(View\Action::class)
        ->name('post/view'),
];
```

Define routes before action bodies. It gives you a checklist of request flows you decided to keep in the Yii3
application.

See [Actions](../structure/action.md), [Middleware](../structure/middleware.md), and
[Routing and URL generation](../runtime/routing.md).

## Requests, responses, redirects, sessions, and cookies

Yii 1.1 code often reads and writes through `Yii::app()`:

```php
$id = Yii::app()->request->getParam('id');
Yii::app()->user->setFlash('success', 'Saved.');
$this->redirect(['post/view', 'id' => $id]);
```

Yii3 uses PSR-7 request and response objects and injectable services. Request input is available from
`ServerRequestInterface`; redirects, sessions, cookies, and responses are explicit dependencies.

See [Request](../runtime/request.md), [Response](../runtime/response.md), [Sessions](../runtime/sessions.md), and
[Cookies](../runtime/cookies.md).

## Views and layouts

Yii 1.1 views use `$this` as the controller or widget context. Layouts and partials are rendered through controller
methods:

```php
<?php
/* @var $this PostController */
/* @var $post Post */
?>

<h1><?php echo CHtml::encode($post->title); ?></h1>
```

In Yii3 templates, `$this` is a `Yiisoft\View\WebView` instance:

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

Move controller-specific view logic to the action or to a presenter. Pass only the data a template needs.

See [View](../views/view.md), [View injections](../views/view-injections.md), and
[Template engines](../views/template-engines.md).

## Assets and client scripts

Yii 1.1 applications often use `CClientScript`, themes, and extension-specific asset publishing:

```php
Yii::app()->clientScript->registerCssFile('/css/site.css');
Yii::app()->clientScript->registerScriptFile('/js/site.js');
```

Yii3 uses asset bundles from `yiisoft/assets`:

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

Register bundles through the asset manager in layouts or views.

See [Assets](../views/asset.md) and [Scripts, styles and metatags](../views/script-style-meta.md).

## Models, forms, and validation

Yii 1.1 has `CModel`, `CFormModel`, and `CActiveRecord`. It is common for one model class to contain input data,
labels, validation rules, database persistence, and business logic.

Yii3 works better when these responsibilities are split:

- form data and labels: `yiisoft/form-model`;
- validation rules: `yiisoft/validator`;
- form rendering: `yiisoft/form`;
- persistence: repositories, `yiisoft/db`, or `yiisoft/active-record`;
- business workflows: application services.

Yii 1.1 form model:

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

Yii3 form model:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Email;
use Yiisoft\Validator\Rule\Required;
use Yiisoft\Validator\RulesProviderInterface;

final class ContactForm extends FormModel implements RulesProviderInterface
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
    ) {
    }

    public function getRules(): array
    {
        return [
            'name' => [new Required()],
            'email' => [new Required(), new Email()],
        ];
    }
}
```

See [Working with forms](../start/forms.md), [Validating input](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form), and [yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record

Yii 1.1 Active Record uses `CActiveRecord::model()` and dynamic attributes:

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

The incremental Yii3 option is [yiisoft/active-record](https://github.com/yiisoft/active-record):

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

Move Yii 1.1 `rules()` to a form model, validator rules, or a service. Keep Active Record focused on persistence:
table mapping, properties, relations, and database operations.

For more complex applications, consider replacing Active Record-heavy code with repositories and domain objects. That
is more work initially, but it avoids carrying Yii 1.1 form and persistence coupling into the new application.

See [Working with databases](../start/databases.md), [Migrations](../databases/db-migrations.md), and
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## Database queries and migrations

Yii 1.1 code may use `CDbCriteria`, `CDbCommand`, `CActiveDataProvider`, and `CGridView` data providers. In Yii3,
use `yiisoft/db` for database access and query building, and `yiisoft/data` / `yiisoft/yii-dataview` for data readers
and widgets.

Migrations are not compatible across Yii 1.1, Yii 2.0, and Yii3. For an existing application, create a baseline from
the current schema and use Yii3 migrations for new changes.

See [Working with databases](../start/databases.md) and [Migrations](../databases/db-migrations.md).

## GridView and data widgets

Yii 1.1 `CGridView` is often configured with `CActiveDataProvider`:

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

Yii3 uses [yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview):

```php
use Yiisoft\Data\Reader\ReadableDataInterface;
use Yiisoft\Yii\DataView\GridView\Column\ActionColumn;
use Yiisoft\Yii\DataView\GridView\Column\Base\DataContext;
use Yiisoft\Yii\DataView\GridView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\GridView;

/**
 * @var ReadableDataInterface $dataReader
 */

echo GridView::widget()
    ->dataReader($dataReader)
    ->columns(
        new DataColumn(property: 'id'),
        new DataColumn(property: 'title'),
        new ActionColumn(
            urlCreator: static fn(string $action, DataContext $context): string => "/post/$action/" . $context->key,
        ),
    );
```

Replace the old data provider with a query service that returns a data reader. Model filters as validator rules and
route or query parameters.

See [Using htmx for partial reloads](../../cookbook/using-htmx-for-partial-reloads.md) and
[yii-dataview GridView docs](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## URL management

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

Prefer named routes. They make views and GridView action columns easier to design and maintain.

See [Routing and URL generation](../runtime/routing.md).

## Filters, access control, and authentication

Yii 1.1 controller filters are controller methods or filter classes:

```php
public function filters()
{
    return [
        'accessControl',
    ];
}
```

Yii3 uses middleware and focused packages. Move authentication, authorization, CSRF, locale detection, and request
body parsing out of controllers and into middleware or services.

See [Middleware](../structure/middleware.md), [Authentication](../security/authentication.md), and
[Authorization](../security/authorization.md).

## Widgets, helpers, and extensions

Yii 1.1 widgets and helpers usually depend on Yii-specific base classes such as `CWidget`, `CHtml`, and extension
autoloading. In Yii3:

- replace helper calls with `yiisoft/html`, `yiisoft/arrays`, `yiisoft/strings`, or application helpers;
- replace extensions with Composer packages;
- rebuild custom widgets with `yiisoft/widget` or plain services/templates;
- replace jQuery UI and Bootstrap widgets with current frontend packages or Yii3 widget packages where available.

See [Widgets](../views/widget.md).

## Console applications

Yii 1.1 console commands extend `CConsoleCommand`:

```php
class ReportCommand extends CConsoleCommand
{
    public function actionSend()
    {
    }
}
```

Yii3 console commands are Symfony Console commands configured as services:

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

See [Console applications](../tutorial/console-applications.md).

## Internationalization

Yii 1.1 message files under `protected/messages` can usually be kept conceptually, but configuration changes. Yii3 uses
translator packages and explicit message sources. Move message files into the structure expected by the selected
translator message package and inject translation services where needed.

See [Internationalization](../tutorial/i18n.md).

## What to refactor before reusing

These Yii 1.1 refactorings make the old behavior easier to understand and reuse:

- isolate database queries from controllers;
- remove direct `Yii::app()` access from domain code;
- move validation out of Active Record when it describes request input rather than database invariants;
- replace large controller actions with services;
- document all routes and URL rules;
- add tests around the flows you plan to rebuild first;
- upgrade PHP syntax gradually if the old runtime allows it.

The goal is not to make Yii 1.1 look like Yii3. The goal is to reduce hidden coupling before the code crosses the
framework boundary.
