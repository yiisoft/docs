# 会话

会话在请求之间持久化数据，无需将数据传递给客户端再传回。Yii 提供了
[会话包](https://github.com/yiisoft/session) 来处理会话数据。

要将其添加到应用程序，请使用 composer：

```shell
composer require yiisoft/session
```

## 配置中间件

要在请求之间保持会话，需要将 `SessionMiddleware` 添加到路由组或应用程序中间件中。当应用程序同时包含基于令牌认证的 API 和常规
Web 路由时，优先选择路由组。这样可以避免为 API 端点启动会话。

要为特定路由组添加会话，请按如下方式编辑 `config/routes.php`：

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

要为整个应用程序添加会话，请按如下方式编辑 `config/application.php`：

```php
return [
    Yiisoft\Yii\Web\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            Router::class,
                            CsrfMiddleware::class,
                            SessionMiddleware::class, // <-- add this
                            ErrorCatcher::class,
                        ]
                    );
            }),
        ],
    ],
];
```

## 开启和关闭会话

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
> 尽早关闭会话是一个良好实践，因为许多会话实现在会话开启期间
> 会阻塞其他请求。

关闭会话还有两种方式：

```php
public function actionProfile(\Yiisoft\Session\SessionInterface $session)
{
    // discard changes and close the session
    $session->discard();

    // destroy the session completely
    $session->destroy();    
}
```

## 处理会话数据

通常您将使用以下方法处理会话数据：

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

## 闪存消息

如果您需要某些数据在会话中保留直到被读取（例如在下一页显示消息），那么“闪存”消息正是您所需要的。闪存消息是一种特殊类型的数据，仅在当前请求和下一个请求中可用，之后将被自动删除。

`FlashInterface` 的用法如下：

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

## 自定义会话存储

使用 `Yiisoft\Session\Session` 时，您可以使用自定义存储实现：

```php
$handler = new MySessionHandler();
$session = new \Yiisoft\Session\Session([], $handler);
```

自定义存储必须实现 `\SessionHandlerInterface`。
