# Upgrading from Version 2.0

> If you haven't used Yii 2.0, you can skip this section and get directly to "[getting started](../start/prerequisites.md)"
> section.

While sharing some common ideas and values, Yii3 is conceptually different from Yii 2.0. There is no easy upgrade
path, so first [check maintenance policy and end-of-life dates for Yii 2.0](https://www.yiiframework.com/release-cycle)
and consider starting new projects on Yii3 while keeping existing ones on Yii 2.0.

## PHP requirements

Yii3 requires PHP 8.2 or above. As a result, there are language features used that weren't used in Yii 2.0:

- [Type declarations](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Return type declarations](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Class constant visibility](https://www.php.net/manual/en/language.oop5.constants.php)
- [Named arguments](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)
- [Anonymous classes](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generators](https://www.php.net/manual/en/language.generators.php)
- [Variadic functions](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)
- [Readonly properties](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.readonly-properties)
- [Readonly classes](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.readonly)
- [Constructor property promotion](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion)
- [Attributes](https://www.php.net/manual/en/language.attributes.php)

## Preliminary refactoring

It's a good idea to refactor your Yii 2.0 project before porting it to Yii3. That would both make porting easier
and benefit the project in question while it's not moved to Yii3 yet.

### Use DI instead of the service locator

Since Yii3 is forcing you to inject dependencies, it's a good idea to prepare and switch from using
service locator (`Yii::$app->`) to [DI container](https://www.yiiframework.com/doc/guide/2.0/en/concept-di-container).

If usage of DI container is problematic for whatever reason, consider moving all calls to `Yii::$app->` to controller
actions and widgets and passing dependencies manually from a controller to what needs them.

See [Dependency injection and container](../concept/di-container.md) for an explanation of the idea.

### Introduce repositories for getting data

Since Active Record isn't the only way to work with a database in Yii3, consider introducing repositories that would
hide details of getting data and gather them in a single place. You can later redo it: 

```php
final readonly class PostRepository
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

In case you have a rich complicated domain, it's a good idea to separate it from infrastructure provided by a framework
that's all the business logic has to go to framework-independent classes.

### Move more into components

Yii3 services are conceptually similar to Yii 2.0 components, so it's a good idea to move reusable parts of your application
into components.

## Things to learn

### Docker

Default application templates are using [Docker](https://www.docker.com/get-started/) to run application.
It's a good idea to learn how to use it and use it for your own projects since it provides a lot of benefits:

1. Exactly the same environment as in production.
2. No need to install anything except Docker itself.
3. Environment is per application, not per server.

### Environment variables

Yii3 application templates are using [environment variables](https://en.wikipedia.org/wiki/Environment_variable)
to configure parts of the application. The concept is [very handy for Dockerized applications](https://12factor.net/)
but might be alien to users of Yii 1.1 and Yii 2.0.

### Handlers

Unlike Yii 2.0, Yii3 doesn't use controllers. Instead, it uses [handlers](../structure/handler.md) which
are similar to controllers but different.

### Application structure

Suggested Yii3 application structure is different from Yii 2.0. 
It's described in [application structure](../structure/overview.md).

Despite that, Yii3 is flexible, so it's still possible to use a structure similar to Yii 2.0 with Yii3.
