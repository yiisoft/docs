# Migrando da versão 1.1

> Se você não usou o Yii 1.1, pode pular esta seção e ir direto para a seção
> "[primeiros passos](../start/prerequisites.md)".

O Yii3 não é um upgrade incremental do Yii 1.1. O Yii 2.0 foi uma reescrita
completa, e o Yii3 muda a arquitetura de novo: pacotes Composer, namespaces,
PHP 8, interfaces PSR, injeção de dependência, rotas explícitas, middleware
e pacotes separados para funcionalidades que no Yii 1.1 eram embutidas no
framework.

Encare isso como a construção de uma nova aplicação Yii3 aproveitando a
experiência com o Yii 1.1. Reaproveite o conhecimento do domínio, o esquema
do banco de dados, os fluxos dos usuários e partes selecionadas do código
após refatorá-las. Não tente reproduzir a estrutura da aplicação Yii 1.1 no
Yii3. Uma conversão direta por busca e substituição não é realista.

Para mais contexto, leia a seção do guia do Yii 2.0 [Upgrading from Version
1.1](https://www.yiiframework.com/doc/guide/2.0/en/intro-upgrade-from-v1).
Ela explica a primeira grande ruptura com o Yii 1.1: Composer, namespaces,
configuração de objetos, mudanças nas views, valores de retorno dos
controllers, widgets, assets, helpers, formulários, query builder, Active
Record e gerenciamento de URLs. O Yii3 se apoia em muitas dessas mudanças e
torna as dependências mais explícitas.

## Abordagem recomendada

Escolha um destes caminhos:

- Construa uma nova aplicação Yii3 diretamente quando a aplicação Yii 1.1
  for pequena ou você já estiver reescrevendo os fluxos de requisição.
- Migre primeiro os conceitos do Yii 1.1 para o Yii 2.0 quando o time
  precisar de um passo conceitual menor.
- Mantenha o Yii 1.1 rodando e reconstrua os fluxos críticos no Yii3 um a
  um.

Para a maioria das aplicações de longa duração, a terceira opção é a de
menor risco. Crie uma aplicação Yii3, conecte-a ao mesmo banco de dados e
construa vertical slices: rota, action, validação de entrada, persistência,
view, assets e testes.  Cada slice deve ser Yii3 idiomático, mesmo quando se
baseia no comportamento da aplicação Yii 1.1.

## Prepare a aplicação Yii 1.1

Uma preparação útil pode acontecer antes de a aplicação Yii3 estar
pronta. Estas refatorações tornam o comportamento antigo mais fácil de
entender e reduzem a quantidade de estado do framework Yii 1.1 que passa
para o código novo:

- Remova o acesso direto a `Yii::app()` do código reutilizável onde for
  viável. Se uma refatoração completa for grande demais, mantenha as
  chamadas a `Yii::app()` perto de controllers, widgets e comandos, e passe
  valores e serviços explicitamente para o código de nível mais baixo.
- Introduza repositórios ou serviços de consulta para as leituras do banco
  de dados hoje espalhadas por controllers, views, métodos de
  `CActiveRecord` e widgets. O Yii3 pode usar Active Record, mas não o exige
  para toda tarefa de persistência.
- Separe as regras de negócio da infraestrutura do framework. Código que não
  estende `CComponent`, não lê o estado global da aplicação nem renderiza
  views é mais fácil de reutilizar como especificação para o código Yii3.
- Mova o comportamento reutilizável de controllers e classes Active Record
  grandes para componentes de aplicação do Yii 1.1 ou serviços simples. Os
  serviços do Yii3 são configurados e injetados de outra forma, mas a
  fronteira de responsabilidade é parecida.
- Adicione testes ou verificações de caracterização em torno das rotas e
  fluxos que você planeja reconstruir primeiro. Eles se tornam a
  especificação executável do slice Yii3.

Por exemplo, em vez de ler os dados do arquivo de posts diretamente em
vários controllers ou widgets, crie um pequeno serviço que descreva a
necessidade da aplicação:

```php
class PostRepository extends CComponent
{
    public function getArchive()
    {
        // ...
    }

    public function getTopForFrontPage($limit = 10)
    {
        // ...
    }
}
```

A implementação no Yii3 pode usar `yiisoft/active-record`, `yiisoft/db` ou
outra camada de persistência. O importante é que controllers e views não
precisem mais conhecer esse detalhe.

## O que aprender antes de começar

Algumas escolhas do template de aplicação do Yii3 provavelmente serão
novidade para uma base de código Yii 1.1:

- [Composer](https://getcomposer.org/). Aplicações e pacotes Yii3 são
  instalados pelo Composer e carregados com autoloading PSR-4.
- [Namespaces](https://www.php.net/manual/en/language.namespaces.php). As
  classes do Yii3 usam namespaces em vez dos prefixos de classe e path
  aliases do Yii 1.1 para o carregamento de classes.
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
  Yii3 é diferente da do Yii 1.1. Comece com o template do Yii3 e altere-o
  apenas quando a aplicação precisar.

## PHP, Composer e namespaces

Aplicações Yii 1.1 costumam depender de código da era do PHP 5, prefixos de
classe como `CController` e autoloading pelo nome da classe. Aplicações Yii3
exigem PHP moderno e autoloading do Composer.

Yii 1.1:

```php
class SiteController extends CController
{
}
```

Yii3:

```php
namespace App\Web\HomePage;

final readonly class Action
{
}
```

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

Execute:

```shell
composer dump-autoload
```

Ao reutilizar uma classe, dê a ela um namespace, adicione strict types,
substitua as classes base do Yii 1.1 e injete as dependências em vez de
lê-las do estado global da aplicação. Se essas mudanças deixarem a classe
estranha, use a classe antiga como especificação e escreva uma nova classe
Yii3.

## Estrutura do projeto

Uma aplicação Yii 1.1 frequentemente usa:

```text
protected/
  commands/
  components/
  config/
  controllers/
  extensions/
  messages/
  migrations/
  models/
  views/
themes/
webroot/
```

O template de aplicação atual do Yii3 usa:

```text
assets/
config/
public/
runtime/
src/
tests/
```

Mapeamentos típicos a considerar:

| Yii 1.1 | Yii3 |
|---------|------|
| `protected/controllers` | `src/Web/*/Action.php` ou serviços no estilo controller |
| `protected/models` | `src/Domain`, `src/Shared`, `src/Db` ou form models, conforme a responsabilidade |
| `protected/views` | templates perto da funcionalidade, por exemplo `src/Web/HomePage/template.php` |
| `protected/views/layouts` | templates de layout e assets em `src/Web/Shared/Layout` |
| `protected/components` | serviços configurados no container de injeção de dependência |
| `protected/extensions` | pacotes Composer ou pacotes locais |
| `protected/commands` | `src/Console/*Command.php` |
| `protected/messages` | arquivos de mensagens do tradutor |
| `protected/config` | `config/common`, `config/web`, `config/console`, `config/environments` |
| `webroot` | `public` |

Não recrie `protected` no Yii3. Coloque o código PHP em `src`, os arquivos
públicos em `public`, os arquivos gerados/de runtime em `runtime` e a
configuração em `config`.

## Configuração e componentes da aplicação

A configuração do Yii 1.1 geralmente é um único array grande:

```php
return [
    'basePath' => dirname(__DIR__),
    'components' => [
        'db' => [
            'connectionString' => 'mysql:host=localhost;dbname=app',
            'username' => 'root',
            'password' => '',
        ],
        'urlManager' => [
            'urlFormat' => 'path',
            'rules' => [
                'post/<id:\d+>' => 'post/view',
            ],
        ],
    ],
];
```

No Yii3, a configuração é dividida por finalidade e os serviços são
conectados pelo container:

- aliases em `config/common/aliases.php`;
- parâmetros em `config/common/params.php` e nos arquivos de ambiente;
- definições de serviços compartilhadas em `config/common/di/*.php`;
- definições de serviços apenas para web em `config/web/di/*.php`;
- rotas em `config/common/routes.php`;
- comandos de console em `config/console/*.php`.

O grupo de DI de console do template padrão reutiliza as definições
compartilhadas de `config/common/di/*.php`. Se você precisar de definições
de container apenas para o console, adicione arquivos para elas ao grupo
`di-console` em `config/configuration.php` e reconstrua o merge plan.

Substitua `Yii::app()->componentName` por serviços injetados pelo construtor:

```php
use Yiisoft\Db\Connection\ConnectionInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class PostRepository
{
    public function __construct(
        private ConnectionInterface $db,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }
}
```

Veja [Configuração](../concept/configuration.md),
[Aliases](../concept/aliases.md) e [Container de injeção de
dependência](../concept/di-container.md).

## Script de entrada

Os scripts de entrada do Yii 1.1 geralmente carregam `yii.php` e criam uma
aplicação web:

```php
require_once __DIR__ . '/../framework/yii.php';

Yii::createWebApplication($config)->run();
```

Os scripts de entrada do Yii3 carregam o Composer e inicializam a aplicação
configurada. Comece com o arquivo `public/index.php` do `yiisoft/app` e
ajuste a configuração em vez de montar a aplicação manualmente no script de
entrada.

Veja [Scripts de entrada](../structure/entry-script.md) e [Fluxo da
aplicação](../start/workflow.md).

## Controllers, actions e rotas

Os controllers do Yii 1.1 estendem `CController`, e as actions são métodos
chamados `actionName`:

```php
class PostController extends CController
{
    public function actionView($id)
    {
        $post = Post::model()->findByPk($id);

        if ($post === null) {
            throw new CHttpException(404);
        }

        $this->render('view', ['post' => $post]);
    }
}
```

O Yii3 não exige herança de controller. O template atual usa classes de
action invocáveis:

```php
namespace App\Web\Post\View;

use App\Post\PostRepository;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private CurrentRoute $currentRoute,
        private PostRepository $posts,
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        $post = $this->posts->findById((int) $this->currentRoute->getArgument('id'));

        return $this->viewRenderer->render(__DIR__ . '/template', [
            'post' => $post,
        ]);
    }
}
```

A rota é explícita:

```php
use App\Web\Post\View;
use Yiisoft\Router\Route;

return [
    Route::get('/post/{id:\d+}')
        ->action(View\Action::class)
        ->name('post/view'),
];
```

Defina as rotas antes do corpo das actions. Isso dá a você uma checklist dos
fluxos de requisição que você decidiu manter na aplicação Yii3.

Veja [Actions](../structure/action.md),
[Middleware](../structure/middleware.md) e [Roteamento e geração de
URLs](../runtime/routing.md).

## Requisições, respostas, redirecionamentos, sessões e cookies

O código Yii 1.1 frequentemente lê e escreve por meio de `Yii::app()`:

```php
$id = Yii::app()->request->getParam('id');
Yii::app()->user->setFlash('success', 'Saved.');
$this->redirect(['post/view', 'id' => $id]);
```

O Yii3 usa objetos de requisição e resposta PSR-7 e serviços injetáveis. A
entrada da requisição está disponível em `ServerRequestInterface`;
redirecionamentos, sessões, cookies e respostas são dependências explícitas.

Veja [Requisição](../runtime/request.md),
[Resposta](../runtime/response.md), [Sessões](../runtime/sessions.md) e
[Cookies](../runtime/cookies.md).

## Views e layouts

As views do Yii 1.1 usam `$this` como o contexto do controller ou do
widget. Layouts e partials são renderizados por métodos do controller:

```php
<?php
/* @var $this PostController */
/* @var $post Post */
?>

<h1><?php echo CHtml::encode($post->title); ?></h1>
```

Nos templates do Yii3, `$this` é uma instância de `Yiisoft\View\WebView`:

```php
use Yiisoft\Html\Html;
use Yiisoft\View\WebView;

/**
 * @var WebView $this
 * @var Post $post
 */

$this->setTitle($post->getTitle());
?>

<h1><?= Html::encode($post->getTitle()) ?></h1>
```

Mova a lógica de view específica do controller para a action ou para um
presenter. Passe apenas os dados de que o template precisa.

Veja [View](../views/view.md), [Injeções de
view](../views/view-injections.md) e [Template
engines](../views/template-engines.md).

## Assets e scripts do cliente

Aplicações Yii 1.1 frequentemente usam `CClientScript`, temas e publicação
de assets específica de extensões:

```php
Yii::app()->clientScript->registerCssFile('/css/site.css');
Yii::app()->clientScript->registerScriptFile('/js/site.js');
```

O Yii3 usa asset bundles do `yiisoft/assets`:

```php
namespace App\Web\Shared\Layout\Main;

use Yiisoft\Assets\AssetBundle;

final class MainAsset extends AssetBundle
{
    public ?string $basePath = '@assets/main';
    public ?string $baseUrl = '@assetsUrl/main';
    public ?string $sourcePath = '@assetsSource/main';

    public array $css = ['site.css'];
    public array $js = ['site.js'];
}
```

Registre os bundles pelo gerenciador de assets nos layouts ou views.

Veja [Assets](../views/asset.md) e [Scripts, estilos e
metatags](../views/script-style-meta.md).

## Models, formulários e validação

O Yii 1.1 tem `CModel`, `CFormModel` e `CActiveRecord`. É comum uma única
classe de model conter os dados de entrada, rótulos, regras de validação,
persistência no banco de dados e lógica de negócio.

O Yii3 funciona melhor quando essas responsabilidades são separadas:

- dados e rótulos do formulário: `yiisoft/form-model`;
- regras de validação: `yiisoft/validator`;
- renderização de formulários: `yiisoft/form`;
- persistência: repositórios, `yiisoft/db` ou `yiisoft/active-record`;
- fluxos de negócio: serviços da aplicação.

Form model no Yii 1.1:

```php
class ContactForm extends CFormModel
{
    public $name;
    public $email;

    public function rules()
    {
        return [
            ['name, email', 'required'],
            ['email', 'email'],
        ];
    }
}
```

Form model no Yii3:

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

Veja [Trabalhando com formulários](../start/forms.md), [Validando a
entrada](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md),
[yiisoft/form](https://github.com/yiisoft/form) e
[yiisoft/form-model](https://github.com/yiisoft/form-model).

## Active Record

O Active Record do Yii 1.1 usa `CActiveRecord::model()` e atributos
dinâmicos:

```php
class Post extends CActiveRecord
{
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    public function tableName()
    {
        return '{{post}}';
    }

    public function rules()
    {
        return [
            ['title, body', 'required'],
            ['title', 'length', 'max' => 255],
        ];
    }
}
```

A opção incremental no Yii3 é o
[yiisoft/active-record](https://github.com/yiisoft/active-record):

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

Mova o `rules()` do Yii 1.1 para um form model, regras do validator ou um
serviço. Mantenha o Active Record focado em persistência: mapeamento de
tabelas, propriedades, relações e operações no banco de dados.

Em aplicações mais complexas, considere substituir o código muito dependente
de Active Record por repositórios e objetos de domínio. Dá mais trabalho no
início, mas evita carregar o acoplamento entre formulário e persistência do
Yii 1.1 para a nova aplicação.

Veja [Trabalhando com banco de dados](../start/databases.md),
[Migrations](../databases/db-migrations.md) e
[yiisoft/active-record](https://github.com/yiisoft/active-record).

## Consultas ao banco de dados e migrations

O código Yii 1.1 pode usar `CDbCriteria`, `CDbCommand`,
`CActiveDataProvider` e data providers do `CGridView`. No Yii3, use
`yiisoft/db` para acesso ao banco de dados e construção de consultas, e
`yiisoft/data` / `yiisoft/yii-dataview` para data readers e widgets.

As migrations não são compatíveis entre o Yii 1.1 e o Yii3. Para uma
aplicação existente, crie uma base a partir do esquema atual e use
migrations do Yii3 para as novas mudanças.

Veja [Trabalhando com banco de dados](../start/databases.md) e
[Migrations](../databases/db-migrations.md).

## GridView e widgets de dados

O `CGridView` do Yii 1.1 costuma ser configurado com `CActiveDataProvider`:

```php
$this->widget('zii.widgets.grid.CGridView', [
    'dataProvider' => $dataProvider,
    'columns' => [
        'id',
        'title',
        [
            'class' => 'CButtonColumn',
        ],
    ],
]);
```

O Yii3 usa o
[yiisoft/yii-dataview](https://github.com/yiisoft/yii-dataview):

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
        new DataColumn('title'),
        new ActionColumn(),
    );
```

Substitua o antigo data provider por um serviço de consulta que retorne um
data reader. Modele os filtros como regras do validator e parâmetros de rota
ou de consulta.

Veja [Usando htmx para recarregamentos
parciais](../../cookbook/using-htmx-for-partial-reloads.md) e a
[documentação do GridView do
yii-dataview](https://github.com/yiisoft/yii-dataview/blob/master/docs/en/guide/gridview.md).

## Gerenciamento de URLs

Yii 1.1:

```php
echo CHtml::link('View', ['post/view', 'id' => $post->id]);
$url = Yii::app()->createUrl('post/view', ['id' => $post->id]);
```

Yii3:

```php
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;

$url = $urlGenerator->generate('post/view', ['id' => $post->getId()]);

echo Html::a('View', $url)->render();
```

Prefira rotas nomeadas. Elas tornam as views e as colunas de action do
GridView mais fáceis de projetar e manter.

Veja [Roteamento e geração de URLs](../runtime/routing.md).

## Filtros, controle de acesso e autenticação

Os filtros de controller do Yii 1.1 são métodos do controller ou classes de
filtro:

```php
public function filters()
{
    return [
        'accessControl',
    ];
}
```

O Yii3 usa middleware e pacotes focados. Mova autenticação, autorização,
CSRF, detecção de idioma e parsing do corpo da requisição para fora dos
controllers, em middlewares ou serviços.

Veja [Middleware](../structure/middleware.md),
[Autenticação](../security/authentication.md) e
[Autorização](../security/authorization.md).

## Widgets, helpers e extensões

Os widgets e helpers do Yii 1.1 geralmente dependem de classes base
específicas do Yii, como `CWidget` e `CHtml`, e do autoloading de
extensões. No Yii3:

- substitua as chamadas a helpers por `yiisoft/html`, `yiisoft/arrays`,
  `yiisoft/strings` ou helpers da aplicação;
- substitua as extensões por pacotes Composer;
- reconstrua widgets personalizados com `yiisoft/widget` ou com
  serviços/templates simples;
- substitua os widgets do jQuery UI e do Bootstrap por pacotes de frontend
  atuais ou pacotes de widgets do Yii3, quando disponíveis.

Veja [Widgets](../views/widget.md).

## Aplicações de console

Os comandos de console do Yii 1.1 estendem `CConsoleCommand`:

```php
class ReportCommand extends CConsoleCommand
{
    public function actionSend()
    {
    }
}
```

Os comandos de console do Yii3 são comandos do Symfony Console configurados
como serviços:

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
        return Command::SUCCESS;
    }
}
```

Veja [Aplicações de console](../tutorial/console-applications.md).

## Internacionalização

Os arquivos de mensagens do Yii 1.1 em `protected/messages` geralmente podem
ser mantidos conceitualmente, mas a configuração muda. O Yii3 usa pacotes de
tradução e fontes de mensagens explícitas. Mova os arquivos de mensagens
para a estrutura esperada pelo pacote de mensagens do tradutor escolhido e
injete os serviços de tradução onde for necessário.

Veja [Internacionalização](../tutorial/i18n.md).

## O que refatorar antes de reutilizar

Estas refatorações no Yii 1.1 tornam o comportamento antigo mais fácil de
entender e reutilizar:

- isole as consultas ao banco de dados dos controllers;
- remova o acesso direto a `Yii::app()` do código de domínio;
- tire a validação do Active Record quando ela descreve a entrada da
  requisição, e não invariantes do banco de dados;
- substitua actions grandes de controller por serviços;
- documente todas as rotas e regras de URL;
- adicione testes em torno dos fluxos que você planeja reconstruir primeiro;
- atualize a sintaxe PHP gradualmente, se o runtime antigo permitir.

O objetivo não é fazer o Yii 1.1 parecer com o Yii3. O objetivo é reduzir o
acoplamento oculto antes que o código cruze a fronteira do framework.
