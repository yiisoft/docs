# 认证

认证是验证用户身份的过程。它通常使用标识符（例如用户名或电子邮件地址）和 secret 令牌（例如 password
或访问令牌）来判断用户是否是其声称的人。认证是登录功能的基础。

Yii 提供了一个认证框架，它连接各种组件以支持登录。要使用此框架，您主要需要执行以下工作：

* 配置 `Yiisoft\User\CurrentUser` 服务；
* 创建一个实现 `\Yiisoft\Auth\IdentityInterface` 接口的类；
* 创建一个实现 `\Yiisoft\Auth\IdentityRepositoryInterface` 接口的类；

要使用 `Yiisoft\User\CurrentUser` 服务，请安装
[yiisoft/user](https://github.com/yiisoft/user) 包：

```shell
composer require yiisoft/user
```

## 配置 `Yiisoft\User\CurrentUser`

`Yiisoft\User\CurrentUser` 应用服务管理用户认证状态。它依赖于
`Yiisoft\Auth\IdentityRepositoryInterface`，该接口应返回一个包含实际认证逻辑的
`\Yiisoft\Auth\IdentityInterface` 实例。

```php
use Yiisoft\Session\Session;
use Yiisoft\Session\SessionInterface;
use Yiisoft\Auth\IdentityRepositoryInterface;
use Yiisoft\Definitions\Reference;

return [
    // ...

    SessionInterface::class => [
        'class' => Session::class,
        '__construct()' => [
            $params['session']['options'] ?? [],
            $params['session']['handler'] ?? null,
        ],
    ],
    IdentityRepositoryInterface::class => IdentityRepository::class,
    CurrentUser::class => [
        'withSession()' => [Reference::to(SessionInterface::class)]
    ],
];
```

## 实现 `\Yiisoft\Auth\IdentityInterface` <span id="implementing-identity"></span>

身份类必须实现 `\Yiisoft\Auth\IdentityInterface` 接口，该接口只有一个方法：

* [[yii\web\IdentityInterface::getId()|getId()]]：它返回此身份实例所代表的用户的 ID。

在以下示例中，身份类被实现为一个纯 PHP 对象。

```php
<?php

namespace App\User;

use Yiisoft\Auth\IdentityInterface;

final readonly class Identity implements IdentityInterface
{
    public function __construct(
        private string $id
    ) {
    }

    public function getId(): string
    {
        return $this->id;
    }
}
```

## 实现 `\Yiisoft\Auth\IdentityRepositoryInterface` <span id="implementing-identity-repository"></span>

身份仓库类必须实现 `\Yiisoft\Auth\IdentityRepositoryInterface` 接口，该接口具有以下方法：

* `findIdentity(string $id): ?IdentityInterface`：它使用指定的 ID
  查找身份类的实例。当您需要通过会话保持登录状态时使用此方法。
* `findIdentityByToken(string $token, string $type):
  ?IdentityInterface`：它使用指定的访问令牌查找身份类的实例。当您需要通过单个 secret 令牌（例如，在无状态 REST API
  中）对用户进行认证时使用此方法。
  
一个示例实现可能如下所示：

```php
namespace App\User;

use App\User\Identity;
use \Yiisoft\Auth\IdentityInterface;
use \Yiisoft\Auth\IdentityRepositoryInterface;

final readonly class IdentityRepository implements IdentityRepositoryInterface
{
    private const USERS = [
      [
        'id' => 1,
        'token' => '12345'   
      ],
      [
        'id' => 42,
        'token' => '54321'
      ],  
    ];

    public function findIdentity(string $id) : ?IdentityInterface
    {
        foreach (self::USERS as $user) {
            if ((string)$user['id'] === $id) {
                return new Identity($id);            
            }
        }
        
        return null;
    }

    public function findIdentityByToken(string $token, string $type) : ?IdentityInterface
    {
        foreach (self::USERS as $user) {
             if ($user['token'] === $token) {
                 return new Identity((string)$user['id']);            
             }
         }
         
         return null;
    }
}
```

## 使用 `Yiisoft\User\CurrentUser`

您可以使用 `Yiisoft\User\CurrentUser` 服务来获取当前用户身份。与任何服务一样，它可以在操作处理器的构造函数或方法中自动装配：

```php
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\User\CurrentUser;

final readonly class SiteController
{
    public function __construct(private CurrentUser $user) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        if ($this->user->isGuest()) {
            // user is guest
        } else {
            $identity = $this->user->getIdentity();
            // do something based on identity
        }
    }
}
```

`isGuest()` 判断用户是否已登录。`getIdentity()` 返回一个身份实例。

要登录用户，您可以使用以下代码：

```php
$identity = $identityRepository->findByEmail($email);

/* @var $user \Yiisoft\User\CurrentUser */
$user->login($identity);
```

`login()` 方法将身份设置到用户服务。它将身份存储到会话中，以便维护用户认证状态。

要注销用户，请调用

```php
/* @var $user \Yiisoft\User\CurrentUser */
$user->logout();
```

## 保护路由

`Yiisoft\Auth\Middleware\Authentication` 中间件可用于将对给定路由的访问限制为仅限已认证用户。

首先，配置 `Yiisoft\Auth\AuthenticationMethodInterface`：

```php
use Yiisoft\Auth\AuthenticationMethodInterface;
use Yiisoft\User\Method\WebAuth;

return [
    // ...
    AuthenticationMethodInterface::class => WebAuth::class,
];
```

然后，将 `Yiisoft\Auth\Middleware\Authentication` 中间件应用到路由：
 
```php
use Yiisoft\Auth\Middleware\Authentication;
 
Route::post('/create')
        ->middleware(Authentication::class)
        ->action([SiteController::class, 'create'])
        ->name('site/create')
```

 或应用到一组路由：

```php
use Yiisoft\Auth\Middleware\Authentication;

Group::create()
        ->middleware(Authentication::class)
        ->routes(
            Route::post('/create')
                ->action([SiteController::class, 'create'])
                ->name('site/create'),
            Route::put('/update/{id}')
                ->action([SiteController::class, 'update'])
                ->name('site/update')
        )
```

## 认证事件 <span id="auth-events"></span>

用户服务在登录和注销过程中会触发一些事件。


* `\Yiisoft\User\Event\BeforeLogin`：在 `login()` 开始时触发。如果事件处理器在事件对象上调用
  `invalidate()`，登录过程将被取消。
* `\Yiisoft\User\Event\AfterLogin`：在成功登录后触发。
* `\Yiisoft\User\Event\BeforeLogout`：在 `logout()` 开始时触发。如果事件处理器在事件对象上调用
  `invalidate()`，注销过程将被取消。
* `\Yiisoft\User\Event\AfterLogout`：在成功注销后触发。

您可以响应这些事件来实现登录审计、在线用户统计等功能。例如，在 `\Yiisoft\User\Event\AfterLogin` 的处理器中，您可以在
`user` 数据库表中记录登录时间和 IP 地址。
