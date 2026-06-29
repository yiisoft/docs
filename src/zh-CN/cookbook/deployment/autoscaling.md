# Configuring an application for autoscaling

Autoscaling works when any application instance can handle any request and
can be added or removed without special local state. In Yii applications
this mostly means keeping runtime state outside the container or VM, making
health checks cheap, and running migrations and workers separately from web
replicas.

## Keep web instances stateless

Do not store user-visible state on the local filesystem of a web
instance. Local files disappear when an instance is replaced and are not
visible to other replicas.

Move these resources to shared services:

- Sessions: use a shared session handler when users can move between
  replicas. See [Sessions](../../guide/runtime/sessions.md) and prefer
  closing sessions early.
- Cache: use Redis, Memcached, database, or another shared PSR-16 cache
  backend for data that must be consistent across replicas. See [Data
  caching](../../guide/caching/data.md).
- Uploads: store files in object storage, a shared volume, or a service
  dedicated to file storage. Local `runtime` or `public/uploads` directories
  are safe only for temporary files.
- Generated assets: build them into the image or publish them to shared
  storage/CDN during deployment.
- Logs: write to stdout/stderr or a central log target. Do not depend on
  files inside a short-lived instance.

Sticky sessions can reduce immediate pressure, but they are not a substitute
for shared state. A replacement instance or deployment rollout still breaks
local session and upload storage.

## Add health endpoints

Use a cheap liveness endpoint for the load balancer or orchestrator:

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

Register it in `config/common/routes.php`:

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

Keep this endpoint independent from the database and external APIs. It
should answer whether the PHP process can accept requests, not whether every
dependency is healthy.

If your platform supports readiness checks, add a separate endpoint such as
`/readyz` for dependencies that must be available before routing traffic to
a new instance. Keep it bounded with short timeouts. A slow readiness check
can make a traffic spike worse.

## Configure runtime paths

The `runtime` directory should contain disposable process-local files only:
logs before shipping, cache files that can be rebuilt, temporary upload
chunks, locks scoped to one instance, and debug artifacts.

For autoscaled deployments:

- mount `runtime` as an instance-local writable volume or create it during
  image startup;
- do not store permanent uploaded files in `runtime`;
- do not use local file locks for jobs that must be unique across all
  replicas;
- clear or ignore local runtime cache during rollouts.

When a command or worker must be unique globally, use a database lock, Redis
lock, queue semantics, or run it as a single scheduled job outside the web
autoscaling group.

## Run migrations once

Do not run `./yii migrate` from every web instance during startup. Multiple
replicas starting at the same time can compete for locks, slow down boot, or
partially deploy incompatible schema.

Run migrations from one deployment job or a dedicated console container
before or during rollout:

```shell
APP_ENV=prod php ./yii migrate --no-interaction
```

For zero-downtime deployments, use an expand-and-contract migration
flow. See [Applying migrations during rolling
updates](rolling-update-migrations.md).

## Separate web, workers, and scheduled jobs

Scale web replicas for request traffic. Scale queue workers for queue depth
or processing latency. Run scheduled jobs from one scheduler, not from every
web replica.

Use the same application image when practical, but different entry points:

```shell
php ./yii queue:listen
php ./yii app:send-digests --no-interaction
```

Make workers and scheduled commands idempotent. A deployment may stop a
worker after it started processing a message, and the queue may deliver it
again.

## Use environment-specific configuration

Keep secrets and per-environment values out of the image:

- database DSN, username, and password;
- cache/session backend addresses;
- cookie validation keys and encryption keys;
- mail, queue, and object-storage credentials;
- public base URL and trusted proxy settings.

Load them through environment variables or environment-specific Yii config
files. Every replica of the same release should receive the same
configuration values, except for platform-provided instance metadata.

## Capacity checklist

Before enabling autoscaling, verify that:

- a request can be served correctly after the previous request went to
  another replica;
- login and flash messages work without sticky sessions;
- uploaded files remain available after the handling instance is removed;
- cache misses on one instance do not corrupt or hide data on another
  instance;
- migrations are run by exactly one deployment step;
- background workers and scheduled commands are not multiplied accidentally;
- health checks are fast and do not overload the database;
- logs and metrics identify the application version and instance;
- shutdown is graceful enough for your web server and queue worker timeouts.
