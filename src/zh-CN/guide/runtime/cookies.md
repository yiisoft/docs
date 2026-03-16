# Cookie

Cookie 用于通过 HTTP 头将数据发送到客户端浏览器，以在请求之间持久化数据。客户端在请求头中将数据发回服务器。因此，Cookie
非常适合存储少量数据，例如令牌或标志位。

## 读取 Cookie

您可以从作为路由处理器（例如控制器操作）参数提供的服务器请求中获取 Cookie 值：

```php
private function actionProfile(\Psr\Http\Message\ServerRequestInterface $request)
{
    $cookieValues = $request->getCookieParams();
    $cookieValue = $cookieValues['cookieName'] ?? null;
    // ...
}
```

除了直接从服务器请求获取 Cookie 值外，您还可以使用
[yiisoft/request-provider](https://github.com/yiisoft/request-provider)
包，该包通过 `\Yiisoft\RequestProvider\RequestCookieProvider` 提供了一种更结构化的 Cookie
处理方式，能简化代码并提高可读性。

以下是使用 `\Yiisoft\RequestProvider\RequestCookieProvider` 处理 Cookie 的示例：

```php
final readonly class MyService
{
    public function __construct(
        private \Yiisoft\RequestProvider\RequestCookieProvider $cookies
    ) {}

    public function go(): void
    {
        // Check if a specific cookie exists
        if ($this->cookies->has('foo')) {
            // Retrieve the value of the cookie
            $fooValue = $this->cookies->get('foo');
            // Do something with the cookie value
        }

        // Retrieve another cookie value
        $barValue = $this->cookies->get('bar');
        // Do something with the bar cookie value
    }
}

## Sending cookies

Since sending cookies is, in fact, sending a header but since forming the header isn't trivial, there is
`\Yiisoft\Cookies\Cookie` class to help with it:

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

构造好 Cookie 后，调用 `addToResponse()` 并传入 `\Psr\Http\Message\ResponseInterface`
实例，以将相应的 HTTP 头添加到响应中。

## 签名与加密 Cookie

为防止 Cookie 值被篡改，该包提供了两种实现：

`Yiisoft\Cookies\CookieSigner` — 使用基于 Cookie 值和密钥的唯一前缀哈希对每个 Cookie
进行签名。`Yiisoft\Cookies\CookieEncryptor` — 使用密钥对每个 Cookie 进行加密。

加密比签名更安全，但性能较低。

```php
$cookie = new \Yiisoft\Cookies\Cookie('identity', 'identityValue');

// The secret key used to sign and validate cookies.
$key = '0my1xVkjCJnD_q1yr6lUxcAdpDlTMwiU';

$signer = new \Yiisoft\Cookies\CookieSigner($key);
$encryptor = new \Yiisoft\Cookies\CookieEncryptor($key);

$signedCookie = $signer->sign($cookie);
$encryptedCookie = $encryptor->encrypt($cookie);
```

要验证并还原纯净值，请使用 `validate()` 和 `decrypt()` 方法。

```php
$cookie = $signer->validate($signedCookie);
$cookie = $encryptor->decrypt($encryptedCookie);
```

如果 Cookie 值被篡改，或之前未经过签名/加密，则会抛出 `\RuntimeException`。因此，如果不确定 Cookie
值之前是否已签名/加密，请先分别使用 `isSigned()` 和 `isEncrypted()` 方法进行检查。

```php
if ($signer->isSigned($cookie)) {
    $cookie = $signer->validate($cookie);
}

if ($encryptor->isEncrypted($cookie)) {
    $cookie = $encryptor->decrypt($cookie);
}
```

如果 Cookie 中存储了用户不应修改的重要数据，对其值进行签名或加密是有必要的。

### 自动化加密与签名

要自动化 Cookie 值的加密/签名和解密/验证，请使用 `Yiisoft\Cookies\CookieMiddleware` 实例，它是符合
[PSR-15](https://www.php-fig.org/psr/psr-15/) 规范的中间件。

该中间件提供以下功能：

- 验证并解密请求中的 Cookie 参数值。
- 如果 Cookie 参数被篡改，则将其从请求中排除并记录相关信息。
- 对 Cookie 值进行加密/签名，并在响应的 `Set-Cookie` 头中替换原始值。

为了让中间件知道哪些 Cookie 的值需要加密/签名，必须向其构造函数传入一个配置数组。数组的键是 Cookie 名称匹配模式，值为
`CookieMiddleware::ENCRYPT` 或 `CookieMiddleware::SIGN` 常量。

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

有关通配符模式用法的更多信息，请参阅
[yiisoft/strings](https://github.com/yiisoft/strings#wildcardpattern-usage)
包。

创建并使用中间件：

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
// The cookie values are encrypted/signed and appended to the response.
$response = $middleware->process($request, $handler);
```

如果 `$cookiesSettings` 数组为空，则不会对任何 Cookie 进行加密或签名。

## Cookie 安全

应将每个 Cookie 配置为安全的。重要的安全设置包括：

- `httpOnly`。设为 `true` 可防止 JavaScript 访问 Cookie 值。
- `secure`。设为 `true` 可防止通过 `HTTP` 发送 Cookie，仅允许通过 `HTTPS` 发送。
- `sameSite`，设为 `SAME_SITE_LAX` 或 `SAME_SITE_STRICT` 可防止在跨站浏览上下文中发送
  Cookie。`SAME_SITE_LAX` 会阻止在易受 CSRF 攻击的请求方法（如 POST、PUT、PATCH 等）中发送
  Cookie；`SAME_SITE_STRICT` 会阻止所有方法发送 Cookie。
- 如果 Cookie 值中的数据不应被篡改，请对其进行签名或加密，以防止值被伪造。
