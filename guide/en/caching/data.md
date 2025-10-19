# Data caching

Data caching is about storing some PHP variables in a cache and retrieving them later from the cache.
It's also the foundation for more advanced caching features, such as [page caching](page.md).

To use cache, install [yiisoft/cache](https://github.com/yiisoft/cache) package:

```shell
composer require yiisoft/cache
```

The following code is a typical usage pattern of data caching, where `$cache` refers to
a `Cache` instance from the package:

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

When cache has data associated with the `$key`, it returns the cached value.
Otherwise, it executes the passed anonymous function to calculate the value to cache and return.

If the anonymous function requires some data from the outer scope, you can pass it with the `use` statement.

## Cache handlers

The cache service uses [PSR-16](https://www.php-fig.org/psr/psr-16/) compatible cache handlers which represent various
cache storages, such as memory, files, and databases.

Yii provides the following handlers:

- `NullCache` — a cache placeholder which does no real caching. The purpose of this handler is to simplify
  the code that needs to check the availability of cache. For example, during development or if the server doesn't have
  actual cache support, you may configure a cache service to use this handler.
  When you enable actual cache support, you can switch to using the corresponding cache handler.
  In both cases, you may use the same code without extra checks.
- `ArrayCache` — provides caching for the current request only by storing the values in an array.
- [APCu](https://github.com/yiisoft/cache-apcu) - uses a PHP [APC](https://secure.php.net/manual/en/book.apc.php) extension.
  You can consider this option as the fastest one when dealing with cache for a centralized thick application (e.g., one
  server, no dedicated load balancers, etc.).
- [Database](https://github.com/yiisoft/cache-db) — uses a database table to store cached data.
- [File](https://github.com/yiisoft/cache-file) — uses standard files to store cached data. This is particularly suitable
  to cache large chunks of data, such as page content.
- [Memcached](https://github.com/yiisoft/cache-memcached) — uses a PHP [memcached](https://secure.php.net/manual/en/book.memcached.php)
  extension. You can consider this option as the fastest one when dealing with cache in a distributed application  
  (e.g., with several servers, load balancers, etc.)
- [Wincache](https://github.com/yiisoft/cache-wincache) — uses PHP [WinCache](https://iis.net/downloads/microsoft/wincache-extension)
  ([see also](https://secure.php.net/manual/en/book.wincache.php)) extension.

[You could find more handlers at packagist.org](https://packagist.org/providers/psr/simple-cache-implementation).

> [!TIP]
> You may use different cache storage in the same application. A common strategy is:
> - To use memory-based cache storage to store small but constantly used data (e.g., statistics)
> - To use file-based or database-based cache storage to store big and less often used data (e.g., page content)

Cache handlers are usually set up in a [dependency injection container](../concept/di-container.md) so that they can
be globally configurable and accessible. 

Because all cache handlers support the same set of APIs, you can swap the underlying cache handler
with a different one. You can do it by reconfiguring the application without modifying the code that uses the cache.

### Cache keys

A key uniquely identifies each data item stored in the cache. When you store a data item,
you have to specify a key for it. Later, when you retrieve the data item, you should give
the corresponding key.

You may use a string or an arbitrary value as a cache key. When a key isn't a string, it will be automatically
serialized into a string.

A common strategy of defining a cache key is to include all determining factors in terms of an array.

When different applications use the same cache storage, you should specify a unique cache key prefix
for each application to avoid conflicts of cache keys.
You can do this by using `\Yiisoft\Cache\PrefixedCache` decorator:

```php
$arrayCacheWithPrefix = new \Yiisoft\Cache\PrefixedCache(new \Yiisoft\Cache\ArrayCache(), 'myapp_');
$cache = new \Yiisoft\Cache\Cache($arrayCacheWithPrefix);
```

### Cache expiration

A data item stored in a cache will remain there forever unless it's removed because of some caching policy
enforcement. For example, caching space is full and cache storage removes the oldest data.
To change this behavior, you can set a TTL parameter when calling a method to store a data item:

```php
$ttl = 3600;
$data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
return getTopProductsFromDatabase($count);
}, $ttl);
```

The `$ttl` parameter indicates for how many seconds the data item can remain valid in the cache. When you retrieve
the data item, if it has passed the expiration time, the method will execute the function and set the resulting value
into cache.

You may set the default TTL for the cache:

```php
$cache = new \Yiisoft\Cache\Cache($arrayCache, 60 * 60); // 1 hour
```

Additionally, you can invalidate a cache key explicitly:

```php
$cache->remove($key);
```

### Invalidation dependencies

Besides the expiration setting, changes of the so-called **invalidation dependencies** may also invalidate cached data item.
For example, `\Yiisoft\Cache\Dependency\FileDependency` represents the dependency of a file's modification time.
When this dependency changes, it means something modifying the corresponding file.
As a result, any outdated file content found in the cache should invalidate.

Cache dependencies are objects of `\Yiisoft\Cache\Dependency\Dependency` descendant classes. When you
store a data item in the cache, you can pass along an associated cache dependency object. For example,

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

Below is a summary of the available cache dependencies:

- `\Yiisoft\Cache\Dependency\ValueDependency`: invalidates the cache when specified value changes.
- `\Yiisoft\Cache\Dependency\CallbackDependency`: invalidates the cache when the result of the specified PHP callback
  is different.
- `\Yiisoft\Cache\Dependency\FileDependency`: invalidates the cache when the file's last modification time is different.
- `\Yiisoft\Cache\Dependency\TagDependency`: associates a cached data item with one or many tags. You may invalidate
  the cached data items with the specified tag(s) by calling `TagDependency::invalidate()`.

You may combine many dependencies using `\Yiisoft\Cache\Dependency\AnyDependency` or `\Yiisoft\Cache\Dependency\AllDependencies`.

To implement your own dependency, extend from `\Yiisoft\Cache\Dependency\Dependency`.

### Cache stampede prevention

[A cache stampede](https://en.wikipedia.org/wiki/Cache_stampede) is a type of cascading failure that can occur when massively
parallel computing systems with caching mechanisms come under a high load.
This behavior is sometimes also called dog-piling.

The `\Yiisoft\Cache\Cache` uses a built-in "Probably early expiration" algorithm that prevents cache stampede.
This algorithm randomly fakes a cache miss for one user while others are still served the cached value.
You can control its behavior with the fifth optional parameter of `getOrSet()`, which is a float value called `$beta`.
By default, beta is `1.0`, which is usually enough.
The higher the value, the earlier cache will be re-created.

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
