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

Since sending cookies is, in fact, sending a header but since forming the header isn't trivial, there is `\Yiisoft\Cookies\Cookie` class
to help with it:

```php
$cookie = (new \Yiisoft\Cookies\Cookie('cookieName', 'value'))
    ->withPath('/')
    ->withDomain('yiiframework.com')
    ->withHttpOnly(true)
    ->withSecure(true)
    ->withSameSite(\Yiisoft\Cookies\Cookie::SAME_SITE_STRICT)
    ->withMaxAge(new \DateInterval('P7D'));

    return $cookie->addToResponse($response);
```

After forming a cookie call `addToResponse()` passing an instance of `\Psr\Http\Message\ResponseInterface` to add
corresponding HTTP headers to it.

## Signing cookies

To prevent the substitution of the cookie value, use `Yiisoft\Cookies\CookieSigner`.
It signs each cookie with a unique prefix hash based on the value of the cookie.

```php
$cookie = new \Yiisoft\Cookies\Cookie('identity', 'identityValue');

// The secret key used to sign and validate cookies.
$key = '0my1xVkjCJnD_q1yr6lUxcAdpDlTMwiU';
$signer = new \Yiisoft\Cookies\CookieSigner($key);

$signedCookie = $signer->sign($cookie);
```

To validate and get back the cookie with clean value, use the `validate()` method.

```php
$cookie = $signer->validate($signedCookie);
```

If the cookie value is tampered or has not been signed before, an `\RuntimeException` will be thrown.
Therefore, if you are not sure that the cookie value was signed earlier, then first use the `isSigned()` method.

```php
if ($signer->isSigned($cookie)) {
    $cookie = $signer->validate($cookie);
}
```

It makes sense to sign the value of a cookie if you store some important data in it,
such as identification data, since signing and verifying has additional overhead.

## Cookies security

Each cookie should be properly configured in order to be secure. In the above code important security settings are:

- `httpOnly`. Setting it to `true` would prevent JavaScript to access cookie value.
- `secure`. Setting it to `true` would prevent sending cookie via `HTTP`. It will be sent via `HTTPS` only.
- `sameSite`, if set to either `SAME_SITE_LAX` or `SAME_SITE_STRICT` would prevent sending a cookie in cross-site
  browsing context. `SAME_SITE_LAX` would prevent cookie sending during CSRF-prone request methods (e.g. POST, PUT,
  PATCH etc). `SAME_SITE_STRICT` would prevent cookie sending for all methods.
- Sign the value of the cookie to prevent spoofing of values if the data in the value is important.

In any case, the use of cookies cannot be 100% secure, so you should not trust the data stored in them and always check this data.
