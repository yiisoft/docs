# Authorization

Authorization is the process of verifying that a user has enough permission to do something.

## Checking for permission <span id="checking-for-permission"></span>

You can check if a user has certain permissions by using `\Yiisoft\User\CurrentUser` service:

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
            // respond with 404
        }

        if (!$this->canCurrentUserUpdatePost($post)) {
            // respond with 403
        }

        // continue with updating the post
    }

    private function canCurrentUserUpdatePost(Post $post): bool
    {
        return $post->getAuthorId() === $this->user->getId() &&
            $this->user->can('updatePost');
    }
}
```

Behind the scenes, `Yiisoft\User\CurrentUser::can()` method calls `Yiisoft\Access\AccessCheckerInterface::userHasPermission()`
so you should provide an implementation in dependency container in order for it to work. 

## Role-based access control (RBAC) <span id="rbac"></span>

Role-Based Access Control (RBAC) provides a simple yet powerful centralized access control. Please refer to
the [Wikipedia](https://en.wikipedia.org/wiki/Role-based_access_control) for details about comparing RBAC
with other more traditional access control schemes.

Yii implements a General Hierarchical RBAC, following the [NIST RBAC model](https://csrc.nist.gov/CSRC/media/Publications/conference-paper/2000/07/26/the-nist-model-for-role-based-access-control-towards-a-unified-/documents/sandhu-ferraiolo-kuhn-00.pdf).

Using RBAC involves two parts of work. The first part is to build up the RBAC authorization data, and the second
part is to use the authorization data to perform access check in places where it's necessary. Since RBAC implements
`\Yiisoft\Access\AccessCheckerInterface`, using it's similar to using any other implementation of an access checker.

To ease description next, there are some basic RBAC concepts first.

### Basic concepts <span id="basic-concepts"></span>

A role represents a collection of *permissions* (for example, creating posts, updating posts).
You may assign a role to one or many users.
To check if a user has a specified permission, you may check if the user has a role with that permission.

Associated with each role or permission, there may be a *rule*.
A rule represents a piece of code that an access checker
will execute to decide if the corresponding role or permission applies to the current user.
For example, the "update post" permission may have a rule that checks if the current user is the post creator.
During access checking, if the user is NOT the post creator, there's no "update post" permission.

Both roles and permissions are in a hierarchy.
In particular, a role may consist of other roles or permissions.
And a permission may consist of other permissions.
Yii implements a *partial order* hierarchy which includes the more special *tree* hierarchy.
While a role can contain a permission, it isn't `true` vice versa.

### Configuring RBAC <span id="configuring-rbac"></span>

Yii RBAC requires storage to be provided.

One of the following storages could be installed:

- [PHP storage](https://github.com/yiisoft/rbac-php) - PHP file storage;
- [DB storage](https://github.com/yiisoft/rbac-db) - database storage based on [Yii DB](https://github.com/yiisoft/db);
- [Cycle DB storage](https://github.com/yiisoft/rbac-cycle-db) - database storage based on
  [Cycle DBAL](https://github.com/cycle/database).
  
You can also provide your own storage using the [yiisoft/rbac](https://github.com/yiisoft/rbac) package.
  
#### Configuring RBAC with the [PHP storage](https://github.com/yiisoft/rbac-php) <span id="configuring-rbac-php"></span>

Install [yiisoft/rbac-php](https://github.com/yiisoft/rbac-php) package:

```
composer require yiisoft/rbac-php
```

Before we set off to define authorization data and perform access checking, you need to configure the
`Yiisoft\Access\AccessCheckerInterface` in dependency container:

```php
use Yiisoft\Rbac\ItemsStorageInterface;
use Yiisoft\Rbac\AssignmentsStorageInterface;
use Yiisoft\Rbac\ManagerInterface;
use Yiisoft\Rbac\Php\ItemsStorage;
use Yiisoft\Rbac\Php\AssignmentsStorage;
use Yiisoft\Access\AccessCheckerInterface;

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
];
```

`Yiisoft\Rbac\Manager` uses PHP script files to store authorization data.
Make sure the directory and all the files in it are writable by the Web server process if you want to change permission
hierarchy online.

#### Configuring RBAC with the [DB storage](https://github.com/yiisoft/rbac-db) <span id="configuring-rbac-db"></span>

Install [yiisoft/rbac-db](https://github.com/yiisoft/rbac-db) package:

```
composer require yiisoft/rbac-db
```

Install one of the following drivers:
  - [SQLite](https://github.com/yiisoft/db-sqlite) (minimal required version is 3.8.3)
  - [MySQL](https://github.com/yiisoft/db-mysql)
  - [PostgreSQL](https://github.com/yiisoft/db-pgsql)
  - [Microsoft SQL Server](https://github.com/yiisoft/db-mssql)
  - [Oracle](https://github.com/yiisoft/db-oracle)
  
[Configure connection](https://yiisoft.github.io/docs/guide/start/databases.html#configuring-connection).

Before we set off to define authorization data and perform access checking, you need to configure the
`Yiisoft\Access\AccessCheckerInterface` in dependency container:

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

Add the RBAC [DB storage](https://github.com/yiisoft/rbac-db) migration paths to params.php:

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

Apply migrations:

```
APP_ENV=dev ./yii migrate:up
```

### Building authorization data <span id="generating-rbac-data"></span>

Building authorization data is all about the following tasks:

- defining roles and permissions;
- establishing relations between roles and permissions;
- defining rules;
- associating rules with roles and permissions;
- assigning roles to users.

Depending on authorization flexibility requirements, you can do the tasks in different ways.
If only developers change your permission hierarchy, you can use either migrations or a console command.
Migration advantage is that you could execute it along with other migrations.
The Console command advantage is that you have a good overview of the hierarchy in the code without a need
to read many migrations.

Either way, in the end, you'll get the following RBAC hierarchy:

![Simple RBAC hierarchy](/images/guide/security/rbac-hierarchy-1.svg "Simple RBAC hierarchy")

In case you want to build permission hierarchy dynamically, you need a UI or a console command.
The API used to build the hierarchy itself won't be different.

### Using console command

If your permission hierarchy doesn't change at all, and you have a fixed number of users, you can create a
[console command](../tutorial/console-applications.md) that will initialize authorization data once via
APIs offered by `\Yiisoft\Rbac\ManagerInterface`:

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

        // add the "author" role and give this role the "createPost" permission
        $this->manager->addRole(new Role(RbacCommand::ROLE_AUTHOR));
        $this->manager->addChild(RbacCommand::ROLE_AUTHOR, RbacCommand::CREATE_POST_PERMISSION);

        // add the "admin" role and give this role the "updatePost" permission
        // as well as the permissions of the "author" role
        $this->manager->addRole(new Role(RbacCommand::ROLE_ADMIN));
        $this->manager->addChild(RbacCommand::ROLE_ADMIN, RbacCommand::UPDATE_POST_PERMISSION);
        $this->manager->addChild(RbacCommand::ROLE_ADMIN, RbacCommand::ROLE_AUTHOR);

        // Assign roles to users. 1 and 2 are IDs returned by IdentityInterface::getId()
        // usually implemented in your User model.
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

Add the command to `config/console/commands.php`:

```php
return [ 
    // ...
    'rbac:init' => App\Command\RbacCommand::class
];
```
 
You can execute the command above from the console the following way:

```
APP_ENV=dev ./yii rbac:init
```

> If you don't want to hardcode what users have certain roles, don't put `->assign()` calls into the command. Instead,
  create either UI or console command to manage assignments.

#### Using migrations

**TODO**: finish it when migrations are implemented.

You can use [migrations](../databases/db-migrations.md)
to initialize and change hierarchy via APIs offered by `\Yiisoft\Rbac\ManagerInterface`.

Create new migration using `APP_ENV=dev ./yii migrate:create init_rbac` then implement creating a hierarchy:

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

        // add the "author" role and give this role the "createPost" permission
        $this->manager->addRole(new Role(M260112125812InitRbac::ROLE_AUTHOR));
        $this->manager->addChild(M260112125812InitRbac::ROLE_AUTHOR, M260112125812InitRbac::CREATE_POST_PERMISSION);

        // add the "admin" role and give this role the "updatePost" permission
        // as well as the permissions of the "author" role
        $this->manager->addRole(new Role(M260112125812InitRbac::ROLE_ADMIN));
        $this->manager->addChild(M260112125812InitRbac::ROLE_ADMIN, M260112125812InitRbac::UPDATE_POST_PERMISSION);
        $this->manager->addChild(M260112125812InitRbac::ROLE_ADMIN, M260112125812InitRbac::ROLE_AUTHOR);

        // Assign roles to users. 1 and 2 are IDs returned by IdentityInterface::getId()
        // usually implemented in your User model.
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

> If you don't want to hardcode which users have certain roles, don't put `->assign()` calls in migrations. Instead,
  create either UI or console command to manage assignments.

You could apply migration by using `APP_ENV=dev ./yii migrate:up`.

## Assigning roles to users

TODO: update when signup implemented in demo / template.

The author can create a post, admin can update the post and do everything the author can.

If your application allows user signup, you need to assign roles to these new users at once.
For example, in order for all signed-up users to become authors in your advanced project template, you need
to change `frontend\models\SignupForm::signup()` as follows:

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

        // the following three lines were added:
        $auth = \Yii::$app->authManager;
        $authorRole = $auth->getRole('author');
        $auth->assign($authorRole, $user->getId());

        return $user;
    }

    return null;
}
```

For applications that require complex access control with dynamically updated authorization data
(such as an admin panel), you many need to develop special user interfaces using APIs offered by `authManager`.


### Using rules <span id="using-rules"></span>

As aforementioned, rules add extra constraint to roles and permissions.
A rule is a class extending from `\Yiisoft\Rbac\Rule`.
It must implement the `execute()` method. 
In the hierarchy you've created before, the author can't edit his own post.
Let's fix it. First, you need a rule to verify that the user is the post author:

```php
namespace App\User\Rbac;

use Yiisoft\Rbac\Item;
use \Yiisoft\Rbac\Rule;

/**
 * Checks if the authorID matches user passed via params.
 */
final readonly class AuthorRule extends Rule
{
    private const NAME = 'isAuthor';

    public function __construct() {
        parent::__construct(self::NAME);
    }

    public function execute(string $userId, Item $item, array $parameters = []): bool
    {
        return isset($params['post']) ? $params['post']->getAuthorId() == $userId : false;
    }
}
```

The rule checks if user created the `post`. Create a special permission `updateOwnPost` in the command you've used before:

```php
/** @var \Yiisoft\Rbac\ManagerInterface $auth */

// add the rule
$rule = new AuthorRule();
$auth->add($rule);

// add the "updateOwnPost" permission and associate the rule with it.
$updateOwnPost = (new \Yiisoft\Rbac\Permission('updateOwnPost'))
    ->withDescription('Update own post')
    ->withRuleName($rule->getName());
$auth->add($updateOwnPost);

// "updateOwnPost" will be used from "updatePost"
$auth->addChild($updateOwnPost, $updatePost);

// allow "author" to update their own posts
$auth->addChild($author, $updateOwnPost);
```

Now you've got the following hierarchy:

![RBAC hierarchy with a rule](/images/guide/security/rbac-hierarchy-2.svg "RBAC hierarchy with a rule")


### Access check <span id="access-check"></span>

The check is done similarly to how it was done in the first section of this guide:

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
            // respond with 404
        }

        if (!$this->canCurrentUserUpdatePost($post)) {
            // respond with 403
        }

        // continue with updating the post
    }

    private function canCurrentUserUpdatePost(Post $post): bool
    {
        return $this->user->can('updatePost', ['post' => $post]);
    }
}
```

The difference is that now checking for a user's own post is part of the RBAC.

If the current user is Jane with `ID=1` you are starting at `createPost` and trying to get to `Jane`:

![Access check](/images/guide/security/rbac-access-check-1.svg "Access check")

To check if a user can update a post,
you need to pass an extra parameter that's required by `AuthorRule` described before:

```php
if ($user->can('updatePost', ['post' => $post])) {
    // update post
}
```

Here is what happens if the current user is John:


![Access check](/images/guide/security/rbac-access-check-2.svg "Access check")

You're starting with the `updatePost` and going through `updateOwnPost`. To pass the access check, `AuthorRule`
should return `true` from its `execute()` method. The method receives its `$params` from the `can()` method call, so the value is
`['post' => $post]`.
If everything is fine, you will get to `author` assigned to John.

In the case of Jane, it's a bit simpler since she is an admin:

![Access check](/images/guide/security/rbac-access-check-3.svg "Access check")

## Implementing your own access checker

If RBAC doesn't suit your needs, you can implement your own access checker without changing the application code:


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
