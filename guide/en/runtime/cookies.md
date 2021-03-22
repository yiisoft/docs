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

## Signing and encrypting cookies

To prevent the substitution of the cookie value, the package provides two implementations:

`Yiisoft\Cookies\CookieSigner` - signs each cookie with a unique prefix hash based on the value of the cookie and a secret key.
`Yiisoft\Cookies\CookieEncryptor` - encrypts each cookie with a secret key.

Encryption is more secure than signing, but has less performance.

```php
$cookie = new \Yiisoft\Cookies\Cookie('identity', 'identityValue');

// The secret key used to sign and validate cookies.
$key = '0my1xVkjCJnD_q1yr6lUxcAdpDlTMwiU';

$signer = new \Yiisoft\Cookies\CookieSigner($key);
$encryptor = new \Yiisoft\Cookies\CookieEncryptor($key);

$signedCookie = $signer->sign($cookie);
$encryptedCookie = $encryptor->encrypt($cookie);
```

To validate and get back the pure value, use the `validate()` and `decrypt()` method.

```php
$cookie = $signer->validate($signedCookie);
$cookie = $encryptor->decrypt($encryptedCookie);
```

If the cookie value is tampered with or has not been signed/encrypted before, a `\RuntimeException` will be thrown.
Therefore, if you are not sure that the cookie value was signed/encrypted earlier,
first use the `isSigned()` and `isEncrypted()` methods, respectively.

```php
if ($signer->isSigned($cookie)) {
    $cookie = $signer->validate($cookie);
}

if ($encryptor->isEncrypted($cookie)) {
    $cookie = $encryptor->decrypt($cookie);
}
```

It makes sense to sign or encrypt the value of a cookie if you store important data that should not be modified by a user.

### Automating encryption and signing

To automate the encryption/signing and decryption/validation of cookie values, use an instance of
`Yiisoft\Cookies\CookieMiddleware`, which is a [PSR-15](https://www.php-fig.org/psr/psr-15/) middleware.

This middleware provides the following features:

- Validates and decrypts the cookie parameter values from the request.
- Excludes the cookie parameter from the request if it was tampered with and logs information about it.
- Encrypts/signs cookie values and replaces their clean values in the `Set-Cookie` headers in the response.

In order for the middleware to know which values of which cookies need to be encrypted/signed,
an array of settings must be passed to its constructor. The array keys are cookie name patterns
and values are constant values of `CookieMiddleware::ENCRYPT` or `CookieMiddleware::SIGN`.

```php
use Yiisoft\Cookies\CookieMiddleware;

$cookiesSettings = [
    // Exact match with the name `identity`.
    'identity' => CookieMiddleware::ENCRYPT,
    // Matches any number from 1 to 9 after the underscore.
    'name_[1-9]' => CookieMiddleware::SIGN,
    // Matches any string after the prefix, including an
    // empty string, except for the delimiters "/" and "\".
    'prefix*' => CookieMiddleware::SIGN,
];
```

For more information on using the wildcard pattern, see the
[yiisoft/strings](https://github.com/yiisoft/strings#wildcardpattern-usage) package.

Creating and using a middleware:

```php
/**
 * @var \Psr\Http\Message\ServerRequestInterface $request
 * @var \Psr\Http\Server\RequestHandlerInterface $handler
 * @var \Psr\Log\LoggerInterface $logger
 */

// The secret key used to sign and validate cookies.
$key = '0my1xVkjCJnD_q1yr6lUxcAdpDlTMwiU';
$signer = new \Yiisoft\Cookies\CookieSigner($key);
$encryptor = new \Yiisoft\Cookies\CookieEncryptor($key);

$cookiesSettings = [
    'identity' => \Yiisoft\Cookies\CookieMiddleware::ENCRYPT,
    'session' => \Yiisoft\Cookies\CookieMiddleware::SIGN,
];

$middleware = new \Yiisoft\Cookies\CookieMiddleware(
    $logger
    $encryptor,
    $signer,
    $cookiesSettings,
);

// The cookie parameter values from the request are decrypted/validated.
// The cookie values are encrypted/signed, and appended to the response.
$response = $middleware->process($request, $handler);
```

If the `$cookiesSettings` array is empty, no cookies will be encrypted and signed.

## Cookies security

Each cookie should be properly configured in order to be secure. In the above code important security settings are:

- `httpOnly`. Setting it to `true` would prevent JavaScript to access cookie value.
- `secure`. Setting it to `true` would prevent sending cookie via `HTTP`. It will be sent via `HTTPS` only.
- `sameSite`, if set to either `SAME_SITE_LAX` or `SAME_SITE_STRICT` would prevent sending a cookie in cross-site
  browsing context. `SAME_SITE_LAX` would prevent cookie sending during CSRF-prone request methods (e.g. POST, PUT,
  PATCH etc). `SAME_SITE_STRICT` would prevent cookie sending for all methods.
- Sign or encrypt the value of the cookie to prevent spoofing of values if the data in the value should not be tampered with.
