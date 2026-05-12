# End-to-end tests

The Yii application template uses the `Web` Codeception suite for tests that go through an HTTP server. These tests live
in `tests/Web` and use `App\Tests\Support\WebTester`.

Use web tests for user-visible HTTP behavior: pages, links, forms, redirects, cookies, and error pages.

## Web suite

The template configures `tests/Web.suite.yml` like this:

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

`RunProcess` starts the application with the Composer `serve` script. `PhpBrowser` sends HTTP requests to the server.

## Test a page

The template includes `tests/Web/HomePageCest.php`:

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

Run the web suite locally:

```shell
APP_ENV=test vendor/bin/codecept run Web
```

Run only this test:

```shell
APP_ENV=test vendor/bin/codecept run Web HomePageCest
```

With Docker:

```shell
make test Web
```

## Test links and error pages

Use the same actor methods for navigation and response assertions:

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

## Smoke test with curl

For a deployment smoke test, start the application and check one URL:

```shell
APP_ENV=test ./yii serve --port=8080
```

In another terminal:

```shell
curl -fsS http://127.0.0.1:8080/ > /tmp/home.html
grep -q "Hello!" /tmp/home.html
```

## Reset state

Web tests use real infrastructure, so reset state before each scenario:

- Load only the records required by the scenario.
- Clear session and cookie storage.
- Clear generated files and outgoing messages.
- Stop background workers, or make their effects deterministic.

If the scenario changes a database, reset it in the Cest `_before()` hook or in a project-specific helper:

```php
public function _before(WebTester $I): void
{
    // Reset database tables, files, queues, and outgoing messages.
}
```
