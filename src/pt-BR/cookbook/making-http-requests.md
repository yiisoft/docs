# Fazendo requisições HTTP

O Yii não inclui uma implementação própria de cliente HTTP. Use um cliente
que implemente a [PSR-18](https://www.php-fig.org/psr/psr-18/) e dependa das
interfaces PSR no código da sua aplicação.

Esta receita usa o [Guzzle](https://docs.guzzlephp.org/) como cliente
HTTP. O Guzzle fornece um cliente PSR-18 e usa mensagens PSR-7.

## Instalação

Instale o Guzzle:

```shell
composer require guzzlehttp/guzzle
```

O pacote instala as interfaces HTTP da PSR e o `guzzlehttp/psr7`, que
fornece mensagens PSR-7 e factories PSR-17.

## Configure o container

Crie `config/common/di/http-client.php`:

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

Use `ClientInterface` para enviar requisições e as factories PSR-17 para
criar requisições, streams e URIs.

## Envie uma requisição GET

Injete `Psr\Http\Client\ClientInterface` e
`Psr\Http\Message\RequestFactoryInterface` no serviço que conversa com a API
externa:

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

Clientes PSR-18 lançam `ClientExceptionInterface` para erros no envio da
requisição. Códigos de status HTTP como `404` e `500` são respostas válidas,
então verifique o código de status no seu serviço.

## Envie JSON

Use `StreamFactoryInterface` quando precisar de um corpo na requisição:

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

## Testes

Para testes unitários, passe um cliente configurado com o `MockHandler` do
Guzzle:

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

## Quando usar o Guzzle diretamente

Dependa das interfaces PSR nos serviços comuns da aplicação. Use
`GuzzleHttp\Client` diretamente em código de infraestrutura que precise de
recursos exclusivos do Guzzle, como requisições assíncronas, handler stacks
ou middleware.
