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
            - path: ./dev/.env
            - path: ./dev/override.env
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
          - ./runtime/db:/var/lib/postgresql/data:rw
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

Now that we have the database, it's time to define the connection. We need a
package to be installed first:

```sh
composer require yiisoft/db-pgsql
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
        'dsn' => (new Dsn('pgsql', 'db', 'app', '5432'))->asString(),
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
it is a good idea to use migrations. These are files creating changes to be
applied to the database. Which are applied is tracked in the same database
so we always know which state is it now and what is to be applied.

To use migrations we need another package installed:

```sh
composer require yiisoft/db-migration
```

And a directory to store migrations such as `migrations` right in the
project root.

Now you can use `yii migrate:create user` to create a new migration. For our
example we need a `page` table with some columns:

```php

public function up(MigrationBuilder $b): void
{
    $b->createTable('page', [
        'id' => $b->primaryKey(),
        'title' => $b->string()->notNull(),
        'text' => $b->text()->notNull(),
        'created_at' => $b->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        'updated_at' => $b->dateTime(),
        'deleted_at' => $b->dateTime(),
    ]);
}
```

Apply it with `yii migrate:up`.

## Inserting

## Selecting

## Using data package

### Pagination

> [!NOTE]
> [← Working with forms](forms.md) |
> [Generating code with Gii →](gii.md)
