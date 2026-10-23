# Middleware

O Yii trabalha com HTTP usando a camada de abstração construída em torno das
[interfaces de mensagens HTTP da PSR-7](https://www.php-fig.org/psr/psr-7/)
e das [interfaces de request handler/middleware da
PSR-15](https://www.php-fig.org/psr/psr-15/).

A aplicação é composta por um ou vários middlewares. O middleware roda entre
a requisição e a resposta.  Quando a URL é requisitada, o objeto de
requisição é passado para o dispatcher de middlewares, que começa a executar
os middlewares um após o outro.  Cada middleware, dada a requisição, pode:

- Passar a requisição para o próximo middleware, fazendo algum trabalho
  antes / depois dele.
- Montar a resposta e devolvê-la.

Dependendo dos middlewares usados, o comportamento da aplicação pode variar
bastante.

![Middleware](/images/guide/middleware.svg)

Acima, cada middleware seguinte envolve o anterior. Também é possível
representar assim:

![Middleware](/images/guide/middleware_alternative.svg)

## Usando middlewares

Qualquer middleware compatível com a
[PSR-15](https://www.php-fig.org/psr/psr-15/) pode ser usado com o Yii, e
existem muitos.  Digamos que você precise adicionar autenticação básica a
uma das URLs da aplicação.  Middlewares que dependem da URL são configurados
pelo router, então você precisa alterar a router factory.

O middleware de autenticação é implementado pelo pacote
`middlewares/http-authentication`, então execute `composer require
middlewares/http-authentication` na pasta raiz da aplicação.

Agora registre o middleware na configuração do container de DI,
`config/web.php`:

```php
<?php
\Middlewares\BasicAuthentication::class => [
    'class' => \Middlewares\BasicAuthentication::class,
    '__construct()' => [
        'users' => [
            'foo' => 'bar',
        ],
    ],
    'realm()' => ['Access to the staging site via basic auth'],
    'attribute()' => ['username'],
],
```

No `config/routes.php`, adicione uma nova rota:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Route;
use App\Controller\SiteController;
use Middlewares\BasicAuthentication;


return [
    //...
    Route::get('/basic-auth')
        ->action([SiteController::class, 'auth'])
        ->name('site/auth')
        ->prependMiddleware(BasicAuthentication::class)
];
```

Ao configurar o roteamento, você está associando a URL `/basic-auth` a uma
cadeia de middlewares formada pela autenticação básica e pela própria
action. Uma cadeia é um middleware especial que executa todos os middlewares
com que foi configurada.

A action em si poderia ser a seguinte:

```php
public function auth(ServerRequestInterface $request): ResponseInterface
{
    $response = $this->responseFactory->createResponse();
    $response->getBody()->write('Hi ' . $request->getAttribute('username'));
    return $response;
}
```

O middleware de autenticação básica gravou o atributo `username` na
requisição, então você pode acessar esse dado se precisar.

Para aplicar um middleware à aplicação como um todo, independentemente da
URL, ajuste o `config/application.php`:

```php
return [
    Yiisoft\Yii\Http\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            ErrorCatcher::class,
                            BasicAuthentication::class,
                            SessionMiddleware::class,
                            CsrfTokenMiddleware::class,
                            Router::class,
                        ]
                    );
            }),
            'fallbackHandler' => Reference::to(NotFoundHandler::class),
        ],
    ],
];
```

## Criando o seu próprio middleware

Para criar um middleware, você precisa implementar um único método,
`process`, da `Psr\Http\Server\MiddlewareInterface`:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface;
```

Há várias formas de tratar uma requisição, e a escolha depende do que o
middleware deve fazer.

### Montando uma resposta diretamente

Para responder diretamente, é preciso uma response factory passada pelo
construtor:

```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class RespondingMiddleware implements MiddlewareInterface
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory
    )
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

### Delegando o tratamento para o próximo middleware

Se o middleware não tem a intenção de montar uma resposta nem de alterar a requisição, ou se não pode fazer nada desta vez,
o tratamento pode ficar para o próximo middleware da pilha:  

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    return $handler->handle($request);    
}
```

Se você precisar passar dados para o próximo middleware, pode usar atributos
da requisição:

```php
$request = $request->withAttribute('answer', 42);
return $handler->handle($request);
``` 

Para obtê-los no próximo middleware:

```php
$answer = $request->getAttribute('answer');
```

### Capturando a resposta para manipulá-la

Você pode querer capturar a resposta para manipulá-la. Isso pode ser útil
para adicionar headers CORS, compactar o conteúdo com gzip etc.

```php
$response = $handler->handle($request);
// tratamento extra
return $response;
```
