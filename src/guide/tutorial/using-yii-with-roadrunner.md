# Using Yii with RoadRunner

[RoadRunner](https://roadrunner.dev/) is a Golang-powered application server that integrates well with PHP. It runs
it as workers and each worker may handle multiple requests. Such an operation mode is often called
[event loop](using-with-event-loop.md) and allows not re-initializing a framework for each request that improves
performance significantly.

## Installation

RoadRunner works on Linux, macOS and Windows. The best way to install it is to use a Composer:

```
composer require yiisoft/yii-runner-roadrunner
```

After installation is done, run

```
./vendor/bin/rr get
```

That would download ready to use RoadRunner server `rr` binary.

## Configuration

First, we need to configure the server itself. Create `/.rr.yaml` and add the following config:

```yaml
server:
  command: "php worker.php"
  env:
    YII_ENV: prod
    YII_DEBUG: false

rpc:
  listen: tcp://127.0.0.1:6001

http:
  address: :8080
  pool:
    debug: false # set to true for local development only
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
> Read more about TLS, HTTP/2, HTTP/3 configuration and other middleware [on the RoadRunner docs](https://docs.roadrunner.dev/docs/http/http).

We're specifying that the entry script is `worker.php`, the server listens on port 8080, `public` directory
files are served statically except `.php` and `.htaccess`. The `max_worker_memory` is a soft limit: if a worker
exceeds 192 MB, it will restart after finishing its current request. Also, we're sending an additional header.

## KV cache

RoadRunner has a [KV plugin](https://docs.roadrunner.dev/docs/key-value/overview-kv) that can be used as a PSR-16
cache storage. It is useful when the application already runs under RoadRunner and needs a cache shared by workers.

Install the PHP bridge and Yii cache package:

```
composer require spiral/roadrunner-kv yiisoft/cache
```

Add a KV storage to `.rr.yaml`:

```yaml
kv:
  cache:
    driver: memory
    config:
      interval: 60
```

The `memory` driver stores values inside the RoadRunner process, so its data is lost when RoadRunner stops.
For persistent cache storage, use another KV driver from the RoadRunner documentation.

Create `config/common/di/roadrunner-kv.php`:

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

Now services can use `Yiisoft\Cache\CacheInterface` the same way as with other cache backends:

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

Create `/worker.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Yii\Runner\RoadRunner\RoadRunnerApplicationRunner;

ini_set('display_errors', 'stderr');

require_once __DIR__ . '/preload.php';

(new RoadRunnerApplicationRunner(__DIR__, $_ENV['YII_DEBUG'], $_ENV['YII_ENV']))->run();
```

## Starting a server

To start a server, execute the following command:

```
./rr serve
```

## On worker scope

- Each worker's scope is isolated from other workers. Memory isn't shared.
- A single worker serves multiple requests where the scope is shared.
- At each iteration of the event loop, every service that depends on state should be reset.
