# Actions

Em uma aplicação web, a URL da requisição determina o que é executado. A
correspondência é feita por um router configurado com várias rotas. Cada
rota pode ser associada a um middleware que, dada a requisição, produz uma
resposta. Como os middlewares podem ser encadeados e podem passar o
tratamento efetivo para o próximo middleware, chamamos de action o
middleware que realmente faz o trabalho.

Há várias formas de descrever uma action. A mais simples é usando uma
closure:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\Route;

Route::get('/')->action(function (ServerRequestInterface $request) use ($responseFactory): ResponseInterface {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
});
```

Isso funciona bem para um tratamento simples, já que qualquer coisa mais
complicada exigiria obter dependências; então, uma boa ideia é mover o
tratamento para um método de classe. Um middleware de callback pode ser
usado para isso:

```php
use Yiisoft\Router\Route;

Route::get('/')->action(FrontPageAction::class),
```

A classe em si seria assim:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

final readonly class FrontPageAction
{
    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        // monta a resposta para a página inicial    
    }
}
```

Em muitos casos, faz sentido agrupar o tratamento de várias rotas em uma
única classe:


```php
use Yiisoft\Router\Route;

Route::get('/post/index')->action([PostController::class, 'actionIndex']),
Route::get('/post/view/{id:\d+}')->action([PostController::class, 'actionView']),
```

A classe em si ficaria assim:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class PostController
{
    public function actionIndex(ServerRequestInterface $request): ResponseInterface
    {
        // renderiza a lista de posts
    }
    
    
    public function actionView(
        ServerRequestInterface $request,
        #[RouteArgument('id')]
        int $id,
    ): ResponseInterface
    {
        // renderiza um único post pelo $id
    }
}
```

Normalmente chamamos uma classe assim de "controller".

A parte `{id}` da rota `/post/view/{id:\d+}` é um parâmetro de rota
nomeado. Os parâmetros de rota estão disponíveis em
`Yiisoft\Router\CurrentRoute`. Para recebê-lo como argumento da action,
adicione o atributo `RouteArgument` ao parâmetro correspondente. O nome no
atributo deve corresponder ao nome do parâmetro de rota.

## Autowiring

Tanto os construtores das classes de action quanto os métodos de action recebem automaticamente serviços do
 container de injeção de dependência:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;

final readonly class PostController
{
    public function __construct(
        private PostRepository $postRepository
    )
    {
    }

    public function actionIndex(ServerRequestInterface $request, LoggerInterface $logger): ResponseInterface
    {
        $logger->debug('Rendering posts list');
        // renderiza a lista de posts
    }
    
    
    public function actionView(ServerRequestInterface $request): ResponseInterface
    {
        // renderiza um único post      
    }
}
```

No exemplo acima, `PostRepository` é injetado automaticamente pelo
construtor. Isso significa que ele fica disponível em todas as actions. O
logger é injetado apenas na action `index`.
