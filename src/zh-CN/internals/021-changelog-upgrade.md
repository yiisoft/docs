# 021 — 变更日志和升级

对于所有已发布的包，我们都有详细的变更日志和升级指南。

## 变更日志

每个发布的版本都会编写变更日志。文件名为 `CHANGELOG.md`。格式如下：

```markdown
# My package Change Log

## 1.0.2 under development

- no changes in this release.

## 1.0.1 March 23, 2021

- Bug #42: Short description of the change (@author1, @author2)

## 1.0.0 February 02, 2021

- Initial release.
```

其中“My package”是包的名称，`1.0.1` 是发布的版本，后面跟着发布日期。对于每个版本，都有多行列出变更内容。"Bug"
指的是变更类型。使用以下类型：

- New — 新功能。
- Chg — 一般变更。
- Enh — 现有功能增强。
- Bug — Bug 修复。

在变更日志文件中，行应按 New、Chg、Enh、Bug 的顺序排列。

上面的“#42”是对应变更的 issue 或 pull request 编号。“author1”是代码作者的 GitHub
昵称。“author2”是额外的作者。作者的昵称必须以 `@` 为前缀。

## 升级

当有新的主版本与之前的版本不兼容时，会创建升级指南。它描述了升级应用程序代码所需的步骤。

文件名为 `UPGRADE.md`。格式如下：

```markdown
# Upgrading Instructions for my package

This file contains the upgrade notes. These notes highlight changes that could break your
application when you upgrade the package from one version to another.

> **Important!** The following upgrading instructions are cumulative. That is, if you want
> to upgrade from version A to version C and there is version B between A and C, you need
> to follow the instructions for both A and B.

## Upgrade from 2.x

- Public method `test()` was removed. Use `perform()` instead.

## Upgrade from 1.x

- Clean up the cache after upgrading. Old cache is not compatible with new code.
```
