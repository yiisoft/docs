# 005 - Yii Development Tool

For Yii 3 the number of packages increased significantly in order to achieve more reusability and independent releases.
In order to ease development of the framework itself we have created a special tool available from [yiisoft/yii-dev](https://github.com/yiisoft/yii-dev).

```
$ ./yii-dev                                                                                                                                 _   _  _  _
 | | | |(_)(_)
 | |_| || || |  Development Tool
  \__, ||_||_|
  |___/         for Yii 3.0

This tool helps with setting up a development environment for Yii 3 packages.

Usage: ./yii-dev <command>

Available Commands:

  install             Install all packages listed in packages.php or package specified
  install <package>   Install a single package. <package> refers to the array key in packages.php
  update              Update all packages listed in packages.php or package specified
  update <package>    Update a single package. <package> refers to the array key in packages.php
  status              Show git status for all packages
  replicate           Copy files specified in replicate.php into each package or package specified
  commit              Add and commit changes into each repository
  push                Push changes into each repository
  lint                Check packages for common mistakes
```

There are multiple commands available. The most important ones are `install` and `update`. What it does is:

1. Install/update all packages listed in [`packages.php`](https://github.com/yiisoft/yii-dev/blob/master/packages.php)
   or individual package from that list if specified.
2. For every packages installed check `vendor` directory for packages listed in `packages.php`. If there are any,
   replace package directory with a symlink to another package source.

As a result you will have multiple packages using each other so there is no need to `git push` and `composer install` / `composer update`
during development.


> Note: In case you are using PhpStorm you have to add `yiisoft` exclusion pattern in "Settings → Directories → Exclude Files".
> Else it would go into infinite indexing cycle.
