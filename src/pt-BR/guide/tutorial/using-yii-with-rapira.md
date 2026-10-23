# Usando o Yii com Rapira

O [Rapira](https://rapira.rs/) é um servidor de aplicação PHP escrito em Rust que embute o interpretador PHP.
O [runner do Yii para Rapira](https://github.com/yiisoft/yii-runner-rapira) suporta os modos classic, worker e dispatcher.
Os modos worker e dispatcher inicializam a aplicação uma vez por worker e a reaproveitam nas requisições seguintes.
Veja [Usando o Yii com event loop](using-with-event-loop.md) para as implicações de manter a aplicação na memória.

## Instalação

O runner exige PHP 8.4–8.5. Instale o binário do Rapira seguindo as
[instruções de instalação do
Rapira](https://rapira.rs/docs/intro/installation), com uma versão do PHP
suportada pelo runner.  Os pacotes do Composer fornecem a integração com o
Yii; o binário do servidor precisa ser instalado à parte.

Instale o runner e o pacote de contratos dele na sua aplicação Yii:

```shell
composer require yiisoft/yii-runner-rapira:@dev rapira/contract:@dev
```

Essas flags de estabilidade permitem as versões de desenvolvimento usadas
nas instruções de instalação do runner.

## Configuração

O exemplo a seguir supõe uma aplicação baseada em `yiisoft/app` ou
`yiisoft/app-api`, com `App\Environment` e `src/bootstrap.php` fornecidos
pelo template.

### Script de entrada do worker

Crie `worker.php` na raiz da aplicação:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Log\LogLevel;
use Yiisoft\ErrorHandler\ErrorHandler;
use Yiisoft\ErrorHandler\Renderer\PlainTextRenderer;
use Yiisoft\Log\Logger;
use Yiisoft\Log\StreamTarget;
use Yiisoft\Yii\Runner\Rapira\RapiraApplicationRunner;

$root = __DIR__;

require_once $root . '/src/bootstrap.php';

$runner = new RapiraApplicationRunner(
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

O runner cria o container, inicia a aplicação, converte as requisições
recebidas em requisições PSR-7 e emite as respostas. Ele detecta o modo de
execução do Rapira, então o mesmo script de entrada serve para os três
modos.

### Configuração do servidor

Crie `rapira.toml` ao lado de `worker.php`:

```toml
[http]
listen = "127.0.0.1:8000"

[http.pool]
entrypoint = "worker.php"
mode = "worker"
max_requests = 1000
```

Essa configuração escuta na interface de loopback e recicla cada worker
depois de 1.000 requisições.  Para servir arquivos de `public`, siga a
[configuração de arquivos estáticos](https://rapira.rs/docs/static-files) do
Rapira.  Veja a [referência de
configuração](https://rapira.rs/docs/configuration) para as outras opções do
servidor e do pool.

## Iniciando o servidor

Execute o seguinte comando na raiz da aplicação:

```shell
rapira serve rapira.toml
```

Abra `http://127.0.0.1:8000` para acessar a aplicação. Reinicie o servidor
depois de alterar o código ou a configuração da aplicação.

## Modos de execução

Defina `mode` na seção `[http.pool]` do `rapira.toml` para escolher como as
requisições são processadas:

- `classic` inicializa a aplicação a cada requisição, como no PHP-FPM.
- `worker` mantém a aplicação na memória e recebe as requisições pelas
  superglobais da SAPI do PHP.
- `dispatcher` mantém a aplicação na memória e recebe objetos de requisição
  pela API de dispatcher do Rapira.  O runner do Yii processa essas
  requisições sequencialmente dentro de cada worker.

Veja [os modos de execução do
Rapira](https://rapira.rs/docs/execution-modes) para mais detalhes.

## Sobre o escopo do worker

Nos modos worker e dispatcher, os serviços podem manter estado entre
requisições. O runner chama `Yiisoft\Di\StateResetter::reset()` depois de
cada requisição, mas você precisa configurar resetters para os seus próprios
serviços com estado.  Veja a [documentação do Yii
DI](https://github.com/yiisoft/di#resetting-services-state).

A opção `max_requests` limita quanto tempo um worker vive; ela não substitui
a redefinição do estado específico de cada requisição.

## Configuração adicional

O `RapiraApplicationRunner` usa por padrão os grupos de configuração web dos
templates de aplicação. O construtor aceita grupos alternativos, diretórios
de configuração e um error handler temporário. Use `withConfig()` para
fornecer uma instância de configuração personalizada ou `withContainer()`
para fornecer um container PSR-11. Veja a [documentação do
runner](https://github.com/yiisoft/yii-runner-rapira#configuration) para
exemplos.
