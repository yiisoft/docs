# Migrations

During the course of developing and maintaining a database-driven
application, the structure of the database being used evolves just like the
source code does. For example, during the development of an application, a
new table may be found necessary; after the application is deployed to
production, it may be discovered that an index should be created to improve
the query performance; and so on. Because a database structure change often
requires some source code changes, Yii supports the so-called *database
migration* feature that allows you to keep track of database changes in
terms of *database migrations* which are version-controlled together with
the source code.

The following steps show how database migration can be used by a team during
development:

1. Tim creates a new migration (e.g. creates a new table, changes a column
   definition, etc.).
2. Tim commits the new migration into the source control system (e.g. Git,
   Mercurial).
3. Doug updates his repository from the source control system and receives
   the new migration.
4. Doug applies the migration to his local development database, thereby
   synchronizing his database to reflect the changes that Tim has made.

And the following steps show how to deploy a new release with database
migrations to production:

1. Scott creates a release tag for the project repository that contains some
   new database migrations.
2. Scott updates the source code on the production server to the release
   tag.
3. Scott applies any accumulated database migrations to the production
   database.

Yii provides a set of migration command line tools that allow you to:

* create new migrations;
* apply migrations;
* revert migrations;
* re-apply migrations;
* show migration history and status.

All these tools are accessible through the command `yii migrate`. In this
section we will describe in detail how to accomplish various tasks using
these tools.

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

To use migrations, install
[yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package:

```shell
make composer require yiisoft/db-migration
```

Create a directory to store migrations `src/Migration` right in the project
root.

Add the following configuration to `config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

You need a database connection configured as well. See [Working with
databases](../start/databases.md) for an example of configuring it for
PostgreSQL.

### Creating a migration

To create a new empty migration, run the following command:

```sh
make yii migrate:create <name>
```

The required `name` argument gives a brief description about the new
migration. For example, if the migration is about creating a new table named
*news*, you may use the name `create_news_table` and run the following
command:

```
make yii migrate:create create_news_table
```


> [!NOTE]
> Because the `name` argument will be used as part of the generated migration class name,
> it should only contain letters, digits, and/or underscore characters.

The above command will create a new PHP class file named
`src/Migration/M251225221906CreateNewsTable.php`.  The file contains the
following code which mainly declares a migration class with the skeleton
code:

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

In the migration class, you are expected to write code in the `up()` method
that makes changes to the database structure.  You may also want to write
code in the `down()` method to revert the changes made by `up()`. The `up()`
method is invoked when you upgrade the database with this migration, while
the `down()` method is invoked when you downgrade the database.  The
following code shows how you may implement the migration class to create a
`news` table:

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

TODO: explain $b and $qb
Below is the list of all these database accessing methods:

### Irreversible migrations

Not all migrations are reversible. For example, if the `up()` method deletes
a row of a table, you may not be able to recover this row in the `down()`
method. Sometimes, you may be just too lazy to implement the `down()`,
because it is not very common to revert database migrations. In this case,
you should implement `Yiisoft\Db\Migration\MigrationInterface` that has
`up()` only.


### Transactional migrations (TODO: update!!!)

While performing complex DB migrations, it is important to ensure each
migration to either succeed or fail as a whole so that the database can
maintain integrity and consistency. To achieve this goal, it is recommended
that you enclose the DB operations of each migration in a
[transaction](db-dao.md#performing-transactions).

An even easier way of implementing transactional migrations is to put
migration code in the `safeUp()` and `safeDown()` methods. These two methods
differ from `up()` and `down()` in that they are enclosed implicitly in a
transaction.  As a result, if any operation in these methods fails, all
prior operations will be rolled back automatically.

In the following example, besides creating the `news` table we also insert
an initial row into this table.

```php
<?php

use yii\db\Migration;

class m150101_185401_create_news_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('news', [
            'id' => $this->primaryKey(),
            'title' => $this->string()->notNull(),
            'content' => $this->text(),
        ]);

        $this->insert('news', [
            'title' => 'test 1',
            'content' => 'content 1',
        ]);
    }

    public function safeDown()
    {
        $this->delete('news', ['id' => 1]);
        $this->dropTable('news');
    }
}
```

Note that usually when you perform multiple DB operations in `safeUp()`, you
should reverse their execution order in `safeDown()`. In the above example
we first create the table and then insert a row in `safeUp()`; while in
`safeDown()` we first delete the row and then drop the table.

> Note: Not all DBMS support transactions. And some DB queries cannot be put into a transaction. For some examples,
please refer to [implicit commit](https://dev.mysql.com/doc/refman/5.7/en/implicit-commit.html). If this is the case,
you should still implement `up()` and `down()`, instead.

TODO: TransactionalMigrationInterface



## TODO: update

The base migration class [[yii\db\Migration]] exposes a database connection
via the [[yii\db\Migration::db|db]] property. You can use it to manipulate
the database schema using the methods as described in [Working with Database
Schema](db-dao.md#database-schema).

Rather than using physical types, when creating a table or column you should use *abstract types*
so that your migrations are independent of specific DBMS. The [[yii\db\Schema]] class defines
a set of constants to represent the supported abstract types. These constants are named in the format
of `TYPE_<Name>`. For example, `TYPE_PK` refers to auto-incremental primary key type; `TYPE_STRING`
refers to a string type. When a migration is applied to a particular database, the abstract types
will be translated into the corresponding physical types. In the case of MySQL, `TYPE_PK` will be turned
into `int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY`, while `TYPE_STRING` becomes `varchar(255)`.

You can append additional constraints when using abstract types. In the
above example, ` NOT NULL` is appended to `Schema::TYPE_STRING` to specify
that the column cannot be `null`.

> Info: The mapping between abstract types and physical types is specified by
the [[yii\db\QueryBuilder::$typeMap|$typeMap]] property in each concrete `QueryBuilder` class.

Since version 2.0.6, you can make use of the newly introduced schema builder
which provides more convenient way of defining column schema.  So the
migration above could be written like the following:

```php
<?php

use yii\db\Migration;

class m150101_185401_create_news_table extends Migration
{
    public function up()
    {
        $this->createTable('news', [
            'id' => $this->primaryKey(),
            'title' => $this->string()->notNull(),
            'content' => $this->text(),
        ]);
    }

    public function down()
    {
        $this->dropTable('news');
    }
}
```

A list of all available methods for defining the column types is available
in the API documentation of [[yii\db\SchemaBuilderTrait]].

> Info: The generated file permissions and ownership will be determined by the current environment. This might lead to
inaccessible files. This could, for example, happen when the migration is created within a docker container
and the files are edited on the host. In this case the `newFileMode` and/or `newFileOwnership` of the MigrateController
can be changed. E.g. in the application config:
  ```php
  <?php
  return [
      'controllerMap' => [
          'migrate' => [
              'class' => 'yii\console\controllers\MigrateController',
              'newFileOwnership' => '1000:1000', # Default WSL user id
              'newFileMode' => 0660,
          ],
      ],
  ];
  ```

## Generating Migrations (TODO: likely is OK but...)

The command provides a convenient way to create migrations using the
provided
[view](https://github.com/yiisoft/db-migration/tree/master/resources/views):

```shell
make yii migrate:create my_first_table --command=table --fields=name,example --table-comment=my_first_table
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
 * Handles the creation of a table `my_first_table`.
 */
final class M240115143455CreateMyFirstTableTable implements RevertibleMigrationInterface, TransactionalMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $b->createTable('my_first_table', [
            'id' => $b->primaryKey(),
            'name',
            'example',
        ]);
        
        $b->addCommentOnTable('my_first_table', 'dest');
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('my_first_table');
    }
}
```

For more information
[see](https://github.com/yiisoft/db-migration/tree/master/docs/guide/en)


## Applying Migrations

To upgrade a database to its latest structure, you should apply all
available new migrations using the following command:

```
yii migrate
```

This command will list all migrations that have not been applied so far. If
you confirm that you want to apply these migrations, it will run the `up()`
or `safeUp()` method in every new migration class, one after another, in the
order of their timestamp values. If any of the migrations fails, the command
will quit without applying the rest of the migrations.

> Tip: In case you don't have command line at your server you may try [web shell](https://github.com/samdark/yii2-webshell)
> extension.

For each migration that has been successfully applied, the command will
insert a row into a database table named `migration` to record the
successful application of the migration. This will allow the migration tool
to identify which migrations have been applied and which have not.

> Info: The migration tool will automatically create the `migration` table in the database specified by
the [[yii\console\controllers\MigrateController::db|db]] option of the command. By default, the database
is specified by the `db` [application component](structure-application-components.md).

Sometimes, you may only want to apply one or a few new migrations, instead
of all available migrations.  You can do so by specifying the number of
migrations that you want to apply when running the command.  For example,
the following command will try to apply the next three available migrations:

```
yii migrate 3
```

You can also explicitly specify a particular migration to which the database
should be migrated by using the `migrate/to` command in one of the following
formats:

```
yii migrate/to 150101_185401                      # using timestamp to specify the migration
yii migrate/to "2015-01-01 18:54:01"              # using a string that can be parsed by strtotime()
yii migrate/to m150101_185401_create_news_table   # using full name
yii migrate/to 1392853618                         # using UNIX timestamp
```

If there are any unapplied migrations earlier than the specified one, they
will all be applied before the specified migration is applied.

If the specified migration has already been applied before, any later
applied migrations will be reverted.


## Reverting Migrations <span id="reverting-migrations"></span>

To revert (undo) one or multiple migrations that have been applied before,
you can run the following command:

```
yii migrate/down     # revert the most recently applied migration
yii migrate/down 3   # revert the most 3 recently applied migrations
```

> Note: Not all migrations are reversible. Trying to revert such migrations will cause an error and stop the
entire reverting process.


## Redoing Migrations <span id="redoing-migrations"></span>

Redoing migrations means first reverting the specified migrations and then
applying again. This can be done as follows:

```
yii migrate/redo        # redo the last applied migration
yii migrate/redo 3      # redo the last 3 applied migrations
```

> Note: If a migration is not reversible, you will not be able to redo it.

## Refreshing Migrations <span id="refreshing-migrations"></span>

Since Yii 2.0.13 you can delete all tables and foreign keys from the
database and apply all migrations from the beginning.

```
yii migrate/fresh       # truncate the database and apply all migrations from the beginning
```

## Listing Migrations <span id="listing-migrations"></span>

To list which migrations have been applied and which are not, you may use
the following commands:

```
yii migrate/history     # showing the last 10 applied migrations
yii migrate/history 5   # showing the last 5 applied migrations
yii migrate/history all # showing all applied migrations

yii migrate/new         # showing the first 10 new migrations
yii migrate/new 5       # showing the first 5 new migrations
yii migrate/new all     # showing all new migrations
```


## Modifying Migration History <span id="modifying-migration-history"></span>

Instead of actually applying or reverting migrations, sometimes you may
simply want to mark that your database has been upgraded to a particular
migration. This often happens when you manually change the database to a
particular state and you do not want the migration(s) for that change to be
re-applied later. You can achieve this goal with the following command:

```
yii migrate/mark 150101_185401                      # using timestamp to specify the migration
yii migrate/mark "2015-01-01 18:54:01"              # using a string that can be parsed by strtotime()
yii migrate/mark m150101_185401_create_news_table   # using full name
yii migrate/mark 1392853618                         # using UNIX timestamp
```

The command will modify the `migration` table by adding or deleting certain
rows to indicate that the database has been applied migrations to the
specified one. No migrations will be applied or reverted by this command.


## Customizing Migrations <span id="customizing-migrations"></span>

There are several ways to customize the migration command.


### Using Command Line Options <span id="using-command-line-options"></span>

The migration command comes with a few command-line options that can be used
to customize its behaviors:

* `interactive`: boolean (defaults to `true`), specifies whether to perform
  migrations in an interactive mode.  When this is `true`, the user will be
  prompted before the command performs certain actions.  You may want to set
  this to `false` if the command is being used in a background process.

* `migrationPath`: string|array (defaults to `@app/migrations`), specifies
  the directory storing all migration class files. This can be specified as
  either a directory path or a path [alias](concept-aliases.md).  Note that
  the directory must exist, or the command may trigger an error. Since
  version 2.0.12 an array can be specified for loading migrations from
  multiple sources.

* `migrationTable`: string (defaults to `migration`), specifies the name of
  the database table for storing migration history information. The table
  will be automatically created by the command if it does not exist.  You
  may also manually create it using the structure `version varchar(255)
  primary key, apply_time integer`.

* `db`: string (defaults to `db`), specifies the ID of the database
  [application component](structure-application-components.md).  It
  represents the database that will be migrated using this command.

* `templateFile`: string (defaults to `@yii/views/migration.php`), specifies
  the path of the template file that is used for generating skeleton
  migration class files. This can be specified as either a file path or a
  path [alias](concept-aliases.md). The template file is a PHP script in
  which you can use a predefined variable named `$className` to get the
  migration class name.

* `generatorTemplateFiles`: array (defaults to `[
        'create_table' => '@yii/views/createTableMigration.php',
        'drop_table' => '@yii/views/dropTableMigration.php',
        'add_column' => '@yii/views/addColumnMigration.php',
        'drop_column' => '@yii/views/dropColumnMigration.php',
        'create_junction' => '@yii/views/createTableMigration.php'
  ]`), specifies template files for generating migration code. See "[Generating Migrations](#generating-migrations)"
  for more details.

* `fields`: array of column definition strings used for creating migration
  code. Defaults to `[]`. The format of each definition is
  `COLUMN_NAME:COLUMN_TYPE:COLUMN_DECORATOR`. For example,
  `--fields=name:string(12):notNull` produces a string column of size 12
  which is not `null`.

The following example shows how you can use these options.

For example, if we want to migrate a `forum` module whose migration files
are located within the module's `migrations` directory, we can use the
following command:

```
# migrate the migrations in a forum module non-interactively
yii migrate --migrationPath=@app/modules/forum/migrations --interactive=0
```

### Separated Migrations


Sometimes using single migration history for all project migrations is not
desirable. For example: you may install some 'blog' extension, which
contains fully separated functionality and contain its own migrations, which
should not affect the ones dedicated to main project functionality.

If you want several migrations to be applied and tracked down completely
separated from each other, you can configure multiple migration commands
which will use different namespaces and migration history tables:

```php
return [
    'controllerMap' => [
        // Common migrations for the whole application
        'migrate-app' => [
            'class' => 'yii\console\controllers\MigrateController',
            'migrationNamespaces' => ['app\migrations'],
            'migrationTable' => 'migration_app',
            'migrationPath' => null,
        ],
        // Migrations for the specific project's module
        'migrate-module' => [
            'class' => 'yii\console\controllers\MigrateController',
            'migrationNamespaces' => ['module\migrations'],
            'migrationTable' => 'migration_module',
            'migrationPath' => null,
        ],
        // Migrations for the specific extension
        'migrate-rbac' => [
            'class' => 'yii\console\controllers\MigrateController',
            'migrationPath' => '@yii/rbac/migrations',
            'migrationTable' => 'migration_rbac',
        ],
    ],
];
```

Note that to synchronize database you now need to run multiple commands
instead of one:

```
yii migrate-app
yii migrate-module
yii migrate-rbac
```

## Migrating Multiple Databases <span id="migrating-multiple-databases"></span>

By default, migrations are applied to the same database specified by the
`db` [application component](structure-application-components.md).  If you
want them to be applied to a different database, you may specify the `db`
command-line option like shown below,

```
yii migrate --db=db2
```

The above command will apply migrations to the `db2` database.

Sometimes it may happen that you want to apply *some* of the migrations to
one database, while some others to another database. To achieve this goal,
when implementing a migration class you should explicitly specify the DB
component ID that the migration would use, like the following:

```php
<?php

use yii\db\Migration;

class m150101_185401_create_news_table extends Migration
{
    public function init()
    {
        $this->db = 'db2';
        parent::init();
    }
}
```

The above migration will be applied to `db2`, even if you specify a
different database through the `db` command-line option. Note that the
migration history will still be recorded in the database specified by the
`db` command-line option.

If you have multiple migrations that use the same database, it is
recommended that you create a base migration class with the above `init()`
code. Then each migration class can extend from this base class.

> Tip: Besides setting the [[yii\db\Migration::db|db]] property, you can also operate on different databases
by creating new database connections to them in your migration classes. You then use the [DAO methods](db-dao.md)
with these connections to manipulate different databases.

Another strategy that you can take to migrate multiple databases is to keep
migrations for different databases in different migration paths. Then you
can migrate these databases in separate commands like the following:

```
yii migrate --migrationPath=@app/migrations/db1 --db=db1
yii migrate --migrationPath=@app/migrations/db2 --db=db2
...
```

The first command will apply migrations in `@app/migrations/db1` to the
`db1` database, the second command will apply migrations in
`@app/migrations/db2` to `db2`, and so on.

### Upgrading from Yii2

Migrations in Yii2 and the
[yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package are
not compatible, and the `migration` table is also not compatible.  A
probable solution is to use structure dumps and rename the old `migration`
table. Upon the initial execution of migrations, a new `migration` table
with new fields will be created. All further changes in the database schema
are applied using the new `migration` component and recorded in the new
migration table.

