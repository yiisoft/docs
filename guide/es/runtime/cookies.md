# Cookies

Cookies allow persisting data between requests by sending it to the client browser using HTTP headers.
The data is sent back to server in each request headers thus cookies are handy to store small amounts of data
such as tokens or flags.

## Reading cookies

Cookie values could be obtained from server request that is available as route handler (such as controller action) argument:

```php
private function actionProfile(\Psr\Http\Message\ServerRequestInterface $request)
{
    $cookieValues = $request->getCookieParams();
    $cookieValue = $cookieValues['cookieName'] ?? null;
    // ...
}
```

## Sending cookies

Since sending cookies is, in fact, sending a header but since forming the header isn't trivial, there is `\Yiisoft\Yii\Web\Cookie` class
to help with it:

```php
$cookie = (new \Yiisoft\Yii\Web\Cookie('cookieName', 'value'))
    ->path('/')
    ->domain('yiiframework.com')
    ->httpOnly(true)
    ->secure(true)
    ->sameSite(\Yiisoft\Yii\Web\Cookie::SAME_SITE_STRICT)
    ->validFor(new \DateInterval('P7D'));

    return $cookie->addToResponse($response);
```

After forming a cookie call `addToResponse()` passing an instance of `\Psr\Http\Message\ResponseInterface` to add
corresponding HTTP headers to it.

## Cookies security

Each cookie should be properly configured in order to be secure. In the above code important security settings are:

- `httpOnly`. Setting it to `true` would prevent JavaScript to access cookie value.
- `secure`. Setting it to `true` would prevent sending cookie via `HTTP`. It will be sent via `HTTPS` only.
- `sameSite`, if set to either `SAME_SITE_LAX` or `SAME_SITE_STRICT` would prevent sending a cookie in cross-site
  browsing context. `SAME_SITE_LAX` would prevent cookie sending during CSRF-prone request methods (e.g. POST, PUT,
  PATCH etc). `SAME_SITE_STRICT` would prevent cookie sending for all methods.
