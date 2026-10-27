# Usando um template de migration personalizado

O comando `migrate:create` do `yiisoft/db-migration` gera classes de
migration a partir de templates PHP de view. Use um template personalizado
quando seu projeto quiser um cabeçalho padrão, um formato de classe rígido,
comentários, chamadas a helpers ou placeholders específicos da equipe em
toda nova migration.

Esta receita assume que as migrations já estão configuradas como descrito no
guia [Migrations de banco de dados](../guide/databases/db-migrations.md).

## Crie um template

Crie `resources/migration-templates/migration.php`:

```php
<?php

declare(strict_types=1);

/**
 * Esta view é usada por {@see Yiisoft\Db\Migration\Command\CreateCommand}.
 *
 * @var \Yiisoft\Db\Migration\Service\Generate\PhpRenderer $this
 * @var string $className O nome da nova classe de migration, sem namespace.
 * @var string $namespace O namespace da nova classe de migration.
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

O template é um arquivo PHP que imprime a migration gerada. Para o comando
`create` padrão, as variáveis mais úteis são `$className` e `$namespace`.

## Configure o gerador

Crie `config/common/di/migration-generator.php`:

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

A chave `create` muda o template usado por:

```shell
./yii migrate:create audit_log
```

O comando pede confirmação e então grava uma migration usando o seu
template.

Se o novo arquivo de DI não for carregado, reconstrua o merge plan da
configuração:

```shell
composer yii-config-rebuild
```

## Configure vários templates

O `yiisoft/db-migration` suporta estas chaves de template:

- `create`
- `table`
- `dropTable`
- `addColumn`
- `dropColumn`
- `junction`

Para substituir vários templates de uma vez, use `setTemplates()`:

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

Para os templates voltados a tabelas, copie o arquivo correspondente de
`vendor/yiisoft/db-migration/resources/views/` e ajuste-o. Esses templates
recebem variáveis adicionais, como `$table`, `$columns`, `$foreignKeys` e
`$tableComment`.

## Mantenha os templates fáceis de manter

Mantenha as migrations geradas independentes dos serviços atuais da
aplicação. Uma migration pode rodar anos depois, quando as APIs dos serviços
já mudaram. Coloque operações de schema estáveis na classe gerada e deixe a
lógica de negócio em comandos de console ou serviços da aplicação.

Não edite templates dentro de `vendor/`. Copie-os para o seu projeto e
configure o `CreateService` para usar as cópias.
