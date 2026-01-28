# Работа с базами данных

Yii не требует использования конкретной базы данных или хранилища для вашего
приложения. Существует множество способов работы с реляционными базами
данных:

- [Yii DB](https://github.com/yiisoft/db)
- [Yii Active Record](https://github.com/yiisoft/active-record)
- [Cycle](https://github.com/cycle) через [пакет Yii
  Cycle](https://github.com/yiisoft/yii-cycle)
- [Doctrine](https://www.doctrine-project.org/) через [пакет Yii
  Doctrine](https://github.com/stargazer-team/yii-doctrine)
- [PDO](https://www.php.net/manual/ru/book.pdo.php)

Для нереляционных баз данных обычно доступны официальные библиотеки:

- [ElasticSearch](https://github.com/elastic/elasticsearch-php)
- [Redis](https://redis.io/docs/latest/develop/clients/php/)
- ...

В этом руководстве мы сосредоточимся на работе с реляционными базами данных
с помощью Yii DB. Мы будем использовать PostgreSQL для реализации простого
CRUD (создание, чтение, обновление, удаление).

## Установка PostgreSQL

Необходимо установить PostgreSQL. Если вы предпочитаете не использовать
Docker, [загрузите установщик с официального
сайта](https://www.postgresql.org/download/), установите его и создайте базу
данных.

При использовании Docker всё немного проще. Измените файл
`docker/dev/compose.yml`:

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
```

Обратите внимание, что мы добавляем `depends_on`, чтобы приложение ждало
запуска базы данных.

Также потребуется расширение `pdo_pgsql` для взаимодействия с
PostgreSQL. Его можно включить локально в файле `php.ini`. При использовании
Docker проверьте файл `docker/Dockerfile` и добавьте `pdo_pgsql` в список
`install-php-extensions`. Затем пересоберите образ PHP командой `make build
&& make down && make up`.

## Настройка подключения

Теперь, когда у нас есть база данных, пришло время определить подключение.

Сначала нам нужно установить пакет:

```sh
make composer require yiisoft/db-pgsql
```

Теперь создайте файл `config/common/di/db-pgsql.php`:

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

Определите параметры в файле `config/common/params.php`. Для Docker это
будет:

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

Хост `db` автоматически разрешается внутри сети Docker.

Для локальной установки без Docker хост в Dsn будет `localhost`. Остальные
параметры необходимо настроить в соответствии с конфигурацией вашей базы
данных.

## Создание и применение миграций

Для начальной настройки приложения и для дальнейших изменений базы данных
рекомендуется использовать миграции. Это файлы, которые описывают изменения
в структуре базы данных. Примененные миграции отслеживаются в базе данных,
что позволяет отслеживать текущее состояние и определять, какие миграции еще
необходимо применить.

Для использования миграций нам нужно установить еще один пакет:

```sh
make composer require yiisoft/db-migration
```

Создайте каталог для хранения миграций `src/Migration` в корневой директории
проекта. Добавьте следующую конфигурацию в файл `config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

Теперь можно использовать команду `make yii migrate:create page` для
создания новой миграции. Для нашего примера необходима таблица `page` с
несколькими столбцами:

```php
<?php

declare(strict_types=1);

namespace App\Migration;

use Yiisoft\Db\Migration\MigrationBuilder;
use Yiisoft\Db\Migration\RevertibleMigrationInterface;

final class M251102141707Page implements RevertibleMigrationInterface
{
    public function up(MigrationBuilder $b): void
    {
        $column = $b->columnBuilder();

        $b->createTable('page', [
            'id' => $column::uuidPrimaryKey(),
            'title' => $column::string()->notNull(),
            'slug' => $column::string()->notNull()->unique(),
            'text' => $column::text()->notNull(),
            'created_at' => $column::dateTime(),
            'updated_at' => $column::dateTime(),
        ]);
    }

    public function down(MigrationBuilder $b): void
    {
        $b->dropTable('page');
    }
}
```

Имя класса миграции `M251102141707Page` генерируется автоматически, поэтому
замените суффикс `Page` на фактическое имя миграции. Префикс `M251102141707`
необходим для поиска и сортировки миграций в порядке их добавления.

Обратите внимание, что мы используем UUID в качестве первичного ключа. Мы
собираемся генерировать эти идентификаторы самостоятельно, вместо того чтобы
полагаться на базу данных, для этого нам понадобится добавить дополнительный
пакет composer.

```shell
make composer require ramsey/uuid
```

Хотя объем хранилища немного больше, чем при использовании int, работа с
такими идентификаторами имеет свои преимущества. Поскольку идентификатор
генерируется самостоятельно, можно определить набор связанных данных и
сохранить его в одной транзакции. Сущности, которые определяют этот набор
данных в коде, часто называются "агрегатом".

Примените миграцию с помощью `make yii migrate:up`.

## Сущность

Теперь, когда таблица создана, необходимо определить сущность в
коде. Создайте файл `src/Web/Page/Page.php`:

```php
<?php

declare(strict_types=1);

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
    ) {}

    public static function create(
        string $id,
        string $title,
        string $text,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
    ): self {
        return new self(
            id: $id,
            title: $title,
            text: $text,
            createdAt: $createdAt ?? new DateTimeImmutable(),
            updatedAt: $updatedAt ?? new DateTimeImmutable(),
        );
    }

    public function getSlug(): string
    {
        return (new Inflector())->toSlug($this->title);
    }
}
```

## Репозиторий

Теперь, когда сущность создана, необходимо место для методов сохранения,
удаления и выборки одной или нескольких страниц.

Создайте файл `src/Web/Page/PageRepository.php`:

```php
<?php

declare(strict_types=1);

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
        $data = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->getSlug(),
            'text' => $page->text,
            'created_at' => $page->createdAt,
            'updated_at' => $page->updatedAt,
        ];

        if ($this->exists($page->id)) {
            $this->connection->createCommand()->update('{{%page}}', $data, ['id' => $page->id])->execute();
        } else {
            $this->connection->createCommand()->insert('{{%page}}', $data)->execute();
        }
    }

    public function findOneBySlug(string $slug): ?Page
    {
        $query = $this->connection
            ->select()
            ->from('{{%page}}')
            ->where('slug = :slug', ['slug' => $slug]);

        return $this->createPage($query->one());
    }

    /**
     * @return iterable<Page>
     */
    public function findAll(): iterable
    {
        $data = $this->connection
            ->select()
            ->from('{{%page}}')
            ->all();

        foreach ($data as $page) {
            yield $this->createPage($page);
        }
    }

    private function createPage(?array $data): ?Page
    {
        if ($data === null) {
            return null;
        }

        return Page::create(
            id: $data['id'],
            title: $data['title'],
            text: $data['text'],
            createdAt: new DateTimeImmutable($data['created_at']),
            updatedAt: new DateTimeImmutable($data['updated_at']),
        );
    }

    public function deleteBySlug(string $slug): void
    {
        $this->connection->createCommand()->delete(
            '{{%page}}',
            ['slug' => $slug],
        )->execute();
    }

    public function exists(string $id): bool
    {
        return $this->connection->createQuery()
            ->from('{{%page}}')
            ->where(['id' => $id])
            ->exists();
    }
}
```

В этом репозитории есть методы для получения данных и метод `save()` для
вставки или обновления записей. База данных возвращает необработанные данные
в виде массивов, но репозиторий автоматически создает из них сущности, что
позволяет в дальнейшем работать с типизированными данными.

## Действия и маршруты

Необходимо создать действия для:

1. Вывести список всех страниц.
2. Просмотреть страницу.
3. Удалить страницу.
4. Создать страницу.
5. Обновить страницу.

Затем необходимо настроить маршрутизацию для всех этих действий.

Рассмотрим их по очереди.

### List all pages

Создайте файл `src/Web/Page/ListAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class ListAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private PageRepository $pageRepository,
    )
    {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/list', [
            'pages' => $this->pageRepository->findAll(),
        ]);
    }
}
```

Создайте представление списка в файле `src/Web/Page/list.php`:

```php
<?php
use App\Web\Page\Page;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;

/** @var iterable<Page> $pages */
/** @var UrlGeneratorInterface $urlGenerator */
?>

<ul>
    <?php foreach ($pages as $page): ?>
    <li>
        <?= Html::a($page->title, $urlGenerator->generate('page/view', ['slug' => $page->getSlug()])) ?>
    </li>
    <?php endforeach ?>
</ul>

<?= Html::a('Create', $urlGenerator->generate('page/edit', ['slug' => 'new'])) ?>
```

### Просмотр страницы

Создайте файл `src/Web/Page/ViewAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class ViewAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private PageRepository $pageRepository,
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug,
    ): ResponseInterface {
        $page = $this->pageRepository->findOneBySlug($slug);
        if ($page === null) {
            return $this->responseFactory->createResponse(Status::NOT_FOUND);
        }

        return $this->viewRenderer->render(__DIR__ . '/view', [
            'page' => $page,
        ]);
    }
}
```

Теперь создайте шаблон в файле `src/Web/Page/view.php`:

```php
<?php
use App\Web\Page\Page;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/** @var Page $page */
/** @var UrlGeneratorInterface $urlGenerator */
/* @var Csrf $csrf */
?>

<h1><?= Html::a('Pages', $urlGenerator->generate('page/list')) ?> → <?= Html::encode($page->title) ?></h1>

<p>
    <?= Html::encode($page->text) ?>
</p>

<?= Html::a('Edit', $urlGenerator->generate('page/edit', ['slug' => $page->getSlug()])) ?> |


<?php
    $deleteForm = Html::form()
        ->post($urlGenerator->generate('page/delete', ['slug' => $page->getSlug()]))
        ->csrf($csrf);
?>
<?= $deleteForm->open() ?>
    <?= Html::submitButton('Delete') ?>
<?= $deleteForm->close() ?>
```

В этом представлении есть форма, которая отправляет запрос на удаление
страницы. Обработка таких запросов через `GET` тоже встречается, но это
неправильно. Поскольку удаление изменяет данные, оно должно обрабатываться
одним из неидемпотентных HTTP-методов. В нашем примере используется POST и
форма, но это может быть и `DELETE` с асинхронным запросом на
JavaScript. Кнопку можно позже стилизовать, чтобы она выглядела похоже на
"Редактировать".

### Удаление страницы

Создайте файл `src/Web/Page/DeleteAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class DeleteAction
{
    public function __construct(
        private PageRepository $pageRepository,
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug
    ): ResponseInterface
    {
        $this->pageRepository->deleteBySlug($slug);

        return $this->responseFactory
            ->createResponse(Status::SEE_OTHER)
            ->withHeader('Location', $this->urlGenerator->generate('page/list'));
    }
}
```

### Создание или обновление страницы

Прежде всего, необходимо создать форму в файле `src/Web/Page/Form.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Label;
use Yiisoft\Validator\Rule\Length;

final class Form extends FormModel
{
    #[Label('Title')]
    #[Length(min: 2)]
    public string $title = '';

    #[Label('Text')]
    #[Length(min: 2)]
    public string $text = '';
}
```

Затем создайте действие в файле `src/Web/Page/EditAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use DateTimeImmutable;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Ramsey\Uuid\Uuid;
use Yiisoft\FormModel\FormHydrator;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class EditAction
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private FormHydrator $formHydrator,
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function __invoke(
        #[RouteArgument('slug')]
        string $slug,
        ServerRequestInterface $request,
        PageRepository $pageRepository,
    ): ResponseInterface
    {
        $isNew = $slug === 'new';

        $form = new Form();

        if (!$isNew) {
            $page = $pageRepository->findOneBySlug($slug);
            if ($page === null) {
                return $this->responseFactory->createResponse(Status::NOT_FOUND);
            }

            $form->title = $page->title;
            $form->text = $page->text;
        }

        $this->formHydrator->populateFromPostAndValidate($form, $request);

        if ($form->isValid()) {
            $id = $isNew ? Uuid::uuid7()->toString() : $page->id;

            $page = Page::create(
                id: $id,
                title: $form->title,
                text: $form->text,
                updatedAt: new DateTimeImmutable(),
            );

            $pageRepository->save($page);

            return $this->responseFactory
                ->createResponse(Status::SEE_OTHER)
                ->withHeader(
                    'Location',
                    $this->urlGenerator->generate('page/view', ['slug' => $page->getSlug()]),
                );
        }

        return $this->viewRenderer->render(__DIR__ . '/edit', [
            'form' => $form,
            'isNew' => $isNew,
            'slug' => $slug,
        ]);
    }
}
```

Обратите внимание, что `Uuid::uuid7()->toString()` не будет работать для MySQL, и вам понадобятся байты вместо этого, `Uuid::uuid7()->getBytes()`.

В приведенном выше коде используется специальный slug в URL для новых
страниц, чтобы URL выглядел как `http://localhost/pages/new`. Если страница
не новая, форма предварительно заполняется данными из базы
данных. Аналогично тому, как это было сделано в разделе [Работа с
формами](forms.md), обрабатывается отправка формы. После успешного
сохранения происходит перенаправление на страницу просмотра.

Теперь создайте шаблон в файле `src/Web/Page/edit.php`:

```php
<?php
use App\Web\Page\Form;
use Yiisoft\FormModel\Field;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/**
 * @var Form $form
 * @var string[] $errors
 * @var UrlGeneratorInterface $urlGenerator
 * @var Csrf $csrf
 * @var bool $isNew
 * @var string $slug
 */

$htmlForm = Html::form()
    ->post($urlGenerator->generate('page/edit', ['slug' => $slug]))
    ->csrf($csrf);
?>

<?= $htmlForm->open() ?>
    <?= Field::text($form, 'title')->required() ?>
    <?= Field::textarea($form, 'text')->required() ?>
    <?= Html::submitButton('Save') ?>
<?= $htmlForm->close() ?>
```

### Маршрутизация

Измените файл `config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Http\Method;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::methods([Method::GET, Method::POST], '/say')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),

            Group::create('/pages')->routes(
                Route::get('')
                    ->action(Web\Page\ListAction::class)
                    ->name('page/list'),
                Route::get('/{slug}')
                    ->action(Web\Page\ViewAction::class)
                    ->name('page/view'),
                Route::methods([Method::GET, Method::POST], '/{slug}/edit')
                    ->action(Web\Page\EditAction::class)
                    ->name('page/edit'),
                Route::post('/{slug}/delete')
                    ->action(Web\Page\DeleteAction::class)
                    ->name('page/delete'),
            ),
        ),
];
```

Обратите внимание, что все маршруты, связанные со страницами, сгруппированы
под префиксом `/pages`. Это удобный способ избежать дублирования кода и
применить дополнительные обработчики запросов, такие как аутентификация, ко
всем маршрутам в группе.

## Проверка работы

Теперь проверьте результат, открыв в браузере `http://localhost/pages`.

