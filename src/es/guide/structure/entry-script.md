# Scripts de entrada

Los scripts de entrada son el primer paso del proceso de arranque de la
aplicación. Una aplicación (ya sea web o de consola) tiene un único script
de entrada. Los usuarios finales hacen solicitudes a los scripts de entrada,
que crean instancias de la aplicación y les reenvían las solicitudes.

Los scripts de entrada de las aplicaciones web deben guardarse en
directorios accesibles desde la web para que los usuarios finales puedan
acceder a ellos. Suelen llamarse `index.php`, pero pueden tener cualquier
otro nombre, siempre que los servidores web puedan encontrarlos.

El script de entrada de la aplicación de consola es `./yii`.

Los scripts de entrada realizan principalmente las siguientes tareas con la
ayuda de `ApplicationRunner`:

* Registrar el [cargador automático de
  Composer](https://getcomposer.org/doc/01-basic-usage.md#autoloading);
* Obtener la configuración;
* Usar la configuración para inicializar un contenedor de inyección de
  dependencias;
* Obtener una instancia de la solicitud.
* Pasarla a `Application` para que la gestione y obtener de ella una
  respuesta.
* Con la ayuda de un emisor, transformar el objeto de respuesta en una
  respuesta HTTP real que se envía al navegador del cliente.

## Aplicaciones web

El siguiente es el código del script de entrada de la plantilla de
aplicación:

```php
<?php

declare(strict_types=1);

use App\ApplicationRunner;

// Enrutamiento del servidor integrado de PHP.
if (PHP_SAPI === 'cli-server') {
    // Servir los archivos estáticos tal cual.
    if (is_file(__DIR__ . $_SERVER['REQUEST_URI'])) {
        return false;
    }

    // Se establece explícitamente para las URL con punto.
    $_SERVER['SCRIPT_NAME'] = '/index.php';
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

$runner = new ApplicationRunner();
// Modo de desarrollo:
$runner->debug();
// Ejecutar la aplicación:
$runner->run();
```


## Aplicaciones de consola

Del mismo modo, este es el código del script de entrada de una aplicación de
consola:

```php
#!/usr/bin/env php
<?php

declare(strict_types=1);

use Psr\Container\ContainerInterface;
use Yiisoft\Config\Config;
use Yiisoft\Di\Container;
use Yiisoft\Di\ContainerConfig;
use Yiisoft\Yii\Console\Application;
use Yiisoft\Yii\Console\Output\ConsoleBufferedOutput;

define('YII_ENV', getenv('env') ?: 'production');

require_once 'vendor/autoload.php';

$config = new Config(
    __DIR__,
    '/config/packages',
);

$containerConfig = ContainerConfig::create()
    ->withDefinitions($config->get('console'))
    ->withProviders($config->get('providers-console'));
$container = new Container($containerConfig);

/** @var ContainerInterface $container */
$container = $container->get(ContainerInterface::class);

$application = $container->get(Application::class);
$exitCode = 1;

try {
    $application->start();
    $exitCode = $application->run(null, new ConsoleBufferedOutput());
} catch (\Error $error) {
    $application->renderThrowable($error, new ConsoleBufferedOutput());
} finally {
    $application->shutdown($exitCode);
    exit($exitCode);
}
```

## Entornos de ejecución alternativos

Con entornos de ejecución alternativos como FrankenPHP, Rapira, RoadRunner o
Swoole, hay que usar scripts de entrada especiales. Consulta:

- [Usar Yii con FrankenPHP](../tutorial/using-yii-with-frankenphp.md)
- [Usar Yii con Rapira](../tutorial/using-yii-with-rapira.md)
- [Usar Yii con RoadRunner](../tutorial/using-yii-with-roadrunner.md)
- [Usar Yii con Swoole](../tutorial/using-yii-with-swoole.md)
