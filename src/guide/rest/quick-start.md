# Quick start

Yii works with JSON APIs through the same PSR-7 request and response objects used by web pages.
For API endpoints, the usual flow is:

* Parse the request body when the client sends JSON.
* Map request data to a typed input object.
* Validate the input object.
* Return a response whose data is formatted as JSON.

This guide assumes that you use the [API application template](https://github.com/yiisoft/app-api).
It already includes request body parsing, request input resolving, JSON data responses, and presenter examples.
For complete applications with different structures, see [Demo applications](../start/demo-apps.md).

## Creating request input

Use [yiisoft/input-http](https://github.com/yiisoft/input-http) to describe request data as a typed input object.
Attach `#[FromBody]` when all values should come from the parsed request body.

Create `src/Api/Post/CreatePostInput.php`:

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

If most values should come from the request body, but one value must come from another part of the request,
combine `#[FromBody]` with parameter attributes.

For example, create `src/Api/Post/UpdatePostInput.php`:

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

For file uploads submitted as `multipart/form-data`, map uploaded files with `#[UploadedFiles]`.

For example, create `src/Api/Post/UploadImageInput.php`:

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

## Creating an action

`RequestInputParametersResolver` lets an action type-hint request input objects directly.
In the API application template, it is already configured in `config/web/di/application.php`.

Create `src/Api/Post/CreatePostAction.php`:

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

You can validate the input in the action as shown above.
Alternatively, configure `RequestInputParametersResolver` to throw
`Yiisoft\Input\Http\InputValidationException` and convert that exception to a JSON response in one error handler.
The API application template uses this centralized approach.

## Returning JSON responses

For small endpoints, you can write JSON to a PSR-7 response manually as shown in
[Responding with JSON](../runtime/response.md#responding-with-json).
For APIs, prefer [yiisoft/data-response](https://github.com/yiisoft/data-response), which formats response data and
sets the `Content-Type` header.

The API application template keeps response formatting in `src/Api/Shared/ResponseFactory.php`:

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

Presenters are application-level abstractions that transform application objects to API output arrays.
Keep them separate from domain entities so changing an API response doesn't force changes in business objects.

Create `src/Api/Post/PostPresenter.php`:

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

Register API routes in `config/common/routes.php`:

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

## Existing applications

If you add JSON API endpoints to an existing web application, install the API packages first:

```shell
composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

If you use Docker:

```shell
make composer require yiisoft/input-http yiisoft/request-body-parser yiisoft/data-response
```

In `config/web/di/application.php`, add `RequestBodyParser` before `Router` so JSON requests are parsed before
actions run:

```php
use Yiisoft\Request\Body\RequestBodyParser;
use Yiisoft\Router\Middleware\Router;

return [
    RequestBodyParser::class,
    Router::class,
];
```

In the same file, add JSON data response middleware before error handling and routing:

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

Also in `config/web/di/application.php`, configure action parameter resolvers:

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

Use the [API application template configuration](https://github.com/yiisoft/app-api/blob/master/config/web/di/application.php)
as the complete reference for middleware order and resolver setup.
