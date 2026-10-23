# Configurando uma aplicação para autoscaling

O autoscaling funciona quando qualquer instância da aplicação consegue
atender qualquer requisição e pode ser adicionada ou removida sem estado
local especial. Em aplicações Yii, isso significa principalmente manter o
estado de runtime fora do container ou da VM, deixar os health checks
baratos e rodar migrations e workers separados das réplicas web.

## Mantenha as instâncias web sem estado

Não guarde estado visível ao usuário no sistema de arquivos local de uma
instância web. Arquivos locais somem quando uma instância é substituída e
não ficam visíveis para as outras réplicas.

Mova estes recursos para serviços compartilhados:

- Sessões: use um handler de sessão compartilhado quando os usuários puderem
  alternar entre réplicas. Veja [Sessões](../../guide/runtime/sessions.md) e
  prefira fechar as sessões cedo.
- Cache: use Redis, Memcached, banco de dados ou outro backend de cache
  PSR-16 compartilhado para dados que precisam ser consistentes entre as
  réplicas. Veja [Cache de dados](../../guide/caching/data.md).
- Uploads: guarde arquivos em object storage, em um volume compartilhado ou
  em um serviço dedicado ao armazenamento de arquivos. Os diretórios locais
  `runtime` ou `public/uploads` só são seguros para arquivos temporários.
- Assets gerados: inclua-os na imagem ou publique-os em um armazenamento
  compartilhado/CDN durante o deploy.
- Logs: escreva em stdout/stderr ou em um destino de log central. Não
  dependa de arquivos dentro de uma instância de vida curta.

Sticky sessions podem aliviar a pressão imediata, mas não substituem o
estado compartilhado. Uma instância substituta ou o rollout de um deploy
ainda quebram o armazenamento local de sessões e de uploads.

## Adicione endpoints de saúde

Use um endpoint de liveness barato para o load balancer ou o orquestrador:

```php
<?php

declare(strict_types=1);

namespace App\Web\Health;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Http\Status;

final readonly class HealthCheckAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->responseFactory->createResponse(Status::NO_CONTENT);
    }
}
```

Registre-o em `config/common/routes.php`:

```php
use App\Web\Health\HealthCheckAction;
use Yiisoft\Router\Route;

return [
    // ...
    Route::get('/healthz')
        ->action(HealthCheckAction::class)
        ->name('healthz'),
];
```

Mantenha esse endpoint independente do banco de dados e de APIs
externas. Ele deve responder se o processo PHP consegue aceitar requisições,
não se todas as dependências estão saudáveis.

Se a sua plataforma suporta readiness checks, adicione um endpoint separado,
como `/readyz`, para as dependências que precisam estar disponíveis antes de
direcionar tráfego para uma nova instância. Limite-o com timeouts curtos. Um
readiness check lento pode piorar um pico de tráfego.

## Configure os caminhos de runtime

O diretório `runtime` deve conter apenas arquivos descartáveis e locais ao
processo: logs antes de serem enviados, arquivos de cache que podem ser
recriados, partes temporárias de upload, locks restritos a uma instância e
artefatos de debug.

Para deploys com autoscaling:

- monte `runtime` como um volume gravável local à instância ou crie-o na
  inicialização da imagem;
- não guarde arquivos enviados permanentes em `runtime`;
- não use locks de arquivo locais para jobs que precisam ser únicos entre
  todas as réplicas;
- limpe ou ignore o cache local de runtime durante os rollouts.

Quando um comando ou worker precisa ser único globalmente, use um lock no
banco de dados, um lock no Redis, a semântica da fila, ou rode-o como um
único job agendado fora do grupo de autoscaling web.

## Rode as migrations uma única vez

Não rode `./yii migrate` em cada instância web durante a
inicialização. Várias réplicas subindo ao mesmo tempo podem disputar locks,
deixar o boot lento ou aplicar parcialmente um schema incompatível.

Rode as migrations a partir de um único job de deploy ou de um container de
console dedicado, antes ou durante o rollout:

```shell
APP_ENV=prod php ./yii migrate --no-interaction
```

Para deploys sem downtime, use um fluxo de migrations do tipo
expand-and-contract. Veja [Aplicando migrations durante rolling
updates](rolling-update-migrations.md).

## Separe web, workers e jobs agendados

Escale as réplicas web conforme o tráfego de requisições. Escale os workers
de fila conforme o tamanho da fila ou a latência de processamento. Rode os
jobs agendados a partir de um único agendador, não de cada réplica web.

Use a mesma imagem da aplicação quando for prático, mas com pontos de
entrada diferentes:

```shell
php ./yii queue:listen
php ./yii app:send-digests --no-interaction
```

Torne workers e comandos agendados idempotentes. Um deploy pode parar um
worker depois que ele começou a processar uma mensagem, e a fila pode
entregá-la de novo.

## Use configuração específica por ambiente

Mantenha segredos e valores de cada ambiente fora da imagem:

- DSN, usuário e senha do banco de dados;
- endereços dos backends de cache/sessão;
- chaves de validação de cookies e chaves de criptografia;
- credenciais de e-mail, fila e object storage;
- URL base pública e configurações de proxies confiáveis.

Carregue-os por variáveis de ambiente ou por arquivos de configuração do Yii
específicos de cada ambiente. Todas as réplicas da mesma release devem
receber os mesmos valores de configuração, exceto os metadados de instância
fornecidos pela plataforma.

## Checklist de capacidade

Antes de habilitar o autoscaling, verifique que:

- uma requisição é atendida corretamente depois que a requisição anterior
  foi para outra réplica;
- login e mensagens flash funcionam sem sticky sessions;
- arquivos enviados continuam disponíveis depois que a instância que os
  recebeu é removida;
- cache misses em uma instância não corrompem nem escondem dados em outra
  instância;
- as migrations são executadas por exatamente uma etapa do deploy;
- workers em segundo plano e comandos agendados não são multiplicados por
  acidente;
- os health checks são rápidos e não sobrecarregam o banco de dados;
- logs e métricas identificam a versão da aplicação e a instância;
- o desligamento é gracioso o bastante para os timeouts do seu servidor web
  e dos workers de fila.
