# 022 — Config groups

This document defines naming convention for the framework groups used with [yiisoft/config](https://github.com/yiisoft/config).
Note that this isn't a naming convention for config files.
These could be anything and are mapped to group names via `composer.json`.

## Config group name postfixes

- "web" postfix applies to web only that's classic server HTML generation, REST, RPC, etc.
- "console" postfix applies to console
- If there's no postfix, it's "common" and applies to both web and console
- "web" and "console" may override what's defined in "common"

## Parameters

Application config parameters that are used in all configs.

- `params` — common parameters
- `params-web` — web application parameters
- `params-console` — console application parameters

## Container

Configuration for [yiisoft/di](https://github.com/yiisoft/di).

### Definitions

- `di` — common container definitions
- `di-web` — web container definitions
- `di-console` — console container definitions

### Providers

- `di-providers` — common container providers
- `di-providers-web` — web container providers
- `di-providers-console` — console container providers

### Delegates

- `di-delegates` — common container delegates
- `di-delegates-web` — web container delegates
- `di-delegates-console` — console container delegates

### Tags

- `di-tags` — common container tags
- `di-tags-web` — web container tags
- `di-tags-console` — console container tags

## Events

Configuration for [yiisoft/yii-event](https://github.com/yiisoft/yii-event).

- `events` — common events
- `events-web` — web events
- `events-console` — console events

## Bootstrap

Application bootstrapping for [yiisoft/yii-runner](https://github.com/yiisoft/yii-runner).

- `bootstrap` — common bootstrap
- `bootstrap-web` — web bootstrap
- `bootstrap-console` — console bootstrap

## Others

- `routes` — [yiisoft/router](https://github.com/yiisoft/router) routes
- `widgets` — [yiisoft/widget](https://github.com/yiisoft/widget) default widgets configuration
