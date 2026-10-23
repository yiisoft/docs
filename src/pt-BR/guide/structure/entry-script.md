# Scripts de entrada

Os scripts de entrada são o primeiro passo no processo de inicialização da
aplicação. Uma aplicação (seja web ou de console) tem um único script de
entrada. Os usuários finais fazem requisições aos scripts de entrada, que
instanciam a aplicação e encaminham as requisições para ela.

Os scripts de entrada de aplicações web devem ficar em pastas acessíveis
pela web, para que os usuários finais possam acessá-los. Eles costumam se
chamar `index.php`, mas podem ter qualquer outro nome, desde que os
servidores web consigam localizá-los.

O script de entrada da aplicação de console é `./yii`.

Os scripts de entrada fazem principalmente o seguinte, com a ajuda do
`ApplicationRunner`:

* Registram o [autoloader do
  Composer](https://getcomposer.org/doc/01-basic-usage.md#autoloading);
* Obtêm a configuração;
* Usam a configuração para inicializar um container de injeção de
  dependência;
* Obtêm uma instância da requisição.
* Passam-na para a `Application` tratar e obtêm dela uma resposta.
* Com a ajuda de um emitter, transformam o objeto de resposta em uma
  resposta HTTP real, que é enviada ao navegador do cliente.

## Aplicações web

Este é o código do script de entrada do template de aplicação:

```php
<?php

declare(strict_types=1);

use App\ApplicationRunner;

// Roteamento do servidor embutido do PHP.
if (PHP_SAPI === 'cli-server') {
    // Serve arquivos estáticos como estão.
    if (is_file(__DIR__ . $_SERVER['REQUEST_URI'])) {
        return false;
    }

    // Definido explicitamente para URLs com ponto.
    $_SERVER['SCRIPT_NAME'] = '/index.php';
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

$runner = new ApplicationRunner();
// Modo de desenvolvimento:
$runner->debug();
// Executa a aplicação:
$runner->run();
```


## Aplicações de console

Da mesma forma, este é o código do script de entrada de uma aplicação de
console:

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

## Runtimes alternativos

Para runtimes alternativos como FrankenPHP, Rapira, RoadRunner ou Swoole,
devem ser usados scripts de entrada especiais. Veja:

- [Usando o Yii com FrankenPHP](../tutorial/using-yii-with-frankenphp.md)
- [Usando o Yii com Rapira](../tutorial/using-yii-with-rapira.md)
- [Usando o Yii com RoadRunner](../tutorial/using-yii-with-roadrunner.md)
- [Usando o Yii com Swoole](../tutorial/using-yii-with-swoole.md)
