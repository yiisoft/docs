# Configuração do ambiente de testes

O template de aplicação Yii já vem com o ambiente de testes configurado. Use
esta página ao criar um novo projeto a partir do template, restaurar
arquivos de teste removidos ou adicionar uma nova suíte.

## Configuração do Composer

O template exige o Codeception, o PHPUnit e os módulos usados pelas suítes:

```json
{
  "require-dev": {
    "codeception/codeception": "^5.3",
    "codeception/module-asserts": "^3.2",
    "codeception/module-cli": "^2.0",
    "codeception/module-phpbrowser": "^3.0",
    "phpunit/phpunit": "^11.5"
  },
  "autoload-dev": {
    "psr-4": {
      "App\\Tests\\": "tests"
    }
  },
  "scripts": {
    "test": "codecept run"
  }
}
```

Se essas entradas já estiverem no seu projeto, mantenha as versões
instaladas do `composer.lock`.

## Arquivo principal do Codeception

O `codeception.yml` na raiz define o namespace dos testes, os caminhos, o
arquivo de bootstrap e a origem da cobertura:

```yaml
namespace: App\Tests
support_namespace: Support
bootstrap: bootstrap.php

settings:
  shuffle: true
  colors: true

paths:
  tests: tests
  output: tests/_output
  data: tests/Support/Data
  support: tests/Support

coverage:
  enabled: true
  show_uncovered: true
  show_only_summary: true
  include:
    - src/*
    - public/index.php
    - yii

extensions:
  enabled:
    - Codeception\Extension\RunFailed
```

`tests/bootstrap.php` prepara o ambiente da aplicação para todas as suítes:

```php
<?php

declare(strict_types=1);

App\Environment::prepare();
```

Defina `APP_ENV=test` ao executar os testes localmente:

```shell
APP_ENV=test vendor/bin/codecept run
```

O serviço de testes do Docker lê o mesmo valor de `docker/test/.env`:

```dotenv
APP_ENV=test
APP_DEBUG=false
APP_C3=true
SERVER_NAME=:80
XDEBUG_MODE=coverage
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

## Suítes

O template tem um arquivo de suíte por tipo de teste.

`tests/Unit.suite.yml` habilita as asserções do PHPUnit por meio do
Codeception:

```yaml
actor: UnitTester
modules:
    enabled:
        - Asserts
```

`tests/Functional.suite.yml` usa o helper `FunctionalTester` do projeto:

```yaml
actor: FunctionalTester
```

`tests/Web.suite.yml` inicia o servidor embutido e envia requisições HTTP
com o PhpBrowser:

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

`tests/Console.suite.yml` habilita os testes de comandos de console:

```yaml
actor: ConsoleTester
modules:
  enabled:
    - Cli
```

Depois de adicionar ou alterar uma suíte, reconstrua as ações geradas dos
actors:

```shell
vendor/bin/codecept build
```

Com Docker:

```shell
make codecept build
```

## Configuração de testes

Coloque os parâmetros da aplicação exclusivos de teste em
`config/environments/test/params.php`. A aplicação carrega esse arquivo
quando `APP_ENV=test`.

Use o ambiente de teste para valores como:

- Nome e credenciais do banco de dados.
- Transporte do mailer.
- Transporte da fila.
- Armazenamento do cache.
- Caminhos dos destinos de log.

Mantenha as credenciais de teste separadas das credenciais de
desenvolvimento e produção.

## Redefinição de estado

Cada teste deve deixar para o próximo um estado previsível. Escolha uma
estratégia de redefinição para cada recurso externo que o teste altera:

- Recrie ou trunque as tabelas do banco de dados antes dos testes de nível
  de aplicação.
- Limpe os pools de cache usados pelo ambiente de teste.
- Limpe sessões e cookies nos testes web.
- Remova arquivos gerados de `runtime`.
- Substitua e-mails enviados, filas e clientes HTTP por test doubles quando
  for viável.

Para testes de banco de dados, prefira um único fluxo de fixtures ou
migrations para todo o projeto. Misturar estratégias de redefinição torna as
falhas difíceis de reproduzir.

## Cobertura

Execute a cobertura localmente quando o Xdebug ou outro driver de cobertura
estiver habilitado:

```shell
APP_ENV=test APP_C3=true XDEBUG_MODE=coverage vendor/bin/codecept run --coverage --coverage-html --disable-coverage-php
```

Com Docker, as variáveis de cobertura já estão em `docker/test/.env`:

```shell
make test-coverage
```
