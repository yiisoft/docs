# Packages

Reusable code could be released as [Composer package](https://getcomposer.org/doc/05-repositories.md#package).
It could be an infrastructure library, a module representing one of the application contexts or, basically, any
reusable code.

## Using packages <span id="using-packages"></span>

By default, Composer installs packages registered on [Packagist](https://packagist.org/) - the biggest repository
for open source PHP packages. You can look for packages on Packagist. You may also
[create your own repository](https://getcomposer.org/doc/05-repositories.md#repository) and configure Composer
to use it. This is useful if you are developing private packages that you want to share within your projects only.

Packages installed by Composer are stored in the `vendor` directory of your project. 
Because Composer is a dependency manager, when it installs a package, it will also install all its dependent packages.

> Warning: `vendor` directory of your application should never be modified.

A package could be installed with the following command:

```
composer install vendor-name/package-name
```

After it is done, Composer modifies `composer.json` and `composer.lock`. The former defines what packages to install,
and their version constraints the later stores a snapshot of exact versions actually installed.

Classes from the package will be available immediately via [autoloading](../concept/autoloading.md).

## Creating packages <span id="creating-packages"></span>


You may consider creating a package when you feel the need to share with other people your great code.
A package can contain any code you like, such as a helper class, a widget, a service, a middleware, whole module, etc.

Below are the basic steps you may follow.

1. Create a project for your package and host it on a VCS repository, such as [github.com](https://github.com).
   The development and maintenance work for the package should be done on this repository.
2. Under the root directory of the project, create a file named `composer.json` as required by Composer. Please
   refer to the next subsection for more details.
3. Register your package with a Composer repository, such as [Packagist](https://packagist.org/), so that
   other users can find and install your package using Composer.


### `composer.json` <span id="composer-json"></span>

Each Composer package must have a `composer.json` file in its root directory. The file contains the metadata about
the package. You may find complete specification about this file in the [Composer Manual](https://getcomposer.org/doc/01-basic-usage.md#composer-json-project-setup).
The following example shows the `composer.json` file for the `yiisoft/yii-widgets` package:

```json
{
    "name": "yiisoft/yii-widgets",
    "type": "library",
    "description": "Yii widgets collection",
    "keywords": [
        "yii",
        "widgets"
    ],
    "homepage": "https://www.yiiframework.com/",
    "license": "BSD-3-Clause",
    "support": {
        "issues": "https://github.com/yiisoft/yii-widgets/issues?state=open",
        "forum": "https://www.yiiframework.com/forum/",
        "wiki": "https://www.yiiframework.com/wiki/",
        "irc": "irc://irc.freenode.net/yii",
        "source": "https://github.com/yiisoft/yii-widgets"
    },
    // package dependencies
    "require": { 
        "php": "^7.4",
        "yiisoft/cache": "^3.0@dev",
        "yiisoft/view": "^3.0@dev",
        "yiisoft/widget": "^3.0@dev"
    },
    // development depdendencies
    "require-dev": {
        "yiisoft/composer-config-plugin": "^1.0@dev",
        "phpunit/phpunit": "^8.4",
        "phan/phan": "^2.4",
        "yiisoft/di": "^3.0@dev",
        "yiisoft/event-dispatcher": "^3.0@dev",
        "yiisoft/log": "^3.0@dev"
    },
    // class autoloading configuration
    "autoload": {
        "psr-4": {
            "Yiisoft\\Yii\\Widgets\\": "src"
        }
    },
    // development class autoloading configuration
    "autoload-dev": {
        "psr-4": {
            "Yiisoft\\Yii\\Widgets\\Tests\\": "tests"
        }
    },
    "extra": {
        "config-plugin": {
            "tests": "config/tests.php"
        }
    },
    "config": {
        "sort-packages": true
    }
}
```


#### Package Name <span id="package-name"></span>

Each Composer package should have a package name which uniquely identifies the package among all others.
The format of package names is `vendorName/projectName`. For example, in the package name `yiisoft/yii-queue`,
the vendor name and the project name are `yiisoft` and `yii-queue`, respectively.

> Warning: Do NOT use `yiisoft` as your vendor name as it is reserved for use by the Yii itself.

We recommend you prefix `yii-` to the project name for packages that are not able to work as general PHP
packages and require Yii application. This will allow users to more easily tell whether a package is Yii specific.


#### Dependencies <span id="dependencies"></span>

If your extension depends on other packages, you should list them in `require` section of `composer.json`.
Make sure you also list appropriate version constraints (e.g. `^1.0`, `@stable`) for each dependent package.
Use stable dependencies when your extension released in a stable version.

#### Class Autoloading <span id="class-autoloading"></span>

In order for your classes to be autoloaded, you should specify the `autoload` entry in the `composer.json` file,
like shown below:

```json
{
    // ....

    "autoload": {
        "psr-4": {
            "MyVendorName\\MyPackageName\\": "src"
        }
    }
}
```

You may list one or multiple root namespaces and their corresponding file paths.

### Recommended Practices <span id="recommended-practices"></span>

Because packages are meant to be used by other people, you often need to make an extra effort during development.
Below we introduce some common and recommended practices in creating high quality extensions.


#### Testing <span id="testing"></span>

You want your package to run flawlessly without bringing problems to other people. To reach this goal, you should
test your extension before releasing it to public.

It is recommended that you create various test cases to cover your extension code rather than relying on manual tests.
Each time before you release a new version of your package, you may run these test cases to make sure
everything is in good shape. For more details, please refer to the [Testing](../testing/overview.md) section.


#### Versioning <span id="versioning"></span>

You should give each release of your extension a version number (e.g. `1.0.1`). We recommend you follow the
[semantic versioning](http://semver.org) practice when determining what version numbers should be used.


#### Releasing <span id="releasing"></span>

To let other people know about your package, you need to release it to the public.

If it is the first time you are releasing a package, you should register it on a Composer repository, such as
[Packagist](https://packagist.org/). After that, all you need to do is simply create a release tag (e.g. `v1.0.1`)
on the VCS repository of your extension and notify the Composer repository about the new release. People will
then be able to find the new release, and install or update the package through the Composer repository.

In the releases of your package, in addition to code files, you should also consider including the following to
help other people learn about and use your extension:

* A readme file in the package root directory: it describes what your extension does and how to install and use it.
  We recommend you write it in [Markdown](http://daringfireball.net/projects/markdown/) format and name the file
  as `README.md`.
* A changelog file in the package root directory: it lists what changes are made in each release. The file
  may be written in Markdown format and named as `CHANGELOG.md`.
* An upgrade file in the package root directory: it gives the instructions on how to upgrade from older releases
  of the extension. The file may be written in Markdown format and named as `UPGRADE.md`.
* Tutorials, demos, screenshots, etc.: these are needed if your extension provides many features that cannot be
  fully covered in the readme file.
* API documentation: your code should be well documented to allow other people to more easily read and understand it.
