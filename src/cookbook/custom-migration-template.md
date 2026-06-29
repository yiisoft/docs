# Using a custom migration template

The `migrate:create` command from `yiisoft/db-migration` generates migration classes from PHP view templates. Use a
custom template when your project wants a standard header, strict class shape, comments, helper calls, or team-specific
placeholders in every new migration.

This recipe assumes migrations are already configured as described in the
[Database migrations](../guide/databases/db-migrations.md) guide.

## Create a template

Create `resources/migration-templates/migration.php`:

```php
<?php

declare(strict_types=1);

/**
 * This view is used by {@see Yiisoft\Db\Migration\Command\CreateCommand}.
 *
 * @var \Yiisoft\Db\Migration\Service\Generate\PhpRenderer $this
 * @var string $className The new migration class name without namespace.
 * @var string $namespace The new migration class namespace.
 */

echo "<?php\n";
echo "\ndeclare(strict_types=1);\n";

if (!empty($namespace)) {
    echo "\nnamespace {$namespace};\n";
}
?>

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class <?= $className ?> implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        // Add forward migration code.
    }

    public function down(MigrationBuilder $b): void
    {
        // Add rollback migration code.
    }
}
```

The template is a PHP file that prints the generated migration. For the default `create` command, the most useful
variables are `$className` and `$namespace`.

## Configure the generator

Create `config/common/di/migration-generator.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Db\Migration\Service\Generate\CreateService;

return [
    CreateService::class => [
        'setTemplate()' => [
            'create',
            dirname(__DIR__, 3) . '/resources/migration-templates/migration.php',
        ],
    ],
];
```

The `create` key changes the template used by:

```shell
./yii migrate:create audit_log
```

The command asks for confirmation and then writes a migration using your template.

If the new DI file is not picked up, rebuild the config merge plan:

```shell
composer yii-config-rebuild
```

## Configure multiple templates

`yiisoft/db-migration` supports these template keys:

- `create`
- `table`
- `dropTable`
- `addColumn`
- `dropColumn`
- `junction`

To replace multiple templates at once, use `setTemplates()`:

```php
use Yiisoft\Db\Migration\Service\Generate\CreateService;

return [
    CreateService::class => [
        'setTemplates()' => [[
            'create' => dirname(__DIR__, 3) . '/resources/migration-templates/migration.php',
            'table' => dirname(__DIR__, 3) . '/resources/migration-templates/create-table.php',
            'dropTable' => dirname(__DIR__, 3) . '/resources/migration-templates/drop-table.php',
            'addColumn' => dirname(__DIR__, 3) . '/resources/migration-templates/add-column.php',
            'dropColumn' => dirname(__DIR__, 3) . '/resources/migration-templates/drop-column.php',
            'junction' => dirname(__DIR__, 3) . '/resources/migration-templates/create-junction.php',
        ]],
    ],
];
```

For table-oriented templates, copy the corresponding file from
`vendor/yiisoft/db-migration/resources/views/` and adjust it. Those templates receive additional variables such as
`$table`, `$columns`, `$foreignKeys`, and `$tableComment`.

## Keep templates maintainable

Keep generated migrations independent from current application services. A migration may run years later, after service
APIs have changed. Put stable schema operations in the generated class and leave business logic in console commands or
application services.

Do not edit templates under `vendor/`. Copy them into your project and configure `CreateService` to use the copies.
