# Integração com o Sentry

## O que é o Sentry

O [Sentry](https://sentry.io/) é uma ferramenta para monitorar e depurar a estabilidade e o desempenho de aplicações.
O Sentry dá acesso aos eventos que você envia para ele a partir da sua aplicação.

Na maioria das vezes, o Sentry é usado para monitorar erros (exceções).
Você pode enriquecer os erros com contexto para entender melhor o problema:
- Argumentos da requisição - Tags para agrupar exceções - Estado do
ambiente: variáveis de ambiente, estado da aplicação e outros atributos
globais

Você encontra a lista completa de funcionalidades no site oficial:
https://sentry.io/welcome/

## Instalação

### Instale o pacote

Instale o pacote necessário `yiisoft/yii-sentry` com o seguinte comando:

```shell
composer require yiisoft/yii-sentry --prefer-dist
```

### Instale um driver HTTP

A biblioteca
[`getsentry/sentry-php`](https://github.com/getsentry/sentry-php) exige o
pacote `php-http/httplug` e algum driver HTTP.  No exemplo abaixo, vamos
usar o adaptador do Guzzle.

> Você encontra a lista de todos os adaptadores [nesta página](https://docs.php-http.org/en/latest/clients.html#clients-adapters).

Para instalar os pacotes, execute o seguinte comando:

```shell
composer require php-http/httplug php-http/guzzle7-adapter --prefer-dist
```

## Configuração

### Obtenha e guarde o token

Em seguida, configure a aplicação.

Primeiro, cadastre-se no [Sentry](https://sentry.io) e crie um projeto.

Depois, nas configurações do projeto, na aba “General Settings”, encontre o
campo “Security Token” e copie o valor dele.

Agora coloque esse token na configuração do pacote. Por padrão, a configuração fica em `config/packages/yiisoft/yii-sentry/config/params.php`.
Defina o token copiado como valor do elemento do array em `yiisoft/yii-sentry` => `options` => `dsn`. Exemplo:

```diff
'yiisoft/yii-sentry' => [
    'enabled' => true,
    'options' => [
-        'dsn' => '',
+        'dsn' => 'TOKEN',
    ],
],
```

### Configure o cliente HTTP

Depois de instalar o cliente HTTP, configure-o.

Crie o arquivo `config/common/sentry.php` e coloque nele o seguinte código:

```php
<?php

declare(strict_types=1);

return [
    \Http\Client\HttpClient::class => \GuzzleHttp\Client::class,
    \Http\Client\HttpAsyncClient::class => [
        'class' => \Http\Adapter\Guzzle7\Client::class,
        '__construct()' => [
            \Yiisoft\Factory\Definition\Reference::to(\Http\Client\HttpClient::class),
        ],
    ],
];
```

# Integração

### Web

O suporte do Sentry para `web` é implementado como middleware.

Isso significa que você só precisa adicionar o `SentryMiddleware` à lista
global de middlewares em `config/web/application.php`:

```diff
return [
    Yiisoft\Yii\Web\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            Router::class,
                            SubFolder::class,
+                            SentryMiddleware::class,
                            ErrorCatcher::class,
                        ]
                    );
            }),
            'fallbackHandler' => Reference::to(NotFoundHandler::class),
        ],
    ],
];
```

### Console

O Sentry suporta o `console` por meio de um handler para o evento
[ConsoleEvents::ERROR](https://symfony.com/doc/current/components/console/events.html#the-consoleevents-error-event).

O pacote fornece um arquivo de configuração que inscreve a aplicação nesse
evento automaticamente.
