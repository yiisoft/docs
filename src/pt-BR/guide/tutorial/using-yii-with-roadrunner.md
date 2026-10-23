# Usando o Yii com RoadRunner

O [RoadRunner](https://roadrunner.dev/) é um servidor de aplicação escrito em Go que se integra bem ao PHP. Ele roda
o PHP como workers, e cada worker pode atender várias requisições. Esse modo de operação costuma ser chamado de
[event loop](using-with-event-loop.md) e evita reinicializar o framework a cada requisição, o que melhora
bastante o desempenho.

## Instalação

O RoadRunner funciona no Linux, macOS e Windows. A melhor forma de
instalá-lo é pelo Composer:

```
composer require yiisoft/yii-runner-roadrunner
```

Terminada a instalação, execute

```
./vendor/bin/rr get
```

Isso baixa o binário `rr` do servidor RoadRunner, pronto para uso.

## Configuração

Primeiro, precisamos configurar o próprio servidor. Crie `/.rr.yaml` e
adicione a seguinte configuração:

```yaml
version: '3'

server:
  command: "php worker.php"

rpc:
  listen: tcp://127.0.0.1:6001

http:
  address: :8080
  pool:
    debug: false # defina como true apenas no desenvolvimento local
    supervisor:
      max_worker_memory: 192
  middleware: [static, gzip, headers, sendfile]
  static:
    dir:   "public"
    forbid: [".php", ".htaccess"]
  headers:
    response:
      "Cache-Control": "no-cache"

logs:
  mode: production
  level: warn
```

> [!INFO]
> Saiba mais sobre configuração de TLS, HTTP/2, HTTP/3 e outros middlewares [na documentação do RoadRunner](https://docs.roadrunner.dev/docs/http/http).

Estamos definindo que o script de entrada é o `worker.php`, que o servidor
escuta na porta 8080 e que os arquivos do diretório `public` são servidos
estaticamente, exceto `.php` e `.htaccess`. O `max_worker_memory` é um
limite flexível: se um worker passar de 192 MB, ele reinicia depois de
terminar a requisição atual. Também estamos enviando um header adicional.

## Cache KV

O RoadRunner tem um [plugin
KV](https://docs.roadrunner.dev/docs/key-value/overview-kv) que pode ser
usado como armazenamento de cache PSR-16. Ele é útil quando a aplicação já
roda no RoadRunner e precisa de um cache compartilhado entre os workers.

Instale a ponte PHP e o pacote de cache do Yii:

```
composer require spiral/roadrunner-kv yiisoft/cache
```

Adicione um armazenamento KV ao `.rr.yaml`:

```yaml
kv:
  cache:
    driver: memory
    config:
      interval: 60
```

O driver `memory` guarda os valores dentro do processo do RoadRunner, então
os dados se perdem quando o RoadRunner para.  Para um armazenamento de cache
persistente, use outro driver KV da documentação do RoadRunner.

Crie `config/common/di/roadrunner-kv.php`:

```php
<?php

declare(strict_types=1);

use Psr\SimpleCache\CacheInterface as SimpleCacheInterface;
use Spiral\Goridge\RPC\RPC;
use Spiral\RoadRunner\KeyValue\Factory;
use Spiral\RoadRunner\KeyValue\StorageInterface;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;

return [
    StorageInterface::class => static function (): StorageInterface {
        $factory = new Factory(RPC::create('tcp://127.0.0.1:6001'));

        return $factory->select('cache');
    },

    SimpleCacheInterface::class => StorageInterface::class,
    YiiCacheInterface::class => Cache::class,
];
```

Agora os serviços podem usar `Yiisoft\Cache\CacheInterface` do mesmo jeito
que com outros backends de cache:

```php
use Yiisoft\Cache\CacheInterface;

final readonly class FeedService
{
    public function __construct(
        private CacheInterface $cache,
    ) {
    }

    public function latest(): array
    {
        return $this->cache->getOrSet('feed-latest', fn (): array => $this->loadLatest(), 60);
    }

    private function loadLatest(): array
    {
        return [];
    }
}
```

Crie `/worker.php`:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Yiisoft\Yii\Runner\RoadRunner\RoadRunnerHttpApplicationRunner;

ini_set('display_errors', 'stderr');

require_once __DIR__ . '/src/bootstrap.php';

(new RoadRunnerHttpApplicationRunner(
    rootPath: __DIR__, 
    debug: Environment::appDebug(),
    checkEvents: Environment::appDebug(),
    environment: Environment::appEnv()
))->run();
```

## Iniciando o servidor

Para iniciar o servidor, execute o seguinte comando:

```
./rr serve
```

## Sobre o escopo do worker

- O escopo de cada worker é isolado dos outros workers. A memória não é
  compartilhada.
- Um único worker atende várias requisições, e nelas o escopo é
  compartilhado.
- A cada iteração do event loop, todo serviço que depende de estado deve ser
  redefinido.
