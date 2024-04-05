# Migrações

Para usar migrações, instale o pacote [yiisoft/db-migration](https://github.com/yiisoft/db-migration/):

```shell
composer require yiisoft/db-migration
```

### Exemplo de uso

Primeiro, configure o contêiner DI. Crie `config/common/db.php` com o seguinte conteúdo:

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

Adicione o seguinte em `config/params.php`:

```php
...
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
...
```

Agora teste se funciona:

```shell
./yii list migrate
```

### Criando uma migração

Para trabalhar com migrações, você pode usar a [visualização fornecida](https://github.com/yiisoft/db-migration/tree/master/resources/views).

```shell
./yii migrate:create my_first_table --command=table --fields=name,example --table-comment=my_first_table
```

Isso geraria o seguinte:

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

Para obter mais informações [consulte](https://github.com/yiisoft/db-migration/tree/master/docs/en)

### Atualizando do Yii2

Migrações no Yii2 e o pacote [yiisoft/db-migration](https://github.com/yiisoft/db-migration/) não são compatíveis,
e a tabela `migration` também não é
compatível.
Uma solução provável é usar dumps de estrutura e renomear a antiga tabela `migration`. Após a execução inicial de
migrações, uma nova tabela `migration` com novos campos será criada. Todas as alterações subsequentes no esquema do banco de dados são
aplicado usando o novo componente `migration` e registrado na nova tabela de migração.