# Upgrading from Version 2.0

> If you haven't used Yii2, you can skip this section and get directly to "[getting started](../start/installation.md)"
> section.

While sharing some common ideas and values, Yii 3 is conceptually different from Yii 2. There is no easy upgrade
path, so first [check maintenance policy and end of life dates for Yii 2](https://www.yiiframework.com/release-cycle)
and consider starting new projects on Yii 3 while keeping existing ones on Yii 2.

## PHP requirements

Yii3 requires PHP 8.0 or above. As a result, there are language features used that weren't used in Yii 2:

- [Type declarations](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Return type declarations](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Class constant visibility](https://www.php.net/manual/en/language.oop5.constants.php)
- [Anonymous classes](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generators](https://www.php.net/manual/en/language.generators.php)
- [Variadic functions](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)

## Preliminary refactoring

It's a good idea to refactor your Yii 2 project before porting it to Yii 3. That would both make porting easier
and benefit the project in question while it's not moved to Yii 3 yet.

### Use DI instead of service locator

Since Yii 3 is forcing you to inject dependencies, it's a good idea to prepare and switch from using
service locator (`Yii::$app->`) to [DI container](https://www.yiiframework.com/doc/guide/2.0/en/concept-di-container).

If usage of DI container is problematic for whatever reason, consider moving all calls to `Yii::$app->` to controller
actions and widgets and passing dependencies manually from a controller to what needs them.

See [Dependency injection and container](../concept/di-container.md) for an explanation of the idea.

### Introduce repositories for getting data

Since Active Record isn't the only way to work with a database in Yii 3, consider introducing repositories that would
hide details of getting data and gather them in a single place you can later re-do: 

```php
class PostRepository
{
    public function getArchive()
    {
        // ...
    }
    
    public function getTop10ForFrontPage()
    {
        // ...
    }

}
```

### Separate domain layer from infrastructure

In case you have a rich complicated domain, it's a good idea to separate it from infrastructure provided by framework
that's all the business logic has to go to framework-independent classes.

### Move more into components

Yii 3 services are conceptually similar to Yii 2 components, so it's a good idea to move reusable parts of your application
into components.
