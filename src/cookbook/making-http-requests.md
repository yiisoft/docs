# Making HTTP requests

When building modern applications, you often need to make HTTP requests to external APIs. This article demonstrates
how to make HTTP requests in Yii3 applications using Guzzle with and [PSR interfaces](https://www.php-fig.org/psr/).

## What are PSR interfaces for HTTP

The PHP-FIG (PHP Framework Interoperability Group) has defined several PSR standards for HTTP handling:

- **PSR-7**: HTTP message interfaces for requests and responses
- **PSR-17**: HTTP factory interfaces for creating PSR-7 message objects
- **PSR-18**: HTTP client interface for sending PSR-7 requests and returning PSR-7 responses

Using these interfaces ensures your code is framework-agnostic and follows established PHP standards.

## Installation

Install the Guzzle HTTP client with PSR-18 support and PSR-17 factories:

```shell
composer require guzzlehttp/guzzle
composer require guzzlehttp/psr7
```

## Basic usage

### Simple GET request

Here's how to make a basic GET request using PSR-18 interfaces:

```php
<?php

declare(strict_types=1);

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\ResponseInterface;

class ApiService
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
    ) {
    }

    public function fetchUserData(int $userId): ResponseInterface
    {
        $request = $this->requestFactory->createRequest(
            'GET',
            "https://example.com/users/{$userId}"
        );

        return $this->httpClient->sendRequest($request);
    }
}
```

### POST request with JSON data

Here's an example of making a POST request with JSON payload:

```php
<?php

declare(strict_types=1);

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\ResponseInterface;

class UserService
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
        private StreamFactoryInterface $streamFactory,
    ) {
    }

    public function createUser(array $userData): ResponseInterface
    {
        $jsonData = json_encode($userData, JSON_THROW_ON_ERROR);
        $stream = $this->streamFactory->createStream($jsonData);

        $request = $this->requestFactory->createRequest('POST', 'https://example.com/users')
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Accept', 'application/json')
            ->withBody($stream);

        return $this->httpClient->sendRequest($request);
    }
}
```

## Configuration in Yii3

### Container configuration

Configure the HTTP client and PSR factories in your DI container:

```php
<?php

declare(strict_types=1);

// config/common/http-client.php

use GuzzleHttp\Client;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UriFactoryInterface;

return [
    ClientInterface::class => [
        'class' => Client::class,
        '__construct()' => [
            'config' => [
                'timeout' => 30,
                'connect_timeout' => 10,
            ],
        ],
    ],
    
    // Configure PSR-17 factories - these will depend on your chosen PSR-7 implementation
    RequestFactoryInterface::class => static function (): RequestFactoryInterface {
        return new \GuzzleHttp\Psr7\HttpFactory();
    },
    ResponseFactoryInterface::class => static function (): ResponseFactoryInterface {
        return new \GuzzleHttp\Psr7\HttpFactory();
    },
    StreamFactoryInterface::class => static function (): StreamFactoryInterface {
        return new \GuzzleHttp\Psr7\HttpFactory();
    },
    UriFactoryInterface::class => static function (): UriFactoryInterface {
        return new \GuzzleHttp\Psr7\HttpFactory();
    },
];
```

### Service with error handling

Here's a more robust service example with proper error handling:

```php
<?php

declare(strict_types=1);

use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;

class WeatherService
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
        private StreamFactoryInterface $streamFactory,
        private LoggerInterface $logger,
        private string $apiKey,
    ) {
    }

    public function getCurrentWeather(string $city): ?array
    {
        try {
            $request = $this->requestFactory->createRequest(
                'GET',
                "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$this->apiKey}&units=metric"
            );

            $response = $this->httpClient->sendRequest($request);

            if ($response->getStatusCode() !== 200) {
                $this->logger->warning('Weather API returned non-200 status', [
                    'status_code' => $response->getStatusCode(),
                    'city' => $city,
                ]);
                return null;
            }

            $data = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            return $data;
        } catch (ClientExceptionInterface $e) {
            $this->logger->error('HTTP client error when fetching weather data', [
                'city' => $city,
                'error' => $e->getMessage(),
            ]);
            return null;
        } catch (\JsonException $e) {
            $this->logger->error('Failed to decode weather API response', [
                'city' => $city,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
```

## Advanced usage

### Using middlewares

Guzzle supports middleware for cross-cutting concerns like authentication, logging, or retrying:

```php
<?php

declare(strict_types=1);

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use Psr\Http\Message\RequestInterface;
use Psr\Log\LoggerInterface;

class HttpClientFactory
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function createClient(): Client
    {
        $stack = HandlerStack::create();
        
        // Add request/response logging middleware
        $stack->push(Middleware::log(
            $this->logger,
            new \GuzzleHttp\MessageFormatter('HTTP {method} {uri} - {code} {phrase}')
        ));
        
        // Add retry middleware
        $stack->push(Middleware::retry(
            function (int $retries, RequestInterface $request) {
                return $retries < 3;
            }
        ));

        return new Client([
            'handler' => $stack,
            'timeout' => 30,
        ]);
    }
}
```

### Async requests

For better performance when making multiple requests, you can use asynchronous requests:

> **Note**: Async functionality is not part of PSR interfaces, so this code depends on Guzzle explicitly.

```php
<?php

declare(strict_types=1);

use GuzzleHttp\Client;
use GuzzleHttp\Promise\PromiseInterface;
use Psr\Http\Message\ResponseInterface;

class BatchApiService
{
    public function __construct(
        private Client $httpClient,
    ) {
    }

    /**
     * @param array<int> $userIds
     * @return array<ResponseInterface>
     */
    public function fetchMultipleUsers(array $userIds): array
    {
        $promises = [];
        
        foreach ($userIds as $userId) {
            $promises[$userId] = $this->httpClient->getAsync(
                "https://example.com/users/{$userId}"
            );
        }

        // Wait for all requests to complete
        $responses = \GuzzleHttp\Promise\settle($promises)->wait();
        
        $results = [];
        foreach ($responses as $userId => $response) {
            if ($response['state'] === PromiseInterface::FULFILLED) {
                $results[$userId] = $response['value'];
            }
        }
        
        return $results;
    }
}
```

## Testing HTTP clients

When testing services that make HTTP requests, you can use Guzzle's MockHandler:

```php
<?php

declare(strict_types=1);

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;

class WeatherServiceTest extends TestCase
{
    public function testGetCurrentWeatherSuccess(): void
    {
        $mockHandler = new MockHandler([
            new Response(200, [], json_encode([
                'name' => 'London',
                'main' => ['temp' => 20.5],
            ])),
        ]);

        $handlerStack = HandlerStack::create($mockHandler);
        $client = new Client(['handler' => $handlerStack]);
        
        $service = new WeatherService(
            $client,
            new \GuzzleHttp\Psr7\HttpFactory(),
            new \GuzzleHttp\Psr7\HttpFactory(),
            $this->createMock(\Psr\Log\LoggerInterface::class),
            'test-api-key'
        );

        $result = $service->getCurrentWeather('London');
        
        $this->assertNotNull($result);
        $this->assertSame('London', $result['name']);
        $this->assertSame(20.5, $result['main']['temp']);
    }
}
```

## Best practices

1. **Use PSR interfaces**: Always type-hint against PSR interfaces rather than concrete implementations for better testability and flexibility.

2. **Handle errors gracefully**: Always wrap HTTP requests in try-catch blocks and handle network failures appropriately.

3. **Configure timeouts**: Set reasonable connection and request timeouts to prevent hanging requests.

4. **Log requests**: Use middleware or manual logging to track API calls for debugging and monitoring.

5. **Use dependency injection**: Inject HTTP clients and factories through your DI container rather than creating them directly.

6. **Mock in tests**: Use Guzzle's MockHandler or similar tools to test your HTTP client code without making real network requests.

By following these patterns and using PSR interfaces, you'll create maintainable, testable, and interoperable HTTP client code in your Yii3 applications.
