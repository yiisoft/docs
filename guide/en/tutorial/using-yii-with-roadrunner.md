# Using Yii with RoadRunner

[RoadRunner](https://roadrunner.dev/) is a Golang-powered application server that integrates well with PHP. It runs
it as workers and each worker may handle multiple requests. Such operation mode is often called
[event loop](using-with-event-loop.md) and allows not to re-initialize framework for each request that improves
performance significantly.

## Installation

RoadRunner works on Linux, MacOS and Windows. The best way to install it is to use Composer:

```
composer require spiral/roadrunner
```

After installation is done, run

```
./vendor/bin/rr get
```

That would download ready to use RoadRunner server `rr` binary.

## Configuration

First, we need to configure the server itself. Create `./.rr.yaml` and add the following config:

```yaml
server:
  command: "php psr-worker.php"

http:
  address: ":8080"
  pool:
    num_workers: 3

  middleware: ["static", "headers"]

  static:
    dir:   "public"
    forbid: [".php", ".htaccess"]

  headers:
    response:
      "Cache-Control": "no-cache"
```

We're specifying that entry script is `psr-worker.php`, there should be three workers on port 8080, `public` directory
files are static ones except `.php` and `.htaccess`. Also, we're sending additional header.

Create `/psr-worker.php`:

```php
<?php

declare(strict_types=1);

use Spiral\RoadRunner;
use Yiisoft\Di\Container;
use Yiisoft\Yii\Web\Application;
use Yiisoft\Config\Config;

ini_set('display_errors', 'stderr');

define('YII_ENV', getenv('env') ?: 'production');
require_once dirname(__DIR__) . '/vendor/autoload.php';

$worker = RoadRunner\Worker::create();
$serverRequestFactory = new HttpSoft\Message\ServerRequestFactory();
$streamFactory = new HttpSoft\Message\StreamFactory();
$uploadsFactory = new HttpSoft\Message\UploadedFileFactory();

$worker = new RoadRunner\Http\PSR7Worker($worker, $serverRequestFactory, $streamFactory, $uploadsFactory);

$config = new Config(
    dirname(__DIR__),
    '/config/packages',
    null,
    [
        'params',
        'events',
        'events-web',
        'events-console',
    ]
);

$container = new Container(
    $config->get('web'),
    $config->get('providers-web')
);

$bootstrapList = $config->get('bootstrap-web');
foreach ($bootstrapList as $callback) {
    if (!(is_callable($callback))) {
        $type = is_object($callback) ? get_class($callback) : gettype($callback);

        throw new \RuntimeException("Bootstrap callback must be callable, $type given.");
    }
    $callback($container);
}

$resetter = $container->get(\Yiisoft\Di\StateResetter::class);
$application = $container->get(Application::class);
$application->start();

while ($request = $worker->waitRequest()) {
    $response = null;
    try {
        $response = $application->handle($request);
        $worker->respond($response);
    } catch (\Throwable $t) {
        // TODO: render it properly
        $worker->getWorker()->error((string)$t);            
    } finally {
        $application->afterEmit($response ?? null);
        $resetter->reset(); // We should reset the state of such services every request.
        gc_collect_cycles();
    }
}

$application->shutdown();
```

We're creating a worker, initializing DI container and then starting to process requests in an event loop. 

## Starting a server

To start a server execute the following command:

```
./rr serve -d
```

## On worker scope

- Each worker scope is isolated from other workers. Memory is not shared.
- A single worker serves multiple requests where scope is shared.
- At each iteration of event loop every service that depends on state should be reset.
