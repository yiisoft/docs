# Functional tests

Functional tests run application code in the same PHP process. For a web application, create a PSR-7 request, pass it
to Yii, and assert on the PSR-7 response.

This checks routing, middleware, action handlers, views, container configuration, headers, cookies, and sessions without
starting a web server.

## Add a web test helper

Create `tests/Support/WebApp.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Support;

use App\Environment;
use HttpSoft\Message\ServerRequestFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

use function dirname;

final class WebApp
{
    public static function request(string $method, string $uri): ServerRequestInterface
    {
        return (new ServerRequestFactory())->createServerRequest($method, $uri);
    }

    public static function handle(ServerRequestInterface $request): ResponseInterface
    {
        $runner = new HttpApplicationRunner(
            rootPath: dirname(__DIR__, 2),
            debug: true,
            environment: Environment::TEST,
            bootstrapGroup: 'bootstrap-web',
            eventsGroup: 'events-web',
            diGroup: 'di-web',
            diProvidersGroup: 'di-providers-web',
            diDelegatesGroup: 'di-delegates-web',
            diTagsGroup: 'di-tags-web',
            paramsGroup: 'params-web',
            nestedParamsGroups: ['params'],
            nestedEventsGroups: ['events'],
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

If your project uses different configuration group names, take them from `config/configuration.php`.

## Test a page

Create `tests/Functional/HomePageTest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Tests\Support\WebApp;
use PHPUnit\Framework\TestCase;

final class HomePageTest extends TestCase
{
    protected function setUp(): void
    {
        test_reset_runtime();
    }

    public function testHomePageReturnsSuccessfulResponse(): void
    {
        $response = WebApp::handle(WebApp::request('GET', '/'));

        self::assertSame(200, $response->getStatusCode());
        self::assertStringContainsString('Welcome', (string) $response->getBody());
    }
}
```

Run it:

```shell
vendor/bin/phpunit tests/Functional/HomePageTest.php
```

## Send request data

Use PSR-7 methods to model the request:

```php
$request = WebApp::request('POST', '/contact')
    ->withHeader('Content-Type', 'application/x-www-form-urlencoded')
    ->withParsedBody([
        'ContactForm' => [
            'name' => 'Sam',
            'email' => 'sam@example.test',
            'body' => 'Hello.',
        ],
    ]);

$response = WebApp::handle($request);

self::assertSame(302, $response->getStatusCode());
self::assertSame('/contact/sent', $response->getHeaderLine('Location'));
```

For JSON APIs, write the JSON body into a PSR-7 stream and set `Content-Type: application/json`.

## Reset state

Functional tests often touch runtime files, sessions, cache, and a database. Reset the changed state before each test:

```php
protected function setUp(): void
{
    test_reset_runtime();
    // Reset database tables, cache pools, queues, and outgoing messages here.
}
```

Use functional tests when the behavior depends on Yii wiring. Keep pure domain rules in unit tests.
