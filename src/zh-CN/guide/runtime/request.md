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

## 属性

应用中间件可以使用 `withAttribute()` 方法设置自定义请求属性，并通过 `getAttribute()` 获取这些属性。
