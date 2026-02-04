# Sentry 集成

## 什么是 Sentry

[Sentry](https://sentry.io/) 是一个用于监控和调试应用程序稳定性和性能的工具。
Sentry 让你可以访问从应用程序发送到那里的事件。

最常见的是，Sentry 用于监控错误（异常）。你可以使用上下文丰富错误信息以更好地理解问题：- 请求参数 - 用于分组异常的标签 -
环境状态：环境变量、应用程序状态和其他全局属性

你可以在官方网站上找到完整的功能列表：https://sentry.io/welcome/

## 安装

### 安装包

使用以下命令安装所需的包 `yiisoft/yii-sentry`：

```shell
composer require yiisoft/yii-sentry --prefer-dist
```

### 安装 HTTP 驱动

[`getsentry/sentry-php`](https://github.com/getsentry/sentry-php) 库需要
`php-http/httplug` 包和任何 HTTP 驱动。在下面的示例中，我们将使用 Guzzle 适配器。

> 你可以在[此页面](https://docs.php-http.org/en/latest/clients.html#clients-adapters)上找到所有适配器的列表。

要安装这些包，请运行以下命令：

```shell
composer require php-http/httplug php-http/guzzle7-adapter --prefer-dist
```

## 配置

### 获取并存储令牌

接下来，配置应用程序。

首先，在 [Sentry](https://sentry.io) 注册并创建一个项目。

然后，在项目设置的“常规设置”选项卡中，找到“安全令牌”字段并复制其值。

现在将此令牌放入包配置中。默认情况下，配置位于 `config/packages/yiisoft/yii-sentry/config/params.php`。
将复制的令牌设置为数组元素 `yiisoft/yii-sentry` => `options` => `dsn` 的值。示例：

```diff
'yiisoft/yii-sentry' => [
    'enabled' => true,
    'options' => [
-        'dsn' => '',
+        'dsn' => 'TOKEN',
    ],
],
```

### 配置 HTTP 客户端

安装 HTTP 客户端后，对其进行配置。

创建文件 `config/common/sentry.php` 并将以下代码放入其中：

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

# 集成

### Web

对 `web` 的 Sentry 支持是作为中间件实现的。

这意味着你只需要将 `SentryMiddleware` 添加到 `config/web/application.php` 中的全局中间件列表中：

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

### 控制台

Sentry 通过
[ConsoleEvents::ERROR](https://symfony.com/doc/current/components/console/events.html#the-consoleevents-error-event)
事件的处理程序支持 `console`。

该包提供了一个配置文件，可以自动将应用程序订阅到此事件。
