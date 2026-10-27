# Cookies

Os cookies servem para manter dados entre requisições, enviando-os ao
navegador do cliente por headers HTTP.  O cliente devolve os dados ao
servidor nos headers da requisição. Por isso, os cookies são práticos para
guardar pequenas quantidades de dados, como tokens ou flags.

## Lendo cookies

Você pode obter os valores dos cookies a partir da requisição do servidor,
que está disponível como argumento do handler da rota (por exemplo, uma
action de controller):

```php
private function actionProfile(\Psr\Http\Message\ServerRequestInterface $request)
{
    $cookieValues = $request->getCookieParams();
    $cookieValue = $cookieValues['cookieName'] ?? null;
    // ...
}
```

Além de obter os valores dos cookies direto da requisição do servidor, você
também pode usar o pacote
[yiisoft/request-provider](https://github.com/yiisoft/request-provider), que
oferece uma forma mais estruturada de lidar com cookies por meio do
`\Yiisoft\RequestProvider\RequestCookieProvider`.  Essa abordagem pode
simplificar o código e melhorar a legibilidade.

Veja um exemplo de como trabalhar com cookies usando o
`\Yiisoft\RequestProvider\RequestCookieProvider`:

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

Depois de montar o cookie, chame `addToResponse()` passando uma instância de
`\Psr\Http\Message\ResponseInterface` para adicionar os headers HTTP
correspondentes a ela.

## Assinando e criptografando cookies

Para evitar que o valor do cookie seja substituído, o pacote oferece duas
implementações:

`Yiisoft\Cookies\CookieSigner` - assina cada cookie com um prefixo de hash
único baseado no valor do cookie e em uma chave secreta.
`Yiisoft\Cookies\CookieEncryptor` - criptografa cada cookie com uma chave
secreta.

A criptografia é mais segura que a assinatura, mas tem desempenho menor.

```php
$cookie = new \Yiisoft\Cookies\Cookie('identity', 'identityValue');

// The secret key used to sign and validate cookies.
$key = '0my1xVkjCJnD_q1yr6lUxcAdpDlTMwiU';

$signer = new \Yiisoft\Cookies\CookieSigner($key);
$encryptor = new \Yiisoft\Cookies\CookieEncryptor($key);

$signedCookie = $signer->sign($cookie);
$encryptedCookie = $encryptor->encrypt($cookie);
```

Para validar e obter de volta o valor puro, use os métodos `validate()` e
`decrypt()`.

```php
$cookie = $signer->validate($signedCookie);
$cookie = $encryptor->decrypt($encryptedCookie);
```

Se o valor do cookie tiver sido adulterado ou não tiver sido
assinado/criptografado antes, uma `\RuntimeException` será lançada.  Por
isso, se você não tem certeza de que o valor do cookie foi
assinado/criptografado antes, use primeiro os métodos `isSigned()` e
`isEncrypted()`, respectivamente.

```php
if ($signer->isSigned($cookie)) {
    $cookie = $signer->validate($cookie);
}

if ($encryptor->isEncrypted($cookie)) {
    $cookie = $encryptor->decrypt($cookie);
}
```

Faz sentido assinar ou criptografar o valor de um cookie quando você guarda
dados importantes que o usuário não deve alterar.

### Automatizando a criptografia e a assinatura

Para automatizar a criptografia/assinatura e a descriptografia/validação dos
valores dos cookies, use uma instância de
`Yiisoft\Cookies\CookieMiddleware`, que é um middleware
[PSR-15](https://www.php-fig.org/psr/psr-15/).

Esse middleware oferece os seguintes recursos:

- Valida e descriptografa os valores dos cookies vindos da requisição.
- Remove o cookie da requisição se ele tiver sido adulterado e registra essa
  informação no log.
- Criptografa/assina os valores dos cookies e substitui os valores puros nos
  headers `Set-Cookie` da resposta.

Para o middleware saber quais valores de quais cookies precisam ser
criptografados/assinados, é preciso passar um array de configurações para o
construtor dele. As chaves do array são padrões de nomes de cookies e os
valores são as constantes `CookieMiddleware::ENCRYPT` ou
`CookieMiddleware::SIGN`.

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

Para mais informações sobre o uso de padrões com curinga, veja o pacote
[yiisoft/strings](https://github.com/yiisoft/strings#wildcardpattern-usage).

Criando e usando o middleware:

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

Se o array `$cookiesSettings` estiver vazio, nenhum cookie será
criptografado ou assinado.

## Segurança dos cookies

Você deve configurar cada cookie para ser seguro. As configurações de
segurança importantes são:

- `httpOnly`. Definir como `true` impede que o JavaScript acesse o valor do
  cookie.
- `secure`. Definir como `true` impede o envio do cookie via `HTTP`. Ele só
  será enviado via `HTTPS`.
- `sameSite`, se definido como `SAME_SITE_LAX` ou `SAME_SITE_STRICT`, impede
  o envio do cookie em contexto de navegação entre sites. `SAME_SITE_LAX`
  impede o envio do cookie em métodos de requisição sujeitos a CSRF (por
  exemplo, POST, PUT, PATCH etc.). `SAME_SITE_STRICT` impede o envio dos
  cookies em todos os métodos.
- Assine ou criptografe o valor do cookie para evitar falsificação quando os
  dados não puderem ser adulterados.
