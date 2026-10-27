# Início rápido

O Yii trabalha com APIs JSON usando os mesmos objetos de requisição e
resposta PSR-7 das páginas web.  Para endpoints de API, o fluxo comum é:

* Ler o corpo da requisição quando o cliente envia JSON.
* Mapear os dados da requisição para um objeto de entrada tipado.
* Validar o objeto de entrada.
* Retornar uma resposta cujos dados são formatados como JSON.

Este guia assume que você usa o [template de aplicação
API](https://github.com/yiisoft/app-api).  Ele já inclui a leitura do corpo
da requisição, a resolução da entrada da requisição, respostas de dados em
JSON e exemplos de presenters.  Para aplicações completas com outras
estruturas, veja [Aplicações demo](../start/demo-apps.md).

## Criando a entrada da requisição

Use o [yiisoft/input-http](https://github.com/yiisoft/input-http) para
descrever os dados da requisição como um objeto de entrada tipado.  Adicione
`#[FromBody]` quando todos os valores devem vir do corpo da requisição já
interpretado.

Crie `src/Api/Post/CreatePostInput.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Post;

use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;
use Yiisoft\Validator\Rule\Length;
use Yiisoft\Validator\Rule\Required;

#[FromBody]
final class CreatePostInput extends AbstractInput
{
    #[Required]
    #[Length(min: 2, max: 100)]
    public string $title = '';

    #[Required]
    public string $content = '';
}
```

Para uma requisição como:

```http
POST /posts HTTP/1.1
Content-Type: application/json

{"title": "First post", "content": "Text"}
```

`CreatePostInput` recebe `title` e `content` do corpo JSON decodificado.

Se a maioria dos valores deve vir do corpo da requisição, mas um valor
precisa vir de outra parte da requisição, combine `#[FromBody]` com
atributos de parâmetro.

Por exemplo, crie `src/Api/Post/UpdatePostInput.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Post;

use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Data\FromBody;
use Yiisoft\Input\Http\Attribute\Parameter\Query;
use Yiisoft\Validator\Rule\Length;
use Yiisoft\Validator\Rule\Required;

#[FromBody]
final class UpdatePostInput extends AbstractInput
{
    public function __construct(
        #[Query('id')]
        public int $id = 0,
        #[Required]
        #[Length(min: 2, max: 100)]
        public string $title = '',
        #[Required]
        public string $content = '',
    ) {}
}
```

Para uploads de arquivos enviados como `multipart/form-data`, mapeie os
arquivos enviados com `#[UploadedFiles]`.

Por exemplo, crie `src/Api/Post/UploadImageInput.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Post;

use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Parameter\Body;
use Yiisoft\Input\Http\Attribute\Parameter\UploadedFiles;

final class UploadImageInput extends AbstractInput
{
    public function __construct(
        #[Body]
        public string $title,
        #[UploadedFiles('image')]
        public mixed $image,
    ) {}
}
```

## Criando uma action

O `RequestInputParametersResolver` permite que uma action declare o tipo de
objetos de entrada da requisição diretamente.  No template de aplicação API,
ele já está configurado em `config/web/di/application.php`.

Crie `src/Api/Post/CreatePostAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Post;

use App\Api\Shared\ResponseFactory;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;

final readonly class CreatePostAction
{
    public function __invoke(
        CreatePostInput $input,
        ResponseFactory $responseFactory,
    ): ResponseInterface {
        $result = $input->getValidationResult();

        if (!$result->isValid()) {
            return $responseFactory->failValidation($result);
        }

        return $responseFactory
            ->success([
                'title' => $input->title,
                'content' => $input->content,
            ])
            ->withStatus(Status::CREATED);
    }
}
```

Você pode validar a entrada na action como mostrado acima.  Outra opção é
configurar o `RequestInputParametersResolver` para lançar
`Yiisoft\Input\Http\InputValidationException` e converter essa exceção em
uma resposta JSON em um único tratador de erros.  O template de aplicação
API usa essa abordagem centralizada.

## Retornando respostas JSON

Para endpoints pequenos, você pode escrever o JSON em uma resposta PSR-7
manualmente, como mostrado em [Respondendo com
JSON](../runtime/response.md#respondendo-com-json).  Para APIs, prefira o
[yiisoft/data-response](https://github.com/yiisoft/data-response), que
formata os dados da resposta e define o header `Content-Type`.

O template de aplicação API mantém a formatação das respostas em
`src/Api/Shared/ResponseFactory.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Shared;

use App\Api\Shared\Presenter\AsIsPresenter;
use App\Api\Shared\Presenter\PresenterInterface;
use App\Api\Shared\Presenter\ValidationResultPresenter;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\DataResponse\ResponseFactory\DataResponseFactoryInterface;
use Yiisoft\Http\Status;
use Yiisoft\Validator\Result;

final readonly class ResponseFactory
{
    public function __construct(
        private DataResponseFactoryInterface $dataResponseFactory,
    ) {}

    public function success(
        array|object|null $data = null,
        PresenterInterface $presenter = new AsIsPresenter(),
    ): ResponseInterface {
        return $this->dataResponseFactory->createResponse([
            'status' => 'success',
            'data' => $presenter->present($data),
        ]);
    }

    public function failValidation(Result $result): ResponseInterface
    {
        return $this->dataResponseFactory
            ->createResponse([
                'status' => 'failed',
                'error_message' => 'Validation failed.',
                'error_data' => (new ValidationResultPresenter())->present($result),
            ])
            ->withStatus(Status::UNPROCESSABLE_ENTITY);
    }
}
```

Presenters são abstrações da camada de aplicação que transformam objetos da
aplicação em arrays de saída da API.  Mantenha-os separados das entidades de
domínio, para que mudar uma resposta da API não force mudanças nos objetos
de negócio.

Crie `src/Api/Post/PostPresenter.php`:

```php
<?php

declare(strict_types=1);

namespace App\Api\Post;

use App\Api\Shared\Presenter\PresenterInterface;

/**
 * @implements PresenterInterface<Post>
 */
final readonly class PostPresenter implements PresenterInterface
{
    public function present(mixed $value): array
    {
        return [
            'id' => $value->id,
            'title' => $value->title,
            'content' => $value->content,
        ];
    }
}
```

O template de API contém uma implementação mais completa da [response
factory](https://github.com/yiisoft/app-api/blob/master/src/Api/Shared/ResponseFactory.php)
e dos
[presenters](https://github.com/yiisoft/app-api/tree/master/src/Api/Shared/Presenter).

## Roteando um endpoint

Registre as rotas da API em `config/common/routes.php`:

```php
use App\Api\Post\CreatePostAction;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::methods([Method::POST], '/posts')
        ->action(CreatePostAction::class)
        ->name('api/posts/create'),
];
```

Envie JSON definindo `Content-Type: application/json`.  Peça respostas JSON
com `Accept: application/json`.

```shell
curl -X POST http://localhost:8080/posts \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -d '{"title":"First post","content":"Text"}'
```

Erros de validação são retornados como JSON com status HTTP `422
Unprocessable Entity`.  Uma criação bem-sucedida normalmente retorna `201
Created`.

## Aplicações existentes

Se você for adicionar endpoints de API JSON a uma aplicação web existente,
primeiro instale os pacotes de API:

```shell
composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

Se você usa Docker:

```shell
make composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

Em `config/web/di/application.php`, adicione o `RequestBodyParser` antes do
`Router`, para que as requisições JSON sejam lidas antes de as actions
rodarem:

```php
use Yiisoft\Request\Body\RequestBodyParser;
use Yiisoft\Router\Middleware\Router;

return [
    RequestBodyParser::class,
    Router::class,
];
```

No mesmo arquivo, adicione o middleware de resposta de dados JSON antes do
tratamento de erros e do roteamento:

```php
use Yiisoft\DataResponse\Formatter\JsonFormatter;
use Yiisoft\DataResponse\Middleware\ContentNegotiatorDataResponseMiddleware;

return [
    static fn() => new ContentNegotiatorDataResponseMiddleware(
        formatters: [
            'application/json' => new JsonFormatter(),
        ],
        fallback: new JsonFormatter(),
    ),
    // tratamento de erros, leitor do corpo da requisição, router e middleware de não encontrado
];
```

Também em `config/web/di/application.php`, configure os resolvedores de
parâmetros das actions:

```php
use Yiisoft\Definitions\Reference;
use Yiisoft\Input\Http\HydratorAttributeParametersResolver;
use Yiisoft\Input\Http\RequestInputParametersResolver;
use Yiisoft\Middleware\Dispatcher\CompositeParametersResolver;
use Yiisoft\Middleware\Dispatcher\ParametersResolverInterface;

return [
    ParametersResolverInterface::class => [
        'class' => CompositeParametersResolver::class,
        '__construct()' => [
            Reference::to(HydratorAttributeParametersResolver::class),
            Reference::to(RequestInputParametersResolver::class),
        ],
    ],
];
```

Use a [configuração do template de aplicação
API](https://github.com/yiisoft/app-api/blob/master/config/web/di/application.php)
como referência completa para a ordem dos middlewares e a configuração dos
resolvedores.
