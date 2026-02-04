# 发起 HTTP 请求

在构建现代应用程序时，你经常需要向外部 API 发起 HTTP 请求。本文演示如何在 Yii3 应用程序中使用 Guzzle 和 [PSR
接口](https://www.php-fig.org/psr/)发起 HTTP 请求。

## 什么是 HTTP 的 PSR 接口

PHP-FIG（PHP 框架互操作性组）为 HTTP 处理定义了几个 PSR 标准：

- **PSR-7**：用于请求和响应的 HTTP 消息接口
- **PSR-17**：用于创建 PSR-7 消息对象的 HTTP 工厂接口
- **PSR-18**：用于发送 PSR-7 请求并返回 PSR-7 响应的 HTTP 客户端接口

使用这些接口可以确保你的代码与框架无关，并遵循已建立的 PHP 标准。

## 安装

安装支持 PSR-18 和 PSR-17 工厂的 Guzzle HTTP 客户端：

```shell
composer require guzzlehttp/guzzle
composer require guzzlehttp/psr7
```

## 基本用法

### 简单的 GET 请求

以下是如何使用 PSR-18 接口发起基本 GET 请求：

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

### 带 JSON 数据的 POST 请求

以下是发起带 JSON 负载的 POST 请求的示例：

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

## 在 Yii3 中的配置

### 容器配置

在 DI 容器中配置 HTTP 客户端和 PSR 工厂：

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

### 带错误处理的服务

以下是一个更健壮的服务示例，具有适当的错误处理：

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

## 高级用法

### 使用中间件

Guzzle 支持用于横切关注点的中间件，如身份验证、日志记录或重试：

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

### 异步请求

为了在发起多个请求时获得更好的性能，你可以使用异步请求：

> **Note**：异步功能不是 PSR 接口的一部分，因此此代码明确依赖于 Guzzle。

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

## 测试 HTTP 客户端

在测试发起 HTTP 请求的服务时，你可以使用 Guzzle 的 MockHandler：

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

## 最佳实践

1. **使用 PSR 接口**：始终针对 PSR 接口进行类型提示，而不是具体实现，以获得更好的可测试性和灵活性。

2. **优雅地处理错误**：始终将 HTTP 请求包装在 try-catch 块中，并适当处理网络故障。

3. **配置超时**：设置合理的连接和请求超时，以防止请求挂起。

4. **记录请求**：使用中间件或手动日志记录来跟踪 API 调用，以便调试和监控。

5. **使用依赖注入**：通过 DI 容器注入 HTTP 客户端和工厂，而不是直接创建它们。

6. **在测试中使用模拟**：使用 Guzzle 的 MockHandler 或类似工具来测试 HTTP 客户端代码，而无需发起真实的网络请求。

通过遵循这些模式并使用 PSR 接口，你将在 Yii3 应用程序中创建可维护、可测试和可互操作的 HTTP 客户端代码。
