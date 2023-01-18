# 022 - Config groups

This document defines naming convention for the framework groups used with [yiisoft/config](https://github.com/yiisoft/config).
Note that this is not naming convention for config files. These are could be anything and are mapped to group names via `composer.json`.

- "web" applies to web only i.e. classic server HTML generation, REST, RPC etc.
- "console" applies to console
- "common" applies to both web and console
- "web" and "console" may override what is defined in "common"

## Parameters

- `params` — common parameters
- `params-web` — web application parameters
- `params-console` — console application parameters

## Container definitions

- `container` — common container definitions
- `container-web` — web container definitions
- `container-console` — console container definitions

## Container providers

- `container-providers` — common container providers
- `container-providers-web` — web container providers
- `container-providers-console` — console container providers

## Container delegates

- `container-delegates` — common container delegates
- `container-delegates-web` — web container delegates
- `container-delegates-console` — console container delegates


## Container tags

- `container-tags` — common container tags
- `container-tags-web` — web container tags
- `container-tags-console` — console container tags

## Events

- `events` — common events
- `events-web` — web events
- `events-console` — console events

## Bootstrap

- `bootstrap` — common bootstrap
- `bootstrap-web` — web bootstrap
- `bootstrap-console` — console bootstrap

## Others

- `routes` — [yiisoft/router](https://github.com/yiisoft/router) routes
- `widgets` — [yiisoft/widget](https://github.com/yiisoft/widget) default widgets configuration
