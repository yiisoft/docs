# Roteamento e geração de URLs

Normalmente, uma aplicação Yii processa certas requisições com certos
handlers.  Ela escolhe o handler com base na URL da requisição.  A parte da
aplicação que faz esse trabalho é o router, e o processo de escolher um
handler, instanciá-lo e executar um método dele é o *roteamento*.

O processo inverso do roteamento é a *geração de URLs*, que cria uma URL a
partir de uma rota nomeada, de argumentos de rota e de parâmetros de query.
Quando você requisita depois a URL criada, o roteamento consegue convertê-la
de volta nos argumentos de rota e parâmetros de query originais.

Roteamento e geração de URLs são serviços separados, mas usam o mesmo
conjunto de rotas tanto para casar URLs quanto para gerá-las.

## Configurando rotas

Configurando rotas, você faz a aplicação reconhecer formatos arbitrários de
URL sem modificar o código existente. Você pode configurar as rotas em
`/config/routes.php`. A estrutura do arquivo é a seguinte:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')
        ->action([SiteController::class, 'index'])
        ->name('site/index')
];
```

O arquivo retorna um array de rotas. Ao definir uma rota, você começa com um
método que corresponde a um tipo de requisição HTTP:

- get
- post
- put
- delete
- patch
- head
- options

Se você precisar de vários métodos, pode usar `methods()`:

```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user/{id}')
        ->action([SiteController::class, 'user'])
        ->name('site/user')
];
```

Todos esses métodos aceitam um padrão de rota.  O padrão de rota define como
o router casa a URL durante o roteamento e como gera a URL a partir do nome
da rota e dos parâmetros.  Você vai conhecer a sintaxe mais adiante neste
guia.  Defina o handler com `action()` como:

- Nome de uma classe de [middleware](../structure/middleware.md).
- Uma action de handler (um array no formato [HandlerClass, handlerMethod]).
- Um callable.

No caso de uma action de handler, uma classe do tipo `HandlerClass` é
instanciada e o seu método `handlerMethod` é chamado:

```php
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

final readonly class HandlerClass
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // ...
    }
}
```

O callable é chamado como está:

```php
static function (ServerRequestInterface $request, RequestHandlerInterface $next) use ($responseFactory) {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
}
```

Para actions de handler e callables, os parâmetros tipados são injetados
automaticamente pelo container de injeção de dependência passado para a
rota.

Obtenha a requisição e o handler atuais usando os type hints
`ServerRequestInterface` e `RequestHandlerInterface`.

### Argumentos de rota nas actions

Os parâmetros nomeados da rota ficam guardados em `CurrentRoute`.  Para
passar um parâmetro de rota para um parâmetro do método da action, use o
atributo `RouteArgument`:

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Router\Route;

return [
    Route::get('/post/{id:\d+}')
        ->action([PostController::class, 'view'])
        ->name('post/view')
];

final readonly class PostController
{
    public function view(#[RouteArgument('id')] int $id): ResponseInterface
    {
        // $id contains the value from the {id} route parameter.
    }
}
```

Se o parâmetro tiver o mesmo nome do parâmetro da action, você pode omitir o
nome no atributo:

```php
public function view(#[RouteArgument] int $id): ResponseInterface
{
    // ...
}
```

Você também pode injetar `CurrentRoute` em uma action ou em um serviço
quando precisar de vários argumentos ou de metadados da rota:

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\CurrentRoute;

final readonly class PostController
{
    public function view(CurrentRoute $currentRoute): ResponseInterface
    {
        $id = $currentRoute->getArgument('id');
        $routeName = $currentRoute->getName();

        // ...
    }
}
```

Argumentos de rota não são atributos da requisição.  Leia-os de
`CurrentRoute` ou de parâmetros da action marcados com `RouteArgument`.

Para parâmetros de rota opcionais, informe um valor padrão na rota com
`defaults()` ou na assinatura do método da action.

Você pode adicionar handlers extras em volta do principal com o método
`middleware()`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET], '/download/{id}')
        ->action([DownloadController::class, 'download'])
        ->name('download/id')
        ->middleware(LimitDownloadRate::class)
];
```

Veja o guia sobre ["middleware"](../structure/middleware.md) para saber mais
sobre como implementar middlewares.

Isso é especialmente útil ao agrupar rotas:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/api')
        ->middleware(ApiDataWrapper::class)
        ->routes(
            Route::get('/info/v2')
                ->action(ApiInfo::class)
                ->name('api/info/v2')
                ->middleware(JsonDataResponseMiddleware::class),
            Route::get('/user')
                ->action([ApiUserController::class, 'index'])
                ->name('api/user/index'),
            Route::get('/user/{login}')
                ->action([ApiUserController::class, 'profile'])
                ->middleware(JsonDataResponseMiddleware::class)
                ->name('api/user/profile'),
        )
];
```

O router executa `ApiDataWrapper` antes de tratar qualquer URL que comece
com `/api`.

Você pode dar um nome a uma rota com o método `name()`. É uma boa ideia
escolher o nome da rota com base no nome do handler.

Você pode definir um valor padrão para um parâmetro de rota. Por exemplo:


```php
<?php

declare(strict_types=1);

use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::GET, Method::POST], '/user[/{id}]')
        ->action([SiteController::class, 'user'])
        ->name('site/user')
        ->defaults(['id' => '42'])
];
```

Essa configuração casa tanto com `/user` quanto com `/user/123`.  Nos dois
casos, o serviço `CurrentRoute` vai ter o argumento `id` preenchido.  No
primeiro caso, ele será o padrão `42` e, no segundo, `123`.

Se a URL só deve valer para um host, você pode defini-lo com `host()`.

## Roteamento

O roteamento do Yii é flexível e, internamente, pode usar diferentes
implementações.  O algoritmo de casamento pode variar, mas a ideia básica é
a mesma.

O router casa as rotas definidas na configuração de cima para baixo.  Se
houver um casamento, ele para de procurar e executa o handler da rota para
obter a resposta.  Se nenhuma rota casar, o router passa o tratamento para o
próximo middleware do [conjunto de middlewares da
aplicação](../structure/middleware.md).

### Respostas OPTIONS automáticas

Quando o caminho da requisição casa com uma rota, mas o método HTTP não, o
router retorna uma resposta `405 Method Not Allowed` com o header `Allow`:

```http
HTTP/1.1 405 Method Not Allowed
Allow: GET
```

Para uma requisição `OPTIONS` no mesmo caminho, o router retorna uma
resposta vazia `204 No Content` com o mesmo header `Allow`:

```http
HTTP/1.1 204 No Content
Allow: GET
```

Essa resposta é gerada a partir das rotas configuradas, antes de a action da
rota ser executada.  Se um endpoint de API precisar de headers CORS,
adicione um middleware de CORS a um grupo de rotas:

```php
<?php

declare(strict_types=1);

use App\Api\CorsMiddleware;
use App\Api\PostController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/api')
        ->withCors(CorsMiddleware::class)
        ->routes(
            Route::methods([Method::GET, Method::POST], '/posts')
                ->action([PostController::class, 'index'])
                ->name('api/posts')
        )
];
```

## Gerando URLs

Para gerar uma URL a partir de uma rota, a rota precisa ter um nome:

```php
<?php

declare(strict_types=1);

use App\Controller\TestController;
use Yiisoft\Router\Route;

return [
    Route::get('/test')
        ->action([TestController::class, 'index'])
        ->name('test/index'),
    Route::post('/test/submit/{id}')
        ->action([TestController::class, 'submit'])
        ->name('test/submit')
];
```


A geração fica assim:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\UrlGeneratorInterface;

final readonly class TestController extends AbstractController
{
    protected function name(): string
    {
        return 'test';
    }

    public function index(UrlGeneratorInterface $urlGenerator): ResponseInterface
    {
        $url = $urlGenerator->generate('test/submit', ['id' => '42']);
        // ...
    }
}
```

No código acima, obtemos uma instância do gerador com a ajuda da [injeção de
dependência automática](../concept/di-container.md), que funciona com
handlers de action.  Em outro serviço, você pode obter a instância com uma
injeção no construtor parecida.  Nas views, o gerador de URLs está
disponível como `$url`.

Depois usamos o método `generate()` para obter a URL.  Ele aceita o nome da
rota, argumentos de rota, parâmetros de query e um fragmento (hash).  O
código retorna `/test/submit/42`.

Os argumentos de rota preenchem os placeholders do padrão da rota.  Os
argumentos que não aparecem no padrão são adicionados à query string, desde
que o array de parâmetros de query ainda não tenha o mesmo nome:

```php
$url = $urlGenerator->generate(
    'test/submit',
    ['id' => '42', 'utm' => 'newsletter'],
    ['page' => '1']
);
// $url is "/test/submit/42?page=1&utm=newsletter".
```

Se você precisar de uma URL absoluta, use `generateAbsolute()`.

### Gerando a URL a partir da rota atual

Use `generateFromCurrent()` quando um link deve manter a rota atual e a
maior parte dos seus argumentos.  Por exemplo, uma página de detalhes pode
apontar para outro número de página mantendo o nome da rota atual e o
argumento `id`:

```php
$url = $urlGenerator->generateFromCurrent(['page' => '2']);
```

O método também mantém os parâmetros de query da requisição atual.  Passe
parâmetros de query explícitos quando o link precisar substituir ou
adicionar valores na query string.

### URLs com locale

Quando o locale faz parte do caminho da URL, defina-o como um argumento de
rota.  Em uma aplicação Yii com as rotas em `config/common/routes.php`,
coloque as rotas localizadas em um grupo com um parâmetro de locale:

```php
<?php

declare(strict_types=1);

use App\Web\HomePage\Action as HomePageAction;
use App\Web\Post\ViewAction as PostViewAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/{_locale:en-US|de}')
        ->routes(
            Route::get('/')
                ->action(HomePageAction::class)
                ->name('home'),
            Route::get('/posts/{slug}')
                ->action(PostViewAction::class)
                ->name('post/view')
        )
];
```

A rota `/de/posts/welcome` casa com a rota `post/view` e guarda `_locale`
como argumento de rota com o valor `de`.

No middleware que escolhe o locale da requisição, leia esse argumento de
`CurrentRoute`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Translator\TranslatorInterface;
use Yiisoft\View\WebView;

final readonly class LocaleMiddleware implements MiddlewareInterface
{
    private const DEFAULT_LOCALE = 'en-US';

    public function __construct(
        private CurrentRoute $currentRoute,
        private TranslatorInterface $translator,
        private UrlGeneratorInterface $urlGenerator,
        private WebView $view,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $locale = $this->currentRoute->getArgument('_locale', self::DEFAULT_LOCALE);

        $this->translator->setLocale($locale);
        $this->view->setLocale($locale);
        $this->urlGenerator->setDefaultArgument('_locale', $locale);

        return $handler->handle($request);
    }
}
```

Registre esse middleware no grupo de rotas localizadas, antes da action da
rota:

```php
use App\Web\HomePage\Action as HomePageAction;
use App\Web\Middleware\LocaleMiddleware;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/{_locale:en-US|de}')
        ->middleware(LocaleMiddleware::class)
        ->routes(
            Route::get('/')
                ->action(HomePageAction::class)
                ->name('home')
        )
];
```

Depois que o middleware define o argumento padrão `_locale`, a geração de
URLs pode omiti-lo:

```php
$url = $urlGenerator->generate('post/view', ['slug' => 'welcome']);
// On a German page, $url is "/de/posts/welcome".
```

Para um seletor de idioma, use `generateFromCurrent()` e substitua apenas o
argumento de locale:

```php
$url = $urlGenerator->generateFromCurrent(
    ['_locale' => 'en-US'],
    fallbackRouteName: 'home'
);
```

## Padrões de rota

Os padrões de rota dependem da implementação usada por baixo.  A
implementação padrão é o
[nikic/FastRoute](https://github.com/nikic/FastRoute).

Os padrões básicos são estáticos, como `/test`. Isso significa que eles
precisam casar exatamente para a rota ser escolhida.

### Parâmetros nomeados

Um padrão pode ter um ou mais parâmetros nomeados, escritos no formato
`{ParamName:RegExp}`, onde `ParamName` é o nome do parâmetro e `RegExp` é
uma expressão regular opcional usada para casar o valor.  Se `RegExp` não
for informada, o valor do parâmetro deve ser uma string sem barras.

> [!NOTE]
> Você só pode usar expressões regulares dentro dos parâmetros. O resto do padrão é tratado como texto puro.

Você não pode usar grupos de captura. Por exemplo, `{lang:(en|de)}` não é um
placeholder válido, porque `()` é um grupo de captura. Em vez disso, use
`{lang:en|de}` ou `{lang:(?:en|de)}`.

Quando uma rota casa, o router preenche os argumentos de `CurrentRoute` com
os valores das partes correspondentes da URL.  Quando você usa a regra para
criar uma URL, ela pega os valores dos parâmetros informados e os insere nas
posições onde os parâmetros foram declarados.

Vamos usar alguns exemplos para mostrar como os parâmetros nomeados
funcionam. Suponha que você declarou os três padrões a seguir:


1. `'posts/{year:\d{4}}/{category}`
2. `'posts'`
3. `'post/{id:\d+}'`

- `/posts` casa com o segundo padrão;
- `/posts/2014/php` casa com o primeiro padrão. Os parâmetros são `year`,
  com valor 2014, e `category`, com valor `php`;
- `/post/100` casa com o terceiro padrão. O valor do parâmetro `id` é 100;
- `/posts/php` não casa.

Ao gerar URLs, você deve usar os seguintes parâmetros:

```php
echo $url->generate('first', ['year' => '2020', 'category' => 'Virology']);
echo $url->generate('second');
echo $url->generate('third', ['id' => '42']);
```

### Partes opcionais

Coloque as partes opcionais do padrão entre `[` e `]`.  Por exemplo, o
padrão `/posts[/{id}]` casa tanto com `http://example.com/posts` quanto com
`http://example.com/posts/42`.  O router só preenche o argumento `id` do
serviço `CurrentRoute` no segundo caso.  Nesse caso, você pode definir o
valor padrão:

```php
use \Yiisoft\Router\Route;

Route::get('/posts[/{id}]')->defaults(['id' => '1']);
```

Partes opcionais só são suportadas no final da rota, não no meio dela.
