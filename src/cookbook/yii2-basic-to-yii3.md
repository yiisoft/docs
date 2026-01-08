# Replicating Yii2 basic app structure with Yii3

This guide explains how to replicate the [Yii2 basic application template](https://github.com/yiisoft/yii2-app-basic) structure and features using Yii3. If you're migrating from Yii2 or want to implement a similar simple application structure, this recipe is for you.

## Understanding the differences

Yii3 is a complete rewrite of Yii2 with a modern architecture. Key differences include:

- **Package-based**: Yii3 is split into multiple packages instead of a monolithic framework
- **PSR compliance**: Full support for PSR-7, PSR-11, PSR-15, and other PHP-FIG standards
- **Dependency injection**: Built-in DI container with constructor injection
- **Immutability**: Configuration and services are immutable by design
- **Middleware**: Request handling uses PSR-15 middleware instead of filters
- **No static methods**: No global state or static framework methods

## Prerequisites

Before starting, ensure you have:

- PHP 8.1 or higher
- Composer installed
- Basic understanding of Yii3 concepts (see the [official guide](/guide))

## Installation

### Creating a Yii3 project

Instead of `yiisoft/yii2-app-basic`, use the Yii3 application template:

```shell
composer create-project yiisoft/app my-project
cd my-project
```

This creates a project with the following structure:

```
config/             Configuration files
public/             Web root directory
resources/          Non-PHP resources (views, assets)
runtime/            Generated files and logs
src/                Application source code
tests/              Tests
vendor/             Composer dependencies
```

### Starting the development server

```shell
./yii serve
```

Or with Docker:

```shell
docker-compose up -d
```

Access your application at `http://localhost:8080`.

## Directory structure comparison

Here's how Yii2 basic app directories map to Yii3:

| Yii2 Basic | Yii3 | Notes |
|------------|------|-------|
| `web/` | `public/` | Entry point and web assets |
| `views/` | `resources/views/` | View templates |
| `assets/` | `resources/asset/` | Asset bundles |
| `controllers/` | `src/Controller/` | Controller classes |
| `models/` | `src/` | Domain classes (not just "models") |
| `commands/` | `src/Command/` | Console commands |
| `config/` | `config/` | Configuration files |
| `runtime/` | `runtime/` | Generated files and logs |
| `mail/` | `resources/mail/` | Email view templates |

## Replicating Yii2 basic app features

### 1. Entry script

**Yii2** (`web/index.php`):
```php
<?php
require __DIR__ . '/../vendor/autoload.php';
$config = require __DIR__ . '/../config/web.php';
(new yii\web\Application($config))->run();
```

**Yii3** (`public/index.php`):
```php
<?php
declare(strict_types=1);

use Yiisoft\Config\Config;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

require_once dirname(__DIR__) . '/vendor/autoload.php';

(new HttpApplicationRunner(
    rootPath: dirname(__DIR__),
    debug: true,
    checkEvents: false,
    environment: 'dev'
))->run();
```

The Yii3 runner handles configuration loading automatically from the `config/` directory.

### 2. Controllers

**Yii2** style:
```php
<?php
namespace app\controllers;

use yii\web\Controller;

class SiteController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}
```

**Yii3** equivalent (`src/Controller/SiteController.php`):
```php
<?php
declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\DataResponse\DataResponseFactoryInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class SiteController
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private DataResponseFactoryInterface $responseFactory
    ) {
        $this->viewRenderer = $viewRenderer->withController($this);
    }

    public function index(): ResponseInterface
    {
        return $this->viewRenderer->render('index');
    }
}
```

Key differences:
- No base controller class required
- Services are injected via constructor
- Methods return PSR-7 `ResponseInterface`
- No `action` prefix needed

### 3. Routing

**Yii2** uses URL rules in configuration:
```php
'urlManager' => [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
        '' => 'site/index',
        'about' => 'site/about',
    ],
],
```

**Yii3** uses route configuration files (`config/routes.php`):
```php
<?php
declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')
        ->action([SiteController::class, 'index'])
        ->name('site/index'),
    Route::get('/about')
        ->action([SiteController::class, 'about'])
        ->name('site/about'),
];
```

### 4. Views

Views in Yii3 are similar to Yii2 but located in `resources/views/`.

**Yii2** (`views/site/index.php`):
```php
<?php
use yii\helpers\Html;
$this->title = 'Home';
?>
<h1><?= Html::encode($this->title) ?></h1>
```

**Yii3** (`resources/views/site/index.php`):
```php
<?php
declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var string $title
 */

$this->setTitle('Home');
?>
<h1><?= Html::encode($this->getTitle()) ?></h1>
```

### 5. Forms and models

**Yii2** ActiveRecord model:
```php
<?php
namespace app\models;

use yii\db\ActiveRecord;

class User extends ActiveRecord
{
    public static function tableName()
    {
        return 'user';
    }
}
```

**Yii3** separates concerns:

Entity (`src/Entity/User.php`):
```php
<?php
declare(strict_types=1);

namespace App\Entity;

final class User
{
    public function __construct(
        private ?int $id,
        private string $username,
        private string $email
    ) {
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
```

Repository (`src/Repository/UserRepository.php`):
```php
<?php
declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use Cycle\ORM\EntityManagerInterface;
use Cycle\ORM\RepositoryInterface;
use Cycle\ORM\Select;

final class UserRepository
{
    private RepositoryInterface $repository;

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        $this->repository = $this->entityManager
            ->getRepository(User::class);
    }

    public function findAll(): array
    {
        return $this->repository
            ->select()
            ->fetchAll();
    }

    public function findByUsername(string $username): ?User
    {
        return $this->repository
            ->select()
            ->where('username', $username)
            ->fetchOne();
    }

    public function save(User $user): void
    {
        $this->entityManager->persist($user);
        $this->entityManager->run();
    }
}
```

For form handling, use `yiisoft/form`:

```php
<?php
declare(strict_types=1);

namespace App\Form;

use Yiisoft\Form\FormModel;
use Yiisoft\Validator\Rule\Email;
use Yiisoft\Validator\Rule\Required;

final class ContactForm extends FormModel
{
    private string $name = '';
    private string $email = '';
    private string $subject = '';
    private string $body = '';

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getAttributeLabels(): array
    {
        return [
            'name' => 'Name',
            'email' => 'Email',
            'subject' => 'Subject',
            'body' => 'Body',
        ];
    }

    public function getRules(): array
    {
        return [
            'name' => [new Required()],
            'email' => [new Required(), new Email()],
            'subject' => [new Required()],
            'body' => [new Required()],
        ];
    }
}
```

### 6. Layouts

**Yii2** (`views/layouts/main.php`):
```php
<?php
use yii\helpers\Html;
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html>
<head>
    <?php $this->head() ?>
    <title><?= Html::encode($this->title) ?></title>
</head>
<body>
<?php $this->beginBody() ?>
    <?= $content ?>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

**Yii3** (`resources/views/layout/main.php`):
```php
<?php
declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 * @var \Yiisoft\Assets\AssetManager $assetManager
 * @var string $content
 */
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= Html::encode($this->getTitle()) ?></title>
    <?php $this->head() ?>
</head>
<body>
<?php $this->beginBody() ?>
<div class="container">
    <?= $content ?>
</div>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

### 7. Console commands

**Yii2** (`commands/HelloController.php`):
```php
<?php
namespace app\commands;

use yii\console\Controller;

class HelloController extends Controller
{
    public function actionIndex($message = 'hello world')
    {
        echo $message . "\n";
    }
}
```

**Yii3** (`src/Command/HelloCommand.php`):
```php
<?php
declare(strict_types=1);

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

final class HelloCommand extends Command
{
    protected static $defaultName = 'hello';

    protected function configure(): void
    {
        $this
            ->setDescription('Says hello')
            ->addArgument(
                'message',
                InputArgument::OPTIONAL,
                'Message to display',
                'hello world'
            );
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $message = $input->getArgument('message');
        $output->writeln($message);

        return Command::SUCCESS;
    }
}
```

Register the command in `config/console/commands.php`:
```php
<?php
declare(strict_types=1);

return [
    'hello' => \App\Command\HelloCommand::class,
];
```

Run with: `./yii hello "Hello Yii3"`

### 8. Configuration

**Yii2** uses a single configuration file with components:
```php
<?php
return [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=yii2basic',
            'username' => 'root',
            'password' => '',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
        ],
    ],
];
```

**Yii3** uses multiple configuration files organized by purpose:

`config/common/params.php` - Parameters:
```php
<?php
declare(strict_types=1);

return [
    'yiisoft/db-mysql' => [
        'dsn' => 'mysql:host=localhost;dbname=yii3app',
        'username' => 'root',
        'password' => '',
    ],
    'app' => [
        'name' => 'My Application',
    ],
];
```

`config/common/di.php` - Service definitions:
```php
<?php
declare(strict_types=1);

use Psr\Container\ContainerInterface;
use Cycle\Database\Config\DatabaseConfig;
use Cycle\Database\DatabaseManager;

return [
    DatabaseManager::class => static function (ContainerInterface $container) {
        $params = $container->get('params');
        $config = new DatabaseConfig([
            'default' => 'default',
            'databases' => [
                'default' => ['connection' => 'mysql'],
            ],
            'connections' => [
                'mysql' => $params['yiisoft/db-mysql'],
            ],
        ]);
        return new DatabaseManager($config);
    },
];
```

### 9. Database access

**Yii2** uses ActiveRecord:
```php
<?php
use app\models\User;

$users = User::find()->all();
$user = User::findOne(['username' => 'admin']);
$user->email = 'newemail@example.com';
$user->save();
```

**Yii3** uses Cycle ORM or database abstraction:

With Cycle ORM:
```php
<?php
declare(strict_types=1);

use App\Repository\UserRepository;

final class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {
    }

    public function getAllUsers(): array
    {
        return $this->userRepository->findAll();
    }

    public function updateEmail(string $username, string $email): void
    {
        $user = $this->userRepository->findByUsername($username);
        if ($user !== null) {
            $user = new User(
                $user->getId(),
                $user->getUsername(),
                $email
            );
            $this->userRepository->save($user);
        }
    }
}
```

With database abstraction:
```php
<?php
declare(strict_types=1);

use Yiisoft\Db\Connection\ConnectionInterface;

final class UserService
{
    public function __construct(
        private ConnectionInterface $db
    ) {
    }

    public function getAllUsers(): array
    {
        return $this->db
            ->createCommand('SELECT * FROM user')
            ->queryAll();
    }
}
```

### 10. Authentication and authorization

**Yii2** uses built-in user component:
```php
<?php
if (Yii::$app->user->isGuest) {
    // User is not logged in
}
Yii::$app->user->login($user);
```

**Yii3** uses `yiisoft/user` package:

Install the package:
```shell
composer require yiisoft/user
```

Implementation:
```php
<?php
declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\User\CurrentUser;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class ProfileController
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private CurrentUser $currentUser
    ) {
        $this->viewRenderer = $viewRenderer->withController($this);
    }

    public function index(): ResponseInterface
    {
        if ($this->currentUser->isGuest()) {
            // Redirect to login
        }

        return $this->viewRenderer->render('profile', [
            'user' => $this->currentUser->getIdentity(),
        ]);
    }
}
```

### 11. Session and cookies

**Yii2** accesses session via component:
```php
<?php
$session = Yii::$app->session;
$session->set('key', 'value');
$value = $session->get('key');
```

**Yii3** uses PSR-7 server request:
```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Session\SessionInterface;

final class SessionController
{
    public function __construct(
        private SessionInterface $session
    ) {
    }

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $this->session->set('key', 'value');
        $value = $this->session->get('key');

        // ...
    }
}
```

For cookies:
```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Cookies\Cookie;
use Yiisoft\Cookies\CookieCollection;

final class CookieController
{
    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $cookies = CookieCollection::fromArray(
            $request->getCookieParams()
        );
        $value = $cookies->get('name')?->getValue();

        $response = // ... create response
        return $response->withAddedHeader(
            'Set-Cookie',
            (string) (new Cookie('name', 'value'))
        );
    }
}
```

### 12. Error handling

**Yii2** uses error handler component:
```php
<?php
'components' => [
    'errorHandler' => [
        'errorAction' => 'site/error',
    ],
],
```

**Yii3** uses middleware:
```php
<?php
declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Yiisoft\ErrorHandler\Middleware\ErrorCatcher;

// ErrorCatcher is already included in the default middleware stack
// in config/web/application.php

// For custom error pages, create a handler:

use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class CustomErrorHandler
{
    public function __construct(
        private ViewRenderer $viewRenderer
    ) {
    }

    public function handle(\Throwable $throwable): ResponseInterface
    {
        return $this->viewRenderer->render('error', [
            'exception' => $throwable,
        ]);
    }
}
```

### 13. Assets

**Yii2** asset bundles:
```php
<?php
namespace app\assets;

use yii\web\AssetBundle;

class AppAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = ['css/site.css'];
    public $js = [];
}
```

**Yii3** asset bundles (`src/Asset/AppAsset.php`):
```php
<?php
declare(strict_types=1);

namespace App\Asset;

use Yiisoft\Assets\AssetBundle;

final class AppAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';

    public array $css = [
        'css/site.css',
    ];

    public array $js = [
        'js/app.js',
    ];
}
```

Register in a view:
```php
<?php
use App\Asset\AppAsset;

$assetManager->register(AppAsset::class);
?>
```

## Migration checklist

When migrating from Yii2 basic app to Yii3:

- [ ] Set up a new Yii3 project with `yiisoft/app`
- [ ] Map directory structure from Yii2 to Yii3
- [ ] Convert controllers to use dependency injection
- [ ] Update routing from URL rules to route configuration
- [ ] Move views to `resources/views/` directory
- [ ] Separate data access logic into repositories
- [ ] Convert models to entities and form models
- [ ] Update console commands to use Symfony Console
- [ ] Reorganize configuration into multiple files
- [ ] Replace ActiveRecord with Cycle ORM or database abstraction
- [ ] Update authentication to use `yiisoft/user` package
- [ ] Convert session/cookie handling to PSR-7
- [ ] Update error handling to use middleware
- [ ] Convert asset bundles to Yii3 format
- [ ] Test all functionality thoroughly

## Key takeaways

Yii3 introduces several modern concepts:

1. **Explicit dependencies**: Use constructor injection instead of accessing global components
2. **Immutability**: Configuration and objects are immutable by design
3. **PSR compliance**: Follow PHP-FIG standards for interoperability
4. **Separation of concerns**: Split models into entities, repositories, and form models
5. **Middleware-based**: Use PSR-15 middleware for request processing
6. **Type safety**: Full type declarations for better IDE support and error detection

While Yii2 basic app was simpler for beginners, Yii3's architecture provides better scalability, testability, and maintainability for modern applications.

## See also

- [Yii3 official guide](/guide)
- [Upgrading from Yii2](/guide/intro/upgrade-from-v2)
- [Application structure](/guide/structure/overview)
- [Dependency injection](/guide/concept/di-container)
- [yiisoft/app template](https://github.com/yiisoft/app)
