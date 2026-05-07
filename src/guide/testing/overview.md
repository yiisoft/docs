# Testing

This section shows a practical test setup for a Yii application. The examples use PHPUnit for unit and functional
tests. They keep Yii's HTTP tests close to the framework model: create a PSR-7 request, pass it to the application, and
assert on a PSR-7 response.

Use the smallest test type that proves the behavior:

1. Unit tests.
2. Functional tests.
3. End-to-end tests.

Unit tests are fast and should cover most domain and service rules. Functional tests check application wiring through a
real request and response. End-to-end tests run through an HTTP server or browser and should cover only the main user
flows.

## Set up the project

Install PHPUnit:

```shell
composer require --dev phpunit/phpunit
```

Create the test directories:

```shell
mkdir -p tests/Unit tests/Functional tests/EndToEnd tests/Support
```

Add development autoloading and scripts to `composer.json`:

```json
{
  "autoload-dev": {
    "psr-4": {
      "App\\Tests\\": "tests"
    }
  },
  "scripts": {
    "test": "phpunit",
    "test:unit": "phpunit --testsuite Unit",
    "test:functional": "phpunit --testsuite Functional"
  }
}
```

Refresh Composer autoloading:

```shell
composer dump-autoload
```

Follow [Testing environment setup](environment-setup.md) to add `phpunit.xml.dist`, a bootstrap file, and a state reset
helper.

## Run tests

Run the full PHPUnit suite:

```shell
composer test
```

Run only unit tests:

```shell
composer test:unit
```

Run only functional tests:

```shell
composer test:functional
```

Run one test class or method:

```shell
vendor/bin/phpunit tests/Functional/HomePageTest.php
vendor/bin/phpunit --filter testHomePageReturnsSuccessfulResponse
```

When the application runs in Docker, run the same command inside the test container:

```shell
docker compose -f docker/compose.yml -f docker/test/compose.yml run --rm app vendor/bin/phpunit
```

## What to write first

Start with unit tests for code that has no framework boundary: value objects, validators, domain services, and
transformers.

Add functional tests for behavior that needs routing, middleware, configuration, a container definition, templates, or
session and cookie handling.

Add end-to-end tests for user-visible workflows such as sign in, form submission, and JavaScript behavior.

Run static analysis in CI and before changing shared contracts. Add mutation testing when the code is important enough
that weak assertions are a real risk.
