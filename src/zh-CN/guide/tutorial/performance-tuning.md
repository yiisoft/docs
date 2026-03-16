# 性能调优

影响应用程序性能的因素有很多，有些与运行环境有关，有些与您的代码有关，还有一些与 Yii
框架本身有关。本节将列举这些主要因素，并说明如何通过调整它们来提升应用程序性能。


## 优化 PHP 环境 <span id="optimizing-php"></span>

合理配置 PHP 环境至关重要。为获得最佳性能，建议：

- 使用最新稳定版 PHP。PHP 的主要版本通常会带来显著的性能提升。
- 通过 [Opcache](https://secure.php.net/opcache) 启用字节码缓存。字节码缓存可避免在每次请求时重复解析和加载
  PHP 脚本的开销。
- [调优 `realpath()` 缓存](https://github.com/samdark/realpath_cache_tuner)。
- 确保生产环境中未安装 [XDebug](https://xdebug.org/)。
- 尝试 [PHP 7 预加载](https://wiki.php.net/rfc/preload)。

## 优化代码 <span id="optimizing-code"></span>

除环境配置外，代码层面的优化同样能提升应用程序性能：

- 注意 [算法复杂度](https://en.wikipedia.org/wiki/Time_complexity)。尤其要留意 `foreach`
  嵌套循环，同时也要避免在循环中使用[高开销的 PHP
  函数](https://stackoverflow.com/questions/2473989/list-of-big-o-for-php-functions)。
- [加速 array_merge()](https://www.exakat.io/speeding-up-array_merge/)
- [将 foreach()
  移入方法内部](https://www.exakat.io/move-that-foreach-inside-the-method/)
- [数组、类与匿名类的内存占用](https://www.exakat.io/array-classes-and-anonymous-memory-usage/)
- 使用带前导反斜杠的完全限定函数名以优化 opcache 性能。在命名空间内调用
  [某些全局函数](https://github.com/php/php-src/blob/944b6b6bbd6f05ad905f5f4ad07445792bee4027/Zend/zend_compile.c#L4291-L4353)
  时，PHP 会先在当前命名空间中查找，再回退到全局命名空间。添加前导反斜杠（例如用 `\count()` 代替 `count()`）可告知 PHP
  直接使用全局函数，避免命名空间查找，提升 opcache 效率。建议通过
  [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) 的
  `native_function_invocation` 规则自动完成此优化。

上述代码层面的优化只有在相关代码被频繁执行时才能带来显著提升，通常适用于大型循环或批量处理场景。

## 使用缓存技术 <span id="using-caching-techniques"></span>

您可以使用多种缓存技术来显著提升应用程序性能。例如，如果应用程序允许用户输入 Markdown 格式文本，可以考虑缓存解析后的 Markdown
内容，避免每次请求都重复解析相同的 Markdown 文本。请参阅[缓存](../caching/overview.md)章节了解 Yii
提供的缓存支持。


## 优化会话存储 <span id="optimizing-session-storage"></span>

默认情况下，会话数据存储在文件中。该实现会在会话打开时锁定文件，直到
通过 `$session->close()` 或请求结束时关闭会话为止。
在会话文件被锁定期间，所有尝试使用同一会话的其他请求都将被阻塞，等待
初始请求释放会话文件。这对于开发环境和小型项目来说没有问题，但当需要 
处理大量并发请求时，最好使用更完善的存储方案，例如 Redis。

可以通过 [在 php.ini 中配置
PHP](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-redis-server-as-a-session-handler-for-php-on-ubuntu-14-04)，或
[实现
SessionHandlerInterface](https://www.sitepoint.com/saving-php-sessions-in-redis/)
并按如下方式配置会话服务来实现：

```php
\Yiisoft\Session\SessionInterface::class => [
    'class' => \Yiisoft\Session\Session::class,
    '__construct()' => [[], $myCustomSessionHandler],
],
```

## 优化数据库 <span id="optimizing-databases"></span>

执行数据库查询和从数据库获取数据通常是 Web
应用程序的主要性能瓶颈。尽管使用[数据缓存](../caching/data.md)技术可以缓解性能压力，但并不能彻底解决问题。当数据库中的数据量极大且缓存数据失效时，如果没有合理的数据库和查询设计，获取最新数据的代价可能会非常高昂。

提升数据库查询性能的通用方法是为需要过滤的表列创建索引。例如，如果需要通过 `username` 查找用户记录，应在 `username`
列上创建索引。请注意，索引虽然能大幅提升 SELECT 查询速度，但会降低 INSERT、UPDATE 和 DELETE 操作的速度。

对于复杂的数据库查询，建议创建数据库视图以节省查询解析和准备的时间。

最后同样重要的一点是，在 `SELECT` 查询中使用 `LIMIT`，以避免从数据库获取过量数据而耗尽 PHP 分配的内存。


## 优化 Composer 自动加载器 <span id="optimizing-autoloader"></span>

由于 Composer 自动加载器用于加载大多数第三方类文件，建议通过执行以下命令对其进行优化：

```
composer dumpautoload -o
```

此外，您还可以考虑使用
[权威类映射](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-a-authoritative-class-maps)
和 [APCu
缓存](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-b-apcu-cache)。请注意，这两种优化不一定适用于所有情况。


## 离线处理数据 <span id="processing-data-offline"></span>

当某个请求涉及资源密集型操作时，应考虑以离线方式执行这些操作，避免让用户等待其完成。

离线处理数据有两种方式：拉取（pull）和推送（push）。

在拉取模式中，每当请求涉及复杂操作时，您创建一个任务并将其保存到持久化存储（如数据库）中，然后使用独立进程（如定时任务）来拉取并处理这些任务。这种方式实现简单，但有一些缺点：例如，任务进程需要周期性地从任务存储中拉取数据，拉取频率过低会导致任务处理延迟较大，而频率过高则会引入较大开销。

在推送模式中，您使用消息队列（例如 RabbitMQ、ActiveMQ、Amazon SQS
等）来管理任务。每当有新任务加入队列时，它会启动或通知任务处理进程以触发任务执行。

## 使用预加载

自 PHP 7.4.0 起，可以配置 PHP 在引擎启动时将脚本预加载到 opcache 中。详情请参阅
[官方文档](https://www.php.net/manual/en/opcache.preloading.php) 和对应的
[RFC](https://wiki.php.net/rfc/preload)。

请注意，性能与内存之间的最优权衡因应用程序而异。“预加载所有内容”可能是最简单的策略，但未必是最佳策略。

例如，我们对 [yiisoft/app](https://github.com/yiisoft/app)
应用程序模板进行了简单基准测试，分别测试了未启用预加载和预加载整个 Composer 类映射两种情况。

### 预加载基准测试

该应用程序模板基准测试包含在引导脚本中配置依赖注入的相关类。

两种情况均使用 [ApacheBench](https://httpd.apache.org/docs/2.4/programs/ab.html)
进行测试，运行参数如下：

```shell
ab -n 1000 -c 10 -t 10
```

同时，调试模式已禁用，使用了 [Composer](https://getcomposer.org) 的优化自动加载器，且未安装开发依赖：

```shell
composer install --optimize-autoloader --no-dev
```

启用预加载时，使用了完整的 Composer 类映射（825 个文件）：

```php
$files = require 'vendor/composer/autoload_classmap.php';

foreach (array_unique($files) as $file) {
    opcache_compile_file($file);
}
```

#### 测试结果

| 基准测试           | 预加载文件数    | Opcache 内存用量    | 每请求内存用量          | 每请求耗时       | 每秒请求数          |
|--------------------|-----------------|---------------------|-------------------------|------------------|---------------------|
| 未预加载           | 0               | 12.32 mb            | 1.71 mb                 | 27.63 ms         | 36.55 rq/s          |
| 已预加载           | 825             | 17.86 mb            | 1.82 mb                 | 26.21 ms         | 38.42 rq/s          |

如您所见，测试结果差异不大，因为这只是一个仅包含少量类的干净应用程序模板。关于预加载的更多讨论（包括基准测试）可参阅 [Composer 的相关
issue](https://github.com/composer/composer/issues/7777)。

## 性能分析 <span id="performance-profiling"></span>

应对代码进行性能分析以找出瓶颈，并采取相应措施。以下分析工具可能对您有所帮助：

<!-- - [Yii debug toolbar and debugger](https://github.com/yiisoft/yii2-debug/blob/master/docs/guide/README.md) -->

- [Blackfire](https://blackfire.io/)
- [XHProf](https://secure.php.net/manual/en/book.xhprof.php)
- [XDebug 分析器](https://xdebug.org/docs/profiler)
