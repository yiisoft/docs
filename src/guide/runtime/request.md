# Request

HTTP request has a method, URI, a set of headers and a body:

```
POST /contact HTTP/1.1
Host: example.org
Accept-Language: en-us
Accept-Encoding: gzip, deflate

{
    "subject": "Hello",
    "body": "Hello there, we need to build Yii application together!"
}
```

The method is `POST`, URI is `/contact`.
Extra headers are specifying host, preferred language and encoding.
The body could be anything.
In this case, it's a JSON payload. 

Yii uses [PSR-7 `ServerRequest`](https://www.php-fig.org/psr/psr-7/) as request representation.
The object is available in controller actions and other types of middleware:

```php
public function view(ServerRequestInterface $request): ResponseInterface
{
    // ...
}
```

## Method

The method could be obtained from a request object:

```php
$method = $request->getMethod();
```

Usually it's one of the: 

- GET
- POST
- PUT
- DELETE
- HEAD
- PATCH
- OPTIONS

In case you want to make sure the request method is of a certain type, there is a special class with method names:

```php
use Yiisoft\Http\Method;

if ($request->getMethod() === Method::POST) {
    // method is POST
}
``` 

## URI

A URI has:

- Scheme (`http`, `https`)
- Host (`yiiframework.com`)
- Port (`80`, `443`)
- Path (`/posts/1`)
- Query string (`page=1&sort=+id`)
- Fragment (`#anchor`)

You can obtain `UriInterface` from request like the following:

```php
$uri = $request->getUri();
``` 

Then you can get various details from its methods:

- `getScheme()`
- `getAuthority()`
- `getUserInfo()`
- `getHost()`
- `getPort()`
- `getPath()`
- `getQuery()`
- `getFragment()`
  
## Headers

There are various methods to inspect request headers. To get all headers as an array:

```php
$headers = $request->getHeaders();
foreach ($headers as $name => $values) {
   // ...
}
```

To get a single header:

```php
$values = $request->getHeader('Accept-Encoding');
```


Also, you could get value as a comma-separated string instead of an array.
That's especially handy if a header has a single value:

```php
if ($request->getHeaderLine('X-Requested-With') === 'XMLHttpRequest') {
    // This is an AJAX request made with jQuery.
    // Note that header presence and name may vary depending on the library used. 
}
```

To check if a header is present in the request:

```php
if ($request->hasHeader('Accept-Encoding')) {
    // ...
}
```

## Body

There are two methods to get body contents. The first is getting the body as it is without parsing:

```php
$body = $request->getBody();
```

The `$body` would be an instance of `Psr\Http\Message\StreamInterface`.

Also, you could get a parsed body:

```php
$bodyParameters = $request->getParsedBody();
```

Parsing depends on PSR-7 implementation and may require middleware for custom body formats.

```php
<?php
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

final readonly class JsonBodyParserMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandler $next): Response
    {
        $contentType = $request->getHeaderLine('Content-Type');

        if (strpos($contentType, 'application/json') !== false) {
            $body = $request->getBody();
            $parsedBody = $this->parse($body);
            $request = $request->withParsedBody($parsedBody);
            
        }

        return $next->handle($request);
    }
}
```

## File uploads

Uploaded files that user submitted from a form with `enctype` attribute equals to `multipart/form-data` are handled
via special request method:

```php
$files = $request->getUploadedFiles();
foreach ($files as $file) {
    if ($file->getError() === UPLOAD_ERR_OK) {
        $file->moveTo('path/to/uploads/new_filename.ext');
    }
}
```

Always check upload errors before reading the stream or moving the file. The file may be missing, too large for PHP
configuration, only partially uploaded, or rejected by a PHP extension.

The following example handles a single `avatar` upload. It validates the upload error, size, detected media type, stores
the file outside the public directory, and generates its own file name instead of trusting the client-provided name.

```php
<?php

declare(strict_types=1);

namespace App\Web\Profile;

use finfo;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use RuntimeException;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Http\Status;

final readonly class UploadAvatarAction
{
    private const MAX_SIZE = 2 * 1024 * 1024;

    /**
     * @var array<string, string>
     */
    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(
        private Aliases $aliases,
        private ResponseFactoryInterface $responseFactory,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $file = $request->getUploadedFiles()['avatar'] ?? null;

        if (!$file instanceof UploadedFileInterface) {
            return $this->badRequest('Upload a file in the "avatar" field.');
        }

        if ($file->getError() !== UPLOAD_ERR_OK) {
            return $this->badRequest($this->uploadErrorMessage($file->getError()));
        }

        if ($file->getSize() === null || $file->getSize() > self::MAX_SIZE) {
            return $this->badRequest('The file must not be larger than 2 MiB.');
        }

        $uploadDirectory = $this->aliases->get('@runtime/uploads/avatars');
        $this->ensureDirectory($uploadDirectory);

        $temporaryPath = $uploadDirectory . DIRECTORY_SEPARATOR . bin2hex(random_bytes(16)) . '.upload';
        $file->moveTo($temporaryPath);

        $mediaType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);

        if (!is_string($mediaType) || !isset(self::EXTENSIONS[$mediaType])) {
            unlink($temporaryPath);
            return $this->badRequest('Only JPEG, PNG, and WebP images are allowed.');
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . self::EXTENSIONS[$mediaType];
        $targetPath = $uploadDirectory . DIRECTORY_SEPARATOR . $fileName;

        if (!rename($temporaryPath, $targetPath)) {
            unlink($temporaryPath);
            throw new RuntimeException('Unable to store uploaded file.');
        }

        $response = $this->responseFactory->createResponse(Status::CREATED);
        $response->getBody()->write('Stored as ' . $fileName);

        return $response;
    }

    private function badRequest(string $message): ResponseInterface
    {
        $response = $this->responseFactory->createResponse(Status::BAD_REQUEST);
        $response->getBody()->write($message);

        return $response;
    }

    private function uploadErrorMessage(int $error): string
    {
        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The uploaded file is too large.',
            UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            default => 'The file could not be uploaded.',
        };
    }

    private function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created.', $directory));
        }
    }
}
```

Notes:

- Store uploads under `@runtime` or another non-public directory unless the files are intentionally public.
- Do not use `getClientFilename()` as a storage path. A browser controls it, so it may contain unsafe characters,
  path-like values, or duplicate names.
- Do not rely on `getClientMediaType()` alone. It comes from the client. Detect the actual type with `fileinfo`,
  an image library, or another server-side parser appropriate for the file format.
- Check PHP limits such as `upload_max_filesize`, `post_max_size`, and `max_file_uploads` when expected files are
  rejected before the action runs.
- When a form uploads several files, the array returned by `getUploadedFiles()` has the same shape as the file input
  names. Validate and move each `UploadedFileInterface` separately.

## Attributes

Application middleware may set custom request attributes using `withAttribute()` method.
You can get these attributes with `getAttribute()`.

Route arguments, such as `id` from a `/posts/{id}` route pattern, aren't request attributes.
Use `#[RouteArgument]` in an action parameter or inject `Yiisoft\Router\CurrentRoute` when you need route arguments
or route metadata.
