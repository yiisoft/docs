# Интеграция с Sentry

## Оглавление
1. [Установка](#Установка)
   1. [Установка пакета](#Установка-пакета)
   2. [Установка http-драйвера](#Установка-http-драйвера)
2. [Настройка](#Настройка)
   1. [Получение и сохранение токена](#Получение-и-сохранение-токена)
   2. [Настройка http-клиента](#Настройка-http-клиента)
3. [Интеграция](#Интеграция)
   1. [Веб](#Веб)
   2. [Консоль](#Консоль)

## Установка

### Установка пакета

Для установки нужного пакета установите пакет `yiisoft/yii-sentry` следующей командой:

```
composer req yiisoft/yii-sentry
```

### Установка http-драйвера

Библиотека https://github.com/getsentry/sentry-php требует установки `php-http/httplug` пакета и любого драйвера. 
Для примеры мы будем использовать адаптер `Guzzle`. 

> Список всех адаптеров можно найти на [этой](https://docs.php-http.org/en/latest/clients.html#clients-adapters) странице.

Для установки пакетов нужно выполнить в консоли следующую команду.

```
composer req php-http/httplug php-http/guzzle7-adapter
```

## Настройка

### Получение и сохранение токена

Далее нам нужно сконфигурировать приложение.

Для начала нужно зарегистрироваться в https://sentry.io и создать проект. 

Далее в настройках проекта, на вкладке `General Settings`, найти поле `Security Token` и скопировать оттуда значение.

Теперь нужно этот токен положить в настройки пакета. По умолчанию конфиг лежит в `config/packages/yiisoft/yii-sentry/config/params.php`.
Скопированный токен нужно положить в значение элемента массива по ключу `yiisoft/yii-sentry` => `options` => `dsn`. Пример:

```diff
'yiisoft/yii-sentry' => [
    'enabled' => true,
    'options' => [
-        'dsn' => '',
+        'dsn' => 'ТОКЕН',
    ],
],
```


### Настройка http-клиента

После установки http-клиента, его нужно сконфигурировать.

Создайте файл `config/common/sentry.php` и положите в него следующий код:

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

# Интеграция

### Веб

Поддержка Sentry для `web` реализована как `middleware`. 

А это значит, что достаточно будет добавить `SentryMiddleware` в глобальный список `middleware`, в `config/web/application.php`:


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


### Консоль

Поддержка Sentry для `console` в виде обработчика события [ConsoleEvents::ERROR](https://symfony.com/doc/current/components/console/events.html#the-consoleevents-error-event).

Пакет предоставляет конфигурационный файл, который автоматически подписывает приложение на это событие.
