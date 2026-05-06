# 发起 HTTP 请求

Yii doesn't include its own HTTP client implementation. Use a client that
implements [PSR-18](https://www.php-fig.org/psr/psr-18/) and depend on PSR
interfaces in your application code.

This recipe uses [Guzzle](https://docs.guzzlephp.org/) as the HTTP
client. Guzzle provides a PSR-18 client and uses PSR-7 messages.

## 安装

Install Guzzle:

```shell
composer require guzzlehttp/guzzle
```

The package installs the PSR HTTP interfaces and `guzzlehttp/psr7`, which
provides PSR-7 messages and PSR-17 factories.

## Configure the container

Create `config/common/di/http-client.php`:

```php
<?php

declare(strict_types=1);

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UriFactoryInterface;
use Yiisoft\Definitions\Reference;

return [
    ClientInterface::class => [
        'class' => Client::class,
        '__construct()' => [
            'config' => [
                'timeout' => 10.0,
                'connect_timeout' => 3.0,
            ],
        ],
    ],

    HttpFactory::class => HttpFactory::class,
    RequestFactoryInterface::class => Reference::to(HttpFactory::class),
    ResponseFactoryInterface::class => Reference::to(HttpFactory::class),
    StreamFactoryInterface::class => Reference::to(HttpFactory::class),
    UriFactoryInterface::class => Reference::to(HttpFactory::class),
];
```

Use `ClientInterface` for sending requests and PSR-17 factories for creating
requests, streams, and URIs.

## Send a GET request

Inject `Psr\Http\Client\ClientInterface` and
`Psr\Http\Message\RequestFactoryInterface` into the service that talks to
the external API:

```php
<?php

declare(strict_types=1);

namespace App\GitHub;

use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use RuntimeException;

final readonly class ReleaseClient
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function latest(string $owner, string $repository): array
    {
        $request = $this->requestFactory
            ->createRequest(
                'GET',
                sprintf(
                    'https://api.github.com/repos/%s/%s/releases/latest',
                    rawurlencode($owner),
                    rawurlencode($repository),
                ),
            )
            ->withHeader('Accept', 'application/vnd.github+json');

        try {
            $response = $this->httpClient->sendRequest($request);
        } catch (ClientExceptionInterface $e) {
            throw new RuntimeException('GitHub request failed.', previous: $e);
        }

        if ($response->getStatusCode() !== 200) {
            throw new RuntimeException(sprintf(
                'GitHub returned HTTP %d.',
                $response->getStatusCode(),
            ));
        }

        return json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
    }
}
```

PSR-18 clients throw `ClientExceptionInterface` for request sending
errors. HTTP status codes such as `404` and `500` are valid responses, so
check the status code in your service.

## Send JSON

Use `StreamFactoryInterface` when you need a request body:

```php
<?php

declare(strict_types=1);

namespace App\Webhook;

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;

final readonly class WebhookClient
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
        private StreamFactoryInterface $streamFactory,
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function send(array $payload): void
    {
        $body = $this->streamFactory->createStream(json_encode($payload, JSON_THROW_ON_ERROR));

        $request = $this->requestFactory
            ->createRequest('POST', 'https://api.example.com/webhooks')
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Accept', 'application/json')
            ->withBody($body);

        $this->httpClient->sendRequest($request);
    }
}
```

## 测试

For unit tests, pass a client configured with Guzzle's `MockHandler`:

```php
<?php

declare(strict_types=1);

use App\GitHub\ReleaseClient;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\HttpFactory;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;

final class ReleaseClientTest extends TestCase
{
    public function testLatestReturnsDecodedRelease(): void
    {
        $handler = new MockHandler([
            new Response(200, [], json_encode(['tag_name' => '1.0.0'], JSON_THROW_ON_ERROR)),
        ]);

        $client = new Client(['handler' => HandlerStack::create($handler)]);
        $factory = new HttpFactory();

        $releaseClient = new ReleaseClient($client, $factory);

        $release = $releaseClient->latest('yiisoft', 'docs');

        $this->assertSame('1.0.0', $release['tag_name']);
    }
}
```

## When to use Guzzle directly

Depend on PSR interfaces for regular application services. Use
`GuzzleHttp\Client` directly in infrastructure code that needs Guzzle-only
features such as asynchronous requests, handler stacks, or middleware.
