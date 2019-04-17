# 000 - Packages

Since version 3.0 Yii is divided into several packages following these agreements:

- Yii Framework and Extensions:
    - *depend* on Yii (`yii-core`)
    - named `yiisoft/yii-something` or more specific: `yii-type-something` e.g.:
        - application bases: `yii-base-web`, `yii-base-api`
        - modules: `yii-module-users`, `yii-module-pages`
        - themes: `yii-theme-adminlte`, `yii-theme-hyde`
        - widgets: `yii-widget-datepicker`
        - and so on
    - titled as "Yii Framework ... Extension"
- Yii Libraries:
    - *do not depend* on Yii (`yii-core`)
    - can be used outside of Yii Framework
    - named as `yiisoft/something` without yii-prefix
    - titled as "Yii ... Library"

For all Yii packages GitHub repository name exactly matches Packagist package name.

## Yii Framework

### Framework

| Package                       | Title                                             | Status
|-------------------------------|---------------------------------------------------|-------------
| [yiisoft/yii-core]            | Yii Framework Core                                | [![Build Status](https://travis-ci.org/yiisoft/yii-core.svg?branch=master)](https://travis-ci.org/yiisoft/yii-core)
| [yiisoft/yii-console]         | Yii Framework Console Extension                   | [![Build Status](https://travis-ci.com/yiisoft/yii-console.svg?branch=master&a=1)](https://travis-ci.com/yiisoft/yii-console)
| [yiisoft/yii-web]             | Yii Framework Web Extension                       | [![Build Status](https://travis-ci.org/yiisoft/yii-web.svg?branch=master&a=1)](https://travis-ci.org/yiisoft/yii-web)
| [yiisoft/yii-rest]            | Yii Framework REST Extension                      | [![Build Status](https://travis-ci.org/yiisoft/yii-rest.svg?branch=master)](https://travis-ci.org/yiisoft/yii-rest)

[yiisoft/yii-core]:             https://github.com/yiisoft/yii-core
[yiisoft/yii-console]:          https://github.com/yiisoft/yii-console
[yiisoft/yii-web]:              https://github.com/yiisoft/yii-web
[yiisoft/yii-rest]:             https://github.com/yiisoft/yii-rest

## Yii project template and application bases

| Package                        | Title                                           | Status
|--------------------------------|-------------------------------------------------|----------------
| [yiisoft/yii-project-template] | Yii Framework Project Template                  | [![Build Status](https://travis-ci.org/yiisoft/yii-project-template.svg?branch=master)](https://travis-ci.org/yiisoft/yii-project-template)
| [yiisoft/yii-base-web]         | Yii Framework Web Application Base              | [![Build Status](https://travis-ci.org/yiisoft/yii-base-web.svg?branch=master)](https://travis-ci.org/yiisoft/yii-base-web)
| [yiisoft/yii-base-api]         | Yii Framework API Application Base              | [![Build Status](https://travis-ci.com/yiisoft/yii-base-api.svg?branch=master&a=1)](https://travis-ci.com/yiisoft/yii-base-api)
| [yiisoft/yii-base-cli]         | Yii Framework CLI Application Base              | [![Build Status](https://travis-ci.com/yiisoft/yii-base-cli.svg?branch=master)](https://travis-ci.com/yiisoft/yii-base-cli)

[yiisoft/yii-project-template]: https://github.com/yiisoft/yii-project-template
[yiisoft/yii-base-web]:         https://github.com/yiisoft/yii-base-web
[yiisoft/yii-base-api]:         https://github.com/yiisoft/yii-base-api
[yiisoft/yii-base-cli]:         https://github.com/yiisoft/yii-base-cli


## Widgets and wrappers

| Package                       | Title                                             | Status
|-------------------------------|---------------------------------------------------|-----------------
| [yiisoft/yii-bootstrap3]      | Yii Framework Bootstrap3 Extension                | [![Build Status](https://travis-ci.org/yiisoft/yii-bootstrap3.svg?branch=master&a=1)](https://travis-ci.org/yiisoft/yii-bootstrap3)
| [yiisoft/yii-bootstrap4]      | Yii Framework Bootstrap4 Extension                | [![Build Status](https://travis-ci.org/yiisoft/yii-bootstrap4.svg?branch=master)](https://travis-ci.org/yiisoft/yii-bootstrap4)
| [yiisoft/yii-dataview]        | Yii Framework Data Displaying Extension           | [![Build Status](https://travis-ci.com/yiisoft/yii-dataview.svg?branch=master&a=1)](https://travis-ci.com/yiisoft/yii-dataview)
| [yiisoft/yii-masked-input]    | Yii Framework Masked Input Widget Extension       | [![Build Status](https://travis-ci.org/yiisoft/yii-masked-input.svg?branch=master)](https://travis-ci.org/yiisoft/yii-masked-input)

[yiisoft/yii-bootstrap3]:       https://github.com/yiisoft/yii-bootstrap3
[yiisoft/yii-bootstrap4]:       https://github.com/yiisoft/yii-bootstrap4
[yiisoft/yii-masked-input]:     https://github.com/yiisoft/yii-masked-input
[yiisoft/yii-dataview]:         https://github.com/yiisoft/yii-dataview

## Tools

| Package                       | Title                                             | Status
|-------------------------------|---------------------------------------------------|--------------
| [yiisoft/yii-debug]           | Yii Framework Debug Panel Extension               | [![Build Status](https://travis-ci.org/yiisoft/yii-debug.svg?branch=master)](https://travis-ci.org/yiisoft/yii-debug)
| [yiisoft/yii-gii]             | Yii Framework Code Generator Extension            | [![Build Status](https://travis-ci.org/yiisoft/yii-gii.svg?branch=master)](https://travis-ci.org/yiisoft/yii-gii)
| [yiisoft/yii-dev]             | Yii framework contributor toolset                 | [![Build Status](https://travis-ci.com/yiisoft/yii-dev.svg?branch=master)](https://travis-ci.com/yiisoft/yii-dev)

[yiisoft/yii-debug]:            https://github.com/yiisoft/yii-debug
[yiisoft/yii-gii]:              https://github.com/yiisoft/yii-gii
[yiisoft/yii-dev]:              https://github.com/yiisoft/yii-dev

## Others

| Package                       | Title                                             | Status
|-------------------------------|---------------------------------------------------|---------
| [yiisoft/yii-jquery]          | Yii Framework jQuery Extension                    | [![Build Status](https://travis-ci.org/yiisoft/yii-jquery.svg?branch=master&a=1)](https://travis-ci.org/yiisoft/yii-jquery)
| [yiisoft/yii-captcha]         | Yii Framework CAPTCHA Extension                   | [![Build Status](https://travis-ci.org/yiisoft/yii-captcha.svg?branch=master)](https://travis-ci.org/yiisoft/yii-captcha)
| [yiisoft/yii-queue]           | Yii Framework Queue Extension                     | [![Build Status](https://travis-ci.org/yiisoft/yii-queue.svg?branch=master&a=1)](https://travis-ci.org/yiisoft/yii-queue)
| [yiisoft/yii-swiftmailer]     | Yii Framework Swift Mailer Extension              | [![Build Status](https://travis-ci.org/yiisoft/yii-swiftmailer.svg?branch=master)](https://travis-ci.org/yiisoft/yii-swiftmailer)
| [yiisoft/yii-twig]            | Yii Framework Twig Extension                      | [![Build Status](https://travis-ci.org/yiisoft/yii-twig.svg?branch=master)](https://travis-ci.org/yiisoft/yii-twig)
| [yiisoft/yii-http-client]     | Yii Framework HTTP client extension               | [![Build Status](https://travis-ci.com/yiisoft/yii-http-client.svg?branch=master)](https://travis-ci.com/yiisoft/yii-http-client)
| [yiisoft/yii-auth-client]     | Yii Framework External Authentication Extension   | [![Build Status](https://travis-ci.com/yiisoft/yii-auth-client.svg?branch=master)](https://travis-ci.com/yiisoft/yii-auth-client)

[yiisoft/yii-jquery]:           https://github.com/yiisoft/yii-jquery
[yiisoft/yii-captcha]:          https://github.com/yiisoft/yii-captcha
[yiisoft/yii-queue]:            https://github.com/yiisoft/yii-queue
[yiisoft/yii-swiftmailer]:      https://github.com/yiisoft/yii-swiftmailer
[yiisoft/yii-twig]:             https://github.com/yiisoft/yii-twig
[yiisoft/yii-http-client]:      https://github.com/yiisoft/yii-http-client
[yiisoft/yii-auth-client]:      https://github.com/yiisoft/yii-auth-client

## Log

| Package                       | Title                                 | Description                                   | Status
|-------------------------------|---------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/log]                 | Yii Logging Library                   | [PSR-3] compatible logger                     | [![Build Status](https://travis-ci.org/yiisoft/log.svg?branch=master)](https://travis-ci.org/yiisoft/log)
| [yiisoft/log-target-db]       | Yii Logging Library - DB Target       | Database target for logs                      | [![Build Status](https://travis-ci.com/yiisoft/log-target-db.svg?branch=master)](https://travis-ci.com/yiisoft/log-target-db)
| [yiisoft/log-target-email]    | Yii Logging Library - Email Target    | Email target for logs                         | [![Build Status](https://travis-ci.com/yiisoft/log-target-email.svg?branch=master)](https://travis-ci.com/yiisoft/log-target-email)
| [yiisoft/log-target-file]     | Yii Logging Library - File Target     | File target for logs                          | [![Build Status](https://travis-ci.org/yiisoft/log-target-file.svg?branch=master)](https://travis-ci.org/yiisoft/log-target-file)
| [yiisoft/log-target-syslog]   | Yii Logging Library - Syslog Target   | Syslog target for logs                        | [![Build Status](https://travis-ci.org/yiisoft/log-target-syslog.svg?branch=master)](https://travis-ci.org/yiisoft/log-target-syslog)

[PSR-3]:                        https://www.php-fig.org/psr/psr-3
[yiisoft/log]:                  https://github.com/yiisoft/log
[yiisoft/log-target-db]:        https://github.com/yiisoft/log-target-db
[yiisoft/log-target-email]:     https://github.com/yiisoft/log-target-email
[yiisoft/log-target-file]:      https://github.com/yiisoft/log-target-file
[yiisoft/log-target-syslog]:    https://github.com/yiisoft/log-target-syslog

## Cache
| Package                       | Title                                 | Description                                   | Status
|-------------------------------|---------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/cache]               | Yii Caching Library                   | [PSR-16] compatible cache                     | [![Build Status](https://travis-ci.com/yiisoft/cache.svg?branch=master)](https://travis-ci.com/yiisoft/cache)

[PSR-16]:                       https://www.php-fig.org/psr/psr-16
[yiisoft/cache]:                https://github.com/yiisoft/cache

## Event Dispatcher
| Package                       | Title                                 | Description                                   | Status
|-------------------------------|---------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/event-dispatcher]    | Yii Event Dispatcher Library          | [PSR-14] compatible event dispatcher          | [![Build Status](https://travis-ci.org/yiisoft/event-dispatcher.svg?branch=master)](https://travis-ci.org/yiisoft/event-dispatcher)

[PSR-14]:                       https://www.php-fig.org/psr/psr-14
[yiisoft/event-dispatcher]:     https://github.com/yiisoft/event-dispatcher

## RBAC

| Package                       | Title                                 | Description                                   | Status
|-------------------------------|---------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/rbac]                | Yii Role-Based Access Control Library |                                               | [![Build Status](https://travis-ci.org/yiisoft/rbac.svg?branch=master)](https://travis-ci.org/yiisoft/rbac)

[yiisoft/rbac]:                 https://github.com/yiisoft/rbac

## Mutex

| Package                       | Title                                  | Description                                   | Status
|-------------------------------|----------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/mutex]               | Yii Mutex Library                      | Framework-independent mutex lock implementation | [![Build Status](https://travis-ci.com/yiisoft/mutex.svg?branch=master)](https://travis-ci.com/yiisoft/mutex)
| [yiisoft/mutex-db-mysql]      | Yii Mutex Library - MySQL DB Driver    | MySQL driver for mutex operations               | [![Build Status](https://travis-ci.com/yiisoft/mutex-db-mysql.svg?branch=master)](https://travis-ci.com/yiisoft/mutex-db-mysql)
| [yiisoft/mutex-db-oracle]     | Yii Mutex Library - Oracle DB Driver   | Oracle driver for mutex operations              | [![Build Status](https://travis-ci.com/yiisoft/mutex-db-oracle.svg?branch=master)](https://travis-ci.com/yiisoft/mutex-db-oracle)
| [yiisoft/mutex-db-pgsql]      | Yii Mutex Library - Postgres DB Driver | Postgres driver for mutex operations            | [![Build Status](https://travis-ci.com/yiisoft/mutex-db-pgsql.svg?branch=master)](https://travis-ci.com/yiisoft/mutex-db-pgsql)
| [yiisoft/mutex-db-redis]      | Yii Mutex Library - Redis DB Driver    | Redis driver for mutex operations               | [![Build Status](https://travis-ci.com/yiisoft/mutex-db-redis.svg?branch=master)](https://travis-ci.com/yiisoft/mutex-db-redis)
| [yiisoft/mutex-file]          | Yii Mutex Library - File Driver        | File driver for mutex operations                | [![Build Status](https://travis-ci.com/yiisoft/mutex-file.svg?branch=master)](https://travis-ci.com/yiisoft/mutex-file)

[yiisoft/mutex]:                https://github.com/yiisoft/mutex
[yiisoft/mutex-db-mysql]:       https://github.com/yiisoft/mutex-db-mysql
[yiisoft/mutex-db-oracle]:      https://github.com/yiisoft/mutex-db-oracle
[yiisoft/mutex-db-pgsql]:       https://github.com/yiisoft/mutex-db-pgsql
[yiisoft/mutex-db-redis]:       https://github.com/yiisoft/mutex-db-redis
[yiisoft/mutex-file]:           https://github.com/yiisoft/mutex-file

## Yii Libraries

| Package                       | Title                                 | Description                                   | Status
|-------------------------------|---------------------------------------|-----------------------------------------------|------------------------------------------------------
| [yiisoft/di]                  | Yii Dependency Injection Library      | [PSR-11] compatible DI container and injector | [![Build Status](https://travis-ci.org/yiisoft/di.svg?branch=master)](https://travis-ci.org/yiisoft/di)
| [yiisoft/db]                  | Yii Database Abstraction Library      |                                               | [![Build Status](https://travis-ci.org/yiisoft/db.svg?branch=master)](https://travis-ci.org/yiisoft/db)
| [yiisoft/active-record]       | Yii Active Record Library             |                                               | [![Build Status](https://travis-ci.org/yiisoft/active-record.svg?branch=master)](https://travis-ci.org/yiisoft/active-record)
| [yiisoft/view]                | Yii View Rendering Library            |                                               | [![Build Status](https://travis-ci.org/yiisoft/view.svg?branch=master)](https://travis-ci.org/yiisoft/view)

[PSR-11]:                       https://www.php-fig.org/psr/psr-11
[yiisoft/di]:                   https://github.com/yiisoft/di
[yiisoft/db]:                   https://github.com/yiisoft/db
[yiisoft/active-record]:        https://github.com/yiisoft/active-record
[yiisoft/view]:                 https://github.com/yiisoft/view
[yiisoft/mutex]:                https://github.com/yiisoft/mutex

### DB drivers

| Package                       | Description                       | Status
|-------------------------------|-----------------------------------|------------------
| [yiisoft/db-mysql]            | MySQL support for Yii             | [![Build Status](https://travis-ci.com/yiisoft/db-mysql.svg?branch=master)](https://travis-ci.com/yiisoft/db-mysql)
| [yiisoft/db-mssql]            | MSSQL support for Yii             | [![Build Status](https://travis-ci.org/yiisoft/db-mssql.svg?branch=master)](https://travis-ci.org/yiisoft/db-mssql)
| [yiisoft/db-pgsql]            | PostgreSQL support for Yii        | [![Build Status](https://travis-ci.com/yiisoft/db-pgsql.svg?branch=master)](https://travis-ci.com/yiisoft/db-pgsql)
| [yiisoft/db-sqlite]           | SQLite support for Yii            | [![Build Status](https://travis-ci.com/yiisoft/db-sqlite.svg?branch=master)](https://travis-ci.com/yiisoft/db-sqlite)
| [yiisoft/db-oracle]           | Oracle Database support for Yii   | [![Build Status](https://travis-ci.org/yiisoft/db-oracle.svg?branch=master)](https://travis-ci.org/yiisoft/db-oracle)

[yiisoft/db-oracle]:            https://github.com/yiisoft/db-oracle
[yiisoft/db-mssql]:             https://github.com/yiisoft/db-mssql
[yiisoft/db-mysql]:             https://github.com/yiisoft/db-mysql
[yiisoft/db-pgsql]:             https://github.com/yiisoft/db-pgsql
[yiisoft/db-sqlite]:            https://github.com/yiisoft/db-sqlite

### NoSQL DB drivers

| Package                       | Title                                 | Description                       | Status
|-------------------------------|---------------------------------------|-----------------------------------|-------------
| [yiisoft/db-sphinx]           | Yii Framework Sphinx Extension        |                                   | [![Build Status](https://travis-ci.org/yiisoft/db-sphinx.svg?branch=master)](https://travis-ci.org/yiisoft/db-sphinx)
| [yiisoft/db-redis]            | Yii Framework Redis Extension         | Cache, Session and ActiveRecord   | [![Build Status](https://travis-ci.org/yiisoft/db-redis.svg?branch=master)](https://travis-ci.org/yiisoft/db-redis)
| [yiisoft/db-mongodb]          | Yii Framework MongoDB Extension       |                                   | [![Build Status](https://travis-ci.org/yiisoft/db-mongodb.svg?branch=master)](https://travis-ci.org/yiisoft/db-mongodb)
| [yiisoft/db-elasticsearch]    | Yii Framework ElasticSearch Extension | Query and ActiveRecord            | [![Build Status](https://travis-ci.com/yiisoft/db-elasticsearch.svg?branch=master)](https://travis-ci.com/yiisoft/db-elasticsearch)

[yiisoft/db-sphinx]:            https://github.com/yiisoft/db-sphinx
[yiisoft/db-redis]:             https://github.com/yiisoft/db-redis
[yiisoft/db-mongodb]:           https://github.com/yiisoft/db-mongodb
[yiisoft/db-elasticsearch]:     https://github.com/yiisoft/db-elasticsearch
