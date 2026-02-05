# Implementing Yii2 basic app structure with Yii3

This guide shows how to implement a [Yii2 basic application template](https://github.com/yiisoft/yii2-app-basic) style structure in Yii3. This approach is useful if you prefer the familiar, simple organization of Yii2 basic app: controllers in a `Controller` directory, models in a `Model` directory, and so on.

> [!NOTE]
> This recipe demonstrates one way to structure a Yii3 application. Yii3's flexible architecture supports many organizational patterns. For alternative approaches, see [Structuring code by use-case with vertical slices](/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices.md).

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

## Target directory structure

We'll organize the Yii3 application similar to Yii2 basic app:

```
config/                  Configuration files
public/                  Web root (entry point, assets)
resources/
  ├── asset/            Asset bundles
  ├── mail/             Email templates
  └── views/            View templates
      └── layout/       Layout files
runtime/                 Generated files and logs
src/
  ├── Command/          Console commands
  ├── Controller/       Web controllers
  ├── Form/             Form models
  └── Model/            Business logic and data models
tests/                   Tests
vendor/                  Dependencies
```

## Implementation guide

### 1. Entry script

The entry script in `public/index.php` bootstraps the application:

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

The runner automatically loads configuration from the `config/` directory.

### 2. Controllers

Controllers handle HTTP requests and live in `src/Controller/`:

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

    public function about(): ResponseInterface
    {
        return $this->viewRenderer->render('about');
    }

    public function contact(): ResponseInterface
    {
        return $this->viewRenderer->render('contact');
    }
}
```

Controllers are plain PHP classes that receive dependencies through constructor injection.

### 3. Routing

Define routes in `config/routes.php`:

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
    Route::methods(['GET', 'POST'], '/contact')
        ->action([SiteController::class, 'contact'])
        ->name('site/contact'),
];
```

### 4. Views

Views are stored in `resources/views/` with the same organization as Yii2:

`resources/views/site/index.php`:
```php
<?php
declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var \Yiisoft\View\WebView $this
 */

$this->setTitle('Home');
?>

<div class="site-index">
    <div class="jumbotron">
        <h1>Congratulations!</h1>
        <p class="lead">You have successfully created your Yii3 application.</p>
    </div>

    <div class="body-content">
        <div class="row">
            <div class="col-lg-4">
                <h2>Heading</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
        </div>
    </div>
</div>
```

### 5. Layouts

Main layout in `resources/views/layout/main.php`:

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

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="/">My Application</a>
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="/">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/about">About</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/contact">Contact</a>
            </li>
        </ul>
    </div>
</nav>

<div class="container">
    <?= $content ?>
</div>

<footer class="footer">
    <div class="container">
        <p class="text-muted">&copy; My Company <?= date('Y') ?></p>
    </div>
</footer>

<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
```

### 6. Models

Business logic and data models go in `src/Model/`:

`src/Model/User.php`:
```php
<?php
declare(strict_types=1);

namespace App\Model;

final class User
{
    public function __construct(
        private ?int $id,
        private string $username,
        private string $email,
        private string $status
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

    public function getStatus(): string
    {
        return $this->status;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
```

For data access, create repository classes in `src/Model/`:

`src/Model/UserRepository.php`:
```php
<?php
declare(strict_types=1);

namespace App\Model;

use Yiisoft\Db\Connection\ConnectionInterface;

final class UserRepository
{
    public function __construct(
        private ConnectionInterface $db
    ) {
    }

    public function findAll(): array
    {
        return $this->db
            ->createCommand('SELECT * FROM {{%user}}')
            ->queryAll();
    }

    public function findByUsername(string $username): ?array
    {
        return $this->db
            ->createCommand('SELECT * FROM {{%user}} WHERE username = :username')
            ->bindValues([':username' => $username])
            ->queryOne() ?: null;
    }

    public function save(User $user): void
    {
        // Implementation for saving user
    }
}
```

### 7. Form models

Form models for handling user input go in `src/Form/`:

`src/Form/ContactForm.php`:
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

Use the form in a controller:

```php
public function contact(
    ServerRequestInterface $request,
    ValidatorInterface $validator,
    FormHydrator $formHydrator
): ResponseInterface {
    $form = new ContactForm();
    
    if ($request->getMethod() === 'POST') {
        $formHydrator->populate($form, $request->getParsedBody());
        $result = $validator->validate($form);
        
        if ($result->isValid()) {
            // Process the form data
            // Send email, save to database, etc.
            
            return $this->responseFactory
                ->createResponse('Form submitted successfully!');
        }
    }
    
    return $this->viewRenderer->render('contact', [
        'form' => $form,
    ]);
}
```

### 8. Console commands

Console commands live in `src/Command/`:

`src/Command/HelloCommand.php`:
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
            ->setDescription('Displays a greeting message')
            ->addArgument(
                'message',
                InputArgument::OPTIONAL,
                'Message to display',
                'Hello, World!'
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

Run with: `./yii hello "Hello from Yii3"`

### 9. Configuration

Configuration files are organized in `config/`:

```
config/
  ├── common/           # Shared configuration
  │   ├── params.php
  │   └── di.php
  ├── web/             # Web-specific configuration
  │   └── application.php
  ├── console/         # Console-specific configuration
  │   └── commands.php
  └── routes.php       # Route definitions
```

`config/common/params.php` - Application parameters:
```php
<?php
declare(strict_types=1);

return [
    'app' => [
        'name' => 'My Application',
        'charset' => 'UTF-8',
    ],
    'yiisoft/db-mysql' => [
        'dsn' => 'mysql:host=localhost;dbname=myapp',
        'username' => 'root',
        'password' => '',
    ],
];
```

`config/common/di.php` - Dependency injection configuration:
```php
<?php
declare(strict_types=1);

use App\Model\UserRepository;
use Psr\Container\ContainerInterface;

return [
    UserRepository::class => static function (ContainerInterface $container) {
        return new UserRepository(
            $container->get(ConnectionInterface::class)
        );
    },
];
```

### 10. Database access

Access the database through dependency injection:

```php
<?php
declare(strict_types=1);

namespace App\Controller;

use App\Model\UserRepository;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final class UserController
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private UserRepository $userRepository
    ) {
        $this->viewRenderer = $viewRenderer->withController($this);
    }

    public function index(): ResponseInterface
    {
        $users = $this->userRepository->findAll();

        return $this->viewRenderer->render('index', [
            'users' => $users,
        ]);
    }
}
```

### 11. Assets

Asset bundles go in `resources/asset/`:

`resources/asset/AppAsset.php`:
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

    public array $depends = [
        // Add dependencies like Bootstrap here
    ];
}
```

Register assets in your layout:

```php
<?php
use App\Asset\AppAsset;

$assetManager->register(AppAsset::class);
?>
```

Place CSS and JavaScript files in `public/assets/` for direct access, or let the asset manager publish them from `resources/asset/`.

### 12. Authentication

For user authentication, use the `yiisoft/user` package:

```shell
composer require yiisoft/user
```

Create an identity class in `src/Model/`:

`src/Model/UserIdentity.php`:
```php
<?php
declare(strict_types=1);

namespace App\Model;

use Yiisoft\User\Login\IdentityInterface;

final class UserIdentity implements IdentityInterface
{
    public function __construct(
        private string $id,
        private string $username
    ) {
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }
}
```

Use it in controllers:

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
            // Redirect to login page
        }

        return $this->viewRenderer->render('profile', [
            'user' => $this->currentUser->getIdentity(),
        ]);
    }
}
```

## Complete example structure

Here's what a complete Yii2-style structured Yii3 application looks like:

```
my-project/
├── config/
│   ├── common/
│   │   ├── di.php              # Service definitions
│   │   └── params.php          # Application parameters
│   ├── console/
│   │   └── commands.php        # Console command list
│   ├── web/
│   │   └── application.php     # Web application config
│   └── routes.php              # Route definitions
├── public/
│   ├── assets/                 # Published assets
│   ├── css/
│   │   └── site.css
│   ├── js/
│   │   └── app.js
│   └── index.php               # Entry script
├── resources/
│   ├── asset/
│   │   └── AppAsset.php        # Asset bundle
│   ├── mail/                   # Email templates
│   └── views/
│       ├── layout/
│       │   └── main.php        # Main layout
│       └── site/
│           ├── index.php       # Home page
│           ├── about.php       # About page
│           └── contact.php     # Contact page
├── runtime/                    # Generated files, logs
├── src/
│   ├── Command/
│   │   └── HelloCommand.php   # Console command
│   ├── Controller/
│   │   └── SiteController.php # Web controller
│   ├── Form/
│   │   └── ContactForm.php    # Form model
│   └── Model/
│       ├── User.php            # Business model
│       └── UserRepository.php # Data access
├── tests/                      # Test files
├── vendor/                     # Dependencies
├── composer.json
└── yii                         # Console entry point
```

## Tips for organizing code

### Keep controllers thin

Controllers should only handle HTTP concerns:
- Receive request data
- Validate input using form models
- Call business logic in model classes
- Render views or return responses

### Use form models for validation

Separate form models (`src/Form/`) from business models (`src/Model/`). Form models handle user input validation, while business models contain domain logic.

### Organize views by controller

Mirror the controller structure in views:
- `src/Controller/SiteController.php` → `resources/views/site/`
- `src/Controller/UserController.php` → `resources/views/user/`

### Group related functionality

For larger applications, group related controllers and models:

```
src/
├── Blog/
│   ├── Controller/
│   │   ├── PostController.php
│   │   └── CommentController.php
│   ├── Model/
│   │   ├── Post.php
│   │   └── Comment.php
│   └── Form/
│       └── PostForm.php
└── User/
    ├── Controller/
    │   └── ProfileController.php
    └── Model/
        └── User.php
```

## Key concepts

### Dependency injection

Instead of accessing global components, inject dependencies through constructors:

```php
public function __construct(
    private ViewRenderer $viewRenderer,
    private UserRepository $userRepository,
    private SessionInterface $session
) {
}
```

### PSR-7 HTTP messages

All HTTP handling uses PSR-7 interfaces:
- `ServerRequestInterface` for requests
- `ResponseInterface` for responses

### Immutability

Configuration and services are immutable. To modify an object, create a new instance:

```php
$newRenderer = $this->viewRenderer->withViewPath('/new/path');
```

## See also

- [Yii3 official guide](/guide)
- [Application structure](/guide/structure/overview)
- [Dependency injection](/guide/concept/di-container)
- [Structuring code with vertical slices](/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices)
- [yiisoft/app template](https://github.com/yiisoft/app)
