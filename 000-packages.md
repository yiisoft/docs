# 000 - Packages

Since version 3.0 Yii is divided into several packages following the following agreements.

For all packages GitHub repository name exactly matches Packagist package name.

For a full list of packages and their build statuses see [status page at yiiframework.com](https://www.yiiframework.com/status/3.0).

## Yii-specific packages (Yii Framework and Extensions)
    
- named `yiisoft/yii-something` or more specific: `yii-type-something` e.g.:
    - modules: `yii-module-users`, `yii-module-pages`
    - themes: `yii-theme-adminlte`, `yii-theme-hyde`
    - widgets: `yii-widget-datepicker`
    - and so on
- titled as "Yii Framework ... Package"
- may have any dependencies and Yii-specific code

## General purpose packages (Libraries)
  
- can be used outside of Yii Framework
- named as `yiisoft/something` without yii-prefix
- titled as "Yii ... Package" or "Yii ... Helper"
- must not have dependencies on any Yii-specific packages
- should have as fewer dependencies as possible

## Configs and defaults

The following applies to both Yii-specific packages and general purpose packages:

- Package may have `config` directory with Yii-specific defaults.
- Package may have "config-plugin" in "extra" section of `composer.json`.  
- Package must not have dependencies in `require` section of `composer.json` that are used in `config` only.
  
