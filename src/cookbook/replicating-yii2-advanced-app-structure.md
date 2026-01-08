# Replicating Yii2 advanced app structure with Yii3

In Yii2, the [advanced application template](https://github.com/yiisoft/yii2-app-advanced) provided a structure for applications that require multiple entry points, such as frontend, backend, console, and API applications. This recipe explains how to achieve a similar structure in Yii3.

## Understanding the differences

Yii3 takes a fundamentally different approach to application structure compared to Yii2:

### Yii2 advanced template structure

The Yii2 advanced template was organized around multiple application directories:

```
yii2-app-advanced/
├── backend/          # Administration panel application
├── frontend/         # Public-facing application
├── console/          # Console commands
├── api/              # API application (optional)
├── common/           # Shared code between applications
│   ├── models/
│   ├── config/
│   └── mail/
├── environments/     # Environment-specific configurations
└── vendor/
```

### Yii3 approach

Yii3 uses a package-based architecture with a single application that can have multiple entry points:

```
yii3-app/
├── config/           # Configuration files
│   ├── common/       # Shared configuration
│   ├── web/          # Web application config
│   └── console/      # Console application config
├── public/           # Web root with entry scripts
│   └── index.php
├── src/              # Application source code
│   ├── Web/          # Web-specific code
│   ├── Console/      # Console-specific code
│   └── Shared/       # Shared code
├── resources/        # Views, assets, translations
└── vendor/
```

Instead of separate applications, Yii3 encourages:

1. **Single codebase** with different entry points
2. **Configuration-based separation** between web and console
3. **Route-based access control** for admin vs. public areas
4. **Middleware-based logic** for different application sections

## Setting up multiple entry points

### Creating separate entry scripts

To replicate the frontend/backend separation, create multiple entry points in your `public/` directory:

#### Frontend entry script

Create `public/index.php` for your public-facing application:

```php
<?php

declare(strict_types=1);

use Yiisoft\Config\Config;
use Yiisoft\Config\ConfigPaths;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

// Define constants
define('YII_ENV', getenv('APP_ENV') ?: 'prod');
define('YII_DEBUG', YII_ENV !== 'prod');

// Application root directory
$rootPath = dirname(__DIR__);

// Register Composer autoloader
require_once $rootPath . '/vendor/autoload.php';

// Run the application
$runner = new HttpApplicationRunner(
    rootPath: $rootPath,
    debug: YII_DEBUG,
    checkEvents: YII_DEBUG,
    environment: YII_ENV,
    bootstrap: require $rootPath . '/config/bootstrap.php',
    configPaths: new ConfigPaths(
        $rootPath,
        'config',
        'web',  // Use web configuration
    ),
);

$runner->run();
```

#### Backend entry script

Create `public/admin.php` for your administration panel:

```php
<?php

declare(strict_types=1);

use Yiisoft\Config\Config;
use Yiisoft\Config\ConfigPaths;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

// Define constants
define('YII_ENV', getenv('APP_ENV') ?: 'prod');
define('YII_DEBUG', YII_ENV !== 'prod');

// Application root directory
$rootPath = dirname(__DIR__);

// Register Composer autoloader
require_once $rootPath . '/vendor/autoload.php';

// Run the application
$runner = new HttpApplicationRunner(
    rootPath: $rootPath,
    debug: YII_DEBUG,
    checkEvents: YII_DEBUG,
    environment: YII_ENV,
    bootstrap: require $rootPath . '/config/bootstrap.php',
    configPaths: new ConfigPaths(
        $rootPath,
        'config',
        'admin',  // Use admin configuration
    ),
);

$runner->run();
```

### Configuring web server routing

Configure your web server to route requests appropriately:

#### Nginx configuration

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/app/public;
    index index.php;

    # Frontend application
    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    # Backend application (admin panel)
    location /admin {
        try_files $uri $uri/ /admin.php$is_args$args;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## Organizing configuration

### Configuration structure

Create a configuration structure that separates concerns:

```
config/
├── common/              # Shared between all entry points
│   ├── di/              # Dependency injection
│   │   ├── logger.php
│   │   ├── db.php
│   │   └── cache.php
│   ├── params.php       # Common parameters
│   └── routes.php       # Shared routes
├── web/                 # Frontend-specific
│   ├── di/
│   │   └── application.php
│   ├── params.php
│   └── routes.php
├── admin/               # Backend-specific
│   ├── di/
│   │   └── application.php
│   ├── params.php
│   └── routes.php
├── console/             # Console commands
│   └── params.php
├── params.php           # Root parameters
├── bootstrap.php        # Application bootstrap
└── packages/            # Package configurations
```

### Configuring the config plugin

Update `composer.json` to include admin configuration:

```json
{
    "config-plugin": {
        "common": "config/common/*.php",
        "params": [
            "config/params.php",
            "?config/params-local.php"
        ],
        "web": [
            "$common",
            "config/web/*.php"
        ],
        "admin": [
            "$common",
            "config/admin/*.php"
        ],
        "console": [
            "$common",
            "config/console/*.php"
        ],
        "events": "config/events.php",
        "events-web": [
            "$events",
            "config/events-web.php"
        ],
        "events-admin": [
            "$events",
            "config/events-admin.php"
        ],
        "providers": "config/providers.php",
        "providers-web": [
            "$providers",
            "config/providers-web.php"
        ],
        "providers-admin": [
            "$providers",
            "config/providers-admin.php"
        ],
        "routes": "config/routes.php"
    }
}
```

### Creating admin-specific configuration

Create `config/admin/di/application.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Definitions\DynamicReference;
use Yiisoft\ErrorHandler\Middleware\ErrorCatcher;
use Yiisoft\Middleware\Dispatcher\MiddlewareDispatcher;
use Yiisoft\Router\Middleware\Router;
use Yiisoft\Session\SessionMiddleware;
use Yiisoft\Yii\Http\Application;
use Yiisoft\Yii\Middleware\CsrfTokenMiddleware;

/** @var array $params */

return [
    Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to([
                'class' => MiddlewareDispatcher::class,
                'withMiddlewares()' => [
                    [
                        ErrorCatcher::class,
                        SessionMiddleware::class,
                        CsrfTokenMiddleware::class,
                        Router::class,
                    ],
                ],
            ]),
        ],
    ],
];
```

## Organizing source code

### Directory structure

Organize your source code to separate concerns while sharing common code:

```
src/
├── Admin/                  # Backend-specific code
│   ├── Controller/
│   │   ├── DashboardController.php
│   │   └── UserController.php
│   ├── Service/
│   │   └── UserManagementService.php
│   └── View/
│       └── layout.php
├── Frontend/               # Frontend-specific code
│   ├── Controller/
│   │   ├── SiteController.php
│   │   └── PostController.php
│   ├── Service/
│   │   └── PostService.php
│   └── View/
│       └── layout.php
├── Console/                # Console commands
│   └── Command/
│       └── MigrateCommand.php
├── Shared/                 # Shared code
│   ├── Entity/
│   │   ├── User.php
│   │   └── Post.php
│   ├── Repository/
│   │   ├── UserRepository.php
│   │   └── PostRepository.php
│   ├── Service/
│   │   └── AuthService.php
│   └── ValueObject/
└── Api/                    # API-specific code (optional)
    ├── Controller/
    └── Dto/
```

### Example: Shared entity

Create shared entities in `src/Shared/Entity/`:

```php
<?php

declare(strict_types=1);

namespace App\Shared\Entity;

final class User
{
    public function __construct(
        private int $id,
        private string $username,
        private string $email,
        private string $passwordHash,
        private string $role,
        private int $status,
        private \DateTimeImmutable $createdAt,
    ) {
    }

    public function getId(): int
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

    public function getRole(): string
    {
        return $this->role;
    }

    public function isActive(): bool
    {
        return $this->status === 1;
    }
}
```

### Example: Admin controller

Create admin-specific controllers in `src/Admin/Controller/`:

```php
<?php

declare(strict_types=1);

namespace App\Admin\Controller;

use App\Shared\Repository\UserRepository;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\DataResponse\DataResponseFactoryInterface;

final class DashboardController
{
    public function __construct(
        private DataResponseFactoryInterface $responseFactory,
        private UserRepository $userRepository,
    ) {
    }

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $totalUsers = $this->userRepository->count();
        
        return $this->responseFactory->createResponse([
            'totalUsers' => $totalUsers,
        ]);
    }
}
```

### Example: Frontend controller

Create frontend-specific controllers in `src/Frontend/Controller/`:

```php
<?php

declare(strict_types=1);

namespace App\Frontend\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\DataResponse\DataResponseFactoryInterface;

final class SiteController
{
    public function __construct(
        private DataResponseFactoryInterface $responseFactory,
    ) {
    }

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        return $this->responseFactory->createResponse([
            'title' => 'Welcome to Frontend',
        ]);
    }
}
```

## Setting up routes

### Separate route configuration

Create route configurations for each application section:

#### Frontend routes

Create `config/web/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Frontend\Controller\PostController;
use App\Frontend\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')
        ->action([SiteController::class, 'index'])
        ->name('site/index'),
    
    Route::get('/post/{id:\d+}')
        ->action([PostController::class, 'view'])
        ->name('post/view'),
    
    Route::get('/posts')
        ->action([PostController::class, 'index'])
        ->name('post/index'),
];
```

#### Backend routes

Create `config/admin/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Admin\Controller\DashboardController;
use App\Admin\Controller\UserController;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    // Admin routes are prefixed with /admin in web server config
    Route::get('/')
        ->action([DashboardController::class, 'index'])
        ->name('admin/dashboard'),
    
    Group::create('/users')
        ->routes(
            Route::get('/')
                ->action([UserController::class, 'index'])
                ->name('admin/user/index'),
            
            Route::get('/{id:\d+}')
                ->action([UserController::class, 'view'])
                ->name('admin/user/view'),
            
            Route::post('/{id:\d+}/edit')
                ->action([UserController::class, 'update'])
                ->name('admin/user/update'),
        ),
];
```

## Implementing access control

### Creating authentication middleware

Create admin-specific authentication middleware:

```php
<?php

declare(strict_types=1);

namespace App\Admin\Middleware;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Yiisoft\User\CurrentUser;

final class AdminAuthMiddleware implements MiddlewareInterface
{
    public function __construct(
        private CurrentUser $currentUser,
        private ResponseFactoryInterface $responseFactory,
    ) {
    }

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        if (!$this->currentUser->isGuest() && $this->currentUser->getIdentity()->getRole() === 'admin') {
            return $handler->handle($request);
        }

        return $this->responseFactory
            ->createResponse(403)
            ->withHeader('Location', '/login');
    }
}
```

### Applying middleware to admin routes

Update `config/admin/di/application.php` to include the authentication middleware:

```php
<?php

declare(strict_types=1);

use App\Admin\Middleware\AdminAuthMiddleware;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\Middleware\Dispatcher\MiddlewareDispatcher;
use Yiisoft\Yii\Http\Application;

/** @var array $params */

return [
    Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to([
                'class' => MiddlewareDispatcher::class,
                'withMiddlewares()' => [
                    [
                        ErrorCatcher::class,
                        SessionMiddleware::class,
                        CsrfTokenMiddleware::class,
                        AdminAuthMiddleware::class,  // Admin authentication
                        Router::class,
                    ],
                ],
            ]),
        ],
    ],
];
```

## Managing shared resources

### Shared database connections

Configure database connections in `config/common/di/db.php` to be shared across all applications:

```php
<?php

declare(strict_types=1);

use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Mysql\Connection;
use Yiisoft\Db\Mysql\Driver;

/** @var array $params */

return [
    ConnectionInterface::class => [
        'class' => Connection::class,
        '__construct()' => [
            'driver' => new Driver(
                $params['yiisoft/db-mysql']['dsn'],
                $params['yiisoft/db-mysql']['username'],
                $params['yiisoft/db-mysql']['password'],
            ),
        ],
    ],
];
```

### Shared services

Create shared services in `src/Shared/Service/`:

```php
<?php

declare(strict_types=1);

namespace App\Shared\Service;

use App\Shared\Entity\User;
use App\Shared\Repository\UserRepository;

final class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
    ) {
    }

    public function authenticate(string $username, string $password): ?User
    {
        $user = $this->userRepository->findByUsername($username);
        
        if ($user === null) {
            return null;
        }
        
        if (!password_verify($password, $user->getPasswordHash())) {
            return null;
        }
        
        return $user;
    }
}
```

## Environment-specific configuration

### Using environment variables

Create `.env` files for different environments:

#### Development environment

Create `.env.dev`:

```env
APP_ENV=dev
DB_HOST=localhost
DB_NAME=app_dev
DB_USER=dev_user
DB_PASSWORD=dev_password
```

#### Production environment

Create `.env.prod`:

```env
APP_ENV=prod
DB_HOST=production-db.example.com
DB_NAME=app_prod
DB_USER=prod_user
DB_PASSWORD=secure_password
```

### Loading environment variables

Use [vlucas/phpdotenv](https://github.com/vlucas/phpdotenv) to load environment variables:

```sh
composer require vlucas/phpdotenv
```

Update your entry scripts to load the appropriate environment file:

```php
<?php

declare(strict_types=1);

use Dotenv\Dotenv;

$rootPath = dirname(__DIR__);

require_once $rootPath . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv::createImmutable($rootPath);
$dotenv->load();

// Define constants from environment
define('YII_ENV', $_ENV['APP_ENV'] ?? 'prod');
define('YII_DEBUG', YII_ENV !== 'prod');

// Continue with application runner...
```

### Environment-specific parameters

Create environment-specific parameter files:

```php
<?php

declare(strict_types=1);

// config/params.php

return [
    'app' => [
        'name' => $_ENV['APP_NAME'] ?? 'My Application',
        'charset' => 'UTF-8',
    ],
    
    'yiisoft/db-mysql' => [
        'dsn' => sprintf(
            'mysql:host=%s;dbname=%s',
            $_ENV['DB_HOST'] ?? 'localhost',
            $_ENV['DB_NAME'] ?? 'app'
        ),
        'username' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASSWORD'] ?? '',
    ],
];
```

## Handling assets and views

### Separate view paths

Configure separate view paths for frontend and backend in parameters:

```php
<?php

declare(strict_types=1);

// config/web/params.php

return [
    'yiisoft/view' => [
        'basePath' => '@root/resources/views/frontend',
    ],
];
```

```php
<?php

declare(strict_types=1);

// config/admin/params.php

return [
    'yiisoft/view' => [
        'basePath' => '@root/resources/views/admin',
    ],
];
```

### View directory structure

Organize views by application:

```
resources/
├── views/
│   ├── frontend/
│   │   ├── layout/
│   │   │   ├── main.php
│   │   │   └── guest.php
│   │   ├── site/
│   │   │   ├── index.php
│   │   │   └── about.php
│   │   └── post/
│   │       ├── index.php
│   │       └── view.php
│   └── admin/
│       ├── layout/
│       │   └── main.php
│       ├── dashboard/
│       │   └── index.php
│       └── user/
│           ├── index.php
│           └── edit.php
└── assets/
    ├── frontend/
    │   ├── css/
    │   └── js/
    └── admin/
        ├── css/
        └── js/
```

## API application

### Creating an API entry point

For RESTful APIs, create `public/api.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Config\ConfigPaths;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

define('YII_ENV', getenv('APP_ENV') ?: 'prod');
define('YII_DEBUG', YII_ENV !== 'prod');

$rootPath = dirname(__DIR__);

require_once $rootPath . '/vendor/autoload.php';

$runner = new HttpApplicationRunner(
    rootPath: $rootPath,
    debug: YII_DEBUG,
    checkEvents: YII_DEBUG,
    environment: YII_ENV,
    bootstrap: require $rootPath . '/config/bootstrap.php',
    configPaths: new ConfigPaths(
        $rootPath,
        'config',
        'api',  // Use API configuration
    ),
);

$runner->run();
```

### API configuration

Create `config/api/di/application.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Definitions\DynamicReference;
use Yiisoft\Middleware\Dispatcher\MiddlewareDispatcher;
use Yiisoft\Yii\Http\Application;

/** @var array $params */

return [
    Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to([
                'class' => MiddlewareDispatcher::class,
                'withMiddlewares()' => [
                    [
                        ErrorCatcher::class,
                        Router::class,
                        // Note: No CSRF for API, use token authentication instead
                    ],
                ],
            ]),
        ],
    ],
];
```

### API routes

Create RESTful routes in `config/api/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Api\Controller\PostController;
use App\Api\Controller\UserController;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/v1')
        ->routes(
            Group::create('/users')
                ->routes(
                    Route::get('/')
                        ->action([UserController::class, 'index'])
                        ->name('api/user/index'),
                    
                    Route::get('/{id:\d+}')
                        ->action([UserController::class, 'view'])
                        ->name('api/user/view'),
                    
                    Route::post('/')
                        ->action([UserController::class, 'create'])
                        ->name('api/user/create'),
                    
                    Route::put('/{id:\d+}')
                        ->action([UserController::class, 'update'])
                        ->name('api/user/update'),
                    
                    Route::delete('/{id:\d+}')
                        ->action([UserController::class, 'delete'])
                        ->name('api/user/delete'),
                ),
            
            Group::create('/posts')
                ->routes(
                    Route::get('/')
                        ->action([PostController::class, 'index'])
                        ->name('api/post/index'),
                    
                    Route::get('/{id:\d+}')
                        ->action([PostController::class, 'view'])
                        ->name('api/post/view'),
                ),
        ),
];
```

## Testing considerations

### Separate test configurations

Create test configurations for each application section:

```
tests/
├── Admin/
│   └── Controller/
│       └── DashboardControllerTest.php
├── Frontend/
│   └── Controller/
│       └── SiteControllerTest.php
├── Api/
│   └── Controller/
│       └── UserControllerTest.php
└── Shared/
    ├── Entity/
    └── Service/
```

### Example test

```php
<?php

declare(strict_types=1);

namespace App\Tests\Admin\Controller;

use App\Admin\Controller\DashboardController;
use App\Shared\Repository\UserRepository;
use PHPUnit\Framework\TestCase;
use Yiisoft\DataResponse\DataResponseFactory;

final class DashboardControllerTest extends TestCase
{
    public function testIndex(): void
    {
        $userRepository = $this->createMock(UserRepository::class);
        $userRepository->method('count')->willReturn(42);
        
        $controller = new DashboardController(
            new DataResponseFactory(),
            $userRepository
        );
        
        $response = $controller->index(
            $this->createMock(\Psr\Http\Message\ServerRequestInterface::class)
        );
        
        $this->assertSame(200, $response->getStatusCode());
    }
}
```

## Migration from Yii2

### Key differences to consider

When migrating from Yii2 advanced template to Yii3:

1. **No separate application classes**: Yii3 uses a single application with different entry points
2. **Configuration-driven**: Separation is achieved through configuration rather than directory structure
3. **PSR compliance**: All components follow PSR standards (PSR-7, PSR-11, PSR-15, etc.)
4. **Dependency injection**: Everything is configured through the DI container
5. **No global state**: No `Yii::$app` or similar global accessors

### Migration steps

1. **Identify shared code**: Move common models, services, and repositories to `src/Shared/`
2. **Separate application logic**: Organize frontend and backend code in respective directories
3. **Configure entry points**: Create separate entry scripts for each application
4. **Update routing**: Convert Yii2 routes to Yii3 route configuration
5. **Refactor controllers**: Update controllers to use PSR-7 request/response
6. **Update views**: Adapt view rendering to Yii3 view system
7. **Configure middleware**: Set up middleware stacks for each application
8. **Test thoroughly**: Ensure all functionality works in the new structure

## Best practices

1. **Keep shared code truly shared**: Only place code in `src/Shared/` if it's genuinely used by multiple applications
2. **Use middleware for separation**: Apply application-specific middleware instead of duplicating logic
3. **Leverage configuration**: Use the config plugin to manage environment and application-specific settings
4. **Follow PSR standards**: Ensure all code follows PSR interfaces for better interoperability
5. **Document entry points**: Clearly document each entry script and its purpose
6. **Use environment variables**: Externalize configuration that varies between environments
7. **Implement proper access control**: Use middleware and RBAC for securing admin areas
8. **Test each application separately**: Write tests that verify each application section works independently

## Conclusion

While Yii3 doesn't have a direct equivalent to the Yii2 advanced template, you can achieve the same level of separation and organization through:

- Multiple entry scripts with different configuration sets
- Organized source code structure separating frontend, backend, API, and shared code
- Configuration-based application setup
- Middleware-based access control and request handling

This approach provides more flexibility and follows modern PHP practices while maintaining clear separation between different parts of your application.

## References

- [Application structure overview](../guide/structure/overview.md)
- [Configuration](../guide/concept/configuration.md)
- [Middleware](../guide/structure/middleware.md)
- [Routing](../guide/runtime/routing.md)
- [Structuring code by use-case with vertical slices](organizing-code/structuring-by-use-case-with-vertical-slices.md)
