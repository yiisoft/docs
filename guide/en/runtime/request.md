# Request

HTTP request contains a method, URI, a set of headers and a body:

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

In the above method is `POST`, URI is `/contact`. Additional headers are specifying host, preferred language
and encoding. The body could be anything. In this case it is JSON payload. 

Yii uses [PSR-7 `ServerRequest`](https://www.php-fig.org/psr/psr-7/) as request representation.
The object is available in controller actions and other types of middleware:

```php
public function view(ServerRequestInterface $request): ResponseInterface
{
    // ...
}
```

## Method

The method could be obtained from request object:

```php
$method = $request->getMethod();
```

Usually it is one of the: 

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

An URI has:

- Scheme (`http`, `https`)
- Host (`yiiframework.com`)
- Port (`80`, `443`)
- Path (`/posts/1`)
- Query string (`page=1&sort=+id`)
- Fragment (`#anchor`)

An object of `UriInterface` could be obtained from request like the following:

```php
$uri = $request->getUri();
``` 

Then various details could be obtained from its methods:

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

To obtain a single header:

```php
$values = $request->getHeader('Accept-Encoding');
```


Alternatively value could be obtained as a comma-separated string instead of an array. That is especially handy if
header contains a single value:

```php
if ($request->getHeaderLine('X-Requested-With') === 'XMLHttpRequest') {
    // This is AJAX request made with jQuery.
    // Note that header presence and name may vary depending on the library used. 
}
```

To check if a header present in the request:

```php
if ($request->hasHeader('Accept-Encoding')) {
    // ...
}
```

## Body

There are two method to obtain body contents. First is getting body as is without parsing:

```php
$body = $request->getBody();
```

The `$body` would be an instance of `Psr\Http\Message\StreamInterface`.

Alternatively, parsed body could be obtained:

```php
$bodyParameters = $request->getParsedBody();
```

Parsing depends on PSR-7 implementation and may require a middleware for custom body formats.

```php
<?php
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class JsonBodyParserMiddleware implements MiddlewareInterface
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

Uploaded files that were submitted from a form with `enctype` attribute equals to `multipart/form-data` are handled
via special request method:

```php
$files = $request->getUploadedFiles();
foreach ($files as $file) {
    if ($file->getError() === UPLOAD_ERR_OK) {
        $file->moveTo('path/to/uploads/new_filename.ext');
    }
}
```

## Attributes

Application middleware may set custom request attributes using `withAttribute()` method. These attributes could be
obtained with `getAttribute()`. For example, router is setting matched route parameters as same-named attributes.  
