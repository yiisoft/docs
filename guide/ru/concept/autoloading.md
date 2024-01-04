# Автозагрузка класоов

Поскольку Yii использует [Composer](https://getcomposer.org/) для управления пакетами, он автоматически загружает классы из пакетов без необходимости явно подключать их через `require`.
При установке пакетов он создает [автозагрузчик, совместимый с PSR-4](https://www.php-fig.org/psr/psr-4/).
Чтобы использовать его, подключите автозагрузчик `/vendor/autoload.php` через `require_once` в ваш файл точки входа`index.php`

You can use autoloader not only for the packages installed, but for your application as well since it's also a package.
To load classes of a certain namespace, add the following to `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Where `App\\` is a root namespace and `src/` is a directory where you have your classes. You can add more source roots if
needed. When done, execute `composer dump-autoload` or simply `composer du` and classes from the corresponding namespaces
will start loading automatically.

If you need development environment specific autoloading that isn't used when executing Composer with `--no-dev` flag,
add it to `autoload-dev` section instead of `autoload`.

## References

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Composer guide on autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
