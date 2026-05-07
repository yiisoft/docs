# Functional tests

Functional tests check how application parts work together in the same PHP process. For web applications, use Yii's
PSR-7 request-response flow: create a PSR-7 server request, pass it to the application or middleware stack, and assert
on the PSR-7 response.

This style covers routing, middleware, action handlers, container configuration, view rendering, and response headers
without starting a web server.

## Request and response

Create the request with a PSR-17 server request factory from the PSR-7 implementation used by the project:

```php
<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ServerRequestFactoryInterface;
use Yiisoft\Yii\Http\Application;

final class HomePageTest extends TestCase
{
    private Application $application;
    private ServerRequestFactoryInterface $requestFactory;

    protected function setUp(): void
    {
        /** @var array{Application, ServerRequestFactoryInterface} $runtime */
        $runtime = require __DIR__ . '/bootstrap-web-test.php';

        [$this->application, $this->requestFactory] = $runtime;
    }

    public function testHomePageReturnsSuccessfulResponse(): void
    {
        $request = $this->requestFactory->createServerRequest('GET', '/');

        $response = $this->handle($request);

        self::assertSame(200, $response->getStatusCode());
        self::assertStringContainsString('Welcome', (string) $response->getBody());
    }

    private function handle(ServerRequestInterface $request): ResponseInterface
    {
        $this->application->start();

        try {
            $response = $this->application->handle($request);
        } finally {
            $this->application->shutdown();
        }

        $body = $response->getBody();
        if ($body->isSeekable()) {
            $body->rewind();
        }

        return $response;
    }
}
```

The `bootstrap-web-test.php` file is project-specific. It should build the test container and return the
`Yiisoft\Yii\Http\Application` instance together with the PSR-17 server request factory used by the project.

## Reset state

Functional tests usually touch more state than unit tests. Reset the database, cache, sessions, files, and outgoing
messages before the next request. If a test sends multiple requests, reset state only between scenarios that must be
independent.

Use functional tests for behavior that needs application wiring. Keep pure domain rules in unit tests.
