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

First, we need to configure the server itself. Create `./rr.yml` and add the following config:

```yaml
http:
  address: ":8080"
  workers:
    command: "php psr-worker.php"
    pool:
      numWorkers: 3
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
/**
 * @var Goridge\RelayInterface $relay
 */
use Spiral\Goridge;
use Spiral\RoadRunner;
use Yiisoft\Di\Container;
use Yiisoft\Yii\Web\Application;
use Yiisoft\Composer\Config\Builder;

ini_set('display_errors', 'stderr');
require 'vendor/autoload.php';

$worker = new RoadRunner\Worker(new Goridge\StreamRelay(STDIN, STDOUT));
$psr7 = new RoadRunner\PSR7Client($worker);

// Don't do it in production, assembling takes it's time
Builder::rebuild();

$container = new Container(require Builder::path('web'));

require dirname(__DIR__) . '/src/globals.php';

$container->set(Spiral\RoadRunner\PSR7Client::class, $psr7);
$application = $container->get(Application::class);
$application->start();

while ($request = $psr7->acceptRequest()) {
    $response = $application->handle($request);
    $psr7->respond($response);
    $application->afterEmit($response);
    gc_collect_cycles();
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
