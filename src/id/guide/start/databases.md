# Working with databases

Yii doesn't dictate using a particular database or storage for your
application.  There are many ways you can work with relational databases:

- [Yii DB](https://github.com/yiisoft/db)
- [Yii Active Record](https://github.com/yiisoft/active-record)
- [Cycle](https://github.com/cycle) via [Yii Cycle
  package](https://github.com/yiisoft/yii-cycle)
- [Doctrine](https://www.doctrine-project.org/) via [Yii Doctrine
  package](https://github.com/stargazer-team/yii-doctrine)
- [PDO](https://www.php.net/manual/en/book.pdo.php)

For non-relational ones, there are usually official libraries available:

- [ElasticSearch](https://github.com/elastic/elasticsearch-php)
- [Redis](https://redis.io/docs/latest/develop/clients/php/)
- ...

In this guide, we will focus on working with relational databases using Yii
DB. We'll use PostgreSQL to implement a simple CRUD (create read update
delete).

## Installing PostgreSQL

You need to install PostgreSQL. If you prefer not to use Docker, [get the
installer from official website](https://www.postgresql.org/download/),
install it and create a database.

If you use Docker, it is a bit simpler. Modify `docker/dev/compose.yml`:

```yaml
services:
    app:
        build:
            dockerfile: docker/Dockerfile
            context: ..
            target: dev
            args:
                USER_ID: ${UID}
                GROUP_ID: ${GID}
        env_file:
            -   path: ./dev/.env
            -   path: ./dev/override.env
                required: false
        ports:
            - "${DEV_PORT:-80}:80"
        volumes:
            - ../:/app
            - ../runtime:/app/runtime
            - caddy_data:/data
            - caddy_config:/config
        tty: true
        depends_on:
            db:
                condition: service_healthy

    db:
        image: postgres:${POSTGRES_VERSION:-15}-alpine
        environment:
            POSTGRES_DB: app
            POSTGRES_PASSWORD: password
            POSTGRES_USER: user
        volumes:
            - ../runtime/db:/var/lib/postgresql/data:rw
        ports:
            - "${DEV_DB_PORT:-5432}:5432"
        healthcheck:
            test: [ "CMD-SHELL", "pg_isready -U user -d app" ]
            interval: 5s
            timeout: 5s
            retries: 5

volumes:
    db:
```

Note that we add `depends_on` so application waits for database to be up.

Also, we'll need a `pdo_pgsql` extension to communicate with PostgreSQL. You
can enable it locally in `php.ini`.  If you use Docker, check
`docker/Dockerfile` and add `pdo_pgsql` in `install-php-extensions`
list. Then rebuild PHP image with `make build && make down && make up`.

## Configuring connection

Now that we have the database, it's time to define the connection.

First we need a package to be installed:

```sh
make composer require yiisoft/db-pgsql
```

Now create `config/common/di/db-pgsql.php`:

```php
<?php

use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Pgsql\Connection;
use Yiisoft\Db\Pgsql\Driver;

/** @var array $params */

return [
    ConnectionInterface::class => [
        'class' => Connection::class,
        '__construct()' => [
            'driver' => new Driver(
                $params['yiisoft/db-pgsql']['dsn'],
                $params['yiisoft/db-pgsql']['username'],
                $params['yiisoft/db-pgsql']['password'],
            ),
        ],
    ],
];
```

And define parameters in `config/common/params.php`. For Docker that would
be:

```php
use Yiisoft\Db\Pgsql\Dsn;

return [
    // ...
    'yiisoft/db-pgsql' => [
        'dsn' => new Dsn('pgsql', 'db', 'app', '5432'),
        'username' => 'user',
        'password' => 'password',
    ],
];
```

`db` host is resolved automatically within the Docker network.

For local installation without Docker the host in Dsn would be
`localhost`. You'll have to adjust the rest to match how you configured the
database.

## Creating and applying migrations

For the initial state of the application and for further database changes,
it is a good idea to use migrations.  These are files that create database
changes. Applied migrations are tracked in the database, allowing us to know
the current state and which migrations remain to be applied.

To use migrations we need another package installed:

```sh
make composer require yiisoft/db-migration
```

Create a directory to store migrations `src/Migration` right in the project
root. Add the following configuration to `config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

Now you can use `make yii migrate:create page` to create a new
migration. For our example we need a `page` table with some columns:

```php
<?php

declare(strict_types=1);

namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M251102141707Page implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $column = $b->columnBuilder();

        $b->createTable('page', [
            'id' => $column::uuidPrimaryKey(),
            'title' => $column::string()->notNull(),
            'slug' => $column::string()->notNull()->unique(),
            'text' => $column::text()->notNull(),
            'created_at' => $column::dateTime(),
            'updated_at' => $column::dateTime(),
        ]);
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('page');
    }
}
```

The `M251102141707Page` name of the migration class is generated so replace
the `Page` suffix with the actual migration name. The `M251102141707` prefix
is needed to find and sort migrations in the order they were added.

Note that we use UUID as the primary key. We are going to generate these IDs
ourselves instead of relying on database so we'll need an extra compose
package for that.

```shell
make composer require ramsey/uuid
```

While the storage space is a bit bigger than using int, the workflow with
such IDs is beneficial. Since you generate the ID yourself so you can define
a set of related data and save it in a single transaction.  The entities
that define this set of data in the code are often called an "aggregate".

Apply the migration with `make yii migrate:up`.

## An entity

Now that you have a table it is time to define an entity in the code. Create
`src/Web/Page/Page.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use DateTimeImmutable;
use Yiisoft\Strings\Inflector;

final readonly class Page
{
    private function __construct(
        public string $id,
        public string $title,
        public string $text,
        public DateTimeImmutable $createdAt,
        public DateTimeImmutable $updatedAt,
    ) {}

    public static function create(
        string $id,
        string $title,
        string $text,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
    ): self {
        return new self(
            id: $id,
            title: $title,
            text: $text,
            createdAt: $createdAt ?? new DateTimeImmutable(),
            updatedAt: $updatedAt ?? new DateTimeImmutable(),
        );
    }

    public function getSlug(): string
    {
        return (new Inflector())->toSlug($this->title);
    }
}
```

## Repository

Now that we have entity, we need a place for methods to save an entity,
delete it and select either a single page or multiple pages.

Create `src/Web/Page/PageRepository.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use DateTimeImmutable;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Query\Query;

final readonly class PageRepository
{
    public function __construct(
        private ConnectionInterface $connection,
    ) {}

    public function save(Page $page): void
    {
        $data = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->getSlug(),
            'text' => $page->text,
            'created_at' => $page->createdAt,
            'updated_at' => $page->updatedAt,
        ];

        if ($this->exists($page->id)) {
            $this->connection->createCommand()->update('{{%page}}', $data, ['id' => $page->id])->execute();
        } else {
            $this->connection->createCommand()->insert('{{%page}}', $data)->execute();
        }
    }

    public function findOneBySlug(string $slug): ?Page
    {
        $query = $this->connection
            ->select()
            ->from('{{%page}}')
            ->where('slug = :slug', ['slug' => $slug]);

        return $this->createPage($query->one());
    }

    /**
     * @return iterable<Page>
     */
    public function findAll(): iterable
    {
        $data = $this->connection
            ->select()
            ->from('{{%page}}')
            ->all();

        foreach ($data as $page) {
            yield $this->createPage($page);
        }
    }

    private function createPage(?array $data): ?Page
    {
        if ($data === null) {
            return null;
        }

        return Page::create(
            id: $data['id'],
            title: $data['title'],
            text: $data['text'],
            createdAt: new DateTimeImmutable($data['created_at']),
            updatedAt: new DateTimeImmutable($data['updated_at']),
        );
    }

    public function deleteBySlug(string $slug): void
    {
        $this->connection->createCommand()->delete(
            '{{%page}}',
            ['slug' => $slug],
        )->execute();
    }

    public function exists(string $id): bool
    {
        return $this->connection->createQuery()
            ->from('{{%page}}')
            ->where(['id' => $id])
            ->exists();
    }
}
```

In this repository there are both methods to get data and `save()` to do
insert or update. DB returns raw data as arrays but our repository
automatically creates entities from this raw data so later we operate typed
data.

## Actions and routes

We need some actions to:

1. List all pages.
2. View a page.
3. Delete a page.
4. Create a page.
5. Update a page.

Then we need routing for all these.

Let's tackle these one by one.

### List all pages

Create `src/Web/Page/ListAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class ListAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private PageRepository $pageRepository,
    )
    {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/list', [
            'pages' => $this->pageRepository->findAll(),
        ]);
    }
}
```

Define list view in `src/Web/Page/list.php`:

```php
<?php
use App\Web\Page\Page;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;

/** @var iterable<Page> $pages */
/** @var UrlGeneratorInterface $urlGenerator */
?>

<ul>
    <?php foreach ($pages as $page): ?>
    <li>
        <?= Html::a($page->title, $urlGenerator->generate('page/view', ['slug' => $page->getSlug()])) ?>
    </li>
    <?php endforeach ?>
</ul>

<?= Html::a('Create', $urlGenerator->generate('page/edit', ['slug' => 'new'])) ?>
```

### View a page

Create `src/Web/Page/ViewAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class ViewAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private PageRepository $pageRepository,
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug,
    ): ResponseInterface {
        $page = $this->pageRepository->findOneBySlug($slug);
        if ($page === null) {
            return $this->responseFactory->createResponse(Status::NOT_FOUND);
        }

        return $this->viewRenderer->render(__DIR__ . '/view', [
            'page' => $page,
        ]);
    }
}
```

Now, a template in `src/Web/Page/view.php`:

```php
<?php
use App\Web\Page\Page;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/** @var Page $page */
/** @var UrlGeneratorInterface $urlGenerator */
/* @var Csrf $csrf */
?>

<h1><?= Html::a('Pages', $urlGenerator->generate('page/list')) ?> → <?= Html::encode($page->title) ?></h1>

<p>
    <?= Html::encode($page->text) ?>
</p>

<?= Html::a('Edit', $urlGenerator->generate('page/edit', ['slug' => $page->getSlug()])) ?> |


<?php
    $deleteForm = Html::form()
        ->post($urlGenerator->generate('page/delete', ['slug' => $page->getSlug()]))
        ->csrf($csrf);
?>
<?= $deleteForm->open() ?>
    <?= Html::submitButton('Delete') ?>
<?= $deleteForm->close() ?>
```

In this view we have a form that submits a request for page
deletion. Handing it with `GET` is common as well, but it is very
wrong. Since deletion changes data, it needs to be handled by one of the
non-idempotent HTTP methods.  We use POST and a form in our example, but it
could be `DELETE` and async request made with JavaScript.  The button could
be later styled properly to look similar to the "Edit".

### Delete a page

Create `src/Web/Page/DeleteAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class DeleteAction
{
    public function __construct(
        private PageRepository $pageRepository,
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug
    ): ResponseInterface
    {
        $this->pageRepository->deleteBySlug($slug);

        return $this->responseFactory
            ->createResponse(Status::SEE_OTHER)
            ->withHeader('Location', $this->urlGenerator->generate('page/list'));
    }
}
```

### Create or update a page

First of all, we need a form at `src/Web/Page/Form.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Label;
use Yiisoft\Validator\Rule\Length;

final class Form extends FormModel
{
    #[Label('Title')]
    #[Length(min: 2)]
    public string $title = '';

    #[Label('Text')]
    #[Length(min: 2)]
    public string $text = '';
}
```

Then an action. Create `src/Web/Page/EditAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use DateTimeImmutable;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Ramsey\Uuid\Uuid;
use Yiisoft\FormModel\FormHydrator;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class EditAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private FormHydrator $formHydrator,
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug,
        ServerRequestInterface $request,
        PageRepository $pageRepository,
    ): ResponseInterface
    {
        $isNew = $slug === 'new';

        $form = new Form();

        if (!$isNew) {
            $page = $pageRepository->findOneBySlug($slug);
            if ($page === null) {
                return $this->responseFactory->createResponse(Status::NOT_FOUND);
            }

            $form->title = $page->title;
            $form->text = $page->text;
        }

        $this->formHydrator->populateFromPostAndValidate($form, $request);

        if ($form->isValid()) {
            $id = $isNew ? Uuid::uuid7()->toString() : $page->id;

            $page = Page::create(
                id: $id,
                title: $form->title,
                text: $form->text,
                updatedAt: new DateTimeImmutable(),
            );

            $pageRepository->save($page);

            return $this->responseFactory
                ->createResponse(Status::SEE_OTHER)
                ->withHeader(
                    'Location',
                    $this->urlGenerator->generate('page/view', ['slug' => $page->getSlug()]),
                );
        }

        return $this->viewRenderer->render(__DIR__ . '/edit', [
            'form' => $form,
            'isNew' => $isNew,
            'slug' => $slug,
        ]);
    }
}
```

Note that `Uuid::uuid7()->toString()` won't work for MySQL and you'll need bytes instead, `Uuid::uuid7()->getBytes()`.

In the above we use a special slug in the URL for new pages so the URL looks
like `http://localhost/pages/new`. If the page isn't new, we pre-fill the
form with the data from the database. Similar to how we did in [Working with
forms](forms.md), we handle the form submission. After successful save we
redirect to the page view.

Now, a template in `src/Web/Page/edit.php`:

```php
<?php
use App\Web\Page\Form;
use Yiisoft\FormModel\Field;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/**
 * @var Form $form
 * @var string[] $errors
 * @var UrlGeneratorInterface $urlGenerator
 * @var Csrf $csrf
 * @var bool $isNew
 * @var string $slug
 */

$htmlForm = Html::form()
    ->post($urlGenerator->generate('page/edit', ['slug' => $slug]))
    ->csrf($csrf);
?>

<?= $htmlForm->open() ?>
    <?= Field::text($form, 'title')->required() ?>
    <?= Field::textarea($form, 'text')->required() ?>
    <?= Html::submitButton('Save') ?>
<?= $htmlForm->close() ?>
```

### Routing

Adjust `config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Http\Method;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::methods([Method::GET, Method::POST], '/say')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),

            Group::create('/pages')->routes(
                Route::get('')
                    ->action(Web\Page\ListAction::class)
                    ->name('page/list'),
                Route::get('/{slug}')
                    ->action(Web\Page\ViewAction::class)
                    ->name('page/view'),
                Route::methods([Method::GET, Method::POST], '/{slug}/edit')
                    ->action(Web\Page\EditAction::class)
                    ->name('page/edit'),
                Route::post('/{slug}/delete')
                    ->action(Web\Page\DeleteAction::class)
                    ->name('page/delete'),
            ),
        ),
];
```

Note that we've grouped all page-related routes with a group under `/pages`
prefix. That is a convenient way to both not to repeat yourself and add some
extra middleware, such as authentication, to the whole group.

## Trying it out

Now try it out by opening `http://localhost/pages` in your browser.

