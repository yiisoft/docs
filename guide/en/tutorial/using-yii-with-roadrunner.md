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

rpc:
  listen: tcp://127.0.0.1:6001

http:
  address: :8080
  pool:
    num_workers: 4
    max_jobs: 64
  middleware: ["static", "headers"]
  static:
    dir:   "public"
    forbid: [".php", ".htaccess"]
  headers:
    response:
      "Cache-Control": "no-cache"

reload:
  interval: 1s
  patterns: [ ".php" ]
  services:
    http:
      recursive: true
      dirs: [ "." ]

logs:
  mode: production
  level: warn
```

We're specifying that entry script is `worker.php`, there should be three workers on port 8080, `public` directory
files are static ones except `.php` and `.htaccess`. Also, we're sending an additional header.

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
./rr serve -d
```

## On worker scope

- Each worker's scope is isolated from other workers. Memory isn't shared.
- A single worker serves multiple requests where the scope is shared.
- At each iteration of the event loop, every service that depends on state should be reset.
