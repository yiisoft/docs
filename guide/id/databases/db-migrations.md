# Migrasi

Untuk menggunakan migrasi, pasang paket [yiisoft/db-migration](https://github.com/yiisoft/db-migration/):

```shell
composer require yiisoft/db-migration
```

### Contoh penggunaan

Pertama, konfigurasikan DI container. Buat `config/common/db.php` dengan isi berikut:

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

Tambahkan hal berikut ke `config/params.php`:

```php
...
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
...
```

Sekarang tes apakah sudah bekerja:

```shell
./yii list migrate
```

### Membuat migrasi

Untuk bekerja dengan migrasi, Anda dapat menggunakan [view](https://github.com/yiisoft/db-migration/tree/master/resources/views) yang disediakan.

```shell
./yii migrate:create my_first_table --command=table --fields=name,example --table-comment=my_first_table
```

Perintah tersebut akan menghasilkan file seperti berikut:

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

Untuk informasi lebih lanjut lihat dokumentasi paket [di sini](https://github.com/yiisoft/db-migration/tree/master/docs/guide/en).

### Migrasi dari Yii2

Migrasi di Yii2 dan paket [yiisoft/db-migration](https://github.com/yiisoft/db-migration/) tidak kompatibel,
dan tabel `migration` juga tidak kompatibel.
Solusi yang mungkin adalah menggunakan dump struktur dan mengganti nama tabel `migration` lama. Pada eksekusi awal
migrasi, tabel `migration` baru dengan field yang baru akan dibuat. Semua perubahan selanjutnya pada skema basis data
akan diterapkan menggunakan komponen migrasi yang baru dan dicatat di tabel migrasi yang baru.
