# 000 — 包

Yii3 团队将框架划分为几个符合以下约定的包。

对于所有包，GitHub 仓库名称与 Packagist 包名称完全匹配。

有关包及其构建状态的完整列表，请参阅 [yiiframework.com
的状态页面](https://www.yiiframework.com/status/3.0)。

## Yii 特定包（框架和扩展）
    
- 命名为 `yiisoft/yii-something` 或更具体的：`yii-type-something`，例如：
    - 模块：`yii-module-users`，`yii-module-pages`
    - 主题：`yii-theme-adminlte`，`yii-theme-hyde`
    - 小部件：`yii-widget-datepicker`
    - ...
- 标题为“Yii Framework ...”
- 可以有任何依赖项和 Yii 特定代码

## 通用包（库）
  
- 您可以独立于 Yii 框架使用这些
- 命名为 `yiisoft/something`，不带 yii 前缀
- 标题为“Yii ...”
- 不得依赖任何 Yii 特定包
- 应尽可能少的依赖项

## 配置和默认值

以下适用于 Yii 特定包和通用包：

- 包可以有包含 Yii 特定默认值的 `config` 目录。
- 包可以在 `composer.json` 的“extra”部分中有“config-plugin”。
- 包不得在 `composer.json` 的 `require` 部分中有仅在 `config` 中使用的依赖项。
- 您应该使用 `vendor/package-name` 命名空间参数：

```php
return [
    'vendor/package-name' => [
        'param1' => 1,
        'param2' => 2,
    ],
];
```
  
## 版本

所有包都遵循 [SemVer](https://semver.org/) 版本控制：

- `x.*.*` - 不兼容的 API 更改。
- `*.x.*` - 添加功能（向后兼容）。
- `*.*.x` - bug 修复（向后兼容）。

第一个稳定版本应该是 1.0.0。

每个包的版本号不依赖于任何其他包的版本或框架名称/版本，仅依赖于其自己的公共契约。整个框架的名称为 "Yii3"。

只要兼容，一起使用不同主版本的包是可以的。

## PHP 版本支持

包支持的 PHP 版本取决于 [PHP 版本生命周期](https://www.php.net/supported-versions.php)。

- 具有活跃支持的包版本必须支持所有具有活跃支持的 PHP 版本。
- 包和应用程序模板都必须有接收 bug 和安全修复的受支持版本。这些应该对应于接收安全修复的 PHP 版本。
- 包和应用程序模板可能有与不受支持的 PHP 版本一起工作的受支持版本。
- 提升包或应用程序模板中的最低 PHP 版本是一个次要更改。

## composer.json

版本范围中的逻辑 OR 运算符必须使用双管道（`||`）。例如：`"yiisoft/arrays": "^1.0 || ^2.0"`。
