# 015 - PhpStorm metadata

[PhpStorm metadata](https://www.jetbrains.com/help/phpstorm/ide-advanced-metadata.html) helps IDE to understand
code better in cases when regular types and PHPDoc tags do not help.

We use the following set of coding styles for metadata.

## Metadata location

- Metadata should be placed in `/.phpstorm.meta.php` directory.
- Configuration should be split into files. Each file should be named after a class it configures.

> Note: There is no support for sub-directories in PhpStorm yet.

## Constants 

All constant dictionaries should be named as `{Class FQN}::{Group name}`. Group name should be short and written in
capital letters. Use underscore as a word separator i.e. `\Yiisoft\Http\Status::STATUSES`. For example:

```php
expectedReturnValues(
  \Psr\Http\Message\RequestInterface::getMethod(),
  argumentsSet('\Yiisoft\Http\Method::METHODS'),
);

registerArgumentsSet(
  '\Yiisoft\Http\Method::METHODS',
  \Yiisoft\Http\Method::GET,
  \Yiisoft\Http\Method::POST,
  \Yiisoft\Http\Method::PUT,
  \Yiisoft\Http\Method::DELETE,
  \Yiisoft\Http\Method::PATCH,
  \Yiisoft\Http\Method::HEAD,
  \Yiisoft\Http\Method::OPTIONS,
);
```
