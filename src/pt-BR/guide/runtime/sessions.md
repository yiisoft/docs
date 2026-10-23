# Sessões

As sessões mantêm dados entre requisições sem precisar enviá-los ao cliente
e de volta.  O Yii tem [um pacote de
sessão](https://github.com/yiisoft/session) para trabalhar com os dados da
sessão.

Para adicioná-lo à sua aplicação, use o composer:

```shell
composer require yiisoft/session
```

## Configurando o middleware

Para manter a sessão entre requisições, você precisa adicionar o
`SessionMiddleware` ao seu grupo de rotas ou aos middlewares da aplicação.
Prefira um grupo de rotas quando a mesma aplicação tiver uma API com
autenticação por token e rotas web comuns. Assim, a sessão não é iniciada
nos endpoints da API.

Para adicionar a sessão a um grupo específico de rotas, edite
`config/routes.php` assim:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Group;
use Yiisoft\Session\SessionMiddleware;

return [
    Group::create('/blog')
        ->middleware(SessionMiddleware::class)
        ->routes(
            // ...
        )
];
```

Para adicionar a sessão à aplicação inteira, edite `config/application.php`
assim:

```php
return [
    Yiisoft\Yii\Web\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            Router::class,
                            CsrfTokenMiddleware::class,
                            SessionMiddleware::class, // <-- add this
                            ErrorCatcher::class,
                        ]
                    );
            }),
        ],
    ],
];
```

## Abrindo e fechando a sessão

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // start a session if it's not yet started
    $session->open();

    // work with session

    // write session values and then close it
    $session->close();
}
``` 

> [!NOTE]
> Fechar a sessão o quanto antes é uma boa prática, já que muitas implementações de sessão bloqueiam outras
> requisições enquanto a sessão está aberta.

Há mais duas formas de fechar uma sessão:

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // discard changes and close the session
    $session->discard();

    // destroy the session completely
    $session->destroy();    
}
```

## Trabalhando com os dados da sessão

Normalmente você vai usar os seguintes métodos para trabalhar com os dados
da sessão:

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // get a value
    $lastAccessTime = $session->get('lastAccessTime');

    // get all values
    $sessionData = $session->all();
        
    // set a value
    $session->set('lastAccessTime', time());

    // check if the value exists
    if ($session->has('lastAccessTime')) {
        // ...    
    }
    
    // remove value
    $session->remove('lastAccessTime');

    // get value and then remove it
    $sessionData = $session->pull('lastAccessTime');

    // clear session data from runtime
    $session->clear();
}
```

## Mensagens flash

Quando você precisa que um dado fique na sessão até ser lido, como ao exibir
uma mensagem na próxima página, o que você precisa são as mensagens
"flash".  Uma mensagem flash é um tipo especial de dado que só fica
disponível na requisição atual e na próxima.  Depois disso, ela é apagada
automaticamente.

O uso de `FlashInteface` é o seguinte:

```php
/** @var Yiisoft\Session\Flash\FlashInterface $flash */

// request 1
$flash->set('warning', 'Oh no, not again.');

// request 2
$warning = $flash->get('warning');
if ($warning !== null) {
    // do something with it
}
```

## Armazenamento de sessão personalizado

Ao usar `Yiisoft\Session\Session`, você pode usar a sua própria
implementação de armazenamento:

```php
$handler = new MySessionHandler();
$session = new \Yiisoft\Session\Session([], $handler);
```

O armazenamento personalizado precisa implementar
`\SessionHandlerInterface`.
