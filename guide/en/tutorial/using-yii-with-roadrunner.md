# Using Yii with RoadRunner

[RoadRunner](https://roadrunner.dev/) is a Golang-powered application server that intergrates well with PHP. It runs
it as workers and each worker may handle multiple requests. Such operation mode is often called
[event loop](using-with-event-loop.md) and allows not to re-initialize framework for each request that improves
performance significantly.

## Installation

First, you need to install RoadRunner. Best way is to use Composer:

```
composer require spiral/roadrunner
```

After installation is done, run

```
./vendor/bin/rr get
```

That would download ready to use RoadRunner server `rr` binary.

## Configuration

First, we need to configre server itself. Create `./rr.yml` and add the following config:

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

Since we're going to work with PSR-7 request and response, we need an emitter that would send responses.
Create `/src/Emitter/RoadrunnerEmitter.php`:

```php
<?php
namespace App\Emitter;

use Psr\Http\Message\ResponseInterface;
use Spiral\RoadRunner\PSR7Client;
use Yiisoft\Yii\Web\Emitter\EmitterInterface;

class RoadrunnerEmitter implements EmitterInterface
{
    private PSR7Client $roadRunnerClient;

    public function __construct(PSR7Client $roadRunnerClient)
    {
        $this->roadRunnerClient = $roadRunnerClient;
    }

    public function emit(ResponseInterface $response, bool $withoutBody = false): bool
    {
        $this->roadRunnerClient->respond($response);
        return true;
    }
}
```

Now, the last part. Entry script. Create `/psr-worker.php`:

```php
<?php
/**
 * @var Goridge\RelayInterface $relay
 */
use Spiral\Goridge;
use Spiral\RoadRunner;
use Yiisoft\Di\Container;
use Yiisoft\Yii\Web\Application;
use hiqdev\composer\config\Builder;

ini_set('display_errors', 'stderr');
require 'vendor/autoload.php';

$worker = new RoadRunner\Worker(new Goridge\StreamRelay(STDIN, STDOUT));
$psr7 = new RoadRunner\PSR7Client($worker);

// Don't do it in production, assembling takes it's time
Builder::rebuild();

$container = new Container(require Builder::path('web'));

require dirname(__DIR__) . '/src/globals.php';

$container->set(Spiral\RoadRunner\PSR7Client::class, $psr7);
$container->set(\Yiisoft\Yii\Web\Emitter\EmitterInterface::class, \App\Emitter\RoadrunnerEmitter::class);

while ($request = $psr7->acceptRequest()) {
    try {
        $container->get(Application::class)->handle($request);
    } catch (\Throwable $e) {
        $psr7->getWorker()->error((string)$e);
    }
    gc_collect_cycles();
}
```

We're creating a worker, intializing DI container and then starting to process requests in an event loop. 

## Starting a server

In order to start a server execute the following command:

```
./rr serve -d
```

## On worker scope

- Each worker scope is isolated from other workers. Memory is not shared.
- A single worker serves multiple requests where scope is shared.
- At each iteration of event loop every service that depends on state should be reset.
