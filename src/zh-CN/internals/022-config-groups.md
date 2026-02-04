# 022 — 配置组

本文档定义了与 [yiisoft/config](https://github.com/yiisoft/config)
一起使用的框架组的命名约定。请注意，这不是配置文件的命名约定。这些可以是任何内容，并通过 `composer.json` 映射到组名称。

## 配置组名称后缀

- “web”后缀仅适用于 web，即经典的服务器 HTML 生成、REST、RPC 等。
- “console”后缀适用于控制台
- 如果没有后缀，则为“common”，适用于 web 和控制台
- “web”和“console”可以覆盖“common”中定义的内容

## 参数

在所有配置中使用的应用程序配置参数。

- `params` — 通用参数
- `params-web` — web 应用程序参数
- `params-console` — 控制台应用程序参数

## 容器

[yiisoft/di](https://github.com/yiisoft/di) 的配置。

### 定义

- `di` — 通用容器定义
- `di-web` — web 容器定义
- `di-console` — 控制台容器定义

### 提供者

- `di-providers` — 通用容器提供者
- `di-providers-web` — web 容器提供者
- `di-providers-console` — 控制台容器提供者

### 委托

- `di-delegates` — 通用容器委托
- `di-delegates-web` — web 容器委托
- `di-delegates-console` — 控制台容器委托

### 标签

- `di-tags` — 通用容器标签
- `di-tags-web` — web 容器标签
- `di-tags-console` — 控制台容器标签

## 事件

[yiisoft/yii-event](https://github.com/yiisoft/yii-event) 的配置。

- `events` — 通用事件
- `events-web` — web 事件
- `events-console` — 控制台事件

## 引导

[yiisoft/yii-runner](https://github.com/yiisoft/yii-runner) 的应用程序引导。

- `bootstrap` — 通用引导
- `bootstrap-web` — web 引导
- `bootstrap-console` — 控制台引导

## 其他

- `routes` — [yiisoft/router](https://github.com/yiisoft/router) 路由
- `widgets` — [yiisoft/widget](https://github.com/yiisoft/widget) 默认小部件配置
