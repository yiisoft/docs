# Handling webhooks

Webhooks are incoming HTTP requests from a third-party system. Treat them differently from browser form submissions:
they usually can't send your CSRF token, they often retry failed deliveries, and their signature must be checked against
the exact raw request body.

This recipe shows a route and an action that:

- accepts only `POST` requests;
- reads the raw request body for signature verification;
- checks a timestamp to limit replay attacks;
- ignores duplicate deliveries by delivery ID;
- returns status codes that work well with webhook retries.

## Route

Add a dedicated route in `config/common/routes.php`:

```php
use App\Web\Webhook\IncomingWebhookAction;
use Yiisoft\Router\Route;

return [
    // ...
    Route::post('/webhooks/example')
        ->action(IncomingWebhookAction::class)
        ->name('webhook/example'),
];
```

If your application enables CSRF middleware globally, exclude webhook routes from that middleware or move CSRF protection
to the route groups that serve browser forms. See [Disabling CSRF protection](disabling-csrf-protection.md) for details.
Do not leave a webhook endpoint unauthenticated because CSRF is disabled. Use the provider's signature mechanism.

## Action

Create `src/Web/Webhook/IncomingWebhookAction.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Webhook;

use JsonException;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Http\Status;

final readonly class IncomingWebhookAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private ProcessedWebhookRepository $processedWebhooks,
        private WebhookProcessor $processor,
        private string $webhookSecret,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $payload = (string) $request->getBody();
        $signature = $request->getHeaderLine('X-Webhook-Signature');
        $timestamp = $request->getHeaderLine('X-Webhook-Timestamp');
        $deliveryId = $request->getHeaderLine('X-Webhook-Delivery');

        if ($deliveryId === '' || $timestamp === '' || !$this->isFreshTimestamp($timestamp)) {
            return $this->responseFactory->createResponse(Status::BAD_REQUEST);
        }

        if (!$this->isValidSignature($payload, $timestamp, $signature)) {
            return $this->responseFactory->createResponse(Status::UNAUTHORIZED);
        }

        if ($this->processedWebhooks->wasProcessed($deliveryId)) {
            return $this->responseFactory->createResponse(Status::NO_CONTENT);
        }

        try {
            $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->responseFactory->createResponse(Status::BAD_REQUEST);
        }

        if (!is_array($event)) {
            return $this->responseFactory->createResponse(Status::BAD_REQUEST);
        }

        $this->processor->process($deliveryId, $event);
        $this->processedWebhooks->markProcessed($deliveryId);

        return $this->responseFactory->createResponse(Status::ACCEPTED);
    }

    private function isFreshTimestamp(string $timestamp): bool
    {
        return ctype_digit($timestamp) && abs(time() - (int) $timestamp) <= 300;
    }

    private function isValidSignature(string $payload, string $timestamp, string $signature): bool
    {
        if (!str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $timestamp . '.' . $payload, $this->webhookSecret);

        return hash_equals($expected, $signature);
    }
}
```

This example signs `timestamp.payload`. Adjust the header names and signature base string to match the provider's
documentation. For example, GitHub, Stripe, Slack, and payment providers all use slightly different header names and
signature formats.

The repository and processor are application services:

```php
<?php

declare(strict_types=1);

namespace App\Web\Webhook;

interface ProcessedWebhookRepository
{
    public function wasProcessed(string $deliveryId): bool;
    public function markProcessed(string $deliveryId): void;
}
```

```php
<?php

declare(strict_types=1);

namespace App\Web\Webhook;

interface WebhookProcessor
{
    /**
     * @param array<array-key, mixed> $event
     */
    public function process(string $deliveryId, array $event): void;
}
```

Use a database table with a unique index on the delivery ID for `ProcessedWebhookRepository`. The unique index is
important because webhook providers may retry quickly or send the same delivery more than once.

Configure the secret in DI, for example in `config/common/di/webhook.php`:

```php
<?php

declare(strict_types=1);

use App\Web\Webhook\IncomingWebhookAction;

return [
    IncomingWebhookAction::class => [
        '__construct()' => [
            'webhookSecret' => $_ENV['WEBHOOK_SECRET'],
        ],
    ],
];
```

Bind `ProcessedWebhookRepository` and `WebhookProcessor` to your concrete application services in the same config file.

## Response codes

Return a `2xx` response only after the delivery is accepted or confirmed as a duplicate. Return `400` for malformed
payloads, missing delivery headers, or stale timestamps. Return `401` for invalid signatures.

Let unexpected infrastructure failures become `5xx` responses so the provider retries later. If processing is slow,
store the delivery in a queue and return `202 Accepted` after it is persisted.

## Operational checklist

- Use HTTPS.
- Keep the endpoint route narrow and accept only the required HTTP method.
- Verify the signature against the raw body before parsing or normalizing JSON.
- Check the provider's timestamp or nonce header when it is available.
- Make processing idempotent with a stored delivery ID.
- Log rejected deliveries without logging secrets or full payment/customer payloads.
