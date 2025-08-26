# 000 — Packages

Yii3 team divided the framework into several packages that conform to the following agreements.

For all packages, the GitHub repository name exactly matches the Packagist package name.

For a full list of packages and their building status,
see [status page at yiiframework.com](https://www.yiiframework.com/status/3.0).

## Yii-specific packages (framework and extensions)
    
- named `yiisoft/yii-something` or more specific: `yii-type-something` e.g.:
    - modules: `yii-module-users`, `yii-module-pages`
    - themes: `yii-theme-adminlte`, `yii-theme-hyde`
    - widgets: `yii-widget-datepicker`
    - ...
- titled as "Yii Framework ..."
- may have any dependencies and Yii-specific code

## General purpose packages (libraries)
  
- you can use these independently of Yii Framework
- named as `yiisoft/something` without yii-prefix
- titled as "Yii ..."
- must not have dependencies on any Yii-specific packages
- should have as fewer dependencies as possible

## Configs and defaults

The following applies to both Yii-specific packages and general purpose packages:

- Package may have `config` directory with Yii-specific defaults.
- Package may have "config-plugin" in "extra" section of `composer.json`.  
- Package mustn't have dependencies in `require` section of `composer.json` that are used in `config` only.
- You should namespace parameters with `vendor/package-name`:

```php
return [
    'vendor/package-name' => [
        'param1' => 1,
        'param2' => 2,
    ],
];
```
  
## Versions

All packages follow [SemVer](https://semver.org/) versioning:

- `x.*.*` - incompatible API changes.
- `*.x.*` - add functionality (backwards-compatible).
- `*.*.x` - bug fixes (backwards-compatible).

The first stable version should be 1.0.0.

Each package version number doesn't depend on any other package version or framework name/version,
only on its own public contract.
The framework as a whole has the "Yii3" name.

It's alright to use packages with different major versions together, as long as they're compatible.

## PHP versions support

The support of PHP versions supported for a package depends on
[PHP versions life cycle](https://www.php.net/supported-versions.php).

- Package versions with active support MUST support all PHP versions that have active support.
- Both packages and application templates MUST have supported versions that receive bug and security fixes.
  These SHOULD correspond to PHP versions receiving security fixes.
- Packages and application templates MIGHT have supported versions that work with unsupported PHP versions.
- Bumping the minimal PHP version in a package or an application template is a minor change.

## composer.json

A logical OR operator in version ranges MUST use double pipe (`||`). For example: `"yiisoft/arrays": "^1.0 || ^2.0"`.   
