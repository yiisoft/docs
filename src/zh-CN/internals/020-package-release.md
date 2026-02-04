# 020 — 包发布

## 标准

- 没有关键问题。
- 公共 API 不太可能更改。已经过了一段时间，没有报告可能需要 API 更改的问题。
- 所有依赖项都是稳定的。
- 接近 100% 的测试覆盖率，理想情况下 MSI 分数为 100%。
- README 没问题。
- 除特殊情况外，所有内容都有类型提示。
- Psalm 分析至少通过 2 级。
- phpdoc 没问题。
- 公共 API 没问题。

## 发布说明

通过 [Yii 开发工具](005-development-tool.md) 发布包。

1. 检查您是否可以在本地签署提交（参见
[签署提交](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)）。

2. 从 `master` 分支拉取最新更改：

```shell
./yii-dev git/checkout master package-name
./yii-dev git/pull package-name
```

3. 检查包是否符合上述标准。

4. 运行 `release/make` 命令：

```shell
./yii-dev release/make package-name
```

5. 选择版本类型（major、minor 或 patch）。

6. 在问题“Push commits and tags, and release on GitHub?”上检查差异。如果差异没问题，回答 "yes"。

7. 对于主要和次要版本，在 [Yii Framework News](https://www.yiiframework.com/news)
   上添加带有发布说明的记录。
