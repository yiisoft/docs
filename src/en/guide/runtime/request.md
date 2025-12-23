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

## Attributes

Application middleware may set custom request attributes using `withAttribute()` method.
You can get these attributes with `getAttribute()`.
