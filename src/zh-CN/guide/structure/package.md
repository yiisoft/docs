# 包

可复用的代码可以作为 [Composer
包](https://getcomposer.org/doc/05-repositories.md#package)发布。它可以是一个基础设施库、代表某个应用上下文的模块，或者基本上任何可复用的代码。

## 使用包 <span id="using-packages"></span>

默认情况下，Composer 会安装在 [Packagist](https://packagist.org/) 上注册的包——这是最大的开源 PHP
包仓库。您可以在 Packagist
上搜索包。您也可以[创建自己的仓库](https://getcomposer.org/doc/05-repositories.md#repository)并配置
Composer 使用它，这在开发只在项目内部共享的私有包时非常有用。

Composer 安装的包存储在项目的 `vendor` 目录中。由于 Composer
是一个依赖管理器，在安装某个包时，它也会同时安装该包所依赖的所有包。

> [!WARNING]
> 永远不要手动修改应用程序的 `vendor` 目录。

可以使用以下命令安装包：

```
composer install vendor-name/package-name
```

完成后，Composer 会修改 `composer.json` 和
`composer.lock`。前者定义要安装的包及其版本约束，后者存储实际安装的精确版本快照。

包中的类可以通过[自动加载](../concept/autoloading.md)立即使用。

## 创建包 <span id="creating-packages"></span>


当您希望与他人共享优质代码时，可以考虑创建一个包。包可以包含任何代码，例如辅助类、小部件、服务、中间件、完整模块等。

以下是基本步骤。

1. 为您的包创建一个项目，并将其托管在 VCS 仓库（例如
   [GitHub.com](https://github.com)）上。包的开发和维护工作应在该仓库中进行。
2. 在项目根目录下，按照 Composer 的要求创建 `composer.json` 文件。详情请参阅下一小节。
3. 将您的包注册到 Composer 仓库（例如 [Packagist](https://packagist.org/)），以便其他用户能够通过
   Composer 找到并安装您的包。


### `composer.json` <span id="composer-json"></span>

每个 Composer 包的根目录下必须有一个 `composer.json` 文件，该文件包含包的元数据。您可以在 [Composer
手册](https://getcomposer.org/doc/01-basic-usage.md#composer-json-project-setup)中找到该文件的完整规范。以下示例展示了
`yiisoft/yii-widgets` 包的 `composer.json` 文件：

```json
{
    "name": "yiisoft/yii-widgets",
    "type": "library",
    "description": "Yii widgets collection",
    "keywords": [
        "yii",
        "widgets"
    ],
    "homepage": "https://www.yiiframework.com/",
    "license": "BSD-3-Clause",
    "support": {
        "issues": "https://github.com/yiisoft/yii-widgets/issues?state=open",
        "forum": "https://www.yiiframework.com/forum/",
        "wiki": "https://www.yiiframework.com/wiki/",
        "irc": "ircs://irc.libera.chat:6697/yii",
        "chat": "https://t.me/yii3en",
        "source": "https://github.com/yiisoft/yii-widgets"
    },
    "funding": [
        {
            "type": "opencollective",
            "url": "https://opencollective.com/yiisoft"
        },
        {
            "type": "github",
            "url": "https://github.com/sponsors/yiisoft"
        }
    ],
    "require": {
        "php": "^7.4|^8.0",
        "yiisoft/aliases": "^1.1|^2.0",
        "yiisoft/cache": "^1.0",
        "yiisoft/html": "^2.0",
        "yiisoft/view": "^4.0",
        "yiisoft/widget": "^1.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.5",
        "roave/infection-static-analysis-plugin": "^1.16",
        "spatie/phpunit-watcher": "^1.23",
        "vimeo/psalm": "^4.18",
        "yiisoft/psr-dummy-provider": "^1.0",
        "yiisoft/test-support": "^1.3"
    },
    "autoload": {
        "psr-4": {
            "Yiisoft\\Yii\\Widgets\\": "src"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Yiisoft\\Yii\\Widgets\\Tests\\": "tests"
        }
    },
    "extra": {
        "branch-alias": {
            "dev-master": "3.0.x-dev"
        }
    },
    "scripts": {
        "test": "phpunit --testdox --no-interaction",
        "test-watch": "phpunit-watcher watch"
    },
    "config": {
        "sort-packages": true,
        "allow-plugins": {
            "infection/extension-installer": true,
            "composer/package-versions-deprecated": true
        }
    }
}
```


#### 包名 <span id="package-name"></span>

每个 Composer 包都应有一个唯一标识该包的包名。包名的格式为 `vendorName/projectName`。例如，在包名
`yiisoft/queue` 中，供应商名称为 `yiisoft`，项目名称为 `queue`。

> [!WARNING]
> 不要使用 `yiisoft` 作为您的供应商名称，该名称为 Yii 框架自身保留。

对于无法作为通用 PHP 包使用、必须依赖 Yii 应用程序的包，我们建议在项目名称前加上 `yii-` 前缀，以便用户更容易判断某个包是否为 Yii
专属包。


#### 依赖 <span id="dependencies"></span>

如果您的扩展依赖其他包，应在 `composer.json` 的 `require` 部分列出它们，并为每个依赖包指定适当的版本约束（例如
`^1.0`、`@stable`）。当扩展发布稳定版本时，应使用稳定版本的依赖。

#### 类自动加载 <span id="class-autoloading"></span>

要使您的类能够被自动加载，需要在 `composer.json` 文件中指定 `autoload` 条目，如下所示：

```json
{
    // ....

    "autoload": {
        "psr-4": {
            "MyVendorName\\MyPackageName\\": "src"
        }
    }
}
```

您可以列出一个或多个根命名空间及其对应的文件路径。

### 推荐实践 <span id="recommended-practices"></span>

由于包是供他人使用的，在开发过程中往往需要付出额外的努力。以下介绍一些创建高质量扩展的常见推荐实践。


#### 测试 <span id="testing"></span>

您希望自己的包能够无缺陷运行，不给他人带来问题。为此，应在公开发布前对扩展进行充分测试。

建议编写各种测试用例来覆盖扩展代码，而不是依赖手动测试。每次发布新版本前，运行这些测试用例以确保一切正常。更多详情请参阅[测试](../testing/overview.md)章节。


#### 版本管理 <span id="versioning"></span>

应为扩展的每个发布版本指定版本号（例如 `1.0.1`）。在确定版本号时，我们建议遵循[语义化版本](https://semver.org)规范。


#### 发布 <span id="releasing"></span>

要让他人了解您的包，需要将其公开发布。

如果是首次发布包，应将其注册到 Composer 仓库（例如
[Packagist](https://packagist.org/)）。之后，只需在扩展的 VCS 仓库上创建发布标签（例如 `v1.0.1`）并通知
Composer 仓库有新版本即可。其他人就能通过 Composer 仓库找到新版本并安装或更新该包。

在发布包时，除代码文件外，还应考虑包含以下内容，以帮助他人了解和使用您的扩展：

* 包根目录下的 readme 文件：描述扩展的功能及安装和使用方法。建议使用
  [Markdown](https://daringfireball.net/projects/markdown/) 格式编写，并命名为
  `README.md`。
* 包根目录下的 changelog 文件：列出每个版本的变更内容。文件可使用 Markdown 格式编写，命名为 `CHANGELOG.md`。
* 包根目录下的 upgrade 文件：提供从旧版本升级的说明。文件可使用 Markdown 格式编写，命名为 `UPGRADE.md`。
* 教程、演示、截图等：如果扩展提供的功能较多，无法在 readme 文件中完整说明，则需要这些补充材料。
* API 文档：代码应有完善的文档注释，以便他人更容易阅读和理解。
