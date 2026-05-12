# Testing environment setup

The Yii application template has the test environment configured. Use this
page when creating a new project from the template, restoring removed test
files, or adding a new suite.

## Composer configuration

The template requires Codeception, PHPUnit, and the modules used by the
suites:

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

If these entries are already in your project, keep the installed versions
from `composer.lock`.

## Main Codeception file

The root `codeception.yml` defines the test namespace, paths, bootstrap
file, and coverage source:

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

`tests/bootstrap.php` prepares the application environment for every suite:

```php
<?php

declare(strict_types=1);

App\Environment::prepare();
```

Set `APP_ENV=test` when running tests locally:

```shell
APP_ENV=test vendor/bin/codecept run
```

The Docker test service reads the same value from `docker/test/.env`:

```dotenv
APP_ENV=test
APP_DEBUG=false
APP_C3=true
SERVER_NAME=:80
XDEBUG_MODE=coverage
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

## Suites

The template has one suite file per test type.

`tests/Unit.suite.yml` enables PHPUnit assertions through Codeception:

```yaml
actor: UnitTester
modules:
    enabled:
        - Asserts
```

`tests/Functional.suite.yml` uses the project `FunctionalTester` helper:

```yaml
actor: FunctionalTester
```

`tests/Web.suite.yml` starts the built-in server and sends HTTP requests
with PhpBrowser:

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

`tests/Console.suite.yml` enables console command testing:

```yaml
actor: ConsoleTester
modules:
  enabled:
    - Cli
```

After adding or changing a suite, rebuild generated actor actions:

```shell
vendor/bin/codecept build
```

With Docker:

```shell
make codecept build
```

## Test configuration

Put test-only application parameters into
`config/environments/test/params.php`. The application loads this file when
`APP_ENV=test`.

Use the test environment for values such as:

- Database name and credentials.
- Mailer transport.
- Queue transport.
- Cache storage.
- Log target paths.

Keep test credentials separate from development and production credentials.

## State reset

Each test must leave the next test with predictable state. Choose a reset
strategy for every external resource the test changes:

- Recreate or truncate database tables before application-level tests.
- Clear cache pools used by the test environment.
- Clear sessions and cookies in web tests.
- Remove generated files from `runtime`.
- Replace outgoing mail, queues, and HTTP clients with test doubles where
  practical.

For database tests, prefer one project-wide fixture or migration
flow. Mixing reset strategies makes failures hard to reproduce.

## Coverage

Run coverage locally when Xdebug or another coverage driver is enabled:

```shell
APP_ENV=test APP_C3=true XDEBUG_MODE=coverage vendor/bin/codecept run --coverage --coverage-html --disable-coverage-php
```

With Docker, coverage variables are already in `docker/test/.env`:

```shell
make test-coverage
```
