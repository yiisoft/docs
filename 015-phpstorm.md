# 015 — PhpStorm metadata and attributes

## PhpStorm metadata

[PhpStorm metadata](https://www.jetbrains.com/help/phpstorm/ide-advanced-metadata.html) helps the IDE to understand
code better in cases when regular types and PHPDoc tags don't help.

We use the following set of coding styles for metadata.

### Metadata location

- Metadata should be placed in `/.phpstorm.meta.php` directory.
- Configuration should be split into files. Each file should be named after a class it configures.

> [!NOTE]
> There is no support for subdirectories in PhpStorm yet.

### Constants 

All constant dictionaries should be named as `{Class FQN}::{Group name}`. Group name should be short and written in
capital letters.
Use underscore as a word separator that's `\Yiisoft\Http\Status::STATUSES`. For example:

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

## PhpStorm attributes

[PhpStorm attributes](https://github.com/JetBrains/phpstorm-attributes) CAN be used in code, but package 
`jetbrains/phpstorm-attributes` MUST be added as a dev dependency:

```shell
composer require --dev jetbrains/phpstorm-attributes
```

### Using with ComposerRequireChecker

When [ComposerRequireChecker](https://github.com/maglnet/ComposerRequireChecker) is also used within the same package, 
add involved attributes' class names to whitelist in config. For example:

```json
{
    "symbol-whitelist": [
        "JetBrains\\PhpStorm\\ExpectedValues",
        "JetBrains\\PhpStorm\\Pure"
    ]
}
```
