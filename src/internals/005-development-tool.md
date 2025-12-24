# 005 — Yii development tool

For Yii3, the number of packages increased significantly to achieve more reusability and independent releases.
To ease development of the framework itself, we've created a special tool available from [yiisoft/yii-dev-tool](https://github.com/yiisoft/yii-dev-tool).

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

There are many commands available. The most important ones are `install` and `update`. What it does is:

1. Install/update all packages listed in [`packages.php`](https://github.com/yiisoft/yii-dev-tool/blob/master/packages.php)
   or individual package from that list if specified.
2. For every package installed check `vendor` directory for packages listed in `packages.php`.
   If there is any, replace the package directory with a symlink to another package source.

As a result, you will have many packages using each other, so there is no need to `git push` and `composer install` / `composer update`
during development.

A [detailed example](https://github.com/yiisoft/yii-dev-tool#usage-example) of using the tool is available in its README.
