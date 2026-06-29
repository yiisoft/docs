# 请求

HTTP 请求包含方法、URI、一组请求头以及正文：

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

方法为 `POST`，URI 为 `/contact`。额外的请求头指定了主机、首选语言和编码。正文可以是任何内容，此处为 JSON 数据。

Yii 使用 [PSR-7 `ServerRequest`](https://www.php-fig.org/psr/psr-7/)
作为请求的表示。该对象可在控制器操作和其他类型的中间件中使用：

```php
public function view(ServerRequestInterface $request): ResponseInterface
{
    // ...
}
```

## 方法

可以从请求对象中获取方法：

```php
$method = $request->getMethod();
```

通常是以下之一：

- GET
- POST
- PUT
- DELETE
- HEAD
- PATCH
- OPTIONS

如果需要判断请求方法是否为某种类型，可以使用包含方法名称的专用类：

```php
use Yiisoft\Http\Method;

if ($request->getMethod() === Method::POST) {
    // method is POST
}
``` 

## URI

URI 包含以下部分：

- 协议（`http`、`https`）
- 主机（`yiiframework.com`）
- 端口（`80`、`443`）
- 路径（`/posts/1`）
- 查询字符串（`page=1&sort=+id`）
- 片段（`#anchor`）

您可以按如下方式从请求中获取 `UriInterface`：

```php
$uri = $request->getUri();
``` 

然后您可以通过其方法获取各类详细信息：

- `getScheme()`
- `getAuthority()`
- `getUserInfo()`
- `getHost()`
- `getPort()`
- `getPath()`
- `getQuery()`
- `getFragment()`
  
## 头部

有多种方法可以查看请求头。获取所有请求头的数组：

```php
$headers = $request->getHeaders();
foreach ($headers as $name => $values) {
   // ...
}
```

获取单个请求头：

```php
$values = $request->getHeader('Accept-Encoding');
```


也可以获取逗号分隔的字符串形式而非数组，当请求头只有单个值时尤为方便：

```php
if ($request->getHeaderLine('X-Requested-With') === 'XMLHttpRequest') {
    // This is an AJAX request made with jQuery.
    // Note that header presence and name may vary depending on the library used. 
}
```

检查请求中是否存在某个请求头：

```php
if ($request->hasHeader('Accept-Encoding')) {
    // ...
}
```

## 正文

有两种方式获取正文内容。第一种是直接获取未解析的原始正文：

```php
$body = $request->getBody();
```

`$body` 是 `Psr\Http\Message\StreamInterface` 的实例。

也可以获取已解析的正文：

```php
$bodyParameters = $request->getParsedBody();
```

解析取决于 PSR-7 的具体实现，对于自定义正文格式可能需要中间件支持。

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

## 文件上传

用户通过 `enctype` 属性为 `multipart/form-data` 的表单上传的文件，可通过专用请求方法处理：

```php
$files = $request->getUploadedFiles();
foreach ($files as $file) {
    if ($file->getError() === UPLOAD_ERR_OK) {
        $file->moveTo('path/to/uploads/new_filename.ext');
    }
}
```

Always validate the upload before reading the stream or moving the file. The
file may be missing, too large for PHP configuration, only partially
uploaded, rejected by a PHP extension, or not match the file type and size
your application expects. Yii Validator provides the
`Yiisoft\Validator\Rule\File` rule for this. It accepts PSR-7
`UploadedFileInterface` values and validates upload error codes, extension,
MIME type, and size. Use `Yiisoft\Validator\Rule\Each` when a field contains
several files.

The following example handles a single `avatar` upload. It validates the
uploaded file with Yii Validator, stores the file outside the public
directory, and generates its own file name instead of trusting the
client-provided name.

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
use Yiisoft\Validator\Rule\File;
use Yiisoft\Validator\Rule\Image\Image;
use Yiisoft\Validator\Validator;

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

        $result = (new Validator())->validate(
            ['avatar' => $file],
            [
                'avatar' => [
                    new File(
                        extensions: ['jpg', 'jpeg', 'png', 'webp'],
                        mimeTypes: array_keys(self::EXTENSIONS),
                        maxSize: self::MAX_SIZE,
                    ),
                    new Image(skipOnError: true),
                ],
            ],
        );

        if (!$result->isValid() || !$file instanceof UploadedFileInterface) {
            $messages = $result->getPropertyErrorMessages('avatar');
            return $this->badRequest(
                $messages === [] ? 'Upload a file in the "avatar" field.' : implode(' ', $messages),
            );
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

    private function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created.', $directory));
        }
    }
}
```

Notes:

- Store uploads under `@runtime` or another non-public directory unless the
  files are intentionally public.
- Do not use `getClientFilename()` as a storage path. A browser controls it,
  so it may contain unsafe characters, path-like values, or duplicate names.
- Do not rely on `getClientMediaType()` alone. It comes from the client. Use
  `File` MIME type validation, `Image` for image validation and dimension
  checks, or another server-side parser appropriate for the file format.
- Check PHP limits such as `upload_max_filesize`, `post_max_size`, and
  `max_file_uploads` when expected files are rejected before the action
  runs.
- When a form uploads several files, the array returned by
  `getUploadedFiles()` has the same shape as the file input names. Validate
  them with `Each(new File(...))` and move each `UploadedFileInterface`
  separately.
- `File` can also validate string file paths and `SplFileInfo` instances. Do
  not pass user-submitted paths directly: use PSR-7 uploaded file objects
  from the request, or perform upload provenance checks before validating
  filesystem paths.

## 属性

应用中间件可以使用 `withAttribute()` 方法设置自定义请求属性，并通过 `getAttribute()` 获取这些属性。

Route arguments, such as `id` from a `/posts/{id}` route pattern, aren't
request attributes.  Use `#[RouteArgument]` in an action parameter or inject
`Yiisoft\Router\CurrentRoute` when you need route arguments or route
metadata.
