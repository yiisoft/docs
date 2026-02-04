# 005 — Yii 开发工具

对于 Yii3，为了实现更好的可重用性和独立发布，包的数量显著增加。为了简化框架本身的开发，我们创建了一个特殊的工具，可从
[yiisoft/yii-dev-tool](https://github.com/yiisoft/yii-dev-tool) 获取。

```
$ ./yii-dev
  _   _  _  _
 | | | |(_)(_)  Development Tool
 | |_| || || |
  \__, ||_||_|  for Yii 3.0
  |___/

This tool helps with setting up a development environment for Yii 3 packages.

Usage:
  command [options] [arguments]

Options:
  -h, --help  Display this help message

Available commands:
  checkout-branch  Creates, if not exists, and checkout a git branch
  commit           Add and commit changes into each package repository
  install          Install packages
  lint             Check packages according to PSR12 standard
  pull             Pull changes from package repositories
  push             Push changes into package repositories
  replicate        Copy files specified in replicate.php into each package
  status           Show git status of packages
  update           Update packages
```

有许多可用的命令。最重要的是 `install` 和 `update`。它的作用是：

1. 安装/更新
   [`packages.php`](https://github.com/yiisoft/yii-dev-tool/blob/master/packages.php)
   中列出的所有包，或者如果指定了，则安装/更新该列表中的单个包。
2. 对于每个已安装的包，检查 `vendor` 目录中是否有 `packages.php`
   中列出的包。如果有，则将包目录替换为指向另一个包源的符号链接。

因此，您将拥有许多相互使用的包，所以在开发过程中无需执行 `git push` 和 `composer install` / `composer
update`。

工具的 [详细使用示例](https://github.com/yiisoft/yii-dev-tool#usage-example) 可在其
README 中找到。
