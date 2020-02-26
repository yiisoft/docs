# Class autoloading

Since Yii uses [Composer](https://getcomposer.org/) to manage packages, classes from these packages are automatically
loaded without the need to `require` their file explicitly. When packages are installed,
a [PSR-0 compatible autoloader](https://www.php-fig.org/psr/psr-4/) is generated. In order to use it, `require_once`
autoloader `/vendor/autoload.php` in your `index.php` entry point file. 

Autoloader is used not only for the packages being installed but for your application, that is also a package. In
order to load classes of a certain namespace, the following should be added to `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Where `App\\` is a root namespace and `src/` is a directory where classes are located. You can add more source roots if
needed. When done, execute `composer dump-autoload` and classes from the corresponding namespaces will be loaded
automatically.


## References

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Composer guide on autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
