# Authentication

Authentication is the process of verifying the identity of a user. It usually uses an identifier
(e.g. a username or an email address) and a secret token (e.g. a password or an access token) to judge
if the user is the one whom he claims as. Authentication is the basis of the login feature.

Yii provides an authentication framework which wires up various components to support login. To use this framework,
you mainly need to do the following work:

* Configure the `Yiisoft\Yii\Web\User\User` service;
* Create a class implementing the `\Yiisoft\Auth\IdentityInterface` interface;
* Create a class implementing the `\Yiisoft\Auth\IdentityRepositoryInterface` interface;

## Configuring `Yiisoft\Yii\Web\User\User` <span id="configuring-user"></span>

The `Yiisoft\Yii\Web\User\User` application service manages the user authentication status. It depends on
`Yiisoft\Auth\IdentityRepositoryInterface` that should return an instance of `\Yiisoft\Auth\IdentityInterface`
which contains the actual authentication logic.

```php
use Yiisoft\Yii\Web\Session\Session;
use Yiisoft\Yii\Web\Session\SessionInterface;
use Yiisoft\Yii\Web\User\User;
use Yiisoft\Auth\IdentityRepositoryInterface;
use Psr\Container\ContainerInterface;
use Psr\EventDispatcher\EventDispatcherInterface;

return [
    // ...

    SessionInterface::class => [
        '__class' => Session::class,
        '__construct()' => [
            $params['session']['options'] ?? [],
            $params['session']['handler'] ?? null,
        ],
    ],
    
    
    // User:
    IdentityRepositoryInterface::class => static function (ContainerInterface $container) {
        // instead of Cycle-based repository, any implementation could be used
        return $container->get(\Cycle\ORM\ORMInterface::class)->getRepository(\App\Entity\User::class);
    },
];
```

## Implementing`\Yiisoft\Auth\IdentityInterface` <span id="implementing-identity"></span>

The identity class must implement the `\Yiisoft\Auth\IdentityInterface` which contains
a single method:

* [[yii\web\IdentityInterface::getId()|getId()]]: it returns the ID of the user represented by this identity instance.

In the following example, an identity class implemented as a pure PHP object.

```php
<?php

namespace App\User;

use Yiisoft\Auth\IdentityInterface;

final class Identity implements IdentityInterface
{
    private string $id;

    public function __construct(string $id) {
        $this->id = $id;
    }

    public function getId(): string
    {
        return $this->id;
    }
}
```

## Implementing`\Yiisoft\Auth\IdentityRepositoryInterface` <span id="implementing-identity-repository"></span>

The identity repository class must implement the `\Yiisoft\Auth\IdentityRepositoryInterface` which contains
the following methods:

* `findIdentity(string $id): ?IdentityInterface`: it looks for an instance of the identity
  class using the specified ID. This method used when you need to maintain the login status via session.
* `findIdentityByToken(string $token, string $type): ?IdentityInterface`: it looks for
  an instance of the identity class using the specified access token. This method is used when you need
  to authenticate a user by a single secret token (e.g. in a stateless RESTful application).
  
A dummy implementation may look like the following:

```php
namespace App\User;

use App\User\Identity;
use \Yiisoft\Auth\IdentityInterface;
use \Yiisoft\Auth\IdentityRepositoryInterface;

final class IdentityRepository implements IdentityRepositoryInterface
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

## Using `\Yiisoft\Yii\Web\User\User` <span id="using-user"></span>

`\Yiisoft\Yii\Web\User\User` service can be used to obtain current user identity. As any service, it could be
auto-wired in either action handler constructor or method:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Yiisoft\Yii\Web\User\User;

class SiteController
{
    public function actionIndex(ServerRequestInterface $request, User $user)
    {        
        if ($user->isGuest()) {
            // user is guest
        } else {
            $identity = $user->getIdentity();
            // do something based on identity
        }        
    }
}
```

`isGuest()` determines if user is logged in or not. `getIdentity()` returns an instance of identity.

To login a user, you may use the following code:

```php
$identity = $identityRepository->findByEmail($email);

/* @var $user \Yiisoft\Yii\Web\User\User */
$user->login($identity);
```

The `login()` method sets the identity to the User service. Identity is stored into session so user 
authentication status is maintained.

To logout a user, simply call

```php
/* @var $user \Yiisoft\Yii\Web\User\User */
$user->logout();
```

## Authentication Events <span id="auth-events"></span>

The user service raises a few events during the login and logout processes.


* `\Yiisoft\Yii\Web\User\Event\BeforeLogin`: raised at the beginning of `login()`.
  If the event handler calls `invalidate()` on event object, the login process will be cancelled.
* `\Yiisoft\Yii\Web\User\Event\AfterLogin`: raised after a successful login.
* `\Yiisoft\Yii\Web\User\Event\BeforeLogout`: raised at the beginning of `logout()`.
  If the event handler calls `invalidate()` on event object, the logout process will be cancelled.
* `\Yiisoft\Yii\Web\User\Event\AfterLogout`: raised after a successful logout.

You may respond to these events to implement features such as login audit, online user statistics. For example,
in the handler for `\Yiisoft\Yii\Web\User\Event\AfterLogin`, you may record the login time and IP
address in the `user` database table.
