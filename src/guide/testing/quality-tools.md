# Static analysis and mutation testing

Static analysis checks code without running it. Mutation testing changes small parts of the source code and checks
whether tests fail. Use both with the test suite.

## Static analysis

Install Psalm:

```shell
composer require --dev vimeo/psalm
vendor/bin/psalm --init
```

Run it:

```shell
vendor/bin/psalm
```

Add a Composer script:

```json
{
  "scripts": {
    "psalm": "psalm --no-progress"
  }
}
```

If the project uses PHPStan, install and configure it:

```shell
composer require --dev phpstan/phpstan
```

Create `phpstan.neon`:

```neon
parameters:
    level: 6
    paths:
        - src
        - tests
```

Run it:

```shell
vendor/bin/phpstan analyse
```

## Mutation testing

Install Infection:

```shell
composer require --dev infection/infection
```

Create `infection.json5`:

```json5
{
  "$schema": "vendor/infection/infection/resources/schema.json",
  "source": {
    "directories": [
      "src"
    ]
  },
  "phpUnit": {
    "configDir": "."
  },
  "logs": {
    "text": "runtime/infection.log"
  },
  "mutators": {
    "@default": true
  }
}
```

Run it:

```shell
vendor/bin/infection --threads=max
```

For a large application, start with one path:

```shell
vendor/bin/infection --filter=src/Shared
```

Add CI thresholds after the first clean run:

```shell
vendor/bin/infection --threads=max --min-msi=80 --min-covered-msi=90
```

## CI command

A pull request check can run:

```shell
composer install --no-interaction --prefer-dist
composer test
vendor/bin/psalm
vendor/bin/infection --threads=max --min-msi=80 --min-covered-msi=90
```

Run mutation testing less often if it is too slow for every pull request. Static analysis and unit tests should run on
every change.
