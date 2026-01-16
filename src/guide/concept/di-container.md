# Dependency injection and container

## Dependency injection <span id="dependency-injection"></span>

There are two ways of re-using things in OOP: inheritance and composition.

Inheritance is simple:

```php
class Cache
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget extends Cache
{
    public function render(): string
    {
        $output = $this->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

The issue here is that these two are becoming unnecessarily coupled or inter-dependent, making them more fragile.

Another way to handle this is composition:

```php
interface CacheInterface
{
    public function getCachedValue($key);
}

final readonly class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget
{
    public function __construct(
        private CacheInterface $cache
    )
    {
    }
    
    public function render(): string
    {
        $output = $this->cache->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

We've avoided unnecessary inheritance and used `CacheInterface` in the `CacheWidget` to reduce coupling.
You can replace cache implementation without changing `CachedWidget` so it's becoming more stable. The less
edits are made to the code, the less chance of breaking it.

The `CacheInterface` here is a dependency: a contract our object needs to function. In other words, our object
depends on the contract.

The process of putting an instance of a contract into an object (`CachedWidget`) is called dependency injection.
There are many ways to perform it:

- Constructor injection. Best for mandatory dependencies.
- Method injection. Best for optional dependencies.
- Property injection. Better to be avoided in PHP except maybe data transfer objects.

### Why use private properties <span id="why-private-properties"></span>

In the composition example above, note that the `$cache` property is declared as `private`.

This approach embraces composition by ensuring objects have well-defined interfaces for interaction rather than
direct property access, making the code more maintainable and less prone to certain types of mistakes.

This design choice provides several benefits:

- **Encapsulation**: Private properties with getters/setters allow you to control access and make future changes
  without breaking existing code.
- **Data integrity**: Setters can validate, normalize, or format values before storing them, ensuring properties
  contain valid data.
- **Immutability**: Private properties enable immutable object patterns where setter `with*()` methods return
  new instances rather than modifying the current one.
- **Flexibility**: You can create read-only or write-only properties or add additional logic to property access later.


## DI container <span id="di-container"></span>

Injecting basic dependencies is straightforward. You're choosing a place where you don't care about dependencies,
which is usually an action handler, which you aren't going to unit-test ever, create instances of dependencies needed
and pass these to dependent classes.

It works well when there are few dependencies overall and when there are no nested dependencies. When there are
many and each dependency has dependencies itself, instantiating the whole hierarchy becomes a tedious process, which
requires lots of code and may lead to hardly debuggable mistakes.

Additionally, lots of dependencies, such as certain third-party API wrappers, are the same for any class using it.
So it makes sense to:

- Define how to instantiate such common dependencies.
- Instantiate them when required and only once per request.

That's what dependency containers are for.

A dependency injection (DI) container is an object that knows how to instantiate and configure objects and
all objects they depend on.

Yii provides the DI container feature through the [yiisoft/di](https://github.com/yiisoft/di) package and
[yiisoft/injector](https://github.com/yiisoft/injector) package.

> [!NOTE]
> The container contains only shared instances. If you need a factory, use the dedicated
> [yiisoft/factory](https://github.com/yiisoft/factory) package.

> [!TIP]
> [Martin Fowler's article](https://martinfowler.com/articles/injection.html) has well
> explained why DI container is useful. Here we will mainly explain the usage of the DI container provided by Yii.

### Configuring container <span id="configuring-container"></span>

Because to create a new object you need its dependencies, you should register them as early as possible.
You can do it in the application configuration, `config/web.php`. For the following service:

```php
final class MyService implements MyServiceInterface
{
    public function __construct(int $amount)
    {
    }

    public function setDiscount(int $discount): void
    {
    
    }
}
```

configuration could be:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

That's equal to the following:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

You can provide arguments with names as well:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => ['amount' => 42],
        'setDiscount()' => ['discount' => 10],
    ],
];
```

That's basically it. You define a map of interfaces to classes and define how to configure them. When an interface
is requested in constructor or elsewhere, container creates an instance of a class and configures it as per the configuration:

```php
final class MyAction
{
    public function __construct(
        private readonly MyServiceInterface $myService
    ) {
    }
    
    public function __invoke() 
    {
        $this->myService->doSomething();
    }
}
```

There are extra methods of declaring dependency configuration.

For simplest cases where there are no custom values needed and all the constructor dependencies could be obtained
from a container, you can use a class name as a value.

```php
interface EngineInterface
{
    
}

final class EngineMarkOne implements EngineInterface
{
    public function __construct(CacheInterface $cache) {
    }   
}
```

In the above example, if we already have cache defined in the container, nothing besides the class name is needed:

```php
return [
    // declare a class for an interface, resolve dependencies automatically
    EngineInterface::class => EngineMarkOne::class,
];
```

If you have a dependency that has public properties, you can configure it as well.


```php
final class NameProvider
{
    public string $name;
}
```

Here's how to do it for the example above:

```php
NameProvider::class => [
    'class' => NameProvider::class, 
    '$name' => 'Alex',
],
```

In this example, you may notice `NameProvider` specified twice. The key is what you may request as dependency and the
value is how to create it.

If the configuration is tricky and requires some logic, a closure can be used:

```php
MyServiceInterface::class => static function(ContainerInterface $container) {
    return new MyService($container->get('db'));
},
```

Additionally, to `ContainerInterface`, you can request any registered service directly as a closure parameter.
The injector will automatically resolve and inject these:

```php
MyServiceInterface::class => static function(ConnectionInterface $db) {
    return new MyService($db);
},
```

It's possible to use a static method call:

```php
MyServiceInterface::class => [MyFactory::class, 'create'],
```

Or an instance of an object:

```php
MyServiceInterface::class => new MyService(),
```

### Injecting dependencies properly <span id="injecting-dependencies"></span>

Directly referencing a container in a class is a bad idea since the code becomes non-generic,
coupled to the container interface and, what's worse, dependencies are becoming hidden. 
Because of that, Yii inverts the control by automatically injecting objects from a container in some constructors
and methods based on method argument types.

This is primarily done in constructor and handing method of action handlers:

```php
use \Yiisoft\Cache\CacheInterface;

final readonly class MyController
{
    public function __construct(
        private CacheInterface $cache
    )
    {
        $this->cache = $cache;    
    }

    public function actionDashboard(RevenueReport $report)
    {
        $reportData = $this->cache->getOrSet('revenue_report', function() use ($report) {
            return $report->getData();               
        });

        return $this->render('dashboard', [
           'reportData' => $reportData,
        ]);
    }
}
```

Since it's [yiisoft/injector](https://github.com/yiisoft/injector) that instantiates and calls action handler, it
checks the constructor and method argument types, gets dependencies of these types from a container and passes them as
arguments. That's usually called auto-wiring. It happens for sub-dependencies as well, that's if you don't give dependency
explicitly, the container would check if it has such a dependency first.
It's enough to declare a dependency you need, and it would be got from a container automatically.


## References <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern by Martin Fowler](https://martinfowler.com/articles/injection.html)
