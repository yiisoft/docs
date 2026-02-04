# What is Yii

Yii 是一个高性能、基于包的 PHP 框架，用于开发现代应用程序。Yii（发音为 `Yee` 或
`[ji:]`）在中文中意为“简单且不断演进”。你也可以把它看作是 **Yes It Is**（是的，就是它）的首字母缩写！

## What's Yii best for

Yii 是一个通用的 Web 编程框架。你可以使用它来开发各种类型的 PHP Web
应用程序。由于其架构和完善的缓存支持，它特别适合开发大型应用程序，如门户网站、内容管理系统、电子商务、REST API 等。

## How does Yii compare with other frameworks?

If you're already familiar with another framework, you may appreciate
knowing how Yii compares:

- Yii takes the [philosophy of being practical and
  helpful](../../internals/001-yii-values.md) achieving:
  - Performance in both development and execution.
  - Convenient customizable defaults.
  - Practice-orientation.
  - Simplicity.
  - Explicitness.
  - Consistency.
  
  Yii will never try to over-design things mainly to follow some design patterns.
- Yii extensively uses PSR interfaces with the ability to reuse what PHP community created and even
  replace core implementations if needed.
- Yii is both a set of libraries and a full-stack framework providing many proven and ready-to-use features:
  caching, logging, template engine, data abstraction, development tools, code generation, and more.
- Yii is extensible. You can customize or replace every piece of the core's code. You can also
  take advantage of Yii's solid architecture to use or develop redistributable packages.
- High performance is always a primary goal of Yii.

Yii is backed up by a [strong core developer
team](https://www.yiiframework.com/team/) financially backed from an
[OpenCollective foundation](https://opencollective.com/yiisoft), as well as
a large community of professionals constantly contributing to Yii's
development. The Yii developer team keeps a close eye on the latest Web
development trends and on the best practices and features found in other
frameworks and projects. The most relevant best practices and features found
elsewhere are incorporated into the core framework and exposed via simple
and elegant interfaces.


## Yii versions

Yii currently has three major versions available: 1.1, 2.0, and 3.0.

- Version 1.1 is the old generation and is now in the feature freeze bugfix
  mode.
- Version 2.0 is a current stable version in the feature freeze bugfix mode.
- Version 3.0 is the current version in development. This guide is mainly
  about version 3.


## Requirements and prerequisites

Yii3 requires PHP 8.2 or above, but some packages work with older PHP, such
as PHP 7.4.

Using Yii requires basic knowledge of object-oriented programming (OOP), as
Yii is a pure OOP-based framework.  Yii3 also makes use of the latest PHP
features, such as type declarations and generators. Understanding these
concepts will help you pick up Yii3 faster.

