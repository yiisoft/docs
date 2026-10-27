# Trabalhando com bancos de dados

O Yii não impõe um banco de dados ou armazenamento específico para a sua
aplicação.  Há muitas formas de trabalhar com bancos de dados relacionais:

- [Yii DB](https://github.com/yiisoft/db)
- [Yii Active Record](https://github.com/yiisoft/active-record)
- [Cycle](https://github.com/cycle) pelo [pacote Yii
  Cycle](https://github.com/yiisoft/yii-cycle)
- [Doctrine](https://www.doctrine-project.org/) pelo [pacote Yii
  Doctrine](https://github.com/stargazer-team/yii-doctrine)
- [PDO](https://www.php.net/manual/en/book.pdo.php)

Para os não relacionais, geralmente existem bibliotecas oficiais:

- [ElasticSearch](https://github.com/elastic/elasticsearch-php)
- [Redis](https://redis.io/docs/latest/develop/clients/php/)
- ...

## Escolhendo uma forma de acesso aos dados

O Yii3 deixa o acesso ao banco de dados em pacotes opcionais. Uma aplicação nova não ganha automaticamente um componente global `Yii::$app->db`
nem uma camada de Active Record embutida, então escolha o pacote e a fronteira que fazem sentido para a sua aplicação.

Se você usava a camada de acesso ao banco de dados do Yii 2.0, o `yiisoft/db` é o equivalente mais próximo no Yii3. Ele oferece
conexões, comandos, suporte a esquema e um query builder. Em vez de chamar `Yii::$app->db`, configure uma
conexão como serviço e injete `ConnectionInterface` onde o banco de dados for necessário.

Se você usava o Active Record do Yii 2.0, pode instalar o
`yiisoft/active-record`. Ele é útil quando suas classes de model descrevem
principalmente tabelas e relações. Em aplicações em que as classes Active
Record do Yii 2.0 também contêm validação de formulário, cenários de
requisição, verificações de autorização ou fluxos de negócio, mova essas
responsabilidades para form models, serviços e objetos de domínio em vez de
colocá-las de volta na classe do registro.

Na maior parte do código da aplicação, coloque um repositório ou serviço de
consulta entre a camada de actions/serviços e o armazenamento:

- actions e serviços da aplicação dependem de métodos do repositório como
  `findOneBySlug()`, `findAll()`, `save()` e `deleteBySlug()`;
- o repositório esconde se a persistência é feita com `yiisoft/db`, Active
  Record, Cycle, Doctrine ou outro armazenamento;
- o repositório é o lugar para converter as linhas brutas do banco de dados
  ou os registros em objetos tipados usados pelo resto do código.

Aplicações CRUD pequenas podem começar com uma classe de repositório
concreta. Aplicações maiores costumam se beneficiar de uma interface de
repositório no domínio ou módulo e de uma implementação na camada de
infraestrutura.

Neste guia, vamos focar no trabalho com bancos de dados relacionais usando o
Yii DB. Vamos usar PostgreSQL para implementar um CRUD simples (create,
read, update, delete: criar, ler, atualizar e excluir).

## Instalando o PostgreSQL

Você precisa instalar o PostgreSQL. Se preferir não usar Docker, [baixe o
instalador no site oficial](https://www.postgresql.org/download/), instale e
crie um banco de dados.

Se você usa Docker, é um pouco mais simples. Altere
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

Repare que adicionamos `depends_on` para que a aplicação espere o banco de
dados subir.

> [!IMPORTANT]
> Também vamos precisar da extensão `pdo_pgsql` para falar com o PostgreSQL. Você pode habilitá-la localmente no `php.ini`.

Se você usa Docker, abra `docker/Dockerfile` e adicione `pdo_pgsql` à lista
do `install-php-extensions`:

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

Depois, reconstrua a imagem do PHP com

```sh
make build && make down && make up
```

## Configurando a conexão

Agora que temos o banco de dados, é hora de definir a conexão.

Primeiro, precisamos instalar um pacote:

```sh
make composer require yiisoft/db-pgsql:2.*
```

Agora crie `config/common/di/db-pgsql.php`:

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

E defina os parâmetros em `config/common/params.php`. Para o Docker, fica
assim:

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

O host `db` é resolvido automaticamente dentro da rede do Docker.

Em uma instalação local sem Docker, o host no Dsn seria `localhost`. Ajuste
o resto conforme a forma como você configurou o banco de dados.

### Várias conexões de banco de dados

Quando a aplicação trabalha com vários bancos de dados, mantenha
`ConnectionInterface` para a conexão principal e adicione um alias de classe
para cada conexão nomeada:

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

Os nomes das classes alias são usados como IDs de serviço e type hints. Eles
não precisam de arquivos PHP próprios.

Defina os parâmetros correspondentes:

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

Serviços que precisam do banco de dados principal continuam podendo depender
de `ConnectionInterface`. Serviços que precisam de outro banco de dados
devem usar o alias correspondente como type hint:

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

## Criando e aplicando migrations

Para o estado inicial da aplicação e para as mudanças seguintes no banco de
dados, é uma boa ideia usar migrations.  Elas são arquivos que aplicam
mudanças no banco de dados. As migrations aplicadas ficam registradas no
banco, o que permite saber o estado atual e quais migrations ainda faltam
aplicar.

Para usar migrations, precisamos instalar outro pacote:

```sh
make composer require yiisoft/db-migration
```

Crie o diretório `src/Migration` para guardar as migrations, direto na raiz
do projeto. Adicione a seguinte configuração em `config/common/params.php`:

```php
'yiisoft/db-migration' => [
    'newMigrationNamespace' => 'App\\Migration',
    'sourceNamespaces' => ['App\\Migration'],
],
```

Agora você pode usar `make yii migrate:create page` para criar uma nova
migration. No nosso exemplo, precisamos de uma tabela `page` com algumas
colunas:

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

O nome `M251102141707Page` da classe da migration é gerado, então substitua
o sufixo `Page` pelo nome real da migration. O prefixo `M251102141707` é
necessário para encontrar e ordenar as migrations na ordem em que foram
adicionadas.

Repare que usamos UUID como chave primária. Vamos gerar esses IDs nós
mesmos, em vez de depender do banco de dados, então precisamos de um pacote
extra do Composer para isso.

```shell
make composer require ramsey/uuid
```

O espaço de armazenamento é um pouco maior do que com int, mas o fluxo de
trabalho com esse tipo de ID compensa. Como você mesmo gera o ID, pode
definir um conjunto de dados relacionados e salvá-lo em uma única
transação.  As entidades que definem esse conjunto de dados no código
costumam ser chamadas de "agregado".

Aplique a migration com `make yii migrate:up`.

## Uma entidade

Agora que você tem uma tabela, é hora de definir uma entidade no
código. Crie `src/Web/Page/Page.php`:

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

## Repositório

Agora que temos uma entidade, precisamos de um lugar para os métodos que a
salvam, a excluem e selecionam uma única página ou várias. Essa é a
fronteira de repositório descrita antes: o resto da aplicação trabalha com
objetos `Page` e não precisa saber como eles são armazenados.

Crie `src/Web/Page/PageRepository.php`:

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

Neste repositório há tanto métodos para buscar dados quanto o `save()`, que
faz insert ou update. O DB retorna os dados brutos como arrays, mas o nosso
repositório cria entidades automaticamente a partir deles, e daí em diante
trabalhamos com dados tipados.

## Actions e rotas

Precisamos de algumas actions para:

1. Listar todas as páginas.
2. Ver uma página.
3. Excluir uma página.
4. Criar uma página.
5. Atualizar uma página.

Depois, precisamos do roteamento para tudo isso.

Vamos resolver uma coisa de cada vez.

### Listar todas as páginas

Crie `src/Web/Page/ListAction.php`:

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

Defina a view da lista em `src/Web/Page/list.php`:

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

### Ver uma página

Crie `src/Web/Page/ViewAction.php`:

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

Agora, um template em `src/Web/Page/view.php`:

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

Nesta view há um formulário que envia uma requisição para excluir a
página. Tratar isso com `GET` também é comum, mas é muito errado. Como a
exclusão altera dados, ela precisa ser tratada por um dos métodos HTTP não
idempotentes.  No nosso exemplo usamos POST e um formulário, mas poderia ser
`DELETE` e uma requisição assíncrona feita com JavaScript.  Depois, o botão
pode ganhar um estilo adequado para ficar parecido com o "Edit".

### Excluir uma página

Crie `src/Web/Page/DeleteAction.php`:

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

### Criar ou atualizar uma página

Antes de tudo, precisamos de um formulário em `src/Web/Page/Form.php`:

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

Depois, uma action. Crie `src/Web/Page/EditAction.php`:

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

Repare que `Uuid::uuid7()->toString()` não funciona no MySQL; lá você vai precisar dos bytes, com `Uuid::uuid7()->getBytes()`.

Acima, usamos um slug especial na URL para páginas novas, então a URL fica
como `http://localhost/pages/new`. Se a página não for nova, preenchemos o
formulário com os dados do banco de dados. Assim como fizemos em
[Trabalhando com formulários](forms.md), tratamos o envio do
formulário. Depois de salvar com sucesso, redirecionamos para a view da
página.

Agora, um template em `src/Web/Page/edit.php`:

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

### Roteamento

Ajuste `config/common/routes.php`:

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

Repare que agrupamos todas as rotas relacionadas a páginas em um grupo com o
prefixo `/pages`. É uma forma prática de não se repetir e também de
adicionar algum middleware extra, como autenticação, ao grupo inteiro.

## Testando

Agora teste abrindo `http://localhost/pages` no navegador.
