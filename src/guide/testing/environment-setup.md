# Testing environment setup

Use a dedicated test environment. It should have its own environment variables, runtime directory, database, cache, and
service fakes.

## Configure PHPUnit

Create `phpunit.xml.dist` in the project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    bootstrap="tests/bootstrap.php"
    cacheDirectory="runtime/.phpunit.cache"
    colors="true"
    failOnDeprecation="true"
    failOnNotice="true"
    failOnWarning="true"
    xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/11.0/phpunit.xsd"
>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory>src</directory>
        </include>
    </source>

    <php>
        <env name="APP_ENV" value="test" force="true"/>
        <env name="APP_DEBUG" value="true" force="true"/>
    </php>
</phpunit>
```

Create `tests/bootstrap.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Files\FileHelper;

require dirname(__DIR__) . '/vendor/autoload.php';

function test_root_path(string $path = ''): string
{
    return dirname(__DIR__) . ($path === '' ? '' : '/' . ltrim($path, '/'));
}

function test_runtime_path(string $path = ''): string
{
    return test_root_path('runtime/test' . ($path === '' ? '' : '/' . ltrim($path, '/')));
}

function test_reset_runtime(): void
{
    $runtime = test_runtime_path();

    if (is_dir($runtime)) {
        FileHelper::removeDirectory($runtime);
    }

    FileHelper::ensureDirectory($runtime);
}
```

The example uses `yiisoft/files`, which is available through the Yii application template. If your application doesn't
have it, install it:

```shell
composer require --dev yiisoft/files
```

## Configure test parameters

Use the test environment files for values that must differ from development and production.

For a Yii application template, put test-only parameters into `config/environments/test/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/log-target-file' => [
        'file' => '@runtime/test/logs/app.log',
    ],
];
```

Use the same approach for a test database, queue, mailer, or cache connection. Keep test credentials separate from
development credentials.

## Reset state

Reset changed state in `setUp()` or in a project-specific base test case:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Support;

use PHPUnit\Framework\TestCase;

abstract class WebTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        test_reset_runtime();
        $this->resetDatabase();
        $this->resetCache();
    }

    private function resetDatabase(): void
    {
        // Truncate tables, reload fixtures, or start a transaction.
    }

    private function resetCache(): void
    {
        // Clear the cache storage used by the test environment.
    }
}
```

Choose one database reset strategy and use it consistently:

- Recreate the schema when tests need full isolation and the schema is small.
- Truncate tables and load fixtures for application-level tests.
- Use transactions for tests that stay on one database connection.

Also reset sessions, cookies, uploaded files, queues, outgoing mail, fake clocks, and generated files when a test
changes them.

## Run locally and in Docker

Run all tests locally:

```shell
APP_ENV=test vendor/bin/phpunit
```

Run one suite:

```shell
APP_ENV=test vendor/bin/phpunit --testsuite Functional
```

With Docker:

```shell
docker compose -f docker/compose.yml -f docker/test/compose.yml run --rm app vendor/bin/phpunit
```
