# 005 - Yii Development Tool

For Yii 3 the number of packages increased significantly in order to achieve more reusability and independent releases.
In order to ease development we have created a special tool available from [yiisoft/yii-dev](https://github.com/yiisoft/yii-dev).

```
$ ./yii-dev
  _   _  _  _
 | | | |(_)(_)
 | |_| || || |  Development Tool
  \__, ||_||_|
  |___/         for Yii 3.0

This tool helps with setting up a development environment for Yii 3 packages.

Usage: ./yii-dev <command>

Available Commands:

  install             Install all packages listed in packages.php
  install <package>   Install a single package. <package> refers to the array key in packages.php
  status              Show stats summary about all packages.
  lint                Check packages for common mistakes.
```

There are multiple commands available. The most important one is `install`. What it does is:

1. Install all packages listed in [`packages.php`](https://github.com/yiisoft/yii-dev/blob/master/packages.php)
   or individual package from that list if specified.
2. For every packages installed check `vendor` directory for packages listed in `packages.php`. If there are any,
   replace package directory with a symlink to another package source.

As a result you will have multiple packages using each other so there is no need to `git push` and `composer update`
during development.
