# 002 — Issue 工作流程

处理传入 issue 的流程如下：

![Issue 工作流程图](/images/internals/002-issue-workflow.svg)

## 角色

我们有多个角色：

- 流程管理员 - 初步分类 issue 并管理标签。
- 决策者 - 参与讨论并推动解决方案。
- Bug 猎人 - 验证 bug。
- 贡献者 - 为 pull request 创建代码。
- 代码审查员 - 审查 pull request。

一个人可以在 issue 解决过程中担任一个或多个角色。

## 标签

我们使用标签标记许多内容：当前状态、issue 类型、受影响的组件。状态标签不言自明。

## 里程碑

除非 issue 是关键的或存在一个可能不错的 pull request，否则不会将其分配到里程碑。
