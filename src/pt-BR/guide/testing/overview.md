# Testes

O template de aplicação Yii inclui uma configuração de testes pronta. Ele
usa o Codeception com asserções do PHPUnit e tem quatro suítes:

- `Unit` para classes PHP isoladas.
- `Functional` para código da aplicação chamado no mesmo processo PHP.
- `Web` para requisições enviadas por um servidor HTTP.
- `Console` para comandos de console.

Os arquivos principais são:

- `codeception.yml`.
- `tests/bootstrap.php`.
- `tests/Unit.suite.yml`.
- `tests/Functional.suite.yml`.
- `tests/Web.suite.yml`.
- `tests/Console.suite.yml`.
- `tests/Support/*Tester.php`.

## Executar testes localmente

Gere as classes de actor depois de instalar as dependências ou alterar uma
suíte:

```shell
vendor/bin/codecept build
```

Execute todos os testes:

```shell
APP_ENV=test vendor/bin/codecept run
```

O template também define um script do Composer:

```shell
APP_ENV=test composer test
```

Execute uma suíte:

```shell
APP_ENV=test vendor/bin/codecept run Unit
APP_ENV=test vendor/bin/codecept run Functional
APP_ENV=test vendor/bin/codecept run Web
APP_ENV=test vendor/bin/codecept run Console
```

Execute uma classe ou um método de teste:

```shell
APP_ENV=test vendor/bin/codecept run Functional HomePageCest
APP_ENV=test vendor/bin/codecept run Functional HomePageCest:base
```

`APP_ENV=test` é obrigatório nos comandos locais porque
`tests/bootstrap.php` prepara o ambiente da aplicação antes da execução dos
testes.

## Executar testes no Docker

Gere as classes de actor:

```shell
make codecept build
```

Execute todos os testes:

```shell
make test
```

Execute uma suíte:

```shell
make test Unit
make test Functional
make test Web
make test Console
```

O ambiente de testes do Docker lê `docker/test/.env`, onde `APP_ENV=test` já
está definido.

## Escolher uma suíte

Comece com testes unitários para código que não tem fronteira com o
framework: value objects, validadores, serviços de domínio e
transformadores.

Use testes funcionais quando o código precisa da configuração do Yii,
injeção de dependência, roteamento, middlewares, tratamento de requisições
ou renderização de templates.

Use testes web para comportamentos que precisam passar por um servidor HTTP:
códigos de status, links, redirecionamentos, cookies e páginas renderizadas
como o cliente as vê.

Use testes de console para os comandos em `src/Console`.

Execute a análise estática no CI e antes de alterar contratos
compartilhados.
