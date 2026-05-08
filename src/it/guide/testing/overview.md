# Testing

The Yii application template includes a ready test setup. It uses
Codeception with PHPUnit assertions and has four suites:

- `Unit` for isolated PHP classes.
- `Functional` for application code called in the same PHP process.
- `Web` for requests sent through an HTTP server.
- `Console` for console commands.

The main files are:

- `codeception.yml`.
- `tests/bootstrap.php`.
- `tests/Unit.suite.yml`.
- `tests/Functional.suite.yml`.
- `tests/Web.suite.yml`.
- `tests/Console.suite.yml`.
- `tests/Support/*Tester.php`.

## Run tests locally

Build actor classes after installing dependencies or changing a suite:

```shell
vendor/bin/codecept build
```

Run all tests:

```shell
APP_ENV=test vendor/bin/codecept run
```

The template also defines a Composer script:

```shell
APP_ENV=test composer test
```

Run one suite:

```shell
APP_ENV=test vendor/bin/codecept run Unit
APP_ENV=test vendor/bin/codecept run Functional
APP_ENV=test vendor/bin/codecept run Web
APP_ENV=test vendor/bin/codecept run Console
```

Run one test class or method:

```shell
APP_ENV=test vendor/bin/codecept run Functional HomePageCest
APP_ENV=test vendor/bin/codecept run Functional HomePageCest:base
```

`APP_ENV=test` is required for local commands because `tests/bootstrap.php`
prepares the application environment before tests run.

## Run tests in Docker

Build actor classes:

```shell
make codecept build
```

Run all tests:

```shell
make test
```

Run one suite:

```shell
make test Unit
make test Functional
make test Web
make test Console
```

The Docker test environment reads `docker/test/.env`, where `APP_ENV=test`
is already set.

## Choose a suite

Start with unit tests for code that has no framework boundary: value
objects, validators, domain services, and transformers.

Use functional tests when code needs Yii configuration, dependency
injection, routing, middleware, request handling, or template rendering.

Use web tests for behavior that must go through an HTTP server: status
codes, links, redirects, cookies, and rendered pages as seen by a client.

Use console tests for commands in `src/Console`.

Run static analysis in CI and before changing shared contracts.
