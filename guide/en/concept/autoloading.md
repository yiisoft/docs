# Class autoloading

Since Yii uses [Composer](https://getcomposer.org/) to manage packages, it automatically loads classes from these packages
without the need to `require` their file explicitly. When it installs packages, 
a [PSR-0 compatible autoloader](https://www.php-fig.org/psr/psr-4/) is generated. To use it, `require_once`
autoloader `/vendor/autoload.php` in your `index.php` entry point file. 

You can use autoloader not only for the packages installed but for your application as well since it is also a package.
To load classes of a certain namespace, the following should be added to `composer.json`:

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

## References

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Composer guide on autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
