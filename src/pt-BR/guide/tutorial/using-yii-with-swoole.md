# Usando o Yii com Swoole

O [Swoole](https://www.swoole.com/) é uma extensão PHP para aplicações de rede orientadas a eventos e baseadas em corrotinas. Ela
inclui um servidor HTTP, APIs de corrotinas e hooks de runtime para as funções de I/O bloqueantes mais comuns.

O Swoole permite que os handlers de requisição do Yii rodem como
workers. Cada worker pode atender várias requisições.  Esse modo de operação
costuma ser chamado de [event loop](using-with-event-loop.md) e evita
reinicializar o framework a cada requisição, o que melhora bastante o
desempenho.

## Instalação

O Swoole suporta Linux, macOS, Cygwin e WSL. Instale a extensão pelo PECL:

```bash
pecl install swoole
```

Se o PECL não habilitar a extensão automaticamente, adicione-a ao seu
`php.ini`:

```ini
extension=swoole.so
```

Confira se o PHP carrega a extensão:

```bash
php --ri swoole
```

O projeto Swoole também oferece uma [imagem
Docker](https://github.com/swoole/docker-swoole) e documenta builds a partir
do código-fonte com recursos opcionais, como hooks para OpenSSL, sockets,
MySQL, PostgreSQL e curl.

## Subindo um servidor

O Swoole passa objetos `Swoole\Http\Request` e `Swoole\Http\Response` para
os callbacks de requisição. O Yii trabalha com requisições e respostas
PSR-7, então adicione um pacote conversor:

```shell
composer require ilexn/swoole-convert-psr7
```

Crie um script de entrada, `server.php`:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Ilex\SwoolePsr7\SwooleResponseConverter;
use Ilex\SwoolePsr7\SwooleServerRequestConverter;
use Psr\Http\Message\ServerRequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\UploadedFileFactoryInterface;
use Psr\Http\Message\UriFactoryInterface;
use Psr\Log\LogLevel;
use Swoole\Http\Server;
use Swoole\HTTP\Request;
use Swoole\HTTP\Response;
use Yiisoft\Di\StateResetter;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Middleware\ErrorCatcher;
use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Http\Application;
use Yiisoft\Yii\Http\Handler\ThrowableHandler;
use Yiisoft\Yii\Runner\Http\HttpApplicationRunner;

ini_set('display_errors', 'stderr');

require_once __DIR__ . '/src/bootstrap.php';

$runner = new HttpApplicationRunner(
    rootPath: __DIR__,
    debug: Environment::appDebug(),
    checkEvents: Environment::appDebug(),
    environment: Environment::appEnv(),
    temporaryErrorHandler: new ErrorHandler(
        new Logger(
            [
                (new StreamTarget())->setLevels([
                    LogLevel::EMERGENCY,
                    LogLevel::ERROR,
                    LogLevel::WARNING,
                ]),
            ],
        ),
        new HtmlRenderer(),
    ),
);

$container = $runner->getContainer();
$application = $container->get(Application::class);
$errorCatcher = $container->get(ErrorCatcher::class);

$serverRequestFactory = new SwooleServerRequestConverter(
    $container->get(ServerRequestFactoryInterface::class),
    $container->get(UriFactoryInterface::class),
    $container->get(UploadedFileFactoryInterface::class),
    $container->get(StreamFactoryInterface::class)
);

$server = new Server('0.0.0.0', 9501);

$server->on('start', static function (Server $server) use ($application) {
    $application->start();
    echo "Swoole http server is started at http://127.0.0.1:9501\n";
});

$server->on('request', static function (
    Request  $request,
    Response $response
) use ($serverRequestFactory, $application, $errorCatcher, $container) {
    try {
        $psr7Request = $serverRequestFactory->createFromSwoole($request);
        $psr7Response = $application->handle($psr7Request);
        (new SwooleResponseConverter($response))->send($psr7Response);
    } catch (Throwable $throwable) {
        $handler = new ThrowableHandler($throwable);
        $psr7Response = $errorCatcher->process($request, $handler);
        (new SwooleResponseConverter($response))->send($psr7Response);
    }
    $application->afterEmit($psr7Response);
    $container->get(StateResetter::class)->reset();
});

$server->on('shutdown', static function (Server $server) use ($application) {
    $application->shutdown();
});

$server->start();
```

## Iniciando o servidor

Para iniciar o servidor, execute o seguinte comando:

```
php server.php
```

## Sobre o escopo

O escopo é compartilhado, então a cada iteração do event loop todo serviço
que depende de estado deve ser redefinido.

## Sessões

Evite as sessões nativas do PHP, incluindo `Yiisoft\Session\Session`, quando
corrotinas do Swoole atendem requisições simultâneas dentro de um mesmo
worker: elas compartilham o estado da sessão e podem expor os dados de um
usuário a outra requisição.

Para requisições atendidas uma por vez, feche a sessão e redefina os
serviços entre as requisições. O `yiisoft/session` impede o reuso de IDs de
sessão antigos, mas não isola corrotinas simultâneas.

Para autenticação, considere tokens como [JWT](https://jwt.io/introduction)
em vez de sessões nativas, principalmente em APIs. Se você precisa de
recursos de sessão, use uma implementação que isole os dados de sessão de
cada corrotina; trocar o handler de armazenamento nativo para Redis não
basta.

Veja as [orientações do
Swoole](https://github.com/swoole/swoole-src/issues/4478#issuecomment-962840796)
e a [discussão sobre sessões no
Yii](https://github.com/yiisoft/session/issues/25).
