# Migrando da versão 2.0

> Se você não usou o Yii 2.0, pode pular esta seção e ir direto para a seção "[primeiros passos](../start/prerequisites.md)"
> do guia.

O Yii3 mantém muitas ideias do Yii, mas não é um substituto direto do Yii
2.0. Ele usa recursos do PHP 8, interfaces PSR, injeção de dependência,
composição explícita de pacotes e um template de aplicação diferente. Use
sua experiência com o Yii 2.0 para projetar uma nova aplicação Yii3 de forma
deliberada, em vez de tentar reproduzir a estrutura da aplicação antiga.

Para as aplicações de origem, compare com:

- [yiisoft/yii2-app-basic](https://github.com/yiisoft/yii2-app-basic)
- [yiisoft/yii2-app-advanced](https://github.com/yiisoft/yii2-app-advanced)

Para a estrutura de destino, compare com:

- [yiisoft/app](https://github.com/yiisoft/app)
- [Guia do Yii3](../index.md)

Antes de começar, [confira a política de manutenção e as datas de fim de
vida do Yii 2.0](https://www.yiiframework.com/release-cycle).  Manter uma
aplicação Yii 2.0 madura no Yii 2.0 pode ser uma escolha válida. Um projeto
Yii3 é mais útil quando você quer o novo ecossistema de pacotes, tipagem
mais rigorosa, middleware PSR e uma arquitetura mais explícita.

## Abordagem recomendada

Pense no trabalho como a construção de uma aplicação Yii3 guiada pela
antiga. O projeto antigo diz quais rotas, formulários, tabelas do banco de
dados, regras de negócio e fluxos dos usuários importam. O projeto Yii3 deve
decidir de novo onde cada uma dessas responsabilidades fica.

Construa em vertical slices:

1. Crie uma nova aplicação Yii3 com `yiisoft/app`.
2. Configure o autoloading do Composer e adicione só o código necessário
   para o slice que você está construindo.
3. Defina a configuração e as rotas antes de escrever as actions.
4. Construa um fluxo de requisição por vez: rota, action, modelo de entrada,
   serviço, persistência, view, assets, testes.
5. Mantenha a aplicação Yii 2.0 rodando até cada fluxo ser verificado no
   Yii3.

Evite mover toda a árvore de diretórios primeiro. Os padrões do Yii3 são
intencionalmente diferentes, e uma cópia mecânica tende a preservar as
suposições de service locator do Yii 2.0. Prefira decisões pequenas e
revisadas a carregar a estrutura antiga só porque ela é familiar.

## Prepare a aplicação Yii 2.0

Uma preparação útil pode acontecer antes de a aplicação Yii3 estar
pronta. Estas refatorações melhoram o próprio projeto Yii 2.0 e deixam a
reescrita posterior menos dependente de estado oculto do framework:

- Substitua o acesso a `Yii::$app` no código reutilizável por argumentos do
  construtor onde for viável. Se uma refatoração completa para injeção de
  dependência for grande demais, mantenha as chamadas a `Yii::$app` perto de
  controllers e widgets, e passe valores e serviços explicitamente para o
  código de nível mais baixo.
- Introduza repositórios ou serviços de consulta para as leituras do banco
  de dados hoje espalhadas por controllers, views, widgets e métodos do
  Active Record. O Yii3 não exige Active Record para persistência, então uma
  fronteira de repositório dá a você um lugar natural para trocar a
  implementação depois.
- Separe as regras de negócio da infraestrutura do framework. Código de
  domínio que não estende classes do Yii, não lê o estado global da
  aplicação nem renderiza views é muito mais fácil de reutilizar ou
  reescrever.
- Mova o comportamento reutilizável para componentes ou serviços do Yii 2.0
  em vez de mantê-lo dentro de controllers e classes Active Record
  grandes. Os serviços do Yii3 são configurados e injetados de outra forma,
  mas a fronteira de responsabilidade é parecida.
- Adicione testes em torno das rotas e fluxos que você planeja reconstruir
  primeiro. Eles se tornam a especificação executável do slice Yii3.

Por exemplo, em vez de ler os dados do arquivo de posts diretamente em
vários controllers ou widgets, crie um pequeno serviço que descreva a
necessidade da aplicação:

```php
final class PostRepository
{
    public function getArchive(): array
    {
        // ...
    }

    public function getTopForFrontPage(int $limit = 10): array
    {
        // ...
    }
}
```

A implementação no Yii3 ainda pode usar Active Record, ou pode usar
consultas do `yiisoft/db`. O importante é que controllers e views não
precisem mais conhecer esse detalhe.

## O que aprender antes de começar

Vale a pena conhecer algumas escolhas do template de aplicação do Yii3 antes
de começar a mover funcionalidades:

- [Docker](https://www.docker.com/get-started/). O template de aplicação
  padrão do Yii3 inclui configuração do Docker.  Usá-lo dá a cada aplicação
  seu próprio ambiente reproduzível e reduz as diferenças entre o
  desenvolvimento local e a produção.
- [Variáveis de
  ambiente](https://en.wikipedia.org/wiki/Environment_variable). Os
  templates do Yii3 costumam usá-las para configurações específicas de
  ambiente e segredos, especialmente em deploys baseados em Docker. Isso
  segue a mesma ideia da [configuração de aplicações
  12-factor](https://12factor.net/config).
- [Actions](../structure/action.md). O Yii3 não exige herança de
  controller. Uma rota pode apontar para qualquer callable, e o template
  padrão usa classes de action invocáveis.
- [Estrutura da aplicação](../structure/overview.md). A estrutura padrão do
  Yii3 é diferente da do Yii 2.0. Ela é flexível, mas comece com o template
  do Yii3 e altere-o apenas quando a aplicação precisar.

## Requisitos de PHP

Os templates de aplicação do Yii3 exigem PHP 8.2 ou superior. Com isso, o
código da aplicação pode usar recursos da linguagem que não eram comuns em
aplicações Yii 2.0:

- [Declarações de
  tipo](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Declarações de tipo de
  retorno](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Visibilidade de constantes de
  classe](https://www.php.net/manual/en/language.oop5.constants.php)
- [Argumentos
  nomeados](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)
- [Classes
  anônimas](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generators](https://www.php.net/manual/en/language.generators.php)
- [Funções
  variádicas](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)
- [Propriedades
  readonly](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.readonly-properties)
- [Classes
  readonly](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.readonly)
- [Promoção de propriedades no
  construtor](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion)
- [Atributos](https://www.php.net/manual/en/language.attributes.php)

Rode análise estática e testes no Yii 2.0 antes de reutilizar código no
Yii3. Código com tipos explícitos, serviços pequenos e poucas dependências
implícitas de `Yii::$app` é mais fácil de entender e de encaixar na nova
aplicação.

## Estrutura do projeto

Aplicações Yii 2.0 costumam manter os papéis do framework em diretórios de
primeiro nível:

```text
assets/
commands/
config/
controllers/
models/
runtime/
views/
web/
widgets/
```

O template advanced do Yii 2.0 divide os mesmos papéis por aplicação:

```text
backend/
common/
console/
frontend/
```

O template de aplicação atual do Yii3 é organizado em torno do código-fonte,
da configuração, dos arquivos públicos e dos arquivos de runtime:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Mapeamentos típicos a considerar:

| Yii 2.0 basic | Yii 2.0 advanced | Yii3 |
|---------------|------------------|------|
| `controllers/` | `frontend/controllers/`, `backend/controllers/` | `src/Web/*/Action.php` ou classes no estilo controller |
| `models/` | `common/models/`, models específicos de cada app | `src/Domain`, `src/Shared`, `src/Web/*` ou `src/Db`, conforme a responsabilidade |
| `views/` | `frontend/views/`, `backend/views/` | templates perto da funcionalidade, por exemplo `src/Web/HomePage/template.php` |
| `views/layouts/` | diretórios de layout de cada app | classes/templates de layout, por exemplo `src/Web/Shared/Layout/Main` |
| `assets/` | asset bundles de cada app | `assets/` para os arquivos-fonte e `src/Web/.../*Asset.php` para os bundles |
| `web/` | `frontend/web/`, `backend/web/` | `public/` |
| `commands/` | `console/controllers/` | `src/Console/*Command.php` |
| `config/*.php` | arquivos de configuração do app e comuns | `config/common`, `config/web`, `config/console`, `config/environments` |

Não existe um layout obrigatório único. A mudança importante é que
aplicações Yii3 devem agrupar o código por responsabilidade e tornar as
dependências explícitas. Se você vem do template advanced, trate `frontend`
e `backend` como contextos web separados. O código de domínio compartilhado
pode ficar em `src/Shared` ou em pacotes específicos da aplicação.

## Composer e autoloading

Aplicações Yii 2.0 geralmente fazem require de `vendor/autoload.php` e
`vendor/yiisoft/yii2/Yii.php` em `web/index.php`.  Aplicações Yii3 precisam
apenas do autoloader do Composer e do código de bootstrap da aplicação.

Configure o namespace da sua aplicação com PSR-4:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Depois, reconstrua os arquivos de autoload do Composer:

```shell
composer dump-autoload
```

Instale os pacotes Yii3 de forma intencional. O Yii3 é dividido em pacotes
focados, então funcionalidades como acesso ao banco de dados, formulários,
validação, assets, widgets de dados, autenticação e cache são dependências
separadas do Composer.

## Configuração e serviços

No Yii 2.0, muitos serviços são configurados como componentes da aplicação e
acessados pelo service locator:

```php
$cache = Yii::$app->cache;
$db = Yii::$app->db;
$url = Yii::$app->urlManager->createUrl(['post/view', 'id' => $id]);
```

No Yii3, os serviços são configurados no container e injetados onde são
necessários:

```php
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class PostService
{
    public function __construct(
        private ConnectionInterface $db,
        private CacheInterface $cache,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }
}
```

Mova a configuração por grupos:

- aliases para `config/common/aliases.php`;
- definições de rotas para `config/common/routes.php`;
- definições de serviços compartilhadas para `config/common/di/*.php`;
- definições de serviços apenas para web para `config/web/di/*.php`;
- parâmetros e comandos de console para `config/console/*.php`;
- parâmetros compartilhados para `config/common/params.php`;
- sobrescritas por ambiente para `config/environments`.

O grupo `di-console` do template padrão reutiliza as definições
compartilhadas de `config/common/di/*.php`. Se você precisar de definições
de container apenas para o console, adicione os arquivos correspondentes ao
grupo `di-console` em `config/configuration.php` e reconstrua o merge plan.

Veja [Configuração](../concept/configuration.md),
[Aliases](../concept/aliases.md) e [Container de injeção de
dependência](../concept/di-container.md).

## Script de entrada e bootstrap

Um script de entrada do template basic do Yii 2.0 geralmente cria a
aplicação diretamente:

```php
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/../config/web.php';

(new yii\web\Application($config))->run();
```

No Yii3, use o script de entrada do template de aplicação como fonte da
verdade. Ele carrega o Composer e inicializa o runner da aplicação
configurada. Evite recriar o antigo padrão `yii\web\Application` em
`public/index.php`; coloque a configuração nos arquivos de configuração e as
dependências no container.

Veja [Scripts de entrada](../structure/entry-script.md) e [Fluxo da
aplicação](../start/workflow.md).

## Controllers, actions e roteamento

As rotas do Yii 2.0 geralmente apontam para métodos de action de
controllers:

```php
namespace app\controllers;

use yii\web\Controller;

final class SiteController extends Controller
{
    public function actionIndex(): string
    {
        return $this->render('index');
    }
}
```

O Yii3 não exige classes base de controller. O template de aplicação atual
usa classes de action invocáveis:

```php
namespace App\Web\HomePage;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template');
    }
}
```

As rotas são explícitas:

```php
use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
        ),
];
```

Ao redesenhar o fluxo de um controller, liste todas as actions do Yii 2.0 e
crie rotas nomeadas para os fluxos de que você ainda precisa.  Depois,
implemente cada fluxo como uma classe invocável ou um serviço no estilo
controller. A injeção pelo construtor substitui as chamadas a `Yii::$app` e
as propriedades do controller.

Veja [Actions](../structure/action.md),
[Middleware](../structure/middleware.md) e [Roteamento e geração de
URLs](../runtime/routing.md).

## Requisições, respostas, sessões e cookies

As actions do Yii 2.0 frequentemente leem os dados da requisição e escrevem
os dados da resposta por meio de componentes da aplicação:

```php
$id = Yii::$app->request->get('id');
Yii::$app->session->setFlash('success', 'Saved.');

return $this->redirect(['post/view', 'id' => $id]);
```

O Yii3 usa objetos de requisição e resposta PSR-7 e serviços injetáveis:

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Http\Status;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class SavePostAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $id = (int) ($request->getQueryParams()['id'] ?? 0);
        $url = $this->urlGenerator->generate('post/view', ['id' => $id]);

        return $this->responseFactory
            ->createResponse(Status::SEE_OTHER)
            ->withHeader('Location', $url);
    }
}
```

Pense no tratamento de requisições logo no início, porque ele afeta
formulários, filtros, endpoints REST, redirecionamentos e testes.

Veja [Requisição](../runtime/request.md),
[Resposta](../runtime/response.md), [Sessões](../runtime/sessions.md) e
[Cookies](../runtime/cookies.md).

## Views, layouts, assets e URLs

No Yii 2.0, a renderização do controller procura arquivos em
`views/{controller}` e layouts em `views/layouts`:

```php
return $this->render('view', [
    'model' => $model,
]);
```

No Yii3, o caminho do template é explícito na action:

```php
return $this->viewRenderer->render(__DIR__ . '/view', [
    'post' => $post,
]);
```

Um template do Yii3 recebe uma instância de `Yiisoft\View\WebView` como
`$this`:

```php
use App\Shared\ApplicationParams;
use Yiisoft\Html\Html;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var ApplicationParams $applicationParams
 * @var string $title
 */

$this->setTitle($title . ' - ' . $applicationParams->name);
?>

<h1><?= Html::encode($title) ?></h1>
```

Os asset bundles passam de `yii\web\AssetBundle` para
`Yiisoft\Assets\AssetBundle`:

```php
namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $css = [
        'site.css',
    ];
}
```

Registre os assets em um layout ou view pelo gerenciador de assets:

```php
$assetManager->register(MainAsset::class);

$this->addCssFiles($assetManager->getCssFiles());
$this->addJsFiles($assetManager->getJsFiles());
```

Substitua o uso de `yii\helpers\Url` e `Yii::$app->urlManager` por rotas nomeadas e
`Yiisoft\Router\UrlGeneratorInterface`:

```php
$url = $urlGenerator->generate('post/view', ['id' => $post->getId()]);
```

Veja [View](../views/view.md), [Assets](../views/asset.md), [Scripts,
estilos e metatags](../views/script-style-meta.md) e [Template
engines](../views/template-engines.md).

## Formulários e validação

O Yii 2.0 frequentemente junta dados do formulário, rótulos, validação e às
vezes persistência em uma classe `yii\base\Model` ou `yii\db\ActiveRecord`:

```php
final class ContactForm extends \yii\base\Model
{
    public $name;
    public $email;

    public function rules(): array
    {
        return [
            [['name', 'email'], 'required'],
            ['email', 'email'],
        ];
    }
}
```

O Yii3 separa essas responsabilidades. Use `yiisoft/form-model` para os
dados e metadados do formulário, e `yiisoft/validator` para as regras:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Email;
use Yiisoft\Validator\Rule\Required;

final class ContactForm extends FormModel
{
    #[Required]
    public ?string $name = null;

    #[Required]
    #[Email]
    public ?string $email = null;
}
```

Para a renderização de formulários, substitua `yii\widgets\ActiveForm` pelos
campos do `yiisoft/form` e pela integração com form models. Para a
hidratação da entrada, prefira os pacotes de form model e hydrator em vez de
atribuir em massa dados arbitrários da requisição a objetos de persistência.

Veja [Trabalhando com formulários](../start/forms.md), [Validando a
entrada](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form) e
[yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record e persistência

Existem duas escolhas comuns no Yii3 para código que usava classes Active
Record do Yii 2.0.

O primeiro caminho é arquitetural: mova a lógica de negócio para serviços e
objetos de domínio e use repositórios para a persistência. Ele é recomendado
quando o model do Yii 2.0 contém validação, cenários de formulário,
verificações de autorização, envio de e-mails, upload de arquivos e acesso
ao banco de dados na mesma classe.

O segundo caminho é incremental: represente o modelo do banco de dados com o
[yiisoft/active-record](https://github.com/yiisoft/active-record). Ele é
mais próximo do Yii 2.0 e pode ser bem mais rápido quando suas classes
Active Record descrevem principalmente tabelas e relações.

Yii 2.0:

```php
final class Post extends \yii\db\ActiveRecord
{
    public static function tableName(): string
    {
        return '{{%post}}';
    }

    public function rules(): array
    {
        return [
            [['title', 'body'], 'required'],
            ['title', 'string', 'max' => 255],
        ];
    }
}
```

Active Record no Yii3:

```php
use Yiisoft\ActiveRecord\ActiveRecord;

final class Post extends ActiveRecord
{
    protected int $id;
    protected string $title;
    protected string $body;

    public function tableName(): string
    {
        return '{{%post}}';
    }

    public function getId(): ?int
    {
        return $this->id ?? null;
    }

    public function getTitle(): ?string
    {
        return $this->title ?? null;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }
}
```

Não mova o `rules()` do Yii 2.0 diretamente para a classe Active Record. No
Yii3, a validação pertence a regras do validator, form models, objetos de
comando ou serviços:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Length;
use Yiisoft\Validator\Rule\Required;

final class PostInput extends FormModel
{
    #[Required]
    #[Length(max: 255)]
    public ?string $title = null;

    #[Required]
    public ?string $body = null;
}
```

Depois, copie os dados validados para o registro ou passe-os para um serviço
da aplicação:

```php
$post = new Post();
$post->setTitle($input->title);
$post->save();
```

Ao decidir o que reutilizar, verifique cada método do Active Record:

- o mapeamento de tabelas e as relações geralmente podem ir para o
  `yiisoft/active-record`;
- a validação deve ir para o `yiisoft/validator`;
- rótulos e dicas de formulário devem ir para o `yiisoft/form-model`;
- os search models devem virar serviços de consulta/data reader;
- os fluxos de negócio devem virar serviços;
- os eventos devem usar eventos PSR-14 ou eventos específicos de pacotes;
- o uso direto de `Yii::$app->db` deve virar dependências de banco de dados
  injetadas.

As migrations do Yii 2.0 e as migrations do `yiisoft/db-migration` do Yii3
não são compatíveis. Comece um novo histórico de migrations ou crie dumps da
estrutura do esquema atual, e use migrations do Yii3 para as mudanças
futuras no esquema.

Veja [Trabalhando com banco de dados](../start/databases.md),
[Migrations](../databases/db-migrations.md) e
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## GridView e widgets de dados

O `GridView` do Yii 2.0 costuma ser usado com `ActiveDataProvider`:

```php
use yii\grid\GridView;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'filterModel' => $searchModel,
    'columns' => [
        'id',
        'title',
        'created_at:datetime',
        ['class' => 'yii\grid\ActionColumn'],
    ],
]);
```

O Yii3 usa o
[yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview). Ele
renderiza dados a partir de um data reader e usa configuração fluente do
widget:

```php
use Yiisoft\Data\Reader\ReadableDataInterface;
use Yiisoft\Yii\DataView\Column\DataColumn;
use Yiisoft\Yii\DataView\GridView\Column\ActionColumn;
use Yiisoft\Yii\DataView\GridView\GridView;

/**
 * @var ReadableDataInterface $dataReader
 */

echo GridView::widget()
    ->dataReader($dataReader)
    ->columns(
        new DataColumn('id'),
        new DataColumn('title', header: 'Title'),
        new DataColumn('created_at', header: 'Created'),
        new ActionColumn(),
    );
```

Para ordenação, paginação, filtragem e URLs de actions, conecte o widget ao
Yii Router:

```php
use Yiisoft\Yii\DataView\YiiRouter\ActionColumnUrlConfig;
use Yiisoft\Yii\DataView\YiiRouter\ActionColumnUrlCreator;
use Yiisoft\Yii\DataView\YiiRouter\UrlCreator;
use Yiisoft\Yii\DataView\YiiRouter\UrlParameterProvider;

echo GridView::widget()
    ->dataReader($dataReader)
    ->urlParameterProvider(new UrlParameterProvider($currentRoute))
    ->urlCreator(new UrlCreator($urlGenerator))
    ->columns(
        new DataColumn('id'),
        new DataColumn('title'),
        new ActionColumn(
            urlCreator: new ActionColumnUrlCreator($urlGenerator, $currentRoute),
            urlConfig: new ActionColumnUrlConfig(baseRouteName: 'post'),
        ),
    );
```

Um search model do Yii 2.0 geralmente vira um serviço de consulta que:

1. lê os parâmetros de filtro e ordenação da requisição;
2. valida esses parâmetros com `yiisoft/validator`;
3. monta uma consulta ao banco de dados ou ao repositório;
4. expõe um data reader para o GridView.

Veja [Usando htmx para recarregamentos
parciais](../../cookbook/using-htmx-for-partial-reloads.md) para um fluxo
completo de GridView no Yii3 e a [documentação do GridView do
yii-dataview](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## Filtros, middleware e controle de acesso

Os filtros e behaviors de controller do Yii 2.0 geralmente são assim:

```php
public function behaviors(): array
{
    return [
        'access' => [
            'class' => \yii\filters\AccessControl::class,
            'rules' => [
                ['allow' => true, 'roles' => ['@']],
            ],
        ],
    ];
}
```

No Yii3, o processamento das requisições é baseado em middleware. Mova
responsabilidades transversais, como autenticação, autorização, parsing do
corpo, negociação de idioma, verificação de CSRF e tratamento de erros, para
middlewares ou serviços dedicados. Mantenha as actions focadas no fluxo de
requisição que elas implementam.

Veja [Middleware](../structure/middleware.md),
[Autenticação](../security/authentication.md) e
[Autorização](../security/authorization.md).

## Comandos de console

Os comandos de console do Yii 2.0 estendem `yii\console\Controller`:

```php
final class ReportController extends \yii\console\Controller
{
    public function actionSend(): int
    {
        // ...
        return self::EXIT_CODE_NORMAL;
    }
}
```

Os comandos de console do Yii3 são serviços em `src/Console`:

```php
namespace App\Console;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'report/send')]
final class SendReportCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // ...
        return Command::SUCCESS;
    }
}
```

Passe as dependências dos comandos para injeção pelo construtor e registre
os comandos na configuração de console.

Veja [Aplicações de console](../tutorial/console-applications.md).

## APIs REST

Os controllers REST, serializers e formatadores de resposta do Yii 2.0 não
passam diretamente para o Yii3. Comece pelas respostas PSR-7 e pelo
roteamento explícito. Construa um recurso por vez:

1. defina rotas para as operações de coleção e de item;
2. injete as dependências de requisição, persistência, serializer e response
   factory;
3. valide a entrada com `yiisoft/validator`;
4. retorne respostas JSON pelos helpers de resposta do Yii3 ou por factories
   PSR-7;
5. mova a autenticação e o rate limiting para middlewares.

Veja [Resposta](../runtime/response.md),
[Autenticação](../security/authentication.md) e
[Autorização](../security/authorization.md).

## Testes

Não deixe os testes para quando a aplicação Yii3 inteira estiver
pronta. Para cada novo fluxo de requisição, adicione:

- testes unitários para serviços e validadores;
- testes funcionais para actions e middlewares;
- testes end-to-end para os fluxos críticos no navegador;
- análise estática para verificações de tipo mais rigorosas.

O código Yii3 é mais explícito, então os testes devem verificar os serviços
diretamente, em vez de montar grandes arrays de componentes da aplicação.

Veja [Visão geral dos testes](../testing/overview.md), [Testes
unitários](../testing/unit.md), [Testes
funcionais](../testing/functional.md) e [Testes
end-to-end](../testing/end-to-end.md).

## Refatorando o código Yii 2.0 antes de reutilizá-lo

Estas mudanças são úteis mesmo que a aplicação antiga continue no Yii 2.0
por um tempo:

- Substitua o acesso a `Yii::$app` no código de domínio por argumentos do
  construtor.
- Tire as consultas dos controllers e views e leve-as para repositórios ou
  serviços de consulta.
- Tire os fluxos de negócio das classes Active Record.
- Separe os form models dos models de persistência.
- Adicione tipos de retorno e tipos de parâmetros.
- Substitua arrays de rotas espalhados pelas views por constantes de rotas
  nomeadas ou métodos helper.
- Adicione testes em torno de cada fluxo antes de reconstruí-lo no Yii3.

Quanto menos estado do framework o seu código Yii 2.0 pressupor, mais fácil
fica entender o que deve ser reutilizado e o que deve ser redesenhado para o
Yii3.
