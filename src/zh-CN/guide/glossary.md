# A

## alias

别名是 Yii 用于引用类或目录的字符串，例如 `@app/vendor`。详见[“别名”](concept/aliases.md)。

## asset

资源是指资源文件。通常包含 JavaScript 或 CSS 代码，但也可以是任何通过 HTTP
访问的静态内容。详见[“资源”](views/asset.md)。

# C

## configuration

配置既可以指设置对象属性的过程，也可以指存储对象或一类对象设置的配置文件。详见[“配置”](concept/configuration.md)。

# D

## DI

依赖注入是一种编程技术，通过该技术将依赖对象注入到另一个对象中。详见[“依赖注入与容器”](concept/di-container.md)。

# I

## installation

安装是按照 readme 文件或执行专门准备的脚本来使软件正常运行的过程。对于 Yii 而言，主要是设置权限和满足软件依赖要求。

# M

## middleware

中间件是请求处理栈中的一个处理器。对于给定的请求，它既可以直接生成响应，也可以执行某些操作后将处理传递给下一个中间件。详见[“中间件”](structure/middleware.md)。

## module

模块是根据使用场景对代码进行分组的命名空间。它通常在主应用程序中使用，可以包含任意源代码、定义额外的 URL 处理器或控制台命令。

# N

## namespace

命名空间是指一种 [PHP
语言特性](https://www.php.net/manual/en/language.namespaces.php)，用于将多个类归组到某个特定名称下。

# P

## package

包通常指 [Composer 包](https://getcomposer.org/doc/)，是可通过包管理器自动安装的、已准备好复用和再分发的代码。

# R

## rule

规则通常指 [yiisoft/validator](https://github.com/yiisoft/validator)
包的验证规则。它持有一组用于检查数据集是否有效的参数。“规则处理器”负责实际执行处理。

# Q

## queue

队列类似于栈，遵循先进先出（FIFO）原则。Yii 提供了
[yiisoft/queue](https://github.com/yiisoft/queue) 包。

# V

## vendor

Vendor 是指以包的形式提供代码的组织或个人开发者。也可以指 [Composer 的 `vendor`
目录](https://getcomposer.org/doc/)。
