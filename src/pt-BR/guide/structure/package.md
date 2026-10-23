# Using packages

Reusable code is distributed as [Composer
packages](https://getcomposer.org/doc/05-repositories.md#package).  A
package can be an infrastructure library, a Yii integration, a reusable
feature, or a module representing an application context.

This page explains how to use packages in an application. To create a
Yii-aware package, see [Designing packages for Yii
applications](designing-packages.md).

## Installing packages

By default, Composer installs packages registered on
[Packagist](https://packagist.org/), the main repository for open source PHP
packages.

Install a package with:

```sh
composer require vendor-name/package-name
```

Composer updates two files:

- `composer.json` stores the package name and version constraint.
- `composer.lock` stores the exact versions installed.

Commit both files so other environments install the same dependency
versions.

Installed packages are stored in the application `vendor/` directory.

> [!WARNING]
> Never edit files in `vendor/` directly. Change application configuration, extend classes, decorate services, or
> contribute fixes to the package instead.

Package classes are available through Composer autoloading after
installation. See [Autoloading](../concept/autoloading.md)  for details.

## Updating packages

Update a package within the version constraint recorded in `composer.json`:

```sh
composer update vendor-name/package-name
```

Change the accepted version constraint with `composer require`:

```sh
composer require vendor-name/package-name:^2.0
```

After updating a Yii-aware package, Composer rebuilds Yii's configuration
merge plan. If you changed configuration group mappings manually, rebuild it
explicitly:

```sh
composer yii-config-rebuild
```

## Removing packages

Remove a package with:

```sh
composer remove vendor-name/package-name
```

Then remove application code and configuration that referenced classes,
services, routes, commands, assets, migrations, or translations from that
package.

## Private packages

For private code, configure Composer repositories in the application
`composer.json`. Common options are:

- `vcs` for a Git repository.
- `path` for a local package during development.
- `composer` for a private Composer repository.

For example, to work with a package located next to the application:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/blog"
        }
    ]
}
```

Then install it normally:

```sh
composer require vendor/blog
```

Read more in the [Composer repository
documentation](https://getcomposer.org/doc/05-repositories.md).

## Package configuration

Some Yii packages provide default configuration through
[yiisoft/config](https://github.com/yiisoft/config).  After installation,
the package configuration becomes part of the vendor layer and the
application can override it in the root package configuration.

Prefer partial overrides in application config files over copying whole
package config files. For example, override only the parameter or service
definition you need.

For more details, see [Configuration](../concept/configuration.md) and
[Designing packages for Yii applications](designing-packages.md).
