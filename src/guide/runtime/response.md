# Response

HTTP response has status code and message, a set of headers and a body: 

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

Yii uses [PSR-7 `Response`](https://www.php-fig.org/psr/psr-7/) in the web application to represent response.

The object should be constructed and returned as a result of the execution of controller actions or other middleware.
Usually, the middleware has a response factory injected into its constructor.

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

## Status code

You can set a status code like the following:

```php
use Yiisoft\Http\Status;

$response = $response->withStatus(Status::NOT_FOUND);
```

Majority of status codes are available from `Status` class for convenience and readability.

## Headers

You can set headers like this:

```php
$response = $response->withHeader('Content-type', 'application/json');
```

If there is a need to append a header value to the existing header:

```php
$response = $response->withAddedHeader('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT');
```

And, if needed, headers could be removed:

```php
$response = $response->withoutHeader('Set-Cookie');
```

## Body

Response body is an object implementing `Psr\Http\Message\StreamInterface`.

You can write to it via the interface itself: 

```php
$body = $response->getBody();
$body->write('Hello');
```


## Examples

### Redirecting

```php
use Yiisoft\Http\Status;

return $response
  ->withStatus(Status::PERMANENT_REDIRECT)
  ->withHeader('Location', 'https://www.example.com');  
```

Note that there are different statuses used for redirection:

| Code | Usage                        | What is it for                                                                                                                                                          |
|------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 301  | `Status::MOVED_PERMANENTLY`  | Permanently changed a URL structure. Search engines update their indexes, and browsers cache it.                                                                        |
| 308  | `Status::PERMANENT_REDIRECT` | Like 301, but guarantees the HTTP method won't change.                                                                                                                  |
| 302  | `Status::FOUND`              | Temporary changes like maintenance pages. Original URL should still be used for future requests. Search engines typically don't update their indexes.                   |
| 307  | `Status::TEMPORARY_REDIRECT` | Like 302, but guarantees the HTTP method won't change.                                                                                                                  |
| 303  | `Status::SEE_OTHER`          | After form submissions to prevent duplicate submissions if the user refreshes. Explicitly tells to use `GET` for the redirect, even if the original request was `POST`. |

### Responding with JSON

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
