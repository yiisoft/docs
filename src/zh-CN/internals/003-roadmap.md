# 003 — 路线图

我们希望 Yii 3：

- 不限制开发者选择架构。允许从“经典”MVC 到 DDD 的任何架构。
- 基于 SOLID、GRASP 等最佳实践，并将它们教给社区。
- 保留 Yii 2 中最好的东西。
- 对全球 PHP 社区和基础设施更加开放。

## PSR 合规性

PSR 合规性有助于可定制性、使用通用 PHP 库的能力以及实现更少的包装器。以下是我们想要实现的 PSR 列表。

### PSR-3 日志记录器

实现为 [不依赖于框架的独立包](https://github.com/yiisoft/log)。

- [x] 框架包应仅依赖于接口。
- [x] 将驱动程序拆分为包。
- [x] 清理代码。
- [x] [修复电子邮件目标](https://github.com/yiisoft/log-target-email)。

### PSR-4 自动加载

- [x] 自动加载已经很好了。
- [x] 记录它的工作原理。

### PSR-7 HTTP 消息

- [x] 删除我们自己的实现。至少目前如此。
- [x] 框架包应仅依赖于接口。

### PSR-11 容器

实现为 [不依赖于框架的独立包](https://github.com/yiisoft/di)。

- [x] 框架包不应直接使用容器。应该能够手动实例化所有内容。
- [x] 完成重构。
- [x] 从包中删除所有框架特定的实现。移至框架。
- [x] [实现自动加载器回退](https://github.com/yiisoft/di/issues/88)

### PSR-12 代码风格

- [x] 确保代码遵循它。
- [x] 在发布前自动修复风格。

### PSR-14 事件调度器

- [x] [实现为独立库](https://github.com/yiisoft/event-dispatcher)。
- [x] 在其他包中使用。
- [x] 完善。

### PSR-15 HTTP 处理器

- [x] 将 HTTP 流程重写为 PSR-7 请求-响应 + 通过 Emitter 进行格式化响应。
- [x] 开箱即用地提供 SAPI Emitter。
- [x] 支持使用 RoadRunner 等替代的 Emitter 实现。
- [x] 支持中间件。
- [x] 将过滤器实现为中间件：
  - [x] [速率限制](https://github.com/yiisoft/yii-web/issues/63)
  - [x] [身份验证](https://github.com/yiisoft/yii-web/issues/114)
- [x] 重新实现路由器，支持路由组的中间件。
- [x] 过滤器应该是中间件。

### PSR-16 简单缓存

实现为 [不依赖于框架的独立包](https://github.com/yiisoft/cache)。

- [x] 框架包应仅依赖于接口。
- [x] 将驱动程序拆分为包。
- [x] 清理代码。

### PSR-17 HTTP 工厂

- [x] 使用 PSR 工厂。

### PSR-18 HTTP 客户端

- [x] 删除我们自己的实现。至少目前如此。
- [x] 框架包应仅依赖于接口。

## 更严格的类型

- [x] 确保在所有地方都使用类型提示。
- [x] 确保类型尽可能明确。尽可能避免变化的类型。

## 单一应用程序模板

- [x] 放弃 basic/advanced。
- [x] 创建一个 [开箱即用的单一应用程序模板](https://github.com/yiisoft/app)。

## 路由器

实现为 [不依赖于框架的独立包](https://github.com/yiisoft/router)。

- [x] 用于配置的 DSL。
- [x] 能够路由到任何可调用对象。
- [x] 命名路由。
- [x] 支持中间件的路由组。

## 所有类/包的最佳实践和 SOLID 合规性

- [x] 确保接口遵循“接口隔离”原则。
- [x] 不要使用公共属性。
- [x] 不要使用 `init()`。
- [x] 不要从 `BaseObject` 或 `Component` 继承。删除这些。
- [x] 没有全局变量。
- [x] 除了 final 的辅助函数外，没有静态调用。
- [x] 优先抛出异常而不是修复输入。

## 开发工具包

- [x] 发布命令行工具
- [x] 开发命令行工具（将包符号链接到可用的应用程序）

## 控制台

- [x] 分离 web 和控制台应用程序
- [x] 可能消除基础应用程序（仍然需要）
- [x] 为控制台创建接口（使用 Symfony 的）
- [x] 实现可能是流行的之一（使用 Symfony 的）
- [x] 确保应用程序可以通过配置添加命令

## 文档

- [ ] 遵循最佳实践。
- [ ] 不要使用“MVC”术语。
- [ ] 从 Yii 2 升级。

## RBAC

RBAC 实现为 [独立于框架的包](https://github.com/yiisoft/rbac)。

- [x] 完成重构。
- [x] 确保它遵循最佳实践。
- [x] 将驱动程序拆分为包。

## 视图

视图实现为 [独立于框架的包](https://github.com/yiisoft/view)。

- [x] 完成重构（[查看 issue](https://github.com/yiisoft/view/issues)）。
- [x] 移植小部件。
- [x] 重新思考并实现活动表单小部件。
- [x] 实现缓存小部件。

## 数据抽象和网格

- [x] 完成 [数据抽象](https://github.com/yiisoft/data)。
- [x] 移植排序，使用数据抽象。应该是
  [yii-dataview](https://github.com/yiisoft/yii-dataview) 的一部分。
- [x] 移植分页，使用数据抽象。应该是
  [yii-dataview](https://github.com/yiisoft/yii-dataview) 的一部分。
- [x] 移植网格，使用数据抽象。应该是
  [yii-dataview](https://github.com/yiisoft/yii-dataview) 的一部分。
- [x] 移植列表，使用数据抽象。应该是
  [yii-dataview](https://github.com/yiisoft/yii-dataview) 的一部分。

## 验证器

- [x] 完成 [主包](https://github.com/yiisoft/validator) 重新设计
- [x] 移植必要的验证器

## 调试工具栏

- [x] 移植调试工具栏。

## Gii

- [x] 移植 Gii。

## 基础设施

- [x] 为 [config](https://github.com/yiisoft/config) 编写测试。
- [x] 发布稳定的 [config](https://github.com/yiisoft/config)。

## 其他

- [x]
  [决定命名空间](https://forum.yiiframework.com/t/lowercase-or-camelcase-namespaces/124983/52)。
- [x]
  [清理错误处理器](https://github.com/yiisoft/yii2/issues/14348)。确保错误处理器捕获致命错误并使用响应。
- [x] 使验证器独立于模型，以允许在处理器中重用它们。
- [x] [拆分 IdentityInterface](https://github.com/yiisoft/yii2/issues/13825)。
