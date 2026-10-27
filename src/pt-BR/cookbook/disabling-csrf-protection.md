# Desativando a proteção CSRF

## O que é a proteção CSRF?

A proteção contra Cross-Site Request Forgery (CSRF) é um mecanismo de
segurança que impede sites maliciosos de fazer requisições não autorizadas
em nome de usuários autenticados. O Yii3 inclui proteção CSRF nativa por
meio do middleware `Yiisoft\Yii\Web\Middleware\CsrfTokenMiddleware`.

Para entender a fundo os ataques CSRF e os mecanismos de proteção, veja a
seção [Boas práticas de
segurança](../guide/security/best-practices.md#evitando-csrf) do guia
principal.

## Quando desativar a proteção CSRF

Embora a proteção CSRF deva, em geral, continuar ativada em aplicações web,
há cenários específicos em que você pode precisar desativá-la:

### Quando sistemas externos não conseguem fornecer tokens CSRF

Ao construir APIs ou tratar requisições automatizadas de sistemas externos,
a proteção CSRF pode atrapalhar requisições legítimas, já que esses sistemas
não conseguem fornecer tokens CSRF válidos:

- **Integrações de terceiros**: serviços externos não conseguem fornecer
  tokens CSRF válidos
- **Aplicativos móveis**: apps móveis nativos normalmente não usam cookies
  ou sessões da mesma forma que os navegadores
- **Comunicação entre servidores**: endpoints de API projetados para
  comunicação máquina a máquina
- **Processadores de pagamento**: PayPal, Stripe e outros sistemas de
  pagamento enviam notificações por webhook
- **Sistemas de controle de versão**: webhooks do GitHub e do GitLab para
  pipelines de CI/CD
- **Redes sociais**: notificações por webhook do Twitter e do Facebook
- **Serviços de comunicação**: integrações com bots do Slack e do Discord

## Como desativar a proteção CSRF

Primeiro, remova o middleware de CSRF da lista principal de middlewares da
aplicação em `config/web/di/application.php`:

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
                        CsrfTokenMiddleware::class, // <- Remova esta linha                        
```

Agora, se você precisar manter o CSRF ativo para rotas ou grupos de rotas
específicos, adicione o middleware `CsrfTokenMiddleware` na configuração do
router em `config/common/routes.php`. Para um grupo, fica assim:

```php
return [
    Group::create()
        ->middleware(CsrfTokenMiddleware::class)
        ->routes(
```

Para uma única rota, você pode adicionar o middleware diretamente nela:

```php
Route::methods([Method::GET, Method::POST], '/say[/{test}]')
    ->action(\App\Controller\Echo\Action::class)
    ->name('echo/say')
    ->middleware(CsrfTokenMiddleware::class)
```


## Considerações de segurança

Ao desativar a proteção CSRF, tenha em mente estas considerações de
segurança:

### Métodos alternativos de autenticação

Para endpoints de API, implemente mecanismos de autenticação adequados:

- **Chaves de API**: exija chaves de API para autenticação
- **Bearer tokens**: use JWT ou autenticação similar baseada em token
- **OAuth 2.0**: implemente OAuth 2.0 para acesso de terceiros
- **Lista de IPs permitidos**: restrinja o acesso de webhooks a endereços IP
  conhecidos

### Validação da requisição

Implemente validação adicional para requisições sem proteção CSRF:

- **Verificação de assinatura**: verifique assinaturas de webhooks (por
  exemplo, o X-Hub-Signature do GitHub)
- **Validação de timestamp**: confira o timestamp das requisições para
  evitar ataques de replay
- **Rate limiting**: implemente limite de requisições para evitar abuso
- **Validação de entrada**: valide rigorosamente todos os parâmetros de
  entrada

### Exemplo: verificação de assinatura de webhook

```php
<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class WebhookController
{
    public function payment(ServerRequestInterface $request): ResponseInterface
    {
        // Verifica a assinatura do webhook
        $signature = $request->getHeaderLine('X-Webhook-Signature');
        $payload = (string) $request->getBody();
        $expectedSignature = hash_hmac('sha256', $payload, $this->webhookSecret);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new \RuntimeException('Invalid webhook signature');
        }
        
        // Processa o payload do webhook
        // ...
    }
}
```

## Boas práticas

1. **Minimize a exposição**: desative a proteção CSRF apenas onde for
   realmente necessário
2. **Use HTTPS**: sempre use HTTPS para endpoints de API e webhooks
3. **Monitore os logs**: registre em log todas as requisições aos endpoints
   de API para monitoramento de segurança
4. **Auditorias de segurança regulares**: revise periodicamente seus
   endpoints de API e as medidas de segurança deles
5. **Documentação**: documente claramente quais endpoints têm a proteção
   CSRF desativada e por quê

## Conclusão

Embora a proteção CSRF seja essencial para aplicações web, há cenários
legítimos em que ela precisa ser desativada, principalmente para APIs
externas e webhooks. Ao desativá-la, sempre implemente medidas de segurança
alternativas e siga as boas práticas de segurança para manter a segurança
geral da sua aplicação.

Lembre-se de que desativar a proteção CSRF aumenta os riscos de segurança,
então é essencial avaliar com cuidado e implementar corretamente as medidas
de segurança alternativas.
