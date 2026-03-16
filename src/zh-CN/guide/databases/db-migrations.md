# 数据库迁移

在开发和维护数据库驱动的应用程序过程中，所使用的数据库结构会像源代码一样不断演变。例如，在应用程序开发过程中，可能发现需要一张新表；在应用程序部署到生产环境后，可能发现应该创建一个索引来提高查询性能；等等。由于数据库结构变更通常需要相应的源代码变更，Yii
支持所谓的*数据库迁移*功能，允许您以*数据库迁移*的形式追踪数据库变更，这些迁移与源代码一起进行版本控制。

以下步骤展示了团队在开发过程中如何使用数据库迁移：

1. Tim 创建一个新的迁移（例如创建一张新表、修改列定义等）。
2. Tim 将新的迁移提交到源代码控制系统（例如 Git、Mercurial）。
3. Doug 从源代码控制系统更新他的仓库，获取新的迁移。
4. Doug 将迁移应用到他的本地开发数据库，从而将数据库同步以反映 Tim 所做的更改。

以下步骤展示了如何将带有数据库迁移的新版本部署到生产环境：

1. Scott 为包含一些新数据库迁移的项目仓库创建一个发布标签。
2. Scott 将生产服务器上的源代码更新到该发布标签。
3. Scott 将所有累积的数据库迁移应用到生产数据库。

Yii 提供了一套迁移命令行工具，允许您：

* 创建新迁移；
* 应用迁移；
* 回滚迁移；
* 重新应用迁移；
* 显示迁移历史和状态。

所有这些工具都可以通过命令 `yii migrate` 访问。在本节中，我们将详细描述如何使用这些工具完成各种任务。

> [!TIP]
> 迁移不仅可以影响数据库模式，还可以调整现有数据以适应新模式、创建 RBAC
层次结构或清理缓存。

> [!NOTE]
> 在使用迁移操作数据时，您可能会发现使用 Active Record 或实体类会很有用，
> 因为其中已经实现了一些逻辑。但请记住，与迁移中编写的代码（其本质是永久不变的）不同，
> 应用程序逻辑是会发生变化的。因此，在迁移代码中使用 Active Record 或实体类时，
> 源代码中逻辑的变更可能会意外破坏现有的迁移。出于这个原因，迁移代码应保持与
> 其他应用程序逻辑相互独立。

## 初始配置

要使用迁移，请安装 [yiisoft/db-migration](https://github.com/yiisoft/db-migration/)
包：

```shell
make composer require yiisoft/db-migration
```

在项目根目录中创建一个用于存储迁移的目录 `src/Migration`。

将以下配置添加到 `config/common/params.php`：

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

如果您想将迁移放置在其他位置，可以在 `newMigrationPath` 中定义路径。如果您要应用的迁移来自多个来源（例如外部模块），可以使用
`sourcePaths` 来定义这些来源。

您还需要配置数据库连接。有关为 PostgreSQL 配置的示例，请参阅 [使用数据库](../start/databases.md)。

## 创建迁移

要创建一个新的空迁移，请运行以下命令：

```sh
make shell
./yii migrate:create <name>
```

必填的 `name` 参数对新迁移进行简短描述。例如，如果迁移是关于创建一张名为 *news* 的新表，您可以使用名称
`create_news_table` 并运行以下命令：

```
make shell
./yii migrate:create create_news_table
```


> [!NOTE]
> 由于 `name` 参数将用作生成的迁移类名的一部分，
> 因此它应该只包含字母、数字和/或下划线字符。

上述命令将创建一个名为 `src/Migration/M251225221906CreateNewsTable.php` 的新 PHP
类文件。该文件包含以下代码，主要声明了一个带有骨架代码的迁移类：

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

在迁移类中，您需要在 `up()` 方法中编写对数据库结构进行更改的代码。您也可以在 `down()` 方法中编写代码来回滚 `up()`
所做的更改。当您使用此迁移升级数据库时，将调用 `up()` 方法；当您降级数据库时，将调用 `down()`
方法。以下代码展示了如何实现迁移类来创建一张 `news` 表：

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

上面的迁移构建器 `$b` 管理数据库模式，而列构建器 `$cb`
管理列类型。两者都支持使用*抽象类型*。当迁移应用到特定数据库时，抽象类型将被转换为相应的数据库物理类型和相应的 SQL 定义语句。

迁移构建器中可用的方法属于以下类型：

- 原始查询
  - getDb — 获取数据库连接实例。
  - execute — 执行原始 SQL 查询。
- 数据
  - insert / update / delete
  - batchInsert
  - upsert
- 表和视图
  - createTable / renameTable / dropTable
  - truncateTable
  - addCommentOnTable / dropCommentFromTable
  - createView / dropView
- 列
  - addColumn / renameColumn / alterColumn / dropColumn
  - addCommentOnColumn / dropCommentFromColumn
- 键和索引
  - addPrimaryKey / dropPrimaryKey
  - addForeignKey / dropForeignKey
  - createIndex / dropIndex

此外，还有一个 `columnBuilder()`，用于获取如上例所示的列构建器。该构建器具有定义各种列类型的静态方法：

- 主键
    - primaryKey
    - smallPrimaryKey
    - bigPrimaryKey
    - uuidPrimaryKey
- 布尔值
  - boolean
- 数字
  - bit
  - tinyint
  - smallint
  - integer
  - bigint
  - flat
  - double
  - decimal
- 字符串
  - char
  - string
  - text
- 日期和时间
  - timestamp
  - datetime
  - datetimeWithTimezone
  - time
  - timeWithTimezone
  - date
- 特殊类型
  - money
  - binary
  - uuid
  - array
  - structured
  - json
- enum

以上所有方法都会创建一个基础类型，可通过以下附加方法进行调整：

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

### 不可逆迁移

并非所有迁移都是可逆的。例如，如果 `up()` 方法删除了一行数据，您可能无法在 `down()` 方法中恢复该行。有时，您可能懒得实现
`down()`，因为回滚数据库迁移并不常见。在这种情况下，您应该实现只有 `up()` 的
`Yiisoft\Db\Migration\MigrationInterface`。


### 事务性迁移

在执行复杂的数据库迁移时，确保每个迁移作为一个整体要么全部成功要么全部失败非常重要，这样数据库才能保持完整性和一致性。为了实现这个目标，建议在迁移的
`implements` 中添加 `TransactionalMigrationInterface`，从而自动将每个迁移的数据库操作封装在事务中。

因此，如果 `up()` 或 `down()` 方法中的任何操作失败，所有之前的操作将自动回滚。

> 注意：并非所有数据库管理系统都支持事务。而且某些数据库查询无法放入事务中。有关一些示例，
请参阅 [隐式提交](https://dev.mysql.com/doc/refman/5.7/en/implicit-commit.html)。

## 生成迁移

该命令提供了一种方便的方式来生成部分代码，而不必手动编写迁移。

```shell
make shell
./yii migrate:create -- my_first_table --command=table --fields=name,example --table-comment=my_first_table
```

这将生成以下内容：

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

可用的命令有：

- create — 空迁移。
- table — 创建一张表。使用 `--fields` 指定字段列表。也可以指定类型，例如
  `id:primaryKey,name:string:defaultValue("Alex"),user_id:integer:foreignKey,category_id2:integer:foreignKey(category
  id2)`。
- dropTable — 删除一张表。
- addColumn — 添加一列。
- dropColumn — 删除一列。
- junction — 创建关联表。使用 `--and` 指定第二张表。

## 应用迁移

要将数据库升级到最新结构，应使用以下命令应用所有可用的新迁移：

```
./yii migrate:up
```

此命令将列出迄今为止尚未应用的所有迁移。如果您确认要应用这些迁移，它将按时间戳顺序依次运行每个新迁移类的 `up()`
方法。如果任何迁移失败，该命令将退出，而不会应用其余的迁移。

对于每个成功应用的迁移，该命令将在名为 `migration`
的数据库表中插入一行，以记录迁移的成功应用。这将允许迁移工具识别哪些迁移已经应用，哪些还没有。

有时，您可能只想应用一个或几个新迁移，而不是所有可用的迁移。您可以在运行命令时指定要应用的迁移数量来实现此目的。例如，以下命令将尝试应用接下来的三个可用迁移：

```
./yii migrate:up --limit=3
```

## 回滚迁移 <span id="reverting-migrations"></span>

要回滚（撤销）之前已应用的一个或多个迁移，可以运行以下命令：

```
./yii migrate:down            # revert the most recently applied migration
./yii migrate:down --limit=3  # revert the most 3 recently applied migrations
./yii migrate:down --all      # revert all migrations
```

> 注意：并非所有迁移都是可逆的。尝试回滚此类迁移将导致错误并停止
整个回滚过程。


## 重做迁移 <span id="redoing-migrations"></span>

重做迁移是指先回滚指定的迁移，然后再重新应用。可以按如下方式操作：

```
./yii migrate:redo            # redo the last applied migration
./yii migrate:redo --limit=3  # redo the last 3 applied migrations
./yii migrate:redo --all      # redo all migrations
```

> 注意：如果迁移不可逆，您将无法重做它。

## 列出迁移 <span id="listing-migrations"></span>

要列出哪些迁移已应用、哪些未应用，可以使用以下命令：

```
./yii migrate/history            # showing the last 10 applied migrations
./yii migrate:history --limit=5  # showing the last 5 applied migrations
./yii migrate:history --all      # showing all applied migrations

./yii migrate:new                # showing the first 10 new migrations
./yii migrate:new --limit=5      # showing the first 5 new migrations
./yii migrate:new --all          # showing all new migrations
```

### 从 Yii 2.0 升级

Yii 2.0 中的迁移与
[yiisoft/db-migration](https://github.com/yiisoft/db-migration/)
包不兼容，`migration` 表也不兼容。

一个可行的解决方案是使用结构转储并重命名旧的 `migration` 表。在初次执行迁移时，将创建一个具有新字段的新 `migration`
表。此后数据库模式的所有变更都使用新的 `migration` 组件应用，并记录在新的迁移表中。
