# Tratamento de erros

O Yii tem o pacote
[yiisoft/error-handler](https://github.com/yiisoft/error-handler), que torna
o tratamento de erros muito mais agradável do que antes. Em particular, o
error handler do Yii oferece:

- Middleware [PSR-15](https://www.php-fig.org/psr/psr-15/) para capturar
  erros não tratados.
- Middleware PSR-15 para mapear certas exceções para respostas
  personalizadas.
- Modos de produção e de debug.
- O modo debug mostra detalhes e o stacktrace, tem temas claro e escuro e
  botões práticos para pesquisar o erro sem digitar.
- Leva em conta as configurações do PHP.
- Trata erros de falta de memória, erros fatais, warnings, notices e
  exceções.
- Pode usar qualquer logger compatível com a
  [PSR-3](https://www.php-fig.org/psr/psr-3/) para registrar os erros.
- Detecta o formato da resposta com base no mime type da requisição.
- Suporta respostas em HTML, texto puro, JSON, XML e headers sem
  configuração extra.
- Você pode implementar a sua própria renderização de erros para outros
  tipos.

Este guia descreve como usar o error handler no [framework
Yii](https://www.yiiframework.com/). Para usá-lo separado do Yii, veja a
[descrição do pacote](https://github.com/yiisoft/error-handler).

## Usando o error handler

O error handler tem duas partes. Uma é o middleware
`Yiisoft\ErrorHandler\Middleware\ErrorCatcher`, que, quando registrado,
captura as exceções que podem surgir durante a execução da pilha de
middlewares e as passa para o handler.  A outra é o próprio error handler,
`Yiisoft\ErrorHandler\ErrorHandler`, que captura as exceções que ocorrem
fora da pilha de middlewares e os erros fatais. O handler também converte
warnings e notices em exceções e faz outras coisas úteis.

O error handler é registrado na própria aplicação. Normalmente isso acontece
no `ApplicationRunner`. Por padrão, a configuração do handler vem do
container. Você pode configurá-lo na configuração da aplicação,
`config/web.php`, assim:

```php
use Psr\Log\LoggerInterface;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\ErrorHandler\ThrowableRendererInterface;

return [
    // ...
    ErrorHandler::class => static function (LoggerInterface $logger, ThrowableRendererInterface $renderer) {
        $errorHandler = new ErrorHandler($logger, $renderer);
        // Set the size of the reserved memory to 512 KB. Defaults to 256KB.
        $errorHandler->memoryReserveSize(524_288);
        return $errorHandler;
    },
    
    ThrowableRendererInterface::class => static fn () => new HtmlRenderer([
        // Defaults to the package file "templates/production.php".
        'template' => '/full/path/to/production/template/file',
        // Defaults to package file "templates/development.php".
        'verboseTemplate' => '/full/path/to/development/template/file',
        // Maximum number of source code lines to be displayed. Defaults to 19.
        'maxSourceLines' => 20,
        // Maximum number of trace source code lines to be displayed. Defaults to 13.
        'maxTraceLines' => 5,
        // Trace the header line with placeholders (file, line, icon) to be substituted. Defaults to `null`.
        'traceHeaderLine' => '<a href="ide://open?file={file}&line={line}">{icon}</a>',
    ]),
    // ...
];
```

Como dito acima, o error handler transforma todos os erros não fatais do PHP
em exceções que podem ser capturadas
(`Yiisoft\ErrorHandler\Exception\ErrorException`). Isso significa que você
pode usar o código a seguir para lidar com erros do PHP:

```php
try {
    10 / 0;
} catch (\Yiisoft\ErrorHandler\Exception\ErrorException $e) {
    // Write a log or something else.
}
// execution continues...
```

O pacote tem outro middleware,
`Yiisoft\ErrorHandler\Middleware\ExceptionResponder`.  Esse middleware
mapeia certas exceções para respostas personalizadas. Configure-o na
configuração da aplicação assim:

```php
use Psr\Http\Message\ResponseFactoryInterface;
use Yiisoft\ErrorHandler\Middleware\ExceptionResponder;
use Yiisoft\Injector\Injector;

return [
    // ...
    ExceptionResponder::class => static function (ResponseFactoryInterface $responseFactory, Injector $injector) {
        $exceptionMap = [
            // Status code with which the factory creates the response.
            MyNotFoundException::class => 404,
            // PHP callable that must return a `Psr\Http\Message\ResponseInterface`.
            MyHttpException::class => static fn (MyHttpException $exception) => new MyResponse($exception),
            // ...
        ];
        
        return new ExceptionResponder($exceptionMap, $responseFactory, $injector);
    },
];
```

Ao configurar a pilha de middlewares da aplicação, você deve colocar
`Yiisoft\ErrorHandler\Middleware\ExceptionResponder` antes de
`Yiisoft\ErrorHandler\Middleware\ErrorCatcher`.

## Renderizando os dados do erro

Cada renderer converte os dados do erro para um formato específico.  Os
seguintes renderers já vêm prontos:

- `Yiisoft\ErrorHandler\Renderer\HeaderRenderer` - Renderiza o erro em
  headers HTTP. É usado em requisições `HEAD`.
- `Yiisoft\ErrorHandler\Renderer\HtmlRenderer` - Renderiza o erro em HTML.
- `Yiisoft\ErrorHandler\Renderer\JsonRenderer` - Renderiza o erro em JSON.
- `Yiisoft\ErrorHandler\Renderer\PlainTextRenderer` - Renderiza o erro em
  texto puro.
- `Yiisoft\ErrorHandler\Renderer\XmlRenderer` - Renderiza o erro em XML.

O renderer gera dados de erro mais ou menos detalhados conforme o modo debug
esteja ativado ou não.

Exemplo de renderização em headers com o modo debug desativado:

```
...
X-Error-Message: An internal server error occurred.
...
```

Exemplo de renderização em headers com o modo debug ativado:

```
...
X-Error-Type: Error
X-Error-Message: Call to undefined function App\Controller\myFunc()
X-Error-Code: 0
X-Error-File: /var/www/yii/app/src/Controller/SiteController.php
X-Error-Line: 21
...
```

Exemplo de saída JSON com o modo debug desativado:

```json
{"message":"An internal server error occurred."}
```

Exemplo de saída JSON com o modo debug ativado:

```json
{
    "type": "Error",
    "message": "Call to undefined function App\\Controller\\myFunc()",
    "code": 0,
    "file": "/var/www/yii/app/src/Controller/SiteController.php",
    "line": 21,
    "trace": [
        {
            "function": "index",
            "class": "App\\Controller\\SiteController",
            "type": "->"
        },
        {
            "file": "/var/www/yii/app/vendor/yiisoft/injector/src/Injector.php",
            "line": 63,
            "function": "invokeArgs",
            "class": "ReflectionFunction",
            "type": "->"
        },
        ...
    ]
}
```

Exemplo de renderização HTML com o modo debug desativado:

![Tela de produção](/images/guide/runtime/view-production.png)

Exemplo de renderização HTML com o modo debug ativado e tema claro:

![Tela de desenvolvimento com tema
claro](/images/guide/runtime/view-development-light.png)

Exemplo de renderização HTML com o modo debug ativado e tema escuro:

![Tela de desenvolvimento com tema
escuro](/images/guide/runtime/view-development-dark.png)

O error catcher escolhe como renderizar uma exceção com base no header HTTP
`accept`.  Se ele for `text/html` ou um tipo de conteúdo desconhecido, usa o
template HTML de erro ou de exceção para exibir os erros.  Para outros mime
types, o error handler escolhe entre os renderers registrados em um renderer
provider.  Por padrão, ele suporta JSON, XML e texto puro.

### Implementando o seu próprio renderer

Você pode personalizar o formato da resposta de erro implementando
`Yiisoft\ErrorHandler\ThrowableRendererInterface`.  O renderer converte um
throwable em `Yiisoft\ErrorHandler\ErrorData`, que contém o corpo e os
headers da resposta.

```php
use Psr\Http\Message\ServerRequestInterface;
use Throwable;
use Yiisoft\ErrorHandler\ErrorData;
use Yiisoft\ErrorHandler\ThrowableRendererInterface;
use Yiisoft\Http\Header;

final readonly class MyRenderer implements ThrowableRendererInterface
{
    public function render(Throwable $t, ?ServerRequestInterface $request = null): ErrorData
    {
        return new ErrorData(
            '{"message":"An internal server error occurred."}',
            [Header::CONTENT_TYPE => 'application/problem+json'],
        );
    }

    public function renderVerbose(Throwable $t, ?ServerRequestInterface $request = null): ErrorData
    {
        return new ErrorData(
            json_encode(
                [
                    'type' => $t::class,
                    'message' => $t->getMessage(),
                    'file' => $t->getFile(),
                    'line' => $t->getLine(),
                ],
                JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES,
            ),
            [Header::CONTENT_TYPE => 'application/problem+json'],
        );
    }
}
```

Registre o renderer em `config/common/di/error-handler.php`:

```php
use Psr\Container\ContainerInterface;
use App\Error\MyRenderer;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\ErrorHandler\Renderer\JsonRenderer;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\ErrorHandler\Renderer\XmlRenderer;
use Yiisoft\ErrorHandler\RendererProvider\CompositeRendererProvider;
use Yiisoft\ErrorHandler\RendererProvider\ContentTypeRendererProvider;
use Yiisoft\ErrorHandler\RendererProvider\HeadRendererProvider;
use Yiisoft\ErrorHandler\ThrowableResponseFactory;
use Yiisoft\ErrorHandler\ThrowableResponseFactoryInterface;

return [
    ThrowableResponseFactoryInterface::class => [
        'class' => ThrowableResponseFactory::class,
        '__construct()' => [
            'rendererProvider' => DynamicReference::to(
                static fn (ContainerInterface $container) => new CompositeRendererProvider(
                    new HeadRendererProvider(),
                    new ContentTypeRendererProvider($container, [
                        'application/problem+json' => MyRenderer::class,
                        'application/json' => JsonRenderer::class,
                        'application/xml' => XmlRenderer::class,
                        'text/xml' => XmlRenderer::class,
                        'text/plain' => PlainTextRenderer::class,
                        'text/html' => HtmlRenderer::class,
                        '*/*' => HtmlRenderer::class,
                    ]),
                ),
            ),
        ],
    ],
];
```

O array `renderers` mapeia os tipos de conteúdo do header `Accept` para
nomes de classes de renderer. Quando você informa esse array, ele substitui
o mapa padrão, então inclua as classes de renderer padrão que ainda
precisar.

## Exceções amigáveis

O renderer de erros do Yii suporta [exceções
amigáveis](https://github.com/yiisoft/friendly-exception), que deixam o
tratamento de erros ainda mais agradável para o seu time. A ideia é oferecer
um nome legível e possíveis soluções para o problema:

```php
use Yiisoft\FriendlyException\FriendlyExceptionInterface;

final readonly class RequestTimeoutException extends \RuntimeException implements FriendlyExceptionInterface
{
    public function getName(): string
    {
        return 'Request timed out';
    }
    
    public function getSolution(): ?string
    {
        return <<<'SOLUTION'
Likely it is a result of resource request is not responding in a timely fashion. Try increasing timeout.
SOLUTION;
    }
}
```

Quando a aplicação lança uma exceção desse tipo, o renderer de erros mostra
o nome e a solução se o modo debug estiver ativado.
