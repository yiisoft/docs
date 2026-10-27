# Testes end-to-end

O template de aplicação Yii usa a suíte `Web` do Codeception para testes que
passam por um servidor HTTP. Esses testes ficam em `tests/Web` e usam
`App\Tests\Support\WebTester`.

Use testes web para o comportamento HTTP visível ao usuário: páginas, links,
formulários, redirecionamentos, cookies e páginas de erro.

## Suíte Web

O template configura `tests/Web.suite.yml` assim:

```yaml
actor: WebTester
extensions:
  enabled:
    - Codeception\Extension\RunProcess:
        0: composer serve
        sleep: 3
modules:
  enabled:
    - PhpBrowser:
        url: http://127.0.0.1:8080
```

`RunProcess` inicia a aplicação com o script `serve` do
Composer. `PhpBrowser` envia requisições HTTP ao servidor.

## Testar uma página

O template inclui `tests/Web/HomePageCest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Web;

use App\Tests\Support\WebTester;

final class HomePageCest
{
    public function base(WebTester $I): void
    {
        $I->wantTo('home page works.');
        $I->amOnPage('/');
        $I->expectTo('see page home.');
        $I->see('Hello!');
    }
}
```

Execute a suíte web localmente:

```shell
APP_ENV=test vendor/bin/codecept run Web
```

Execute apenas este teste:

```shell
APP_ENV=test vendor/bin/codecept run Web HomePageCest
```

Com Docker:

```shell
make test Web
```

## Testar links e páginas de erro

Use os mesmos métodos do actor para navegação e asserções sobre a resposta:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Web;

use App\Tests\Support\WebTester;

final class NotFoundHandlerCest
{
    public function nonExistentPage(WebTester $I): void
    {
        $I->wantTo('see 404 page.');
        $I->amOnPage('/non-existent-page');
        $I->canSeeResponseCodeIs(404);
        $I->see('404');
        $I->see('The page /non-existent-page not found.');
    }
}
```

## Smoke test com curl

Para um smoke test de deploy, inicie a aplicação e verifique uma URL:

```shell
APP_ENV=test ./yii serve --port=8080
```

Em outro terminal:

```shell
curl -fsS http://127.0.0.1:8080/ > /tmp/home.html
grep -q "Hello!" /tmp/home.html
```

## Redefinir o estado

Testes web usam infraestrutura real, então redefina o estado antes de cada
cenário:

- Carregue apenas os registros exigidos pelo cenário.
- Limpe o armazenamento de sessão e de cookies.
- Limpe arquivos gerados e mensagens de saída.
- Pare os workers em segundo plano ou torne seus efeitos determinísticos.

Se o cenário altera um banco de dados, redefina-o no hook `_before()` do
Cest ou em um helper específico do projeto:

```php
public function _before(WebTester $I): void
{
    // Redefina tabelas do banco de dados, arquivos, filas e mensagens de saída.
}
```
