# Usando o Yii com FrankenPHP

O [FrankenPHP](https://frankenphp.dev/) é um servidor de aplicação PHP com o Caddy embutido. Ele pode rodar o Yii em
[modo worker](using-with-event-loop.md), o que faz o bootstrap do framework acontecer uma vez por worker em vez de
uma vez por requisição.

## Instalação

O [runner para FrankenPHP](https://github.com/yiisoft/yii-runner-frankenphp)
exige PHP 8.1–8.5.  Instale o FrankenPHP seguindo as [instruções de
instalação](https://frankenphp.dev/docs/) dele, ou use a configuração Docker
dos templates de aplicação do Yii, descrita abaixo.

Instale o pacote do runner com o Composer:

```shell
composer require yiisoft/yii-runner-frankenphp
```

O FrankenPHP funciona especialmente bem em deploys com containers e é o
runtime usado pela configuração Docker dos templates de aplicação do Yii,
descrita em [Docker nos templates de aplicação](docker.md).

> [!NOTE]
> Este runner é para o modo worker. Para usar o FrankenPHP no modo clássico, mantenha o `public/index.php` e o
> [yiisoft/yii-runner-http](https://github.com/yiisoft/yii-runner-http), o runner HTTP padrão dos templates.

## Configuração

Primeiro, configure o script de entrada do worker.

### Script de entrada do worker

Crie `/worker.php` na raiz do projeto:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Log\LogLevel;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Runner\FrankenPHP\FrankenPHPApplicationRunner;

$root = __DIR__;

require_once $root . '/src/bootstrap.php';

if (Environment::appC3()) {
    $c3 = $root . '/c3.php';
    if (file_exists($c3)) {
        require_once $c3;
    }
}

$runner = new FrankenPHPApplicationRunner(
    rootPath: $root,
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
        new PlainTextRenderer(),
    ),
);
$runner->run();
```

O runner faz o bootstrap da aplicação uma vez e depois continua processando
requisições em modo worker. Diferente do `public/index.php` clássico, este
script não é executado a cada requisição.

### Configuração do servidor

O FrankenPHP é configurado por um `Caddyfile`. Em produção, ele pode ficar
assim:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
        }
    }
}
```

Essa configuração diz ao FrankenPHP para servir o diretório `public` e
atender todas as requisições com o `worker.php`.  Os assets estáticos
continuam sendo servidos de `public`, enquanto as requisições PHP são
processadas pelo worker de longa duração.

Em desenvolvimento, adicione `watch` para que o FrankenPHP recarregue os
workers quando arquivos PHP mudarem:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
            watch /app/**/*.php
        }
    }
}
```

### Configuração Docker nos templates de aplicação do Yii

Os templates de aplicação do Yii já vêm com uma configuração Docker baseada
no FrankenPHP. Para passar a aplicação para o modo worker, altere os
arquivos da estrutura Docker em vez de depender do `public/index.php`.

Crie `/worker.php` na raiz do projeto como mostrado acima e depois altere a
configuração do Caddy usada pelo container.  Em desenvolvimento, edite
`docker/dev/Caddyfile`:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
            watch /app/**/*.php
        }
    }
}
```

Em produção, use a mesma configuração sem `watch` em `docker/Caddyfile`:

```caddyfile
{
    skip_install_trust

    frankenphp {

    }
}

{$SERVER_NAME::80} {
    encode zstd br gzip
    php_server {
        root /app/public
        worker {
            match *
            file /app/worker.php
        }
    }
}
```

Os templates usam `dunglas/frankenphp` como imagem base em
`docker/Dockerfile`, montam o projeto em `/app` no desenvolvimento e passam
a configuração de runtime por arquivos de ambiente como `docker/dev/.env` e
`docker/prod/.env`. O valor padrão de `SERVER_NAME` nesses arquivos é `:80`,
que corresponde aos exemplos acima.

Depois de alterar o `worker.php` e o `Caddyfile` correspondente, reconstrua
a imagem e reinicie o ambiente:

```shell
make build
make up
```

Em produção, reconstrua a imagem de produção e faça o deploy usando o fluxo
Docker de produção do projeto.

Se você passar totalmente para o modo worker, o `public/index.php` e o
`yiisoft/yii-runner-http` deixam de ser necessários.

## Iniciando o servidor

O comando exato para iniciar depende de como você roda o FrankenPHP:

- Nos templates de aplicação do Yii, execute `make build` e `make up` depois
  de alterar o `worker.php` e o `Caddyfile` correspondente.
- Com o binário standalone, execute o seguinte comando no diretório que
  contém o seu `Caddyfile`:

```shell
frankenphp run --config Caddyfile
```

A configuração de exemplo usa `/app` como raiz da aplicação. Ajuste
`/app/public`, `/app/worker.php` e o caminho do watch conforme a sua
instalação. Veja a [referência de configuração do
FrankenPHP](https://frankenphp.dev/docs/config/)  para outras opções de
deploy.

## Sobre o escopo do worker

- A memória de cada worker é isolada da dos outros workers.
- Um único worker atende várias requisições, então os serviços criados
  dentro dele podem manter estado entre requisições.
- A cada iteração do event loop, todo serviço com estado deve ser
  redefinido.

Para as implicações gerais de workers de longa duração, veja [Usando o Yii
com event loop](using-with-event-loop.md).

## Notas sobre o modo worker

- Use a variável de ambiente `MAX_REQUESTS` para limitar quantas requisições
  um worker atende antes de ser reiniciado.
- O runner chama `Yiisoft\Di\StateResetter::reset()` depois de cada
  requisição. Registre resetters para os seus serviços com estado, como
  descrito na [documentação do Yii
  DI](https://github.com/yiisoft/di#resetting-services-state).

## Configuração adicional

O `FrankenPHPApplicationRunner` vem configurado por padrão para os templates
de aplicação do Yii e segue o conceito de [configuração do container de
dependências](../concept/configuration.md#configuracao-do-container).

O construtor permite sobrescrever a configuração padrão de bootstrap,
eventos, DI, params e tratamento de erros.  Você também pode fornecer uma
instância de configuração personalizada com `withConfig()` e um container
personalizado com `withContainer()`.
