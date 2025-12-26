# What is Yii

Yii is a high-performance, package-based PHP framework for developing modern applications.
The name Yii (pronounced `Yee` or `[ji:]`) means "simple and evolutionary" in Chinese.
You can also think about it as an acronym for **Yes It Is**!

## What's Yii best for

Yii is a generic Web programming framework.
You can use it for developing all kinds of Web applications using PHP.
Because of its architecture and sophisticated caching support,
it's especially suitable for developing large-scale applications such as portals, content management systems,
e-commerce, REST APIs, etc.

## How does Yii compare with other frameworks?

If you're already familiar with another framework, you may appreciate knowing how Yii compares:

- Yii takes the [philosophy of being practical and helpful](../../internals/001-yii-values.md) achieving:
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

Yii is backed up by a [strong core developer team](https://www.yiiframework.com/team/) financially backed from an
[OpenCollective foundation](https://opencollective.com/yiisoft), as well as a large community of professionals constantly
contributing to Yii's development. The Yii developer team keeps a close eye on the latest Web development trends and
on the best practices and features found in other frameworks and projects. The most relevant best practices and features
found elsewhere are incorporated into the core framework and exposed via simple and elegant interfaces.


## Yii versions

Yii currently has three major versions available: 1.1, 2.0, and 3.0.

- Version 1.1 is the old generation and is now in the feature freeze bugfix mode.
- Version 2.0 is a current stable version in the feature freeze bugfix mode.
- Version 3.0 is the current version in development. This guide is mainly about version 3.


## Requirements and prerequisites

Yii3 requires PHP 8.2 or above, but some packages work with older PHP, such as PHP 7.4.

Using Yii requires basic knowledge of object-oriented programming (OOP), as Yii is a pure OOP-based framework.
Yii3 also makes use of the latest PHP features, such as type declarations and generators. Understanding these
concepts will help you pick up Yii3 faster.

