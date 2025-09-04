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

Проблема здесь в том, что эти два класса становятся излишне сопряженными или
взаимозависимыми, что делает их более хрупкими.

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


## Контейнер внедрения зависимостей <span id="di-container"></span>

Внедрять базовые зависимости просто и легко.
Вы выбираете место, где вас не волнуют зависимости, которые обычно являются
обработчиками действий и которые вы не собираетесь тестировать, создаете
экземпляры необходимых зависимостей и передаете их в зависимые классы.

Это хорошо работает, когда в целом зависимостей немного и нет вложенных
зависимостей.
Когда их много, и каждая зависимость сама имеет зависимости, создание всей
иерархии становится утомительным процессом, который требует большого
количества кода и может привести к трудно отлаживаемым ошибкам.

Кроме того, многие зависимости, такие как некоторые сторонние обертки API,
одинаковы для любого класса, использующего его.
Поэтому имеет смысл:

- Определить, как создать экземпляр такой обертки API один раз.
- Создавать его экземпляр при необходимости и только один раз за запрос.

Именно для этого нужны контейнеры зависимостей.

Контейнер внедрения зависимостей (DI-контейнер) — это объект, который знает,
как создавать и настраивать объекты и все зависимые от них объекты.
[Статья Мартина Фаулера](https://martinfowler.com/articles/injection.html)
хорошо объясняет почему DI-контейнер полезен.
Здесь мы в основном поясним использование DI-контейнера, предоставляемого
Yii.

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

Непосредственное обращение к контейнеру в классе — плохая идея, так как код
становится не универсальным, сопряжен с интерфейсом контейнера и, что еще
хуже, зависимости становятся скрытыми. Поэтому Yii инвертирует управление,
автоматически вводя объекты из контейнера в конструкторы и методы,
основываясь на типах аргументов.

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

Поскольку именно [yiisoft/injector](https://github.com/yiisoft/injector)
создает экземпляр и вызывает обработчик действий - он проверяет типы
аргументов конструктора и метода, получает зависимости этих типов из
контейнера и передает их как аргументы.
Обычно это называется автоматическим разрешением зависимостей.
Это происходит и с дополнительными зависимостями - если вы явно не
указываете зависимость, контейнер сначала проверит, есть ли у него такая
зависимость.
Достаточно объявить нужную вам зависимость, и она будет получена из
контейнера автоматически.


## Полезные ссылки <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern
  Мартина Фаулера](https://martinfowler.com/articles/injection.html)
