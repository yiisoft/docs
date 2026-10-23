# Functional tests

Functional tests run application code in the same PHP process. In the Yii
application template they live in `tests/Functional` and use
`App\Tests\Support\FunctionalTester`.

Use them for routing, middleware, action handlers, views, container
configuration, headers, cookies, and sessions.

## Functional tester

The template already has a helper method for sending PSR-7 requests:

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

## Test a page

The template includes `tests/Functional/HomePageCest.php`:

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

Run it:

```shell
APP_ENV=test vendor/bin/codecept run Functional
APP_ENV=test vendor/bin/codecept run Functional HomePageCest
```

## Send request data

Use PSR-7 methods to model the request:

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

For JSON APIs, write the JSON body into a PSR-7 stream and set
`Content-Type: application/json`.

## Reset state

Functional tests often touch runtime files, sessions, cache, and a
database. Reset changed state in the Cest `_before()` hook or in a project
helper:

```php
public function _before(FunctionalTester $tester): void
{
    // Reset database tables, cache pools, queues, and outgoing messages.
}
```

Keep pure domain rules in unit tests. Put request and response behavior in
functional tests.
