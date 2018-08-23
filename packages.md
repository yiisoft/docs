# Yii packages

Since 3.0 Yii is divided into several packages:

- packages that *depend* on Yii (`core`) are named `yiisoft/yii-something`,
- packages that *do not depend* on Yii itself (`core`) are named as `yiisoft/something`.

Extension packages are titled as "Yii Framework *** Extension".

## General packages

| Repository            | Package                       | Description                                      |
|-----------------------|-------------------------------|--------------------------------------------------|
| [core]                | [yiisoft/core]                | Framework core |
| [log]                 | [yiisoft/log]                 | [PSR-3] compatible logger |
| [di]                  | [yiisoft/di]                  | [PSR-11] compatible DI container and injector |
| [cache]               | [yiisoft/cache]               | [PSR-16] compatible cache library |
| [db]                  | [yiisoft/db]                  | Database abstraction library |
| [active-record]       | [yiisoft/active-record]       | Active Record
| [rbac]                | [yiisoft/rbac]                | Role-based access control |

[PSR-3]:                    https://www.php-fig.org/psr/psr-3
[PSR-11]:                   https://www.php-fig.org/psr/psr-11
[PSR-16]:                   https://www.php-fig.org/psr/psr-16

[core]:                     https://github.com/yiisoft/core
[log]:                      https://github.com/yiisoft/log
[di]:                       https://github.com/yiisoft/di
[cache]:                    https://github.com/yiisoft/cache
[db]:                       https://github.com/yiisoft/db
[rbac]:                     https://github.com/yiisoft/rbac
[active-record]:            https://github.com/yiisoft/active-record

[yiisoft/core]:             https://packagist.org/packages/yiisoft/core
[yiisoft/log]:              https://packagist.org/packages/yiisoft/log
[yiisoft/di]:               https://packagist.org/packages/yiisoft/di
[yiisoft/cache]:            https://packagist.org/packages/yiisoft/cache
[yiisoft/db]:               https://packagist.org/packages/yiisoft/db
[yiisoft/rbac]:             https://packagist.org/packages/yiisoft/rbac
[yiisoft/active-record]:    https://packagist.org/packages/yiisoft/active-record

### DB drivers

| Repository            | Package                       | Description                    |
|-----------------------|-------------------------------|--------------------------------|
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

| Repository  | Package name  | Description  |
|-----------------------|-------------------------------|---|
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

## Yii-dependent packages

### Framework

| Repository  | Package name  | Description  |
|---|---|---|
| [yii-console](https://github.com/yiisoft/yii-console) | [yiisoft/yii-console](https://packagist.org/packages/yiisoft/yii-console) | Yii console components |
| [yii-web](https://github.com/yiisoft/yii-web) | [yiisoft/yii-web](https://packagist.org/packages/yiisoft/yii-web) | Yii web components | 
| [yii-rest](https://github.com/yiisoft/yii-rest) | [yiisoft/yii-rest](https://packagist.org/packages/yiisoft/yii-rest) | Yii REST API framework |
| [yii-app-template](https://github.com/yiisoft/yii-app-template) | - | Yii web application template |
| [yii-app](https://github.com/yiisoft/yii-app) | [yiisoft/yii-app](https://packagist.org/packages/yiisoft/yii-app)  | Yii web application template |


## Widgets and wrappers

| Repository  | Package  | Description  |
|---|---|---|
| [yii-boostrap3](https://github.com/yiisoft/yii-bootstrap3) | [yiisoft/yii-bootstrap3](https://packagist.org/packages/yiisoft/yii-bootstrap3) | Yii Framework Bootstrap3 Extension |
| [yii-bootstrap4](https://github.com/yiisoft/yii-bootstrap4) | [yiisoft/yii-bootstrap4](https://packagist.org/packages/yiisoft/yii-bootstrap4)  | Yii Framework Bootstrap4 Extension |
| [yii-masked-input](https://github.com/yiisoft/yii-masked-input) | [yiisoft/yii-masked-input](https://packagist.org/packages/yiisoft/yii-masked-input) | Yii Framework Masked input widget Extension |

## Tools

| Repository  | Package  | Description  |
|---|---|---|
| [yii-debug](https://github.com/yiisoft/yii-debug) | [yiisoft/yii-debug](https://packagist.org/packages/yiisoft/yii-debug) | Yii debug panel extension    |
| [yii-gii](https://github.com/yiisoft/yii-gii)     | [yiisoft/yii-gii](https://packagist.org/packages/yiisoft/yii-gii) | Yii code generator extension |

## Others

| Repository  | Package name  | Description  |
|---|---|---|
| [yii-jquery](https://github.com/yiisoft/yii-jquery)  | [yiisoft/yii-jquery](https://packagist.org/packages/yiisoft/yii-jquery)  | Yii Framework jQuery Extension |
| [yii-captcha](https://github.com/yiisoft/yii-captcha)  | [yiisoft/yii-captcha](https://packagist.org/packages/yiisoft/yii-captcha) |   Yii Framework CAPTCHA Extension | 
| [yii-swift-mailer](https://github.com/yiisoft/yii-swift-mailer)  | [yiisoft/swift-mailer](https://packagist.org/packages/yiisoft/yii-swift-mailer)  | Yii Framework Swift Mailer Extension |
| [yii-twig](https://github.com/yiisoft/yii-twig) | [yiisoft/yii-twig](https://packagist.org/packages/yiisoft/yii-twig) | Yii Framework Twig Extension |
| [yii-http-client](https://github.com/yiisoft/yii-http-client) | [yiisoft/yii-http-client](https://packagist.org/packages/yiisoft/yii-http-client) | Yii Framework HTTP client extension |
| [yii-auth-client](https://github.com/yiisoft/yii-auth-client) | [yiisoft/yii-auth-client](https://packagist.org/packages/yiisoft/yii-auth-client) | Yii Framework external authentication via OAuth and OpenID Extension |
