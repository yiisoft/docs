# Autenticação

Autenticação é o processo de verificar a identidade de um
usuário. Normalmente ela usa um identificador (por exemplo, um nome de
usuário ou um endereço de e-mail) e um token secreto (como uma senha ou um
token de acesso) para decidir se o usuário é quem diz ser. A autenticação é
a base do recurso de login.

O Yii fornece um framework de autenticação que conecta vários componentes
para dar suporte ao login. Para usar esse framework, você precisa
basicamente fazer o seguinte:

* Configurar o serviço `Yiisoft\User\CurrentUser`;
* Criar uma classe que implementa a interface
  `\Yiisoft\Auth\IdentityInterface`;
* Criar uma classe que implementa a interface
  `\Yiisoft\Auth\IdentityRepositoryInterface`;

Para usar o serviço `Yiisoft\User\CurrentUser`, instale o pacote
[yiisoft/user](https://github.com/yiisoft/user):

```shell
composer require yiisoft/user
```

## Configurando `Yiisoft\User\CurrentUser`

O serviço de aplicação `Yiisoft\User\CurrentUser` gerencia o estado de
autenticação do usuário. Ele depende de
`Yiisoft\Auth\IdentityRepositoryInterface`, que deve retornar uma instância
de `\Yiisoft\Auth\IdentityInterface` contendo a lógica de autenticação de
fato.

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

## Implementando`\Yiisoft\Auth\IdentityInterface`

A classe de identidade deve implementar a `\Yiisoft\Auth\IdentityInterface`,
que tem um único método:

* [[yii\web\IdentityInterface::getId()|getId()]]: retorna o ID do usuário
  representado por esta instância de identidade.

No exemplo a seguir, a classe de identidade é implementada como um objeto
PHP puro.

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

## Implementando`\Yiisoft\Auth\IdentityRepositoryInterface`

A classe de repositório de identidades deve implementar a
`\Yiisoft\Auth\IdentityRepositoryInterface`, que tem os seguintes métodos:

* `findIdentity(string $id): ?IdentityInterface`: procura uma instância da
  classe de identidade usando o ID informado. Esse método é usado quando
  você precisa manter o estado de login via sessão.
* `findIdentityByToken(string $token, string $type): ?IdentityInterface`:
  procura uma instância da classe de identidade usando o token de acesso
  informado. Esse método é usado quando você precisa autenticar um usuário
  por um único token secreto (por exemplo, numa API REST sem estado).
  
Uma implementação fictícia pode ficar assim:

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

## Usando `Yiisoft\User\CurrentUser`

Você pode usar o serviço `Yiisoft\User\CurrentUser` para obter a identidade
do usuário atual.  Como qualquer serviço, ele pode ser injetado
automaticamente (autowiring) no construtor ou no método do handler da
action:

```php
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\User\CurrentUser;

final readonly class SiteController
{
    public function __construct(private CurrentUser $user) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        if ($this->user->isGuest()) {
            // o usuário é visitante
        } else {
            $identity = $this->user->getIdentity();
            // faça algo com base na identidade
        }
    }
}
```

`isGuest()` determina se o usuário está logado ou não. `getIdentity()`
retorna uma instância da identidade.

Para fazer o login de um usuário, você pode usar o seguinte código:

```php
$identity = $identityRepository->findByEmail($email);

/* @var $user \Yiisoft\User\CurrentUser */
$user->login($identity);
```

O método `login()` define a identidade no serviço de usuário.  Ele armazena
a identidade na sessão, para que o estado de autenticação do usuário seja
mantido.

Para fazer o logout de um usuário, chame

```php
/* @var $user \Yiisoft\User\CurrentUser */
$user->logout();
```

## Protegendo rotas

O middleware `Yiisoft\Auth\Middleware\Authentication` pode ser usado para
restringir o acesso a uma rota apenas a usuários autenticados.

Primeiro, configure a `Yiisoft\Auth\AuthenticationMethodInterface`:

```php
use Yiisoft\Auth\AuthenticationMethodInterface;
use Yiisoft\User\Method\WebAuth;

return [
    // ...
    AuthenticationMethodInterface::class => WebAuth::class,
];
```

Depois, aplique o middleware `Yiisoft\Auth\Middleware\Authentication` a uma
rota:
 
```php
use Yiisoft\Auth\Middleware\Authentication;
 
Route::post('/create')
        ->middleware(Authentication::class)
        ->action([SiteController::class, 'create'])
        ->name('site/create')
```

 Ou a um grupo de rotas:

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

## Eventos de autenticação

O serviço de usuário dispara alguns eventos durante os processos de login e
logout.


* `\Yiisoft\User\Event\BeforeLogin`: disparado no início de `login()`.  Se o
  handler do evento chamar `invalidate()` no objeto do evento, o processo de
  login será cancelado.
* `\Yiisoft\User\Event\AfterLogin`: disparado após um login bem-sucedido.
* `\Yiisoft\User\Event\BeforeLogout`: disparado no início de `logout()`.  Se
  o handler do evento chamar `invalidate()` no objeto do evento, o processo
  de logout será cancelado.
* `\Yiisoft\User\Event\AfterLogout`: disparado após um logout bem-sucedido.

Você pode responder a esses eventos para implementar recursos como auditoria
de login ou estatísticas de usuários online. Por exemplo, no handler de
`\Yiisoft\User\Event\AfterLogin`, você pode registrar o horário e o endereço
IP do login na tabela `user` do banco de dados.
