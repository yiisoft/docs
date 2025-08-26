# Sentry integration

## What is Sentry

[Sentry](https://sentry.io/) is a tool for monitoring and debugging application stability and performance.
Sentry gives you access to the events that you send there from your application.

Most often, Sentry is used for monitoring errors (exceptions).
You can enrich errors with context to better understand the problem:
- Request arguments
- Tags for grouping exceptions
- Environment state: environment variables, application state, and other global attributes

You can find the full list of features on the official website: https://sentry.io/welcome/

## Installation

### Install the package

Install the required package `yiisoft/yii-sentry` with the following command:

```shell
composer require yiisoft/yii-sentry --prefer-dist
```

### Install an HTTP driver

The [`getsentry/sentry-php`](https://github.com/getsentry/sentry-php) library requires the `php-http/httplug` package and any HTTP driver.
In the example below we’ll use the Guzzle adapter.

> You can find the list of all adapters on [this page](https://docs.php-http.org/en/latest/clients.html#clients-adapters).

To install the packages, run the following command:

```shell
composer require php-http/httplug php-http/guzzle7-adapter --prefer-dist
```

## Configuration

### Get and store the token

Next, configure the application.

First, register at [Sentry](https://sentry.io) and create a project.

Then, in the project settings on the “General Settings” tab, find the “Security Token” field and copy its value.

Now put this token into the package configuration. By default, the config is located at `config/packages/yiisoft/yii-sentry/config/params.php`.
Set the copied token as the value of the array element at `yiisoft/yii-sentry` => `options` => `dsn`. Example:

```diff
'yiisoft/yii-sentry' => [
    'enabled' => true,
    'options' => [
-        'dsn' => '',
+        'dsn' => 'TOKEN',
    ],
],
```

### Configure the HTTP client

After installing the HTTP client, configure it.

Create the file `config/common/sentry.php` and put the following code into it:

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

# Integration

### Web

Sentry support for `web` is implemented as middleware.

That means you only need to add `SentryMiddleware` to the global middleware list in `config/web/application.php`:

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

Sentry supports `console` via a handler for the [ConsoleEvents::ERROR](https://symfony.com/doc/current/components/console/events.html#the-consoleevents-error-event) event.

The package provides a configuration file that automatically subscribes the application to this event.
