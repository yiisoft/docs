# 响应

HTTP 响应包含状态码和消息、一组响应头以及正文：

```
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache/2.2.14 (Win32)
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
Content-Length: 6 
Content-Type: text/html
Connection: Closed

Hello!
```

Yii 在 Web 应用程序中使用 [PSR-7 `Response`](https://www.php-fig.org/psr/psr-7/)
来表示响应。

该对象应在控制器操作或其他中间件执行后构建并返回。通常，中间件会通过构造函数注入一个响应工厂。

```php
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class PostAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory
    )
    {
    }

    public function view(ServerRequestInterface $request): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

## 状态码

您可以按如下方式设置状态码：

```php
use Yiisoft\Http\Status;

$response = $response->withStatus(Status::NOT_FOUND);
```

大多数状态码可通过 `Status` 类获取，以便于使用和提高可读性。

## 头部

您可以按如下方式设置响应头：

```php
$response = $response->withHeader('Content-type', 'application/json');
```

如果需要向已有响应头追加值：

```php
$response = $response->withAddedHeader('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT');
```

如果需要，也可以移除响应头：

```php
$response = $response->withoutHeader('Set-Cookie');
```

## 正文

响应正文是一个实现 `Psr\Http\Message\StreamInterface` 的对象。

您可以通过该接口直接写入内容：

```php
$body = $response->getBody();
$body->write('Hello');
```


## 示例

### 重定向

```php
use Yiisoft\Http\Status;

return $response
  ->withStatus(Status::PERMANENT_REDIRECT)
  ->withHeader('Location', 'https://www.example.com');  
```

请注意，重定向使用不同的状态码：

| 代码 | 用法                         | 用途                                                                                                                                                                    |
|------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 301  | `Status::MOVED_PERMANENTLY`  | URL 结构已永久更改。搜索引擎更新索引，浏览器缓存结果。                                                                                                                  |
| 308  | `Status::PERMANENT_REDIRECT` | 类似 301，但保证 HTTP 方法不会改变。                                                                                                                                    |
| 302  | `Status::FOUND`              | 临时更改，例如维护页面。原始 URL 应继续用于未来请求，搜索引擎通常不更新索引。                                                                                           |
| 307  | `Status::TEMPORARY_REDIRECT` | 类似 302，但保证 HTTP 方法不会改变。                                                                                                                                    |
| 303  | `Status::SEE_OTHER`          | 表单提交后防止用户刷新时重复提交。明确指定重定向使用 `GET`，即使原始请求是 `POST`。                                                                                     |

### 返回 JSON 响应

```php
use Yiisoft\Http\Status;
use Yiisoft\Json\Json;

$data = [
    'account' => 'samdark',
    'value' => 42
];

$response->getBody()->write(Json::encode($data));
return $response
    ->withStatus(Status::OK)
    ->withHeader('Content-Type', 'application/json');
``` 
