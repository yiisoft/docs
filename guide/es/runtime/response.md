# Response

HTTP response contains status code and message, a set of headers and a body: 

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

Yii uses [PSR-7 `Response`](https://www.php-fig.org/psr/psr-7/) in the web applicaiton to represent response.

The object should be constructed and returned as a result of execution of controller actions or other middleware.
Usually the middleware has response factory injected into its constructor.

```php
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class PostAction
{
    private ResponseFactoryInterface $responseFactory;

    public function __construct(ResponseFactoryInterface $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }

    public function view(ServerRequestInterface $request): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

## Status code

Setting status code is done like the following:

```php
use Yiisoft\Http\Status;

$response = $response->withStatus(Status::NOT_FOUND);
```

Majority of status codes are available from `Status` class for convenience and readability.

## Headers

Headers could be set like this:

```php
$response = $response->withHeader('Content-type', 'application/json');
```

If there is a need to append a header value to existing header:

```php
$response = $response->withAddedHeader('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT');
```

And, if needed, headers could be removed:

```php
$response = $response->withoutHeader('Set-Cookie');
```

## Body

Response body is an object implementing `Psr\Http\Message\StreamInterface`.

Writing to it could be done via the interface itself: 

```php
$body = $response->getBody();
$body->write('Hello');
```


## Examples

### Redirecting

```php
use Yiisoft\Http\Status;

return $response
  ->withStatus(STatus::PERMANENT_REDIRECT)
  ->withHeader('Location', 'https://www.example.com');  
```

### Responding with JSON

```php
use Yiisoft\Json\Json;

$data = [
    'account' => 'samdark',
    'value' => 42
];

$response->getBody()->write(Json::encode($data));
return $response
          ->withStatus(200)
          ->withHeader('Content-Type', 'application/json');
``` 
