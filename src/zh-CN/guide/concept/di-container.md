# 依赖注入和容器

## 依赖注入 <span id="dependency-injection"></span>

在面向对象编程中，有两种重用代码的方式：继承和组合。

继承很简单：

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

这里的问题是这两者变得不必要地耦合或相互依赖，使它们更加脆弱。

另一种处理方式是组合：

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

我们避免了不必要的继承，并在 `CacheWidget` 中使用 `CacheInterface` 来减少耦合。您可以在不更改
`CachedWidget` 的情况下替换缓存实现，因此它变得更加稳定。对代码的编辑越少，破坏它的机会就越小。

这里的 `CacheInterface` 是一个依赖：我们的对象需要运行的契约。换句话说，我们的对象依赖于这个契约。

将契约的实例放入对象（`CachedWidget`）的过程称为依赖注入。有多种方式可以执行它：

- 构造函数注入。最适合强制性依赖。
- 方法注入。最适合可选依赖。
- 属性注入。在 PHP 中最好避免使用，除非可能是数据传输对象。

### 为什么使用私有属性 <span id="why-private-properties"></span>

在上面的组合示例中，请注意 `$cache` 属性被声明为 `private`。

这种方法通过确保对象具有明确定义的交互接口而不是直接属性访问来拥抱组合，使代码更易于维护，并且不太容易出现某些类型的错误。

这种设计选择提供了几个好处：

- **封装**：带有 getter/setter 的私有属性允许您控制访问并在不破坏现有代码的情况下进行未来更改。
- **数据完整性**：Setter 可以在存储值之前验证、规范化或格式化值，确保属性包含有效数据。
- **不可变性**：私有属性启用不可变对象模式，其中 setter `with*()` 方法返回新实例而不是修改当前实例。
- **灵活性**：您可以创建只读或只写属性，或稍后向属性访问添加额外的逻辑。


## DI 容器 <span id="di-container"></span>

注入基本依赖很简单。您选择一个不关心依赖的地方，通常是一个操作处理器，您永远不会对其进行单元测试，创建所需依赖的实例并将这些传递给依赖类。

当总体依赖很少且没有嵌套依赖时，它运行良好。当有很多依赖并且每个依赖本身都有依赖时，实例化整个层次结构变成一个繁琐的过程，需要大量代码，并可能导致难以调试的错误。

此外，许多依赖（例如某些第三方 API 包装器）对于使用它的任何类都是相同的。因此，有必要：

- 定义如何实例化这些常见依赖。
- 在需要时实例化它们，并且每个请求只实例化一次。

这就是依赖容器的用途。

依赖注入（DI）容器是一个知道如何实例化和配置对象以及它们所依赖的所有对象的对象。

Yii 通过 [yiisoft/di](https://github.com/yiisoft/di) 包和
[yiisoft/injector](https://github.com/yiisoft/injector) 包提供 DI 容器功能。

> [!NOTE]
> 容器仅包含共享实例。如果您需要工厂，请使用专用的
> [yiisoft/factory](https://github.com/yiisoft/factory) 包。

> [!TIP]
> [Martin Fowler 的文章](https://martinfowler.com/articles/injection.html) 很好地
> 解释了为什么 DI 容器有用。这里我们将主要解释 Yii 提供的 DI 容器的使用。

### 配置容器 <span id="configuring-container"></span>

因为要创建新对象需要其依赖，所以您应该尽早注册它们。您可以在应用程序配置 `config/web.php` 中执行此操作。对于以下服务：

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

配置可以是：

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

这等同于以下内容：

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

您也可以提供带名称的参数：

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => ['amount' => 42],
        'setDiscount()' => ['discount' => 10],
    ],
];
```

基本上就是这样。您定义接口到类的映射并定义如何配置它们。当在构造函数或其他地方请求接口时，容器会创建类的实例并根据配置对其进行配置：

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

还有其他声明依赖配置的方法。

对于不需要自定义值且所有构造函数依赖都可以从容器获取的最简单情况，您可以使用类名作为值。

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

在上面的示例中，如果我们已经在容器中定义了缓存，则除了类名之外不需要任何东西：

```php
return [
    // declare a class for an interface, resolve dependencies automatically
    EngineInterface::class => EngineMarkOne::class,
];
```

如果您有一个具有公共属性的依赖，您也可以配置它。


```php
final class NameProvider
{
    public string $name;
}
```

以下是上面示例的操作方法：

```php
NameProvider::class => [
    'class' => NameProvider::class, 
    '$name' => 'Alex',
],
```

在此示例中，您可能会注意到 `NameProvider` 被指定了两次。键是您可以请求作为依赖的内容，值是如何创建它。

如果配置很复杂并需要一些逻辑，可以使用闭包：

```php
MyServiceInterface::class => static function(ContainerInterface $container) {
    return new MyService($container->get('db'));
},
```

此外，除了 `ContainerInterface`，您还可以直接将任何已注册的服务作为闭包参数请求。注入器将自动解析并注入这些：

```php
MyServiceInterface::class => static function(ConnectionInterface $db) {
    return new MyService($db);
},
```

可以使用静态方法调用：

```php
MyServiceInterface::class => [MyFactory::class, 'create'],
```

或对象的实例：

```php
MyServiceInterface::class => new MyService(),
```

### 正确注入依赖 <span id="injecting-dependencies"></span>

在类中直接引用容器是一个坏主意，因为代码变得不通用，耦合到容器接口，更糟糕的是，依赖变得隐藏。因此，Yii
通过根据方法参数类型在某些构造函数和方法中自动从容器注入对象来反转控制。

这主要在操作处理器的构造函数和处理方法中完成：

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

由于是 [yiisoft/injector](https://github.com/yiisoft/injector)
实例化并调用操作处理器，它会检查构造函数和方法参数类型，从容器中获取这些类型的依赖并将它们作为参数传递。这通常称为自动装配。它也适用于子依赖，也就是说，如果您没有显式提供依赖，容器会首先检查它是否有这样的依赖。只需声明您需要的依赖，它就会自动从容器中获取。


## 参考资料 <span id="references"></span>

- [Martin Fowler
  的控制反转容器和依赖注入模式](https://martinfowler.com/articles/injection.html)
