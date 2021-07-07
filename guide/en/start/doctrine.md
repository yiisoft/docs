# Doctrine

## Add packages to composer.json

- "doctrine/orm": "*",
- "doctrine/migrations": "*",
- "doctrine/annotations": "*",


## How to work with doctrine

### Create cli config doctrine /config/cli-config.php

```
<?php

use Doctrine\ORM\Configuration;
use Doctrine\ORM\Tools\Console\ConsoleRunner;

require_once dirname(__dir__) . '/vendor/autoload.php';

$settings = require_once __dir__ . '/doctrine.php';

$config = \Doctrine\ORM\Tools\Setup::createAnnotationMetadataConfiguration(
    $settings['meta']['entity_path'],
    $settings['meta']['auto_generate_proxies'],
    $settings['meta']['proxy_dir'],
    $settings['meta']['cache'],
    false
);

$em = \Doctrine\ORM\EntityManager::create($settings['connection'], $config);

return ConsoleRunner::createHelperSet($em);
```

### Create params config doctrine /config/doctrine.php

```
<?php

return [
    'meta' => [
        'entity_path' => [
            dirname(__dir__) . '/App/Entity'
        ],
        'auto_generate_proxies' => true,
        'proxy_dir' =>  dirname(__DIR__) . '/public/runtime/cache',
        'cache' => null,
    ],
    'connection' => [
        'driver'   => 'pdo_mysql',
        'host'     => 'localhost',
        'dbname'   => 'appuser',
        'user'     => 'root',
        'password' => '1234',
    ],

];
```

### Create DI-Container config doctrine /config/web.php

```
use Doctrine\ORM\EntityManagerInterface;

// Doctrine
EntityManagerInterface::class => function (ContainerInterface $container) {
    $settings = require __dir__ . '/doctrine.php';
    $config = \Doctrine\ORM\Tools\Setup::createAnnotationMetadataConfiguration(
        $settings['meta']['entity_path'],
        $settings['meta']['auto_generate_proxies'],
        $settings['meta']['proxy_dir'],
        $settings['meta']['cache'],
        false
    );
    return \Doctrine\ORM\EntityManager::create($settings['connection'], $config);
},
```

### Run cli-doctrine

```
vendor/bin/doctrine
```

After making the described settings, you will have connection to the database, it only remains to create the entities, repositories and services.