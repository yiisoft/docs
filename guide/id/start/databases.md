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
- [Redis](https://redis.io/docs/clients/#php)
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

Let's use latest versions to be released. Change your `minimum-stability` to
`dev` in `composer.json` first.

Then we need a package to be installed:

```sh
make composer require yiisoft/db-pgsql dev-master
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
composer require yiisoft/db-migration dev-master
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

/**
 * Class M251102141707Page
 */
final class M251102141707Page implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $cb = $b->columnBuilder();

        $b->createTable('page', [
            'id' => $cb::uuidPrimaryKey(),
            'title' => $cb::string()->notNull(),
            'slug' => $cb::string()->notNull(),
            'text' => $cb::text()->notNull(),
            'created_at' => $cb::dateTime(),
            'updated_at' => $cb::dateTime(),
            'deleted_at' => $cb::dateTime(),
        ]);
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('page');
    }
}
```

Note that we use UUID as the primary key. While the storage space is a bit
bigger than using int, the workflow with such IDs is beneficial. You
generate the ID yourself so you can define a set of related data and save it
in a single transaction. The entities that define this set of data in the
code are often called an "aggregate".

Apply it with `make yii migrate:up`.

## An entity

Now that you have a table it is time to define an entity in the code. Create
`src/Web/Page/Page.php`:

```php
<?php

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
        public ?DateTimeImmutable $deletedAt = null,
    ) {}

    public static function create(
        string $id,
        string $title,
        string $text,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
    ): self {
        return new self(
            id: $id,
            title: $title,
            text: $text,
            createdAt: $createdAt ?? new DateTimeImmutable(),
            updatedAt: $updatedAt ?? new DateTimeImmutable(),
            deletedAt: $deletedAt,
        );
    }

    public function getSlug(): string
    {
        return (new Inflector())->toSlug($this->title);
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }
}
```

## Repository

Now that we have entity, we need a place for methods to save an entity,
delete it and select either a single page or multiple pages.

Create `src/Web/Page/PageRepository.php`:

```php
<?php

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
        $this->connection->createCommand()->upsert('{{%page}}', [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->getSlug(),
            'text' => $page->text,
            'created_at' => $page->createdAt,
            'updated_at' => $page->updatedAt,
            'deleted_at' => $page->deletedAt,
        ])->execute();
    }

    public function findOneBySlug(string $slug): ?Page
    {
        $data = (new Query($this->connection))
            ->select('*')
            ->from('{{%page}}')
            ->where('slug = :slug', ['slug' => $slug])
            ->one();

        if ($data === null) {
            return null;
        }

        return $this->createPage($data);
    }

    /**
     * @return iterable<Page>
     */
    public function findAll(): iterable
    {
        $data = (new Query($this->connection))
            ->select('*')
            ->from('{{%page}}')
            ->all();

        foreach ($data as $page) {
            yield $this->createPage($page);
        }
    }

    private function createPage(array $data): Page
    {
        return Page::create(
            id: $data['id'],
            title: $data['title'],
            text: $data['text'],
            createdAt: new DateTimeImmutable($data['created_at']),
            updatedAt: new DateTimeImmutable($data['updated_at']),
            deletedAt: $data['deleted_at'] ? new DateTimeImmutable($data['deleted_at']) : null,
        );
    }

    public function delete(string $id): void
    {
        $this->connection->createCommand()->delete('{{%page}}', ['id' => $id])->execute();
    }
}
```

## Actions and routes

You need actions to:

1. List all pages.
2. View a page.
3. Delete a page.
4. Create a page.
5. Edit a page.

> [!NOTE]
> [← Working with forms](forms.md) |
> [Generating code with Gii →](gii.md)
