# Testes funcionais

Testes funcionais executam o código da aplicação no mesmo processo PHP. No
template de aplicação Yii eles ficam em `tests/Functional` e usam
`App\Tests\Support\FunctionalTester`.

Use-os para roteamento, middlewares, action handlers, views, configuração do
container, headers, cookies e sessões.

## Functional tester

O template já tem um método helper para enviar requisições PSR-7:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Support;

use App\Environment;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

use function dirname;

class FunctionalTester extends \Codeception\Actor
{
    use _generated\FunctionalTesterActions;

    public function sendRequest(ServerRequestInterface $request): ResponseInterface
    {
        $runner = new HttpApplicationRunner(
            rootPath: dirname(__DIR__, 2),
            environment: Environment::appEnv(),
        );

        $response = $runner->runAndGetResponse($request);
        $body = $response->getBody();
        if ($body->isSeekable()) {
            $body->rewind();
        }

        return $response;
    }
}
```

## Testar uma página

O template inclui `tests/Functional/HomePageCest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Support\FunctionalTester;
use HttpSoft\Message\ServerRequest;

use function PHPUnit\Framework\assertSame;
use function PHPUnit\Framework\assertStringContainsString;

final class HomePageCest
{
    public function base(FunctionalTester $tester): void
    {
        $response = $tester->sendRequest(
            new ServerRequest(uri: '/'),
        );

        assertSame(200, $response->getStatusCode());
        assertStringContainsString(
            'Don\'t forget to check the guide',
            $response->getBody()->getContents(),
        );
    }
}
```

Execute-o:

```shell
APP_ENV=test vendor/bin/codecept run Functional
APP_ENV=test vendor/bin/codecept run Functional HomePageCest
```

## Enviar dados na requisição

Use os métodos PSR-7 para modelar a requisição:

```php
$request = (new ServerRequest(uri: '/contact', method: 'POST'))
    ->withHeader('Content-Type', 'application/x-www-form-urlencoded')
    ->withParsedBody([
        'ContactForm' => [
            'name' => 'Sam',
            'email' => 'sam@example.test',
            'body' => 'Hello.',
        ],
    ]);

$response = $tester->sendRequest($request);

assertSame(302, $response->getStatusCode());
assertSame('/contact/sent', $response->getHeaderLine('Location'));
```

Para APIs JSON, escreva o corpo JSON em um stream PSR-7 e defina
`Content-Type: application/json`.

## Redefinir o estado

Testes funcionais costumam mexer em arquivos de runtime, sessões, cache e
banco de dados. Redefina o estado alterado no hook `_before()` do Cest ou em
um helper do projeto:

```php
public function _before(FunctionalTester $tester): void
{
    // Redefina tabelas do banco de dados, pools de cache, filas e mensagens de saída.
}
```

Mantenha as regras de domínio puras nos testes unitários. Coloque o
comportamento de requisição e resposta nos testes funcionais.
