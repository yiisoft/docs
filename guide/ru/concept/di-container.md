# Dependency injection and container
# Внедрение зависимостей и контейнер внедрения зависимостей

## Dependency injection <span id="dependency-injection"></span>
## Внедрение зависимостей <span id="dependency-injection"></span>

There are two ways of re-using things in OOP: inheritance and composition.
В ООП существует два способа повторного использования кода: наследование и  композиция.

Inheritance is simple:
Наследование - это просто:

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
Проблема здесь в том, что эти два класса становятся излишне связанными или взаимозависимыми, что делает их более хрупкими.

Another way to handle this is composition:
Есть способ справиться с этой проблемой — композиция:

```php
interface CacheInterface
{
    public function getCachedValue($key);
}

final class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final class CachedWidget
{
    private CacheInterface $cache;

    public function __construct(CacheInterface $cache)
    {
        $this->cache = $cache;
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

We've avoided unnecessary inheritance and used interface to reduce coupling. You can replace cache
implementation without changing `CachedWidget` so it's becoming more stable.
Мы избежали ненужного наследования и использовали интерфейс, чтобы уменьшить связанность. Вы можете заменить реализацию кэша без изменения класса `CachedWidget`, поэтому он становится более стабильным.

The `CacheInterface` here is a dependency: an object another object depends on.
The process of putting an instance of dependency into an object (`CachedWidget`) is called dependency injection.
Здесь `CacheInterface` это зависимость - объект, от которого зависит другой объект. Процесс помещения экземпляра объекта зависимости в объект (`CachedWidget`) называется внедрением зависимости.

There are many ways to perform it:
Существует множество способов его реализации:

- Constructor injection. Best for mandatory dependencies.
- Внедрение через конструктор. Лучше всего подходит для обязательных зависиомостей.
- Method injection. Best for optional dependencies.
- Через метод. Лучше использовать для необязательных зависимостей.
- Property injection. Better to be avoided in PHP except maybe data transfer objects.
- Через свойство. Лучше избегать использования в PHP, за исключением, может быть, объектов передачи данных (DTO)


## DI container <span id="di-container"></span>
## Контейнер внедрения зависимостей <span id="di-container"></span>

Injecting basic dependencies is simple and easy. You're choosing a place where you don't care about dependencies,
which is usually an action handler, which you aren't going to unit-test ever, create instances of dependencies needed
and pass these to dependent classes.
Внедрять базовые зависимости просто и легко. Вы выбираете место где вас не волнуют зависимости, которые обычно являются обработчиками действий и которые вы не собираетесь тестировать, создаете экземпляры необходимых зависимостей и передаете их в зависимые классы.

It works well when there aren't many dependencies overall and when there are no nested dependencies. When there are
many and each dependency has dependencies itself, instantiating the whole hierarchy becomes a tedious process, which
requires lots of code and may lead to hard to debug mistakes.
Это хорошо работает, когда в целом зависимостей немного и нет вложенных зависимостей. Когда их много, и каждая зависимость сама имеет зависимости, создание всей иерархии становится утомительным процессом, который требует большого количества кода и может привести к трудно отлаживаемым ошибкам.

Additionally, lots of dependencies, such as certain third party API wrapper, are the same for any class using it.
Кроме того, многие зависимости, такие как некоторые сторонние обертки API, одинаковы для любого класса, использующего его.
So it makes sense to:
Поэтому имеет смысл:

- Define how to instantiate such API wrapper once.
- Определить, как создать экземпляр такой обертки API один раз.
- Instantiate it when required and only once per request.
- Создавать его экземпляр при необходимости и только один раз за запрос.

That's what dependency containers are for.
Именно для этого нужны контейнеры зависимостей.

A dependency injection (DI) container is an object that knows how to instantiate and configure objects and
all their dependent objects. [Martin Fowler's article](https://martinfowler.com/articles/injection.html) has well
explained why DI container is useful. Here we will mainly explain the usage of the DI container provided by Yii.
Контейнер внедрения зависимостей (DI-контейнер) - это объект, который знает, как создавать и настраивать объекты и все зависимые от них объекты. [Статья Мартина Фаулера](https://martinfowler.com/articles/injection.html) хорошо объясняет почему DI-контейнер полезен. Здесь мы в основном поясним использование DI-контейнера, предоставляемого Yii.

Yii provides the DI container feature through the [yiisoft/di](https://github.com/yiisoft/di) package and
[yiisoft/injector](https://github.com/yiisoft/injector) package.
Yii реализует DI-контейнер через пакет [yiisoft/di](https://github.com/yiisoft/di) и [yiisoft/injector](https://github.com/yiisoft/injector).

### Configuring container <span id="configuring-container"></span>
### Конфигурирование контейнера <span id="configuring-container"></span>

Because to create a new object you need its dependencies, you should register them as early as possible.
Поскольку для создания нового объекта вам нужны его зависимости, вам следует зарегестрировать их как можно раньше
You can do it in the application configuration, `config/web.php`. For the following service:
Вы можете сделать это в конфигурации приложения, `config/web.php`. Для следующего сервиса:

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
конфигурация может быть:

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
Это соответствует:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

There are extra methods of declaring dependencies:
Существуют дополнительные методы объявления зависимостей:

```php
return [
    // declare a class for an interface, resolve dependencies automatically
    // объявить класс для интерфейса, автоматически разрешить зависимости
    EngineInterface::class => EngineMarkOne::class,

    // array definition (same as above)
    // определение в массиве (то же, что и выше)
    'full_definition' => [
        'class' => EngineMarkOne::class,
        '__construct()' => [42], 
        '$propertyName' => 'value',
        'setX()' => [42],
    ],

    // closure
    // замыкание
    'closure' => static function(ContainerInterface $container) {
        return new MyClass($container->get('db'));
    },

    // static call
    // статический вызов
    'static_call' => [MyFactory::class, 'create'],

    // instance of an object
    // экземпляр объекта
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

Since it's [yiisoft/injector](https://github.com/yiisoft/injector) that instantiates and calls action handler, it
checks the constructor and method argument types, get dependencies of these types from a container and pass them as
arguments. That's usually called auto-wiring. It happens for sub-dependencies as well, that's if you don't give dependency
explicitly, container would check if it has such a dependency first.
It's enough to declare a dependency you need, and it would be got from a container automatically.


## References <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern by Martin Fowler](https://martinfowler.com/articles/injection.html)
