# 禁用 CSRF 保护

## 什么是 CSRF 保护？

跨站请求伪造（CSRF）保护是一种安全机制，可防止恶意网站代表已认证用户发出未经授权的请求。Yii3 通过
`Yiisoft\Yii\Web\Middleware\Csrf` 中间件提供内置的 CSRF 保护。

要全面了解 CSRF
攻击和保护机制，请参阅主指南中的[安全最佳实践](../guide/security/best-practices.md#avoiding-csrf)部分。

## 何时禁用 CSRF 保护

虽然 Web 应用程序通常应保持启用 CSRF 保护，但在某些特定场景下你可能需要禁用它：

### 当外部系统无法提供 CSRF 令牌时

在构建 API 或处理来自外部系统的自动化请求时，CSRF 保护可能会干扰合法请求，因为这些系统无法提供有效的 CSRF 令牌：

- **第三方集成**：外部服务无法提供有效的 CSRF 令牌
- **移动应用程序**：原生移动应用通常不像 Web 浏览器那样使用 cookie 或会话
- **服务器到服务器通信**：为机器对机器通信设计的 API 端点
- **支付处理器**：PayPal、Stripe 和其他支付系统发送 webhook 通知
- **版本控制系统**：用于 CI/CD 流水线的 GitHub、GitLab webhook
- **社交媒体平台**：Twitter、Facebook webhook 通知
- **通信服务**：Slack、Discord 机器人集成

## 如何禁用 CSRF 保护

首先，你需要从 `config/web/di/application.php` 中的主应用程序中间件列表中删除 CSRF 中间件：

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

现在，如果你需要为特定路由或路由组保留 CSRF 保护，可以通过在 `config/common/routes.php` 的路由器配置中添加
`CsrfMiddleware` 中间件来实现。对于路由组，配置如下：

```php
return [
    Group::create()
        ->middleware(CsrfTokenMiddleware::class)
        ->routes(
```

对于单个路由，你可以直接将中间件添加到路由：

```php
Route::methods([Method::GET, Method::POST], '/say[/{test}]')
    ->action(\App\Controller\Echo\Action::class)
    ->name('echo/say')
    ->middleware(CsrfTokenMiddleware::class)
```


## 安全注意事项

禁用 CSRF 保护时，请牢记以下安全注意事项：

### 替代身份验证方法

对于 API 端点，实施适当的身份验证机制：

- **API 密钥**：要求使用 API 密钥进行身份验证
- **Bearer 令牌**：使用 JWT 或类似的基于令牌的身份验证
- **OAuth 2.0**：为第三方访问实施 OAuth 2.0
- **IP 白名单**：将 webhook 的访问限制为已知的 IP 地址

### 请求验证

为没有 CSRF 保护的请求实施额外的验证：

- **签名验证**：验证 webhook 签名（例如，GitHub 的 X-Hub-Signature）
- **时间戳验证**：检查请求时间戳以防止重放攻击
- **速率限制**：实施速率限制以防止滥用
- **输入验证**：严格验证所有输入参数

### 示例：Webhook 签名验证

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

## 最佳实践

1. **最小化暴露**：仅在绝对必要时禁用 CSRF 保护
2. **使用 HTTPS**：始终对 API 端点和 webhook 使用 HTTPS
3. **监控日志**：记录所有对 API 端点的请求以进行安全监控
4. **定期安全审计**：定期审查你的 API 端点及其安全措施
5. **文档记录**：清楚地记录哪些端点禁用了 CSRF 保护以及原因

## 结论

虽然 CSRF 保护对 Web 应用程序至关重要，但在某些合法场景下需要禁用它，特别是对于外部 API 和 webhook。禁用 CSRF
保护时，始终实施替代安全措施并遵循安全最佳实践，以维护应用程序的整体安全性。

请记住，禁用 CSRF 保护会增加安全风险，因此仔细考虑并正确实施替代安全措施至关重要。
