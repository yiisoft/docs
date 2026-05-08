# Static analysis and code quality

The Yii application template includes static analysis and code quality tools
alongside the test suite.

## Psalm

Run Psalm locally:

```shell
vendor/bin/psalm
```

Run Psalm in Docker:

```shell
make psalm
```

The template stores Psalm configuration in `psalm.xml`. The GitHub Actions
workflow runs Psalm for supported PHP versions.

When Psalm reports an issue, fix the code or add a precise type
annotation. Keep suppressions narrow and local to the line or method that
needs them.

## Composer Dependency Analyser

Composer Dependency Analyser checks that `composer.json` matches the classes
used by the application.

Run it locally:

```shell
vendor/bin/composer-dependency-analyser --config=composer-dependency-analyser.php
```

Run it in Docker:

```shell
make composer-dependency-analyser
```

Use this check after adding or removing package usage in `src`, `config`, or
`tests`.

## PHP CS Fixer

PHP CS Fixer applies the project coding style from `.php-cs-fixer.php`.

Run it locally:

```shell
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
```

Run it in Docker:

```shell
make cs-fix
```

Commit formatting changes together with the code that needs them.

## Rector

Rector applies configured code upgrades and refactorings from `rector.php`.

Preview changes locally:

```shell
vendor/bin/rector --dry-run
```

Apply changes locally:

```shell
vendor/bin/rector
```

Run it in Docker:

```shell
make rector
```

Review Rector changes before committing them. Automated refactoring can
change behavior when custom rules or broad paths are configured.

## Pull request checks

A practical local check before opening a pull request is:

```shell
APP_ENV=test vendor/bin/codecept build
APP_ENV=test vendor/bin/codecept run
vendor/bin/psalm
vendor/bin/composer-dependency-analyser --config=composer-dependency-analyser.php
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
```

With Docker:

```shell
make codecept build
make test
make psalm
make composer-dependency-analyser
make cs-fix
```
