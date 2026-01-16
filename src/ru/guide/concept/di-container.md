# Внедрение зависимостей и контейнер внедрения зависимостей

## Внедрение зависимостей <span id="dependency-injection"></span>

В ООП существует два способа повторного использования кода: наследование и
композиция.

Наследование — это просто:

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

The issue here is that these two are becoming unnecessarily coupled or
inter-dependent, making them more fragile.

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

Мы избежали ненужного наследования и использовали интерфейс, чтобы уменьшить
сопряженность.
Вы можете заменить реализацию кэша без изменения класса `CachedWidget`,
поэтому он становится более стабильным.

Здесь `CacheInterface` это зависимость — объект, от которого зависит другой
объект.
Процесс помещения экземпляра объекта зависимости в объект (`CachedWidget`)
называется внедрением зависимости. Существует множество способов его
реализации:

- Внедрение через конструктор. Лучше всего подходит для обязательных
  зависимостей.
- Через метод. Лучше использовать для необязательных зависимостей.
- Через свойство. Лучше избегать использования в PHP, за исключением, может
  быть, объектов передачи данных (DTO)

### Why use private properties <span id="why-private-properties"></span>

In the composition example above, note that the `$cache` property is
declared as `private`.

This approach embraces composition by ensuring objects have well-defined
interfaces for interaction rather than direct property access, making the
code more maintainable and less prone to certain types of mistakes.

This design choice provides several benefits:

- **Encapsulation**: Private properties with getters/setters allow you to
  control access and make future changes without breaking existing code.
- **Data integrity**: Setters can validate, normalize, or format values
  before storing them, ensuring properties contain valid data.
- **Immutability**: Private properties enable immutable object patterns
  where setter `with*()` methods return new instances rather than modifying
  the current one.
- **Flexibility**: You can create read-only or write-only properties or add
  additional logic to property access later.


## Контейнер внедрения зависимостей <span id="di-container"></span>

Injecting basic dependencies is straightforward. You're choosing a place
where you don't care about dependencies, which is usually an action handler,
which you aren't going to unit-test ever, create instances of dependencies
needed and pass these to dependent classes.

It works well when there are few dependencies overall and when there are no
nested dependencies. When there are many and each dependency has
dependencies itself, instantiating the whole hierarchy becomes a tedious
process, which requires lots of code and may lead to hardly debuggable
mistakes.

Additionally, lots of dependencies, such as certain third-party API
wrappers, are the same for any class using it.  So it makes sense to:

- Define how to instantiate such an API wrapper.
- Создавать его экземпляр при необходимости и только один раз за запрос.

Именно для этого нужны контейнеры зависимостей.

Контейнер внедрения зависимостей (DI-контейнер) — это объект, который знает,
как создавать и настраивать объекты и все зависимые от них объекты.
[Статья Мартина Фаулера](https://martinfowler.com/articles/injection.html)
хорошо объясняет почему DI-контейнер полезен.
Здесь мы в основном поясним использование DI-контейнера, предоставляемого
Yii.

> [!NOTE]
> The container contains only shared instances. If you need a factory, use the dedicated [yiisoft/factory](https://github.com/yiisoft/factory) package.

Yii реализует DI-контейнер через пакет
[yiisoft/di](https://github.com/yiisoft/di) и
[yiisoft/injector](https://github.com/yiisoft/injector).

### Конфигурирование контейнера <span id="configuring-container"></span>

Поскольку для создания нового объекта вам нужны его зависимости, вам следует
зарегестрировать их как можно раньше.
Вы можете сделать это в конфигурации приложения, `config/web.php`.
Например, для следующего сервиса:

```php
class MyService implements MyServiceInterface
{
    public function __construct(int $amount)
    {
    }

    public function setDiscount(int $discount): void
    {
    
    }
```

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

Это соответствует:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

Существуют дополнительные методы объявления зависимостей:

```php
return [
    // объявить класс для интерфейса, автоматически разрешить зависимости
    EngineInterface::class => EngineMarkOne::class,

    // определение в массиве (то же, что и выше)
    'full_definition' => [
        'class' => EngineMarkOne::class,
        '__construct()' => [42], 
        '$propertyName' => 'value',
        'setX()' => [42],
    ],

    // замыкание
    'closure' => static function(ContainerInterface $container) {
        return new MyClass($container->get('db'));
    },

    // статический вызов
    'static_call' => [MyFactory::class, 'create'],

    // экземпляр объекта
    'object' => new MyClass(),
];
```

### Внедрение зависимостей <span id="injecting-dependencies"></span>

Directly referencing a container in a class is a bad idea since the code
becomes non-generic, coupled to the container interface and, what's worse,
dependencies are becoming hidden.  Because of that, Yii inverts the control
by automatically injecting objects from a container in some constructors and
methods based on method argument types.

В основном это делается в конструкторе и методе, обрабатывающем действие:

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

Since it's [yiisoft/injector](https://github.com/yiisoft/injector) that
instantiates and calls action handler, it checks the constructor and method
argument types, gets dependencies of these types from a container and passes
them as arguments. That's usually called auto-wiring. It happens for
sub-dependencies as well, that's if you don't give dependency explicitly,
the container would check if it has such a dependency first.  It's enough to
declare a dependency you need, and it would be got from a container
automatically.


## Полезные ссылки <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern
  Мартина Фаулера](https://martinfowler.com/articles/injection.html)
