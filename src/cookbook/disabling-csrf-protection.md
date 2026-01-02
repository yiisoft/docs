# Disabling CSRF protection

## What is CSRF protection?

Cross-Site Request Forgery (CSRF) protection is a security mechanism that prevents malicious websites from making 
unauthorized requests on behalf of authenticated users. Yii3 includes built-in CSRF protection through 
the `Yiisoft\Yii\Web\Middleware\Csrf` middleware.

For a comprehensive understanding of CSRF attacks and protection mechanisms, see
the [Security best practices](../guide/security/best-practices.md#avoiding-csrf) section in the main guide.

## When to disable CSRF protection

While CSRF protection should generally remain enabled for web applications, there are specific scenarios where you might 
need to disable it:

### When external systems cannot provide CSRF tokens

When building APIs or handling automated requests from external systems, CSRF protection can interfere with legitimate
requests since these systems cannot provide valid CSRF tokens:

- **Third-party integrations**: External services cannot provide valid CSRF tokens
- **Mobile applications**: Native mobile apps typically don't use cookies or sessions in the same way as web browsers
- **Server-to-server communication**: API endpoints designed for machine-to-machine communication
- **Payment processors**: PayPal, Stripe, and other payment systems send webhook notifications
- **Version control systems**: GitHub, GitLab webhooks for CI/CD pipelines
- **Social media platforms**: Twitter, Facebook webhook notifications
- **Communication services**: Slack, Discord bot integrations

## How to disable CSRF protection

First, you need to remove CSRF middleware from your main application middleware list in `config/web/di/application.php`:

```php
return [
    Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to([
                'class' => MiddlewareDispatcher::class,
                'withMiddlewares()' => [
                    [
                        ErrorCatcher::class,
                        SessionMiddleware::class,
                        CsrfTokenMiddleware::class, // <- Remove this line                        
```

Now, if you need to leave CSRF on for specific routes or route groups, you can do so by adding the `CsrfMiddleware` 
middleware to the router configuration in `config/common/routes.php`. For a group that would be the following:

```php
return [
    Group::create()
        ->middleware(CsrfTokenMiddleware::class)
        ->routes(
```

For a single route, you can add the middleware directly to the route:

```php
Route::methods([Method::GET, Method::POST], '/say[/{test}]')
    ->action(\App\Controller\Echo\Action::class)
    ->name('echo/say')
    ->middleware(CsrfTokenMiddleware::class)
```


## Security considerations

When disabling CSRF protection, keep these security considerations in mind:

### Alternative authentication methods

For API endpoints, implement proper authentication mechanisms:

- **API keys**: Require API keys for authentication
- **Bearer tokens**: Use JWT or similar token-based authentication
- **OAuth 2.0**: Implement OAuth 2.0 for third-party access
- **IP whitelisting**: Restrict access to known IP addresses for webhooks

### Request validation

Implement additional validation for requests without CSRF protection:

- **Signature verification**: Verify webhook signatures (e.g., GitHub's X-Hub-Signature)
- **Timestamp validation**: Check request timestamps to prevent replay attacks
- **Rate limiting**: Implement rate limiting to prevent abuse
- **Input validation**: Strictly validate all input parameters

### Example: Webhook signature verification

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class WebhookController
{
    public function payment(ServerRequestInterface $request): ResponseInterface
    {
        // Verify webhook signature
        $signature = $request->getHeaderLine('X-Webhook-Signature');
        $payload = (string) $request->getBody();
        $expectedSignature = hash_hmac('sha256', $payload, $this->webhookSecret);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new \RuntimeException('Invalid webhook signature');
        }
        
        // Process webhook payload
        // ...
    }
}
```

## Best practices

1. **Minimize exposure**: Only disable CSRF protection where absolutely necessary
2. **Use HTTPS**: Always use HTTPS for API endpoints and webhooks
3. **Monitor logs**: Log all requests to API endpoints for security monitoring
4. **Regular security audits**: Periodically review your API endpoints and their security measures
5. **Documentation**: Clearly document which endpoints have CSRF protection disabled and why

## Conclusion

While CSRF protection is crucial for web applications, there are legitimate scenarios where it needs to be disabled,
particularly for external APIs and webhooks. When disabling CSRF protection, always implement alternative security 
measures and follow security best practices to maintain the overall security of your application.

Remember that disabling CSRF protection increases security risks, so careful consideration and proper implementation
of alternative security measures are essential.
