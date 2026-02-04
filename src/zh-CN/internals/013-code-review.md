# 013 — 代码审查

代码审查对项目的成功至关重要，与贡献代码同样重要。

审查通过 GitHub pull request 处理。当请求准备好审查时，会添加“status: code review”标签。

[需要审查的 pull request
完整列表](https://github.com/search?q=org%3Ayiisoft+label%3A"status%3Acode+review"&state=open&type=Issues)
可在 GitHub 上查看。

## 指南

- 检出 pull request 分支，在 IDE 中打开项目，了解全局。
- pull request 整体上是否合理？
- 使用 pull request 中的代码运行测试和/或应用程序。这些是否正常？
- 阅读 pull request 中的所有代码行。
- 能否做得更简单？
- 是否存在安全问题？
- 是否存在性能问题？
- 留下评论时，要有礼貌。
- 避免代码格式化方面的评论。

## 必需部分

- [ ] 没有代码时失败、有代码时通过的测试。
- [ ] 类型提示。
- [ ] `declare(strict_types=1)`.
- [ ] 文档：phpdoc，yiisoft/docs。
- [ ] 变更日志条目（如果包是稳定的）。
