# Autorização

Autorização é o processo de verificar se um usuário tem permissão suficiente
para fazer algo.

## Verificando permissões

Você pode verificar se um usuário tem determinadas permissões usando o
serviço `\Yiisoft\User\CurrentUser`:

```php
namespace App\Blog\Post;

use Yiisoft\User\CurrentUser;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Psr\Http\Message\ResponseInterface;

final readonly class PostController
{
    public function __construct(
        private PostRepositoryInterface $postRepository,
        private CurrentUser $user
    )
    {
    }

    public function update(#[RouteArgument('id')] int $id): ResponseInterface
    {
        $post = $this->postRepository->findByPK($id);
        if ($post === null) {
            // responda com 404
        }

        if (!$this->canCurrentUserUpdatePost($post)) {
            // responda com 403
        }

        // continue com a atualização do post
    }

    private function canCurrentUserUpdatePost(Post $post): bool
    {
        return $post->getAuthorId() === $this->user->getId() &&
            $this->user->can('updatePost');
    }
}
```

Por baixo dos panos, o método `Yiisoft\User\CurrentUser::can()` chama
`Yiisoft\Access\AccessCheckerInterface::userHasPermission()`, então você
precisa fornecer uma implementação no container de dependências para que ele
funcione.

## Controle de acesso baseado em papéis (RBAC)

O controle de acesso baseado em papéis (RBAC, Role-Based Access Control)
oferece um controle de acesso centralizado simples e flexível. Consulte a
[Wikipedia](https://en.wikipedia.org/wiki/Role-based_access_control) para
detalhes sobre a comparação do RBAC com outros esquemas de controle de
acesso mais tradicionais.

O Yii implementa um RBAC hierárquico geral, seguindo o [modelo RBAC do
NIST](https://csrc.nist.gov/CSRC/media/Publications/conference-paper/2000/07/26/the-nist-model-for-role-based-access-control-towards-a-unified-/documents/sandhu-ferraiolo-kuhn-00.pdf).

Usar RBAC envolve duas partes de trabalho. A primeira é montar os dados de
autorização do RBAC, e a segunda é usar esses dados para fazer a verificação
de acesso onde for necessário. Como o RBAC implementa
`\Yiisoft\Access\AccessCheckerInterface`, usá-lo é parecido com usar
qualquer outra implementação de verificador de acesso.

Para facilitar a explicação a seguir, primeiro alguns conceitos básicos de
RBAC.

### Conceitos básicos

Um papel representa um conjunto de *permissões* (por exemplo, criar posts,
atualizar posts).  Você pode atribuir um papel a um ou mais usuários.  Para
verificar se um usuário tem uma determinada permissão, você pode verificar
se ele tem um papel com essa permissão.

Cada papel ou permissão pode ter uma *regra* associada.  Uma regra
representa um trecho de código que o verificador de acesso executa para
decidir se o papel ou a permissão correspondente se aplica ao usuário
atual.  Por exemplo, a permissão "atualizar post" pode ter uma regra que
verifica se o usuário atual é o criador do post.  Durante a verificação de
acesso, se o usuário NÃO for o criador do post, ele não tem a permissão
"atualizar post".

Tanto papéis quanto permissões ficam em uma hierarquia.  Em particular, um
papel pode ser composto de outros papéis ou permissões.  E uma permissão
pode ser composta de outras permissões.  O Yii implementa uma hierarquia de
*ordem parcial*, que inclui a hierarquia mais específica em *árvore*.
Embora um papel possa conter uma permissão, o inverso não é verdadeiro.

### Configurando o RBAC

O RBAC do Yii exige que um armazenamento seja fornecido.

Um dos seguintes armazenamentos pode ser instalado:

- [Armazenamento PHP](https://github.com/yiisoft/rbac-php) - armazenamento
  em arquivos PHP;
- [Armazenamento em DB](https://github.com/yiisoft/rbac-db) - armazenamento
  em banco de dados baseado no [Yii DB](https://github.com/yiisoft/db);
- [Armazenamento Cycle DB](https://github.com/yiisoft/rbac-cycle-db) -
  armazenamento em banco de dados baseado no [Cycle
  DBAL](https://github.com/cycle/database).
  
Você também pode fornecer seu próprio armazenamento usando o pacote
[yiisoft/rbac](https://github.com/yiisoft/rbac).
  
#### Configurando o RBAC com o [armazenamento PHP](https://github.com/yiisoft/rbac-php)

Instale o pacote [yiisoft/rbac-php](https://github.com/yiisoft/rbac-php):

```
composer require yiisoft/rbac-php
```

Antes de definir os dados de autorização e fazer verificações de acesso,
você precisa configurar a `Yiisoft\Access\AccessCheckerInterface` no
container de dependências:

```php
use Yiisoft\Rbac\ItemsStorageInterface;
use Yiisoft\Rbac\AssignmentsStorageInterface;
use Yiisoft\Rbac\ManagerInterface;
use Yiisoft\Rbac\Php\ItemsStorage;
use Yiisoft\Rbac\Php\AssignmentsStorage;
use Yiisoft\Access\AccessCheckerInterface;
use Yiisoft\User\CurrentUser;

return [
    // ...
    ItemsStorageInterface::class => [
        'class' => ItemsStorage::class,
        '__construct()' => [
            'filePath' => $params['rbacItemsStorageFilePath']
        ]
    ],
    AssignmentsStorageInterface::class => [
        'class' => AssignmentsStorage::class,
        '__construct()' => [
            'filePath' => $params['rbacAssignmentsStorageFilePath']
        ]
    ],
    AccessCheckerInterface::class => ManagerInterface::class,

    CurrentUser::class => [
        'withAccessChecker()' => [Reference::to(AccessCheckerInterface::class)]
    ],
];
```

O `Yiisoft\Rbac\Manager` usa arquivos de script PHP para armazenar os dados
de autorização.  Garanta que o diretório e todos os arquivos dentro dele
tenham permissão de escrita para o processo do servidor web, se você quiser
alterar a hierarquia de permissões em tempo de execução.

#### Configurando o RBAC com o [armazenamento em DB](https://github.com/yiisoft/rbac-db)

Instale o pacote [yiisoft/rbac-db](https://github.com/yiisoft/rbac-db):

```
composer require yiisoft/rbac-db
```

Instale um dos seguintes drivers:
  - [SQLite](https://github.com/yiisoft/db-sqlite) (a versão mínima exigida é a 3.8.3)
  - [MySQL](https://github.com/yiisoft/db-mysql)
  - [PostgreSQL](https://github.com/yiisoft/db-pgsql)
  - [Microsoft SQL Server](https://github.com/yiisoft/db-mssql)
  - [Oracle](https://github.com/yiisoft/db-oracle)
  
[Configure a
conexão](https://yiisoft.github.io/docs/guide/start/databases.html#configuring-connection).

Antes de definir os dados de autorização e fazer verificações de acesso,
você precisa configurar a `Yiisoft\Access\AccessCheckerInterface` no
container de dependências:

```php
use Yiisoft\Rbac\ItemsStorageInterface;
use Yiisoft\Rbac\AssignmentsStorageInterface;
use Yiisoft\Rbac\ManagerInterface;
use Yiisoft\Rbac\Db\ItemsStorage;
use Yiisoft\Rbac\Db\AssignmentsStorage;
use Yiisoft\Access\AccessCheckerInterface;

return [
    // ...
    ItemsStorageInterface::class => ItemsStorage::class,
    AssignmentsStorageInterface::class => AssignmentsStorage::class,
    AccessCheckerInterface::class => ManagerInterface::class,
];
```

Adicione os caminhos das migrations do [armazenamento em
DB](https://github.com/yiisoft/rbac-db) do RBAC ao params.php:

```php
return [
    // ...
    'yiisoft/db-migration' => [
        'sourcePaths' => [
             __DIR__ . '/../../vendor/yiisoft/rbac-db/migrations/items',
             __DIR__ . '/../../vendor/yiisoft/rbac-db/migrations/assignments',
        ],
    ],
];
```

Aplique as migrations:

```
./yii migrate:up
```

### Montando os dados de autorização

Montar os dados de autorização consiste nas seguintes tarefas:

- definir papéis e permissões;
- estabelecer relações entre papéis e permissões;
- definir regras;
- associar regras a papéis e permissões;
- atribuir papéis a usuários.

Dependendo da flexibilidade de autorização exigida, você pode fazer essas
tarefas de maneiras diferentes.  Se apenas desenvolvedores alteram sua
hierarquia de permissões, você pode usar migrations ou um comando de
console.  A vantagem da migration é que você pode executá-la junto com as
outras migrations.  A vantagem do comando de console é que você tem uma boa
visão da hierarquia no código, sem precisar ler muitas migrations.

De qualquer forma, no fim você terá a seguinte hierarquia RBAC:

![Hierarquia RBAC simples](/images/guide/security/rbac-hierarchy-1.svg
"Hierarquia RBAC simples")

Caso você queira montar a hierarquia de permissões dinamicamente, precisa de
uma interface de usuário ou de um comando de console.  A API usada para
montar a hierarquia em si não muda.

### Usando um comando de console

Se a sua hierarquia de permissões não muda nunca e você tem um número fixo
de usuários, pode criar um [comando de
console](../tutorial/console-applications.md) que inicializa os dados de
autorização uma única vez, usando as APIs oferecidas por
`\Yiisoft\Rbac\ManagerInterface`:

```php
<?php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Yiisoft\Rbac\ManagerInterface;
use Yiisoft\Rbac\Permission;
use Yiisoft\Rbac\Role;
use Yiisoft\Yii\Console\ExitCode;

#[AsCommand(
    name: 'rbac:init',
    description: 'Builds RBAC hierarchy',
)]
final class RbacCommand extends Command
{
    private const CREATE_POST_PERMISSION = 'createPost';
    private const UPDATE_POST_PERMISSION = 'updatePost';
    private const ROLE_AUTHOR = 'author';
    private const ROLE_ADMIN = 'admin';

    public function __construct(private ManagerInterface $manager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->removeAll();

        $this->manager->addPermission((new Permission(RbacCommand::CREATE_POST_PERMISSION))->withDescription('Create a post'));
        $this->manager->addPermission((new Permission(RbacCommand::UPDATE_POST_PERMISSION))->withDescription('Update post'));

        // adiciona o papel "author" e dá a ele a permissão "createPost"
        $this->manager->addRole(new Role(RbacCommand::ROLE_AUTHOR));
        $this->manager->addChild(RbacCommand::ROLE_AUTHOR, RbacCommand::CREATE_POST_PERMISSION);

        // adiciona o papel "admin" e dá a ele a permissão "updatePost"
        // além das permissões do papel "author"
        $this->manager->addRole(new Role(RbacCommand::ROLE_ADMIN));
        $this->manager->addChild(RbacCommand::ROLE_ADMIN, RbacCommand::UPDATE_POST_PERMISSION);
        $this->manager->addChild(RbacCommand::ROLE_ADMIN, RbacCommand::ROLE_AUTHOR);

        // Atribui papéis aos usuários. 1 e 2 são IDs retornados por IdentityInterface::getId(),
        // normalmente implementado no seu model User.
        $this->manager->assign(RbacCommand::ROLE_AUTHOR, 2);
        $this->manager->assign(RbacCommand::ROLE_ADMIN, 1);

        return ExitCode::OK;
    }

    private function removeAll(): void
    {
        $this->manager->revokeAll(2);
        $this->manager->revokeAll(1);

        $this->manager->removeRole(RbacCommand::ROLE_ADMIN);
        $this->manager->removeRole(RbacCommand::ROLE_AUTHOR);

        $this->manager->removePermission(RbacCommand::CREATE_POST_PERMISSION);
        $this->manager->removePermission(RbacCommand::UPDATE_POST_PERMISSION);
    }
}
```

Adicione o comando em `config/console/commands.php`:

```php
return [ 
    // ...
    'rbac:init' => App\Command\RbacCommand::class
];
```
 
Você pode executar o comando acima no console da seguinte forma:

```
./yii rbac:init
```

> Se você não quer deixar fixo no código quais usuários têm determinados papéis, não coloque chamadas `->assign()` no comando. Em vez disso,
  crie uma interface de usuário ou um comando de console para gerenciar as atribuições.

#### Usando migrations

**TODO**: terminar quando as migrations forem implementadas.

Você pode usar [migrations](../databases/db-migrations.md)  para inicializar
e alterar a hierarquia via APIs oferecidas por
`\Yiisoft\Rbac\ManagerInterface`.

Crie uma nova migration com `./yii migrate:create init_rbac` e implemente a
criação da hierarquia:

```php
<?php
namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;
use Yiisoft\Rbac\ManagerInterface;
use Yiisoft\Rbac\Permission;
use Yiisoft\Rbac\Role;

final class M260112125812InitRbac implements RevertibleMigrationInterface
{
    private const CREATE_POST_PERMISSION = 'createPost';
    private const UPDATE_POST_PERMISSION = 'updatePost';
    private const ROLE_AUTHOR = 'author';
    private const ROLE_ADMIN = 'admin';

    public function __construct(private ManagerInterface $manager)
    {
    }

    public function up(MigrationBuilder $b): void
    {
        $this->manager->addPermission((new Permission(M260112125812InitRbac::CREATE_POST_PERMISSION))->withDescription('Create a post'));
        $this->manager->addPermission((new Permission(M260112125812InitRbac::UPDATE_POST_PERMISSION))->withDescription('Update post'));

        // adiciona o papel "author" e dá a ele a permissão "createPost"
        $this->manager->addRole(new Role(M260112125812InitRbac::ROLE_AUTHOR));
        $this->manager->addChild(M260112125812InitRbac::ROLE_AUTHOR, M260112125812InitRbac::CREATE_POST_PERMISSION);

        // adiciona o papel "admin" e dá a ele a permissão "updatePost"
        // além das permissões do papel "author"
        $this->manager->addRole(new Role(M260112125812InitRbac::ROLE_ADMIN));
        $this->manager->addChild(M260112125812InitRbac::ROLE_ADMIN, M260112125812InitRbac::UPDATE_POST_PERMISSION);
        $this->manager->addChild(M260112125812InitRbac::ROLE_ADMIN, M260112125812InitRbac::ROLE_AUTHOR);

        // Atribui papéis aos usuários. 1 e 2 são IDs retornados por IdentityInterface::getId(),
        // normalmente implementado no seu model User.
        $this->manager->assign(M260112125812InitRbac::ROLE_AUTHOR, 2);
        $this->manager->assign(M260112125812InitRbac::ROLE_ADMIN, 1);
    }

    public function down(MigrationBuilder $b): void
    {
        $this->manager->revokeAll(2);
        $this->manager->revokeAll(1);

        $this->manager->removeRole(M260112125812InitRbac::ROLE_ADMIN);
        $this->manager->removeRole(M260112125812InitRbac::ROLE_AUTHOR);

        $this->manager->removePermission(M260112125812InitRbac::CREATE_POST_PERMISSION);
        $this->manager->removePermission(M260112125812InitRbac::UPDATE_POST_PERMISSION);
    }
}
```

> Se você não quer deixar fixo no código quais usuários têm determinados papéis, não coloque chamadas `->assign()` nas migrations. Em vez disso,
  crie uma interface de usuário ou um comando de console para gerenciar as atribuições.

Você pode aplicar a migration com `./yii migrate:up`.

## Atribuindo papéis a usuários

TODO: atualizar quando o cadastro for implementado no demo / template.

O autor pode criar um post, o admin pode atualizar o post e fazer tudo o que
o autor pode.

Se sua aplicação permite o cadastro de usuários, você precisa atribuir
papéis a esses novos usuários imediatamente.  Por exemplo, para que todos os
usuários cadastrados se tornem autores no seu template de projeto avançado,
você precisa alterar `frontend\models\SignupForm::signup()` da seguinte
forma:

```php
public function signup()
{
    if ($this->validate()) {
        $user = new User();
        $user->username = $this->username;
        $user->email = $this->email;
        $user->setPassword($this->password);
        $user->generateAuthKey();
        $user->save(false);

        // as três linhas a seguir foram adicionadas:
        $authorRole = $this->manager->getRole('author');
        if ($authorRole !== null) {
            $this->manager->assign($authorRole->getName(), $user->getId());
        }

        return $user;
    }

    return null;
}
```

Para aplicações que exigem controle de acesso complexo com dados de
autorização atualizados dinamicamente (como um painel administrativo),
talvez você precise desenvolver interfaces de usuário específicas usando as
APIs oferecidas por `Yiisoft\Rbac\Manager`.


### Usando regras

Como mencionado, regras adicionam restrições extras a papéis e permissões.
Uma regra é uma classe que estende `\Yiisoft\Rbac\Rule`.  Ela deve
implementar o método `execute()`.  Na hierarquia que você criou antes, o
autor não pode editar o próprio post.  Vamos corrigir isso. Primeiro, você
precisa de uma regra para verificar se o usuário é o autor do post:

```php
namespace App\User\Rbac;

use Yiisoft\Rbac\Item;
use Yiisoft\Rbac\RuleContext;
use Yiisoft\Rbac\RuleInterface;

/**
 * Checks if the authorID matches user passed via params.
 */
final readonly class AuthorRule implements RuleInterface
{
    public function execute(?string $userId, Item $item, RuleContext $context): bool
    {
        $post = $context->getParameterValue('post');
        return $post !== null && $post->getAuthorId() == $userId;
    }
}
```

A regra verifica se o usuário criou o `post`. Crie uma permissão especial
`updateOwnPost` no comando que você usou antes:

```php
use Yiisoft\Rbac\Permission;
use Yiisoft\Rbac\ManagerInterface;

// adiciona a permissão "updateOwnPost" e associa a regra a ela.
$updateOwnPost = (new Permission('updateOwnPost'))
    ->withDescription('Update own post')
    ->withRuleName(AuthorRule::class);
$this->manager->addPermission($updateOwnPost);

// "updateOwnPost" será usada a partir de "updatePost"
$this->manager->addChild($updateOwnPost->getName(), $updatePost->getName());

// permite que "author" atualize os próprios posts
$this->manager->addChild($authorRole->getName(), $updateOwnPost->getName());

// Remova esta linha, já que não queremos que a AuthorRule seja aplicada ao papel 'admin'
$this->manager->addChild('admin', 'author');
```

Agora você tem a seguinte hierarquia:

![Hierarquia RBAC com uma regra](/images/guide/security/rbac-hierarchy-2.svg
"Hierarquia RBAC com uma regra")


### Verificação de acesso

A verificação é feita de forma semelhante à da primeira seção deste guia:

```php
namespace App\Blog\Post;

use Yiisoft\User\CurrentUser;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Psr\Http\Message\ResponseInterface;

final readonly class PostController
{
    public function __construct(
        private PostRepositoryInterface $postRepository,
        private CurrentUser $user
    )
    {
    }

    public function update(#[RouteArgument('id')] int $id): ResponseInterface
    {
        $post = $this->postRepository->findByPK($id);
        if ($post === null) {
            // responda com 404
        }

        if (!$this->canCurrentUserUpdatePost($post)) {
            // responda com 403
        }

        // continue com a atualização do post
    }

    private function canCurrentUserUpdatePost(Post $post): bool
    {
        return $this->user->can('updatePost', ['post' => $post]);
    }
}
```

A diferença é que agora a verificação do próprio post do usuário faz parte
do RBAC.

Se o usuário atual for Jane, com `ID=1`, você começa em `createPost` e tenta
chegar a `Jane`:

![Verificação de acesso](/images/guide/security/rbac-access-check-1.svg
"Verificação de acesso")

Para verificar se um usuário pode atualizar um post, você precisa passar um
parâmetro extra exigido pela `AuthorRule` descrita antes:

```php
if ($user->can('updatePost', ['post' => $post])) {
    // atualiza o post
}
```

Veja o que acontece se o usuário atual for John:


![Verificação de acesso](/images/guide/security/rbac-access-check-2.svg
"Verificação de acesso")

Você começa em `updatePost` e passa por `updateOwnPost`. Para passar na verificação de acesso, a `AuthorRule`
deve retornar `true` no método `execute()`. O método recebe seus `$params` da chamada do método `can()`, então o valor é
`['post' => $post]`.
Se tudo estiver certo, você chega a `author`, atribuído a John.

No caso de Jane, é um pouco mais simples, já que ela é admin:

![Verificação de acesso](/images/guide/security/rbac-access-check-3.svg
"Verificação de acesso")

## Implementando seu próprio verificador de acesso

Se o RBAC não atende às suas necessidades, você pode implementar seu próprio
verificador de acesso sem alterar o código da aplicação:


```php
namespace App\User;

use \Yiisoft\Access\AccessCheckerInterface;

final readonly class AccessChecker implements AccessCheckerInterface
{
    private const PERMISSIONS = [
        [
            1 => ['editPost'],
            42 => ['editPost', 'deletePost'],
        ],
    ];

    public function userHasPermission($userId, string $permissionName, array $parameters = []) : bool
    {
        if (!array_key_exists($userId, self::PERMISSIONS)) {
            return false;
        }

        return in_array($permissionName, self::PERMISSIONS[$userId], true); 
    }
}
```
