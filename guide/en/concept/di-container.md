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

class CachedWidget extends Cache
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

The issue here is that these two are becoming unnecessarily coupled or inter-dependent making them more fragile.

Another way to handle it is composition:

```php
interface CacheInterface
{
    public function getCachedValue($key);
}

class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

class CachedWidget
{
    private CacheInterface $cache;

    public function __construct(CacheInterface $cache)
    {
        $this->cache = $cache;
    }
    
    public function render()
    {
        $output = $this->cache->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

In the above we've avoided unnecessary inheritance and used interface to reduce coupling. You can replace cache
implementation without changing `CachedWidget` so it is becoming more stable.

The process of getting an instance of `CacheInterface` into `CachedWidget` is called dependency injection.
There are multiple ways to perform it:

- Constructor injection. Best for mandatory dependencies.
- Method injection. Best for optional dependencies.
- Property injection. Better to be avoided in PHP except maybe data transfer objects.


## DI container <span id="di-container"></span>

Injecting basic dependencies is simple and easy. You're choosing a place where you don't care about dependencies,
which is usually action handler, which you aren't going to unit-test ever, create instances of dependencies needed
and pass these to dependent classes.

It works well when there aren't many dependencies overall and when there are no nested dependencies. When there are
many and each dependency has dependencies itself, instantiating the whole hierarchy becomes tedious process, which
requires lots of code and may lead to hard to debug mistakes.

Additionally, lots of dependencies, such as certain third party API wrapper, are the same for any class using it.
So it makes sense to:

- Define how to instantiate such API wrapper once.
- Instantiate it when required and only once per request.

That's what dependency containers are for.

A dependency injection (DI) container is an object that knows how to instantiate and configure objects and
all their dependent objects. [Martin Fowler's article](http://martinfowler.com/articles/injection.html) has well
explained why DI container is useful. Here we will mainly explain the usage of the DI container provided by Yii.

Yii provides the DI container feature through the [yiisoft/di](https://github.com/yiisoft/di) package and
[yiisoft/injector](https://github.com/yiisoft/injector) package.

### Configuring container <span id="configuring-container"></span>

Because to create a new object you need its dependencies, you should register them as early as possible.
If you are application developer it could be done right in the application configuration,
`config/web.php`. For the following service:

```php
class MyService implements MyServiceInterface
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
        '__class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

Which is equivalent to the following:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

There are additional methods of declaring dependencies:

```php
return [
    // declare class for an interface, resolve dependencies automatically
    EngineInterface::class => EngineMarkOne::class,

    // array definition (same as above)
    'full_definition' => [
        '__class' => EngineMarkOne::class,
        '__construct()' => [42], 
        'propertyName' => 'value',
        'setX()' => [42],
    ],

    // closure
    'closure' => static function(ContainerInterface $container) {
        return new MyClass($container->get('db'));
    },

    // static call
    'static_call' => [MyFactory::class, 'create'],

    // instance of an object
    'object' => new MyClass(),
];
```

### Injecting dependencies <span id="injecting-dependencies"></span>

Directly referencing container in a class is a bad idea since the code becomes non-generic, coupled to container interface
and, what's worse, dependencies are becoming hidden. Because of that, Yii inverts the control by automatically injecting
objects from a container in some constructors and methods based on method argument types.

This is primarily done in constructor and handing method of action handlers:

```php
use \Yiisoft\Cache\CacheInterface;

class MyController
{
    private CacheInterface $cache;

    public function __construct(CacheInterface $cache) {
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

Since it is [yiisoft/injector](https://github.com/yiisoft/injector) that instantiates and calls action handler, it
checks the constructor and method argument types, get dependencies of these types from container and pass them as
arguments. That is usually called auto-wiring. It happens for sub-dependencies as well i.e., if you do not provide dependency
explicitly, container would check if it has such a dependency first. As a developer it is enough to declare a dependency
you need, and it would be got from container automatically.


## References <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern by Martin Fowler](https://martinfowler.com/articles/injection.html)
