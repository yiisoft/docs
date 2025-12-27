# Migrations

During the course of developing and maintaining a database-driven application, the structure of the database
being used evolves just like the source code does. For example, during the development of an application,
a new table may be found necessary; after the application is deployed to production, it may be discovered
that an index should be created to improve the query performance; and so on. Because a database structure change
often requires some source code changes, Yii supports the so-called *database migration* feature that allows
you to keep track of database changes in terms of *database migrations* which are version-controlled together
with the source code.

The following steps show how database migration can be used by a team during development:

1. Tim creates a new migration (e.g. creates a new table, changes a column definition, etc.).
2. Tim commits the new migration into the source control system (e.g. Git, Mercurial).
3. Doug updates his repository from the source control system and receives the new migration.
4. Doug applies the migration to his local development database, thereby synchronizing his database
   to reflect the changes that Tim has made.

And the following steps show how to deploy a new release with database migrations to production:

1. Scott creates a release tag for the project repository that contains some new database migrations.
2. Scott updates the source code on the production server to the release tag.
3. Scott applies any accumulated database migrations to the production database.

Yii provides a set of migration command line tools that allow you to:

* create new migrations;
* apply migrations;
* revert migrations;
* re-apply migrations;
* show migration history and status.

All these tools are accessible through the command `yii migrate`. In this section we will describe in detail
how to accomplish various tasks using these tools.

> [!TIP]
> Migrations could affect not only database schema but adjust existing data to fit new schema, create RBAC
hierarchy or clean up cache.

> [!NOTE]
> When manipulating data using a migration you may find that using your Active Record or entity classes
> for this might be useful because some of the logic is already implemented there. Keep in mind however, that in contrast
> to code written in the migrations, whose nature is to stay constant forever, application logic is subject to change.
> So when using Active Record or entity classes in migration code, changes to the logic in the source code
> may accidentally break the existing migrations. For this reason migration code should be kept independent of other
> application logic such.

## Initial configuration

To use migrations, install [yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package:

```shell
make composer require yiisoft/db-migration
```

Create a directory to store migrations `src/Migration` right in the project root.

Add the following configuration to `config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

If you want to place migrations elsewhere, you can define the path in `newMigrationPath`. If your migrations to be
applied are from multiple sources, such as external modules, `sourcePaths` could be used to define these.

You need a database connection configured as well. See [Working with databases](../start/databases.md) for an example
of configuring it for PostgreSQL.

## Creating a migration

To create a new empty migration, run the following command:

```sh
make shell
./yii migrate:create <name>
```

The required `name` argument gives a brief description about the new migration. For example, if
the migration is about creating a new table named *news*, you may use the name `create_news_table`
and run the following command:

```
make shell
./yii migrate:create create_news_table
```


> [!NOTE]
> Because the `name` argument will be used as part of the generated migration class name,
> it should only contain letters, digits, and/or underscore characters.

The above command will create a new PHP class file named `src/Migration/M251225221906CreateNewsTable.php`. 
The file contains the following code which mainly declares a migration class with the skeleton code:

```php
<?php

declare(strict_types=1);

namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M251225221906CreateNewsTable implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        // TODO: Implement the logic to apply the migration.
    }

    public function down(MigrationBuilder $b): void
    {
        // TODO: Implement the logic to revert the migration.
    }
}
```

In the migration class, you are expected to write code in the `up()` method that makes changes to the database structure.
You may also want to write code in the `down()` method to revert the changes made by `up()`. The `up()` method is invoked
when you upgrade the database with this migration, while the `down()` method is invoked when you downgrade the database.
The following code shows how you may implement the migration class to create a `news` table:

```php
<?php

declare(strict_types=1);

namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M251225221906CreateNewsTable implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $cb = $b->columnBuilder();

        $b->createTable('news', [
            'id' => $cb::uuidPrimaryKey(),
            'title' => $cb::string()->notNull(),
            'content' => $cb::text(),
        ]);
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('news');
    }
}
```

Migration builder `$b` in the above manages database schema while the column builder `$cb` manages column types. Both
allow using *abstract types*. When a migration is applied to a particular database, the abstract types will
be translated into the corresponding database physical types and corresponding SQL to define them.

Methods available in migration builder belong to the following types:

- Raw queries
  - getDb — to get database connection instance.
  - execute — to execute raw SQL query.
- Data
  - insert / update / delete  
  - batchInsert
  - upsert
- Tables and views
  - createTable / renameTable / dropTable
  - truncateTable
  - addCommentOnTable / dropCommentFromTable
  - createView / dropView
- Columns  
  - addColumn / renameColumn / alterColumn / dropColumn
  - addCommentOnColumn / dropCommentFromColumn
- Keys and indexes
  - addPrimaryKey / dropPrimaryKey
  - addForeignKey / dropForeignKey
  - createIndex / dropIndex

Additionally, there's a `columnBuilder()` which is used to obtain a column builder as in example above. The builder
has static methods that define various column types:

- Keys
    - primaryKey
    - smallPrimaryKey
    - bigPrimaryKey
    - uuidPrimaryKey
- Boolean
  - boolean
- Numbers
  - bit
  - tinyint
  - smallint
  - integer
  - bigint
  - flat
  - double
  - decimal
- Strings
  - char
  - string
  - text
- Date and time
  - timestamp
  - datetime
  - datetimeWithTimezone
  - time
  - timeWithTimezone
  - date
- Special types
  - money
  - binary
  - uuid
  - array
  - structured
  - json
- enum

All the above methods create a base type which could be adjusted with additional methods:

- null / notNull
- defaultValue
- unique
- scale / size / unsigned
- primaryKey / autoIncrement
- check
- comment
- computed  
- extra
- reference

### Irreversible migrations

Not all migrations are reversible. For example, if the `up()` method deletes a row of a table, you may
not be able to recover this row in the `down()` method. Sometimes, you may be just too lazy to implement
the `down()`, because it is not very common to revert database migrations. In this case, you should implement
`Yiisoft\Db\Migration\MigrationInterface` that has `up()` only.


### Transactional migrations

While performing complex DB migrations, it is important to ensure each migration to either succeed or fail as a whole
so that the database can maintain integrity and consistency. To achieve this goal, it is recommended that you may
enclose the DB operations of each migration in a transaction automatically by adding `TransactionalMigrationInterface`
to `implements` of your migration.

As a result, if any operation in the `up()` or `down()` method fails, all prior operations will
be rolled back automatically.

> Note: Not all DBMS support transactions. And some DB queries cannot be put into a transaction. For some examples,
please refer to [implicit commit](https://dev.mysql.com/doc/refman/5.7/en/implicit-commit.html).

## Generating a migration

Instead of writing migrations by hand, the command provides a convenient way generate some of the code.

```shell
make shell
./yii migrate:create -- my_first_table --command=table --fields=name,example --table-comment=my_first_table
```

That would generate the following:

```php
<?php

declare(strict_types=1);

namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;
use Yiisoft\Db\Migration\TransactionalMigrationInterface;

/**
 * Handles the creation of table `my_first_table`.
 */
final class M251227095006CreateMyFirstTableTable implements RevertibleMigrationInterface, TransactionalMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $columnBuilder = $b->columnBuilder();

        $b->createTable('my_first_table', [
            'id' => $columnBuilder::primaryKey(),
            'name',
            'example',
        ]);

        $b->addCommentOnTable('my_first_table', 'my_first_table');
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('my_first_table');
    }
}
```

Commands available are:

- create - empty migration. 
- table - creating a table. Use `--fields` specify a list of fields to use. Types could be specified as well such as
  `id:primaryKey,name:string:defaultValue("Alex"),user_id:integer:foreignKey,category_id2:integer:foreignKey(category id2)`.
- dropTable - dropping a table.
- addColumn - adding a column.
- dropColumn - dropping a column.
- junction - creating a junction table. Use `--and` specify a second table.

## Applying Migrations

To upgrade a database to its latest structure, you should apply all available new migrations using the following command:

```
./yii migrate:up
```

This command will list all migrations that have not been applied so far. If you confirm that you want to apply
these migrations, it will run the `up()` method in every new migration class, one after another,
in the order of their timestamp values. If any of the migrations fails, the command will quit without applying
the rest of the migrations.

For each migration that has been successfully applied, the command will insert a row into a database table named
`migration` to record the successful application of the migration. This will allow the migration tool to identify
which migrations have been applied and which have not.

Sometimes, you may only want to apply one or a few new migrations, instead of all available migrations.
You can do so by specifying the number of migrations that you want to apply when running the command.
For example, the following command will try to apply the next three available migrations:

```
./yii migrate:up --limit=3
```

## Reverting Migrations <span id="reverting-migrations"></span>

To revert (undo) one or multiple migrations that have been applied before, you can run the following command:

```
./yii migrate:down            # revert the most recently applied migration
./yii migrate:down --limit=3  # revert the most 3 recently applied migrations
./yii migrate:down --all      # revert all migrations
```

> Note: Not all migrations are reversible. Trying to revert such migrations will cause an error and stop the
entire reverting process.


## Redoing Migrations <span id="redoing-migrations"></span>

Redoing migrations means first reverting the specified migrations and then applying again. This can be done
as follows:

```
./yii migrate:redo            # redo the last applied migration
./yii migrate:redo --limit=3  # redo the last 3 applied migrations
./yii migrate:redo --all      # redo all migrations
```

> Note: If a migration is not reversible, you will not be able to redo it.

## Listing Migrations <span id="listing-migrations"></span>

To list which migrations have been applied and which are not, you may use the following commands:

```
./yii migrate/history            # showing the last 10 applied migrations
./yii migrate:history --limit=5  # showing the last 5 applied migrations
./yii migrate:history --all      # showing all applied migrations

./yii migrate:new                # showing the first 10 new migrations
./yii migrate:new --limit=5      # showing the first 5 new migrations
./yii migrate:new --all          # showing all new migrations
```

### Upgrading from Yii 2.0

Migrations in Yii 2.0 and the [yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package are not compatible,
and the `migration` table is also not compatible.

A probable solution is to use structure dumps and rename the old `migration` table. Upon the initial execution of
migrations, a new `migration` table with new fields will be created. All further changes in the database schema are
applied using the new `migration` component and recorded in the new migration table.
