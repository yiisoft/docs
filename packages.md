# Yii Packages

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
    - *do not depend* on Yii itself (`yii-core`)
    - can be used outside of Yii Framework
    - named as `yiisoft/something` without yii-prefix
    - titled as "Yii ... Library"

## Yii Libraries

| Repository            | Package                       | Title                                 | Description                                   |
|-----------------------|-------------------------------|---------------------------------------|-----------------------------------------------|
| [log]                 | [yiisoft/log]                 | Yii Logging Library                   | [PSR-3] compatible logger                     |
| [di]                  | [yiisoft/di]                  | Yii Dependency Injection Library      | [PSR-11] compatible DI container and injector |
| [cache]               | [yiisoft/cache]               | Yii Caching Library                   | [PSR-16] compatible cache                     |
| [db]                  | [yiisoft/db]                  | Yii Database Abstraction Library      | |
| [active-record]       | [yiisoft/active-record]       | Yii Active Record Library             | |
| [rbac]                | [yiisoft/rbac]                | Yii Role-Based Access Control Library | |

[PSR-3]:                    https://www.php-fig.org/psr/psr-3
[PSR-11]:                   https://www.php-fig.org/psr/psr-11
[PSR-16]:                   https://www.php-fig.org/psr/psr-16

[log]:                      https://github.com/yiisoft/log
[di]:                       https://github.com/yiisoft/di
[cache]:                    https://github.com/yiisoft/cache
[db]:                       https://github.com/yiisoft/db
[rbac]:                     https://github.com/yiisoft/rbac
[active-record]:            https://github.com/yiisoft/active-record

[yiisoft/log]:              https://packagist.org/packages/yiisoft/log
[yiisoft/di]:               https://packagist.org/packages/yiisoft/di
[yiisoft/cache]:            https://packagist.org/packages/yiisoft/cache
[yiisoft/db]:               https://packagist.org/packages/yiisoft/db
[yiisoft/rbac]:             https://packagist.org/packages/yiisoft/rbac
[yiisoft/active-record]:    https://packagist.org/packages/yiisoft/active-record

### DB drivers

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [db-mysql]            | [yiisoft/db-mysql]            | MySQL support for Yii |
| [db-mssql]            | [yiisoft/db-mssql]            | MSSQL support for Yii |
| [db-pgsql]            | [yiisoft/db-pgsql]            | PostgreSQL support for Yii |
| [db-sqlite]           | [yiisoft/db-sqlite]           | SQLite support for Yii |
| [db-oracle]           | [yiisoft/db-oracle]           | Oracle Database support for Yii |

[db-oracle]:                https://github.com/yiisoft/db-oracle
[db-mssql]:                 https://github.com/yiisoft/db-mssql
[db-mysql]:                 https://github.com/yiisoft/db-mysql
[db-pgsql]:                 https://github.com/yiisoft/db-pgsql
[db-sqlite]:                https://github.com/yiisoft/db-sqlite

[yiisoft/db-oracle]:        https://packagist.org/packages/yiisoft/db-oracle
[yiisoft/db-mssql]:         https://packagist.org/packages/yiisoft/db-mssql
[yiisoft/db-mysql]:         https://packagist.org/packages/yiisoft/db-mysql
[yiisoft/db-pgsql]:         https://packagist.org/packages/yiisoft/db-pgsql
[yiisoft/db-sqlite]:        https://packagist.org/packages/yiisoft/db-sqlite

### NoSQL DB drivers

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [db-sphinx]           | [yiisoft/db-sphinx]           | Yii Framework Sphinx full text search engine extension  |
| [db-redis]            | [yiisoft/db-redis]            | Yii Framework Redis Cache, Session and ActiveRecord extension |
| [db-mongodb]          | [yiisoft/db-mongodb]          | Yii Framework MongoDB extension |
| [db-elasticsearch]    | [yiisoft/db-elasticsearch]    | Yii Framework Elasticsearch Query and ActiveRecord |

[db-sphinx]:                https://github.com/yiisoft/db-sphinx
[db-redis]:                 https://github.com/yiisoft/db-redis
[db-mongodb]:               https://github.com/yiisoft/db-mongodb
[db-elasticsearch]:         https://github.com/yiisoft/db-elasticsearch

[yiisoft/db-sphinx]:        https://packagist.org/packages/yiisoft/db-sphinx
[yiisoft/db-redis]:         https://packagist.org/packages/yiisoft/db-redis
[yiisoft/db-mongodb]:       https://packagist.org/packages/yiisoft/db-mongodb
[yiisoft/db-elasticsearch]: https://packagist.org/packages/yiisoft/db-elasticsearch

## Yii Framework

### Framework

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [yii-core]            | [yiisoft/yii-core]            | Yii Framework Core                                |
| [yii-console]         | [yiisoft/yii-console]         | Yii Framework Console Extension                   |
| [yii-web]             | [yiisoft/yii-web]             | Yii Framework Web Extension                       |
| [yii-rest]            | [yiisoft/yii-rest]            | Yii Framework REST Extension                      |

[yii-core]:                 https://github.com/yiisoft/yii-core
[yii-console]:              https://github.com/yiisoft/yii-console
[yii-web]:                  https://github.com/yiisoft/yii-web
[yii-rest]:                 https://github.com/yiisoft/yii-rest

[yiisoft/yii-core]:         https://packagist.org/packages/yiisoft/yii-core
[yiisoft/yii-console]:      https://packagist.org/packages/yiisoft/yii-console
[yiisoft/yii-web]:          https://packagist.org/packages/yiisoft/yii-web
[yiisoft/yii-rest]:         https://packagist.org/packages/yiisoft/yii-rest

## Yii project template and application bases

| Repository             | Package                        | Title                                           |
|------------------------|--------------------------------|-------------------------------------------------|
| [yii-project-template] | [yiisoft/yii-project-template] | Yii Framework Project Template                  |
| [yii-base-web]         | [yiisoft/yii-base-web]         | Yii Framework Web Application Base              |
| [yii-base-api]         | [yiisoft/yii-base-api]         | Yii Framework API Application Base              |
| [yii-base-cli]         | [yiisoft/yii-base-cli]         | Yii Framework CLI Application Base              |

[yii-project-template]:     https://github.com/yiisoft/yii-project-template
[yii-base-web]:             https://github.com/yiisoft/yii-base-web
[yii-base-api]:             https://github.com/yiisoft/yii-base-api
[yii-base-cli]:             https://github.com/yiisoft/yii-base-cli

[yiisoft/yii-project-template]: https://packagist.org/packages/yiisoft/yii-project-template
[yiisoft/yii-base-web]:     https://packagist.org/packages/yiisoft/yii-base-web
[yiisoft/yii-base-api]:     https://packagist.org/packages/yiisoft/yii-base-api
[yiisoft/yii-base-cli]:     https://packagist.org/packages/yiisoft/yii-base-cli

## Widgets and wrappers

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [yii-boostrap3]       | [yiisoft/yii-bootstrap3]      | Yii Framework Bootstrap3 Extension                |
| [yii-bootstrap4]      | [yiisoft/yii-bootstrap4]      | Yii Framework Bootstrap4 Extension                |
| [yii-masked-input]    | [yiisoft/yii-masked-input]    | Yii Framework Masked Input Widget Extension       |

[yii-boostrap3]:            https://github.com/yiisoft/yii-bootstrap3
[yii-bootstrap4]:           https://github.com/yiisoft/yii-bootstrap4
[yii-masked-input]:         https://github.com/yiisoft/yii-masked-input

[yiisoft/yii-bootstrap3]:   https://packagist.org/packages/yiisoft/yii-bootstrap3
[yiisoft/yii-bootstrap4]:   https://packagist.org/packages/yiisoft/yii-bootstrap4
[yiisoft/yii-masked-input]: https://packagist.org/packages/yiisoft/yii-masked-input

## Tools

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [yii-debug]           | [yiisoft/yii-debug]           | Yii Framework Debug Panel Extension               |
| [yii-gii]             | [yiisoft/yii-gii]             | Yii Framework Code Generator Extension            |

[yii-debug]:                https://github.com/yiisoft/yii-debug
[yii-gii]:                  https://github.com/yiisoft/yii-gii

[yiisoft/yii-debug]:        https://packagist.org/packages/yiisoft/yii-debug
[yiisoft/yii-gii]:          https://packagist.org/packages/yiisoft/yii-gii

## Others

| Repository            | Package                       | Title                                             |
|-----------------------|-------------------------------|---------------------------------------------------|
| [yii-jquery]          | [yiisoft/yii-jquery]          | Yii Framework jQuery Extension                    |
| [yii-captcha]         | [yiisoft/yii-captcha]         | Yii Framework CAPTCHA Extension                   |
| [yii-swift-mailer]    | [yiisoft/swift-mailer]        | Yii Framework Swift Mailer Extension              |
| [yii-twig]            | [yiisoft/yii-twig]            | Yii Framework Twig Extension                      |
| [yii-http-client]     | [yiisoft/yii-http-client]     | Yii Framework HTTP client extension               |
| [yii-auth-client]     | [yiisoft/yii-auth-client]     | Yii Framework External Authentication Extension   |

[yii-jquery]:               https://github.com/yiisoft/yii-jquery
[yii-captcha]:              https://github.com/yiisoft/yii-captcha
[yii-swift-mailer]:         https://github.com/yiisoft/yii-swift-mailer
[yii-twig]:                 https://github.com/yiisoft/yii-twig
[yii-http-client]:          https://github.com/yiisoft/yii-http-client
[yii-auth-client]:          https://github.com/yiisoft/yii-auth-client

[yiisoft/yii-jquery]:       https://packagist.org/packages/yiisoft/yii-jquery
[yiisoft/yii-captcha]:      https://packagist.org/packages/yiisoft/yii-captcha
[yiisoft/swift-mailer]:     https://packagist.org/packages/yiisoft/yii-swift-mailer
[yiisoft/yii-twig]:         https://packagist.org/packages/yiisoft/yii-twig
[yiisoft/yii-http-client]:  https://packagist.org/packages/yiisoft/yii-http-client
[yiisoft/yii-auth-client]:  https://packagist.org/packages/yiisoft/yii-auth-client
