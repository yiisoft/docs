# Trabajar con bases de datos

Yii no impone el uso de una base de datos o un almacenamiento concretos para
tu aplicación. Hay muchas formas de trabajar con bases de datos
relacionales:

- [Yii DB](https://github.com/yiisoft/db)
- [Yii Active Record](https://github.com/yiisoft/active-record)
- [Cycle](https://github.com/cycle) mediante el [paquete Yii
  Cycle](https://github.com/yiisoft/yii-cycle)
- [Doctrine](https://www.doctrine-project.org/) mediante el [paquete Yii
  Doctrine](https://github.com/stargazer-team/yii-doctrine)
- [PDO](https://www.php.net/manual/en/book.pdo.php)

Para las no relacionales, normalmente hay bibliotecas oficiales disponibles:

- [ElasticSearch](https://github.com/elastic/elasticsearch-php)
- [Redis](https://redis.io/docs/latest/develop/clients/php/)
- ...

## Elegir un enfoque de acceso a datos

Yii3 mantiene el acceso a bases de datos en paquetes opcionales. Una aplicación nueva no obtiene automáticamente un componente global `Yii::$app->db`
ni una capa de Active Record integrada, así que elige el paquete y la frontera que mejor se adapten a tu aplicación.

Si usabas la capa de acceso a bases de datos de Yii 2.0, `yiisoft/db` es el equivalente más cercano en Yii3. Proporciona conexiones
a bases de datos, comandos, soporte de esquemas y un constructor de consultas. En lugar de llamar a `Yii::$app->db`, configura una
conexión como servicio e inyecta `ConnectionInterface` donde se necesite la base de datos.

Si usabas Active Record de Yii 2.0, puedes instalar
`yiisoft/active-record`. Es útil cuando tus clases de modelo se limitan
sobre todo a describir tablas y relaciones. En las aplicaciones en las que
las clases Active Record de Yii 2.0 también contienen validación de
formularios, escenarios de solicitud, comprobaciones de autorización o
flujos de negocio, traslada esas responsabilidades a modelos de formulario,
servicios y objetos de dominio en lugar de volver a ponerlas en la clase del
registro.

Para la mayor parte del código de la aplicación, pon un repositorio o un
servicio de consulta entre la capa de acciones/servicios y el
almacenamiento:

- las acciones y los servicios de la aplicación dependen de métodos del
  repositorio como `findOneBySlug()`, `findAll()`, `save()` y
  `deleteBySlug()`;
- el repositorio oculta si la persistencia se implementa con `yiisoft/db`,
  Active Record, Cycle, Doctrine u otro almacenamiento;
- el repositorio es el lugar donde se transforman las filas en bruto de la
  base de datos o los registros en los objetos tipados que usa el resto del
  código.

Las aplicaciones CRUD pequeñas pueden empezar con una clase de repositorio
concreta. Las aplicaciones más grandes suelen beneficiarse de una interfaz
de repositorio en el dominio o en el módulo y una implementación en la capa
de infraestructura.

En esta guía nos centraremos en trabajar con bases de datos relacionales
mediante Yii DB. Usaremos PostgreSQL para implementar un CRUD sencillo
(crear, leer, actualizar y eliminar).

## Instalar PostgreSQL

Tienes que instalar PostgreSQL. Si prefieres no usar Docker, [descarga el
instalador desde la web oficial](https://www.postgresql.org/download/),
instálalo y crea una base de datos.

Si usas Docker, es algo más sencillo. Modifica `docker/dev/compose.yml`:

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
        image: postgres:${POSTGRES_VERSION:-18}-alpine
        environment:
            POSTGRES_DB: app
            POSTGRES_PASSWORD: password
            POSTGRES_USER: user
            POSTGRES_INITDB_ARGS: "--locale-provider=icu --icu-locale=und --encoding=UTF8"
        volumes:
            - ../runtime/db:/var/lib/postgresql:rw
        ports:
            - "${DEV_DB_PORT:-5432}:5432"
        healthcheck:
            test: [ "CMD-SHELL", "pg_isready -U user -d app" ]
            interval: 5s
            timeout: 5s
            retries: 5
```

Ten en cuenta que añadimos `depends_on` para que la aplicación espere a que
la base de datos esté en marcha.

> [!IMPORTANT]
> Además, necesitaremos la extensión `pdo_pgsql` para comunicarnos con PostgreSQL. En local, puedes habilitarla en `php.ini`.

Si usas Docker, revisa `docker/Dockerfile` y añade `pdo_pgsql` a la lista de
`install-php-extensions`:

```dockerfile
RUN install-php-extensions \
    opcache \
    mbstring \
    intl \
    dom \
    ctype \
    curl \
    phar \
    openssl \
    xml \
    xmlwriter \
    simplexml \
    pdo \
    pdo_pgsql
```

Después, vuelve a construir la imagen de PHP con

```sh
make build && make down && make up
```

## Configurar la conexión

Ahora que tenemos la base de datos, es hora de definir la conexión.

Primero tenemos que instalar un paquete:

```sh
make composer require yiisoft/db-pgsql:2.*
```

Ahora crea `config/common/di/db-pgsql.php`:

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

Y define los parámetros en `config/common/params.php`. Con Docker sería:

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

El host `db` se resuelve automáticamente dentro de la red de Docker.

En una instalación local sin Docker, el host del DSN sería
`localhost`. Tendrás que ajustar el resto según cómo hayas configurado la
base de datos.

### Varias conexiones a bases de datos

Cuando la aplicación trabaja con varias bases de datos, mantén
`ConnectionInterface` para la conexión principal y añade un alias de clase
para cada conexión con nombre:

```php
<?php

use App\Db\AnalyticsDatabase;
use App\Db\MainDatabase;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Db\Pgsql\Connection;
use Yiisoft\Db\Pgsql\Driver;

/** @var array $params */

class_alias(Connection::class, MainDatabase::class);
class_alias(Connection::class, AnalyticsDatabase::class);

return [
    ConnectionInterface::class => MainDatabase::class,

    MainDatabase::class => [
        'class' => Connection::class,
        '__construct()' => [
            'driver' => new Driver(
                $params['app/db']['main']['dsn'],
                $params['app/db']['main']['username'],
                $params['app/db']['main']['password'],
            ),
        ],
    ],

    AnalyticsDatabase::class => [
        'class' => Connection::class,
        '__construct()' => [
            'driver' => new Driver(
                $params['app/db']['analytics']['dsn'],
                $params['app/db']['analytics']['username'],
                $params['app/db']['analytics']['password'],
            ),
        ],
    ],
];
```

Los nombres de las clases alias se usan como identificadores de servicio y
en las declaraciones de tipo. No necesitan archivos PHP propios.

Define los parámetros correspondientes:

```php
use Yiisoft\Db\Pgsql\Dsn;

return [
    // ...
    'app/db' => [
        'main' => [
            'dsn' => new Dsn('pgsql', 'db', 'app', '5432'),
            'username' => 'user',
            'password' => 'password',
        ],
        'analytics' => [
            'dsn' => new Dsn('pgsql', 'analytics-db', 'analytics', '5432'),
            'username' => 'analytics_user',
            'password' => 'analytics_password',
        ],
    ],
];
```

Los servicios que necesitan la base de datos principal pueden seguir
dependiendo de `ConnectionInterface`. Los servicios que necesitan otra base
de datos deben declarar como tipo el alias correspondiente:

```php
<?php

declare(strict_types=1);

namespace App\Report;

use App\Db\AnalyticsDatabase;

final readonly class ReportRepository
{
    public function __construct(
        private AnalyticsDatabase $connection,
    ) {}
}
```

## Crear y aplicar migraciones

Para el estado inicial de la aplicación y para los cambios posteriores en la
base de datos, conviene usar migraciones. Son archivos que aplican cambios a
la base de datos. Las migraciones aplicadas se registran en la base de
datos, lo que nos permite conocer el estado actual y saber qué migraciones
quedan por aplicar.

Para usar migraciones necesitamos instalar otro paquete:

```sh
make composer require yiisoft/db-migration
```

Crea, a partir de la raíz del proyecto, un directorio `src/Migration` para
guardar las migraciones. Añade la siguiente configuración a
`config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

Ahora puedes usar `make yii migrate:create page` para crear una migración
nueva. Para nuestro ejemplo necesitamos una tabla `page` con algunas
columnas:

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

El nombre `M251102141707Page` de la clase de migración se genera
automáticamente, así que sustituye el sufijo `Page` por el nombre real de la
migración. El prefijo `M251102141707` es necesario para encontrar las
migraciones y ordenarlas según se añadieron.

Ten en cuenta que usamos UUID como clave primaria. Vamos a generar estos
identificadores nosotros mismos en lugar de depender de la base de datos,
así que necesitaremos un paquete de Composer adicional para ello.

```shell
make composer require ramsey/uuid
```

Aunque ocupa algo más de espacio que un int, trabajar con este tipo de
identificadores tiene ventajas. Como generas tú mismo el identificador,
puedes definir un conjunto de datos relacionados y guardarlo en una sola
transacción. Las entidades que definen este conjunto de datos en el código
suelen llamarse "agregado".

Aplica la migración con `make yii migrate:up`.

## Una entidad

Ahora que tienes una tabla, es hora de definir una entidad en el
código. Crea `src/Web/Page/Page.php`:

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
        public string $slug,
        public DateTimeImmutable $createdAt,
        public DateTimeImmutable $updatedAt,
    ) {
    }

    public static function create(
        string $id,
        string $title,
        string $text,
        string $slug = null,
        DateTimeImmutable $createdAt = new DateTimeImmutable(),
        DateTimeImmutable $updatedAt = new DateTimeImmutable(),
    ): self
    {
        return new self(
            id: $id,
            title: $title,
            slug: $slug ?? (new Inflector())->toSlug($title),
            text: $text,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
        );
    }
}
```

## Repositorio

Ahora que tenemos una entidad, necesitamos un lugar para los métodos que la
guardan, la eliminan y seleccionan una sola página o varias. Esta es la
frontera del repositorio descrita antes: el resto de la aplicación trabaja
con objetos `Page` y no necesita saber cómo se almacenan.

Crea `src/Web/Page/PageRepository.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use DateTimeImmutable;
use Yiisoft\Db\Connection\ConnectionInterface;

final readonly class PageRepository
{
    public function __construct(
        private ConnectionInterface $connection,
    ) {}

    public function save(Page $page): void
    {
        $row = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'text' => $page->text,
            'created_at' => $page->createdAt,
            'updated_at' => $page->updatedAt,
        ];

        if ($this->exists($page->id)) {
            $this->connection->createCommand()->update('{{%page}}', $row, ['id' => $page->id])->execute();
        } else {
            $this->connection->createCommand()->insert('{{%page}}', $row)->execute();
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
        $rows = $this->connection
            ->select()
            ->from('{{%page}}')
            ->all();

        foreach ($rows as $row) {
            yield $this->createPage($row);
        }
    }

    private function createPage(?array $row): ?Page
    {
        if ($row === null) {
            return null;
        }

        return Page::create(
            id: $row['id'],
            title: $row['title'],
            text: $row['text'],
            slug: $row['slug'],
            createdAt: new DateTimeImmutable($row['created_at']),
            updatedAt: new DateTimeImmutable($row['updated_at']),
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

En este repositorio hay tanto métodos para obtener datos como `save()`, que
inserta o actualiza. La base de datos devuelve los datos en bruto como
arrays, pero nuestro repositorio crea automáticamente entidades a partir de
ellos, de modo que después trabajamos con datos tipados.

## Acciones y rutas

Necesitamos algunas acciones para:

1. Listar todas las páginas.
2. Ver una página.
3. Eliminar una página.
4. Crear una página.
5. Actualizar una página.

Después necesitamos el enrutamiento para todas ellas.

Vamos a abordarlas una a una.

### Listar todas las páginas

Crea `src/Web/Page/ListAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class ListAction
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
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

Define la vista de lista en `src/Web/Page/list.php`:

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
        <?= Html::a($page->title, $urlGenerator->generate('page/view', ['slug' => $page->slug])) ?>
    </li>
    <?php endforeach ?>
</ul>

<?= Html::a('Create', $urlGenerator->generate('page/edit', ['slug' => 'new'])) ?>
```

### Ver una página

Crea `src/Web/Page/ViewAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Page;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class ViewAction
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
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

Ahora, una plantilla en `src/Web/Page/view.php`:

```php
<?php
use App\Web\Page\Page;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/** @var Page $page */
/** @var UrlGeneratorInterface $urlGenerator */
/** @var Csrf $csrf */
?>

<h1><?= Html::a('Pages', $urlGenerator->generate('page/list')) ?> → <?= Html::encode($page->title) ?></h1>

<p>
    <?= Html::encode($page->text) ?>
</p>

<?= Html::a('Edit', $urlGenerator->generate('page/edit', ['slug' => $page->slug])) ?> |


<?php
    $deleteForm = Html::form()
        ->post($urlGenerator->generate('page/delete', ['slug' => $page->slug]))
        ->csrf($csrf);
?>
<?= $deleteForm->open() ?>
    <?= Html::submitButton('Delete') ?>
<?= $deleteForm->close() ?>
```

En esta vista tenemos un formulario que envía una solicitud para eliminar la
página. Gestionarlo con `GET` también es habitual, pero es un grave
error. Como la eliminación modifica datos, debe gestionarse con uno de los
métodos HTTP no idempotentes. En nuestro ejemplo usamos POST y un
formulario, pero podría ser `DELETE` y una solicitud asíncrona hecha con
JavaScript. Más adelante se le puede dar estilo al botón para que se parezca
a "Edit".

### Eliminar una página

Crea `src/Web/Page/DeleteAction.php`:

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

### Crear o actualizar una página

En primer lugar, necesitamos un formulario en `src/Web/Page/Form.php`:

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

Después, una acción. Crea `src/Web/Page/EditAction.php`:

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
use Yiisoft\Strings\Inflector;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class EditAction
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
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
            );

            $pageRepository->save($page);

            return $this->responseFactory
                ->createResponse(Status::SEE_OTHER)
                ->withHeader(
                    'Location',
                    $this->urlGenerator->generate('page/view', ['slug' => $page->slug]),
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

Ten en cuenta que `Uuid::uuid7()->toString()` no funcionará con MySQL; en ese caso necesitarás los bytes, `Uuid::uuid7()->getBytes()`.

En el código anterior usamos un slug especial en la URL para las páginas
nuevas, de modo que la URL queda como `http://localhost/pages/new`. Si la
página no es nueva, rellenamos previamente el formulario con los datos de la
base de datos. Igual que hicimos en [Trabajar con formularios](forms.md),
gestionamos el envío del formulario. Tras guardar correctamente, redirigimos
a la vista de la página.

Ahora, una plantilla en `src/Web/Page/edit.php`:

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

### Enrutamiento

Ajusta `config/common/routes.php`:

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

Ten en cuenta que hemos agrupado todas las rutas relacionadas con las
páginas en un grupo con el prefijo `/pages`. Es una forma práctica tanto de
no repetirse como de añadir middlewares adicionales, como la autenticación,
a todo el grupo.

## Probarlo

Ahora pruébalo abriendo `http://localhost/pages` en tu navegador.
