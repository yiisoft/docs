# JSON API quick start

Yii works with JSON APIs through the same PSR-7 request and response objects used by web pages.
For API endpoints, the usual flow is:

* Parse the request body when the client sends JSON.
* Map request data to a typed input object.
* Validate the input object.
* Return a response whose data is formatted as JSON.

The [API application template](https://github.com/yiisoft/app-api) already contains this setup and is the best
starting point for a dedicated API project.
For complete applications with different structures, see [Demo applications](../start/demo-apps.md).
For an existing web application, install the packages you need:

```shell
composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

If you use Docker:

```shell
make composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

## Parsing JSON requests

HTML forms submit `application/x-www-form-urlencoded` or `multipart/form-data` request bodies.
These values are available through the PSR-7 parsed body and uploaded files.

Raw JSON requests need a body parser middleware before routing and action execution.
`yiisoft/request-body-parser` parses `application/json` requests by default and writes the result to
`$request->getParsedBody()`:

```php
use Yiisoft\Request\Body\RequestBodyParser;
use Yiisoft\Router\Middleware\Router;

return [
    RequestBodyParser::class,
    Router::class,
];
```

In a full application, this middleware is usually configured in the HTTP application middleware dispatcher.
See the [API application template configuration](https://github.com/yiisoft/app-api/blob/master/config/web/di/application.php)
for a complete example.

## Creating request input

Use [yiisoft/input-http](https://github.com/yiisoft/input-http) to describe request data as a typed input object.
Attach `#[FromBody]` when all values should come from the parsed request body.
The same input works for JSON requests parsed by `RequestBodyParser` and for regular form data available as a parsed body.

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

For a request such as:

```http
POST /posts HTTP/1.1
Content-Type: application/json

{"title": "First post", "content": "Text"}
```

`CreatePostInput` receives `title` and `content` from the decoded JSON body.

If a value must come from a specific part of the request, use parameter attributes instead:

```php
use Yiisoft\Input\Http\Attribute\Parameter\Body;
use Yiisoft\Input\Http\Attribute\Parameter\Query;

final class UpdatePostInput
{
    public function __construct(
        #[Query('id')]
        public int $id,
        #[Body]
        public string $title,
        #[Body]
        public string $content,
    ) {}
}
```

For file uploads submitted as `multipart/form-data`, map uploaded files with `#[UploadedFiles]`:

```php
use Yiisoft\Input\Http\Attribute\Parameter\Body;
use Yiisoft\Input\Http\Attribute\Parameter\UploadedFiles;

final class UploadImageInput
{
    public function __construct(
        #[Body]
        public string $title,
        #[UploadedFiles('image')]
        public mixed $image,
    ) {}
}
```

## Resolving input in actions

`RequestInputParametersResolver` lets an action type-hint request input objects directly.
`HydratorAttributeParametersResolver` lets an action use individual request attributes such as `#[Query]` and `#[Body]`.

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

Then use the input object in an action:

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

If you prefer centralized validation handling, configure `RequestInputParametersResolver` to throw
`Yiisoft\Input\Http\InputValidationException` and convert that exception to a JSON response in one error handler.
The API application template uses this approach.

## Returning JSON responses

For small endpoints, you can write JSON to a PSR-7 response manually as shown in
[Responding with JSON](../runtime/response.md#responding-with-json).
For APIs, prefer [yiisoft/data-response](https://github.com/yiisoft/data-response), which formats response data and
sets the `Content-Type` header.

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
    // error handling, request body parser, router, and not-found middleware
];
```

With that middleware, actions can return data responses. A small response factory keeps the response shape consistent:

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

Presenters transform application objects to API output arrays.
Keep them separate from domain entities so changing an API response doesn't force changes in business objects.

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

The API template contains a fuller implementation of
[response factory](https://github.com/yiisoft/app-api/blob/master/src/Api/Shared/ResponseFactory.php) and
[presenters](https://github.com/yiisoft/app-api/tree/master/src/Api/Shared/Presenter).

## Routing an endpoint

Register API routes as usual:

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

Send JSON by setting `Content-Type: application/json`.
Ask for JSON responses with `Accept: application/json`.

```shell
curl -X POST http://localhost:8080/posts \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -d '{"title":"First post","content":"Text"}'
```

Validation errors are returned as JSON with HTTP status `422 Unprocessable Entity`.
Successful creation usually returns `201 Created`.
