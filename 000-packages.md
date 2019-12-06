# 000 - Packages

Since version 3.0 Yii is divided into several packages following these agreements:

- Yii Framework and Extensions:
    - named `yiisoft/yii-something` or more specific: `yii-type-something` e.g.:
        - application bases: `yii-base-web`, `yii-base-api`
        - modules: `yii-module-users`, `yii-module-pages`
        - themes: `yii-theme-adminlte`, `yii-theme-hyde`
        - widgets: `yii-widget-datepicker`
        - and so on
    - titled as "Yii Framework ... Extension"
- Yii Libraries:
    - can be used outside of Yii Framework
    - named as `yiisoft/something` without yii-prefix
    - titled as "Yii ... Library" or "Yii ... Helper"

For all Yii packages GitHub repository name exactly matches Packagist package name.

For a full list of packages and their build statuses see [status page at yiiframework.com](https://www.yiiframework.com/status/3.0).
