# 数据缓存

数据缓存是将一些 PHP 变量存储在缓存中，然后稍后从缓存中检索它们。它也是更高级缓存功能（如 [页面缓存](page.md)）的基础。

要使用缓存，请安装 [yiisoft/cache](https://github.com/yiisoft/cache) 包：

```shell
composer require yiisoft/cache
```

以下代码是数据缓存的典型使用模式，其中 `$cache` 引用包中的 `Cache` 实例：

```php
public function getTopProducts(\Yiisoft\Cache\CacheInterface $cache): array
{
    $key = ['top-products', $count = 10];
    
    // Try retrieving $data from cache.
    $data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
        // Can't find $data in a cache, calculate it from scratch.
        return getTopProductsFromDatabase($count);
    }, 3600);
    
    return $data;
}
```

当缓存中有与 `$key` 关联的数据时，它返回缓存的值。否则，它执行传递的匿名函数来计算要缓存的值并返回。

如果匿名函数需要来自外部作用域的一些数据，您可以使用 `use` 语句传递它。

## 缓存处理器

缓存服务使用兼容 [PSR-16](https://www.php-fig.org/psr/psr-16/)
的缓存处理器，它们代表各种缓存存储，如内存、文件和数据库。

Yii 提供以下处理器：

- `NullCache` —
  一个不进行实际缓存的缓存占位符。此处理器的目的是简化需要检查缓存可用性的代码。例如，在开发期间或服务器没有实际缓存支持时，您可以配置缓存服务使用此处理器。当您启用实际缓存支持时，可以切换到使用相应的缓存处理器。在这两种情况下，您都可以使用相同的代码而无需额外检查。
- `ArrayCache` — 通过将值存储在数组中，仅为当前请求提供缓存。
- [APCu](https://github.com/yiisoft/cache-apcu) - 使用 PHP
  [APC](https://secure.php.net/manual/en/book.apc.php)
  扩展。在处理集中式厚应用程序（例如，单服务器，无专用负载均衡器等）的缓存时，您可以将此选项视为最快的选项。
- [数据库](https://github.com/yiisoft/cache-db) — 使用数据库表存储缓存数据。
- [文件](https://github.com/yiisoft/cache-file) —
  使用标准文件存储缓存数据。这特别适合缓存大块数据，如页面内容。
- [Memcached](https://github.com/yiisoft/cache-memcached) — 使用 PHP
  [memcached](https://secure.php.net/manual/en/book.memcached.php)
  扩展。在分布式应用程序中处理缓存时，您可以将此选项视为最快的选项
  （例如，多个服务器、负载均衡器等）
- [Wincache](https://github.com/yiisoft/cache-wincache) — 使用 PHP [WinCache](https://iis.net/downloads/microsoft/wincache-extension)
  （[另见](https://secure.php.net/manual/en/book.wincache.php)）扩展。

[您可以在 packagist.org
找到更多处理器](https://packagist.org/providers/psr/simple-cache-implementation)。

> [!TIP]
> 您可以在同一应用程序中使用不同的缓存存储。常见策略是：
> - 使用基于内存的缓存存储来存储小但经常使用的数据（例如，统计信息）
> - 使用基于文件或数据库的缓存存储来存储大且不常使用的数据（例如，页面内容）

缓存处理器通常在[依赖注入容器](../concept/di-container.md)中设置，以便它们可以全局配置和访问。

由于所有缓存处理器都支持相同的 API 集，您可以将底层缓存处理器替换为不同的处理器。您可以通过重新配置应用程序来实现，而无需修改使用缓存的代码。

### 缓存键

键唯一标识存储在缓存中的每个数据项。当您存储数据项时，必须为其指定一个键。稍后，当您检索数据项时，应提供相应的键。

您可以使用字符串或任意值作为缓存键。当键不是字符串时，它将自动序列化为字符串。

定义缓存键的常见策略是将所有决定因素包含在数组中。

当不同的应用程序使用相同的缓存存储时，您应该为每个应用程序指定唯一的缓存键前缀以避免缓存键冲突。您可以使用
`\Yiisoft\Cache\PrefixedCache` 装饰器来实现：

```php
$arrayCacheWithPrefix = new \Yiisoft\Cache\PrefixedCache(new \Yiisoft\Cache\ArrayCache(), 'myapp_');
$cache = new \Yiisoft\Cache\Cache($arrayCacheWithPrefix);
```

### 缓存过期

存储在缓存中的数据项将永久保留在那里，除非由于某些缓存策略强制执行而被删除。例如，缓存空间已满，缓存存储会删除最旧的数据。要更改此行为，您可以在调用方法存储数据项时设置
TTL 参数：

```php
$ttl = 3600;
$data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
return getTopProductsFromDatabase($count);
}, $ttl);
```

`$ttl` 参数指示数据项在缓存中可以保持有效的秒数。当您检索数据项时，如果已超过过期时间，该方法将执行函数并将结果值设置到缓存中。

您可以为缓存设置默认 TTL：

```php
$cache = new \Yiisoft\Cache\Cache($arrayCache, 60 * 60); // 1 hour
```

此外，您可以显式使缓存键失效：

```php
$cache->remove($key);
```

### 失效依赖

除了过期设置外，所谓的**失效依赖**的更改也可能使缓存的数据项失效。例如，`\Yiisoft\Cache\Dependency\FileDependency`
表示文件修改时间的依赖关系。当此依赖关系发生变化时，意味着有东西修改了相应的文件。因此，在缓存中找到的任何过时的文件内容都应该失效。

缓存依赖是 `\Yiisoft\Cache\Dependency\Dependency`
后代类的对象。当您在缓存中存储数据项时，可以传递关联的缓存依赖对象。例如，

```php
/**
 * @var callable $callable
 * @var \Yiisoft\Cache\CacheInterface $cache
 */

use Yiisoft\Cache\Dependency\TagDependency;

// Set many cache values marking both with a tag.
$cache->getOrSet('item_42_price', $callable, null, new TagDependency('item_42'));
$cache->getOrSet('item_42_total', $callable, 3600, new TagDependency('item_42'));

// Trigger invalidation by tag.
TagDependency::invalidate($cache, 'item_42');
```

以下是可用缓存依赖的摘要：

- `\Yiisoft\Cache\Dependency\ValueDependency`：当指定值更改时使缓存失效。
- `\Yiisoft\Cache\Dependency\CallbackDependency`：当指定 PHP 回调的结果不同时使缓存失效。
- `\Yiisoft\Cache\Dependency\FileDependency`：当文件的最后修改时间不同时使缓存失效。
- `\Yiisoft\Cache\Dependency\TagDependency`：将缓存的数据项与一个或多个标签关联。您可以通过调用
  `TagDependency::invalidate()` 使具有指定标签的缓存数据项失效。

您可以使用 `\Yiisoft\Cache\Dependency\AnyDependency` 或
`\Yiisoft\Cache\Dependency\AllDependencies` 组合多个依赖项。

要实现您自己的依赖项，请从 `\Yiisoft\Cache\Dependency\Dependency` 扩展。

### 缓存雪崩预防

[缓存雪崩](https://en.wikipedia.org/wiki/Cache_stampede)是一种级联故障，当具有缓存机制的大规模并行计算系统处于高负载时可能发生。这种行为有时也称为
dog-piling。

`\Yiisoft\Cache\Cache`
使用内置的“可能提前过期”算法来防止缓存雪崩。该算法随机为一个用户伪造缓存未命中，而其他用户仍然获得缓存值。您可以使用 `getOrSet()`
的第五个可选参数来控制其行为，该参数是一个名为 `$beta` 的浮点值。默认情况下，beta 为
`1.0`，这通常就足够了。值越高，缓存重新创建得越早。

```php
/**
 * @var mixed $key
 * @var callable $callable
 * @var \DateInterval $ttl
 * @var \Yiisoft\Cache\CacheInterface $cache
 * @var \Yiisoft\Cache\Dependency\Dependency $dependency
 */

$beta = 2.0;
$cache->getOrSet($key, $callable, $ttl, $dependency, $beta);
```
