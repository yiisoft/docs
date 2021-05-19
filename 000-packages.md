# 000 - Packages

Since Yii 3 framework is divided into several packages with the following agreements.

For all packages GitHub repository name exactly matches Packagist package name.

For a full list of packages and their build statuses see [status page at yiiframework.com](https://www.yiiframework.com/status/3.0).

## Yii-specific packages (Yii Framework and Extensions)
    
- named `yiisoft/yii-something` or more specific: `yii-type-something` e.g.:
    - modules: `yii-module-users`, `yii-module-pages`
    - themes: `yii-theme-adminlte`, `yii-theme-hyde`
    - widgets: `yii-widget-datepicker`
    - and so on
- titled as "Yii Framework ..."
- may have any dependencies and Yii-specific code

## General purpose packages (Libraries)
  
- can be used outside of Yii Framework
- named as `yiisoft/something` without yii-prefix
- titled as "Yii ..."
- must not have dependencies on any Yii-specific packages
- should have as fewer dependencies as possible

## Configs and defaults

The following applies to both Yii-specific packages and general purpose packages:

- Package may have `config` directory with Yii-specific defaults.
- Package may have "config-plugin" in "extra" section of `composer.json`.  
- Package must not have dependencies in `require` section of `composer.json` that are used in `config` only.
- Parameters should be namespaced with `vendor/package-name`:

```php
return [
    'vendor/package-name' => [
        'param1' => 1,
        'param2' => 2,
    ],
];
```
  
## Versions

All packages are versioned according to [SemVer](https://semver.org/):

- `x.*.*` - incompatible API changes.
- `*.x.*` - add functionality (backwards-compatible).
- `*.*.x` - bug fixes (backwards-compatible).

First stable version should be 1.0.0.

Each package version number does not depend on any other package version or framework version, only on its own public contract. 

So it is completely normal to use together packages with different major versions, as long as they are compatible.

Framework as a whole will kept naming "Yii 3" so it will be considered version 3, independent of version of its packages.

## PHP versions support

Initial release is meant to support PHP 7.4+. We may drop old version support in a major release.
