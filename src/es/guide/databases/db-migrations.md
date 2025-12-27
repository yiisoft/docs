# Migrations

To use migrations, install
[yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package:

```shell
composer require yiisoft/db-migration
```

### Example usage

First, configure a DI container. Create `config/common/db.php` with the
following content:

```php
<?php

declare(strict_types=1);

use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Sqlite\Connection as SqliteConnection;

return [
    ConnectionInterface::class => [
        'class' => SqliteConnection::class,
        '__construct()' => [
            'dsn' => 'sqlite:' . __DIR__ . '/Data/yiitest.sq3'
        ]
    ]
];
```

Add the following to `config/params.php`:

```php
...
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
...
```

Now test if it works:

```shell
./yii list migrate
```

### Creating a migration

To work with migrations, you can use the provided
[view](https://github.com/yiisoft/db-migration/tree/master/resources/views).

```shell
./yii migrate:create my_first_table --command=table --fields=name,example --table-comment=my_first_table
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

### Upgrading from Yii 2.0

Migrations in Yii 2.0 and the
[yiisoft/db-migration](https://github.com/yiisoft/db-migration/) package are
not compatible, and the `migration` table is also not compatible.  A
probable solution is to use structure dumps and rename the old `migration`
table. Upon the initial execution of migrations, a new `migration` table
with new fields will be created. All further changes in the database schema
are applied using the new `migration` component and recorded in the new
migration table.

