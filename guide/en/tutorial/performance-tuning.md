# Performance tuning

There are many factors affecting the performance of your application. Some are environmental, some are related 
to your code, while some others are related to Yii itself. In this section, we will count most of these
factors and explain how you can improve your application performance by adjusting these factors.


## Optimizing your PHP Environment <span id="optimizing-php"></span>

A well-configured PHP environment is important. To get maximum performance:

- Use the latest stable PHP version. Major releases of PHP may bring significant performance improvements.
- Enable bytecode caching with [Opcache](https://secure.php.net/opcache). 
  Bytecode caching avoids the time spent in parsing and including PHP scripts for every incoming request.
- [Tune `realpath()` cache](https://github.com/samdark/realpath_cache_tuner).
- Make sure [XDebug](https://xdebug.org/) isn't installed in production environment.
- Try [PHP 7 preloading](https://wiki.php.net/rfc/preload).

## Using Caching Techniques <span id="using-caching"></span>

You can use various caching techniques to significantly improve the performance of your application. For example,
if your application allows users to enter text in Markdown format, you may consider caching the parsed Markdown
content to avoid parsing the same Markdown text repeatedly in every request. Please refer to 
the [Caching](../caching/overview.md) section to learn about the caching support provided by Yii.


## Optimizing Session Storage <span id="optimizing-session"></span>

By default, session data are stored in files. The implementation is locking a file from opening a session to the point it's
closed either by `$session->close()` or at the end of request.
While the session file is locked all other requests, which are trying to use the same session are blocked, that's waiting for the
initial request to release session file. This is fine for development and probably small projects. But when it comes 
to handling massive concurrent requests, it's better to use more sophisticated storage, such as Redis.

It could be done either by [configuring PHP via php.ini](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-redis-server-as-a-session-handler-for-php-on-ubuntu-14-04)
or [implementing SessionHandlerInterface](https://www.sitepoint.com/saving-php-sessions-in-redis/) and configuring
session service as follows:

```php
\Yiisoft\Session\SessionInterface::class => [
    'class' => \Yiisoft\Session\Session::class,
    '__construct()' => [[], $myCustomSessionHandler],
],
```

## Optimizing Databases <span id="optimizing-databases"></span>

Executing DB queries and fetching data from databases are often the main performance bottleneck in
a Web application. Although using [data caching](../caching/data.md) techniques may ease the performance hit,
it doesn't fully solve the problem. When the database has enormous amounts of data, and the cached data are invalid, 
fetching the latest data could be prohibitively expensive without a proper database and query design.

A general technique to improve the performance of DB queries is to create indices for table columns that
need to be filtered by. For example, if you need to look for a user record by `username`, you should create an index
on `username`. Note that while indexing can make SELECT queries much faster, it will slow down INSERT, UPDATE and DELETE queries.

For complex DB queries, it's recommended that you create database views to save the query parsing and preparation time.

Last but not least, use `LIMIT` in your `SELECT` queries. This avoids fetching an overwhelming amount of data from the database
and exhausting the memory allocated to PHP.


## Optimizing Composer Autoloader <span id="optimizing-autoloader"></span>

Because Composer autoloader is used to include most third-party class files, you should consider optimizing it
by executing the following command:

```
composer dumpautoload -o
```

Additionally, you may consider using
[authoritative class maps](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-a-authoritative-class-maps)
and [APCu cache](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-b-apcu-cache).
Note that both optimizations may or may not be suitable for your particular case.


## Processing Data Offline <span id="processing-data-offline"></span>

When a request involves some resource intensive operations, you should think of ways to perform those operations
in offline mode without having users wait for them to finish.

There are two methods to process data offline: pull and push. 

In the pull method, whenever a request involves some complex operation, you create a task and save it in a persistent 
storage, such as a database. You then use a separate process (such as a cron job) to pull the tasks and process them.
This method is easy to implement, but it has some drawbacks. For example, the task process needs to periodically pull
from the task storage. If the pull frequency is too low, the tasks may be processed with great delay, but if the frequency
is too high, it will introduce high overhead.

In the push method, you would use a message queue (e.g. RabbitMQ, ActiveMQ, Amazon SQS, etc.) to manage the tasks. 
Whenever a new task is put on the queue, it will initiate or notify the task handling process to trigger the task processing.

## Using preloading

As of PHP 7.4.0, PHP can be configured to preload scripts into the opcache when the engine starts.
You can read more in the [documentation](https://www.php.net/manual/en/opcache.preloading.php)
and the corresponding [RFC](https://wiki.php.net/rfc/preload).

Note that the optimal tradeoff between performance and memory may vary with the application. "Preload everything"
may be the easiest strategy, but not necessarily the best strategy.

For example, we conducted a simple [yiisoft/app](https://github.com/yiisoft/app) application template benchmark.
Without preloading and with preloading of the entire composer class map.

### Preloading benchmarks

The application template benchmark includes configuring classes to injected dependencies in the bootstrap script.

For both variants, [ApacheBench](https://httpd.apache.org/docs/2.4/programs/ab.html)
was used with the following run parameters:

```shell
ab -n 1000 -c 10 -t 10
```

Also, a debug mode was disabled. And an optimized autoloader of the [Composer](https://getcomposer.org) was used
and development dependencies weren't used:

```shell
composer install --optimize-autoloader --no-dev
```

With preloading enabled, the entire composer class map (825 files) was used:

```php
$files = require 'vendor/composer/autoload_classmap.php';

foreach (array_unique($files) as $file) {
    opcache_compile_file($file);
}
```

#### Test results

| Benchmark          | Preloaded files | Opcache memory used | Per request memory used | Time per request | Requests per second |
|--------------------|-----------------|---------------------|-------------------------|------------------|---------------------|
| Without preloading | 0               | 12.32 mb            | 1.71 mb                 | 27.63 ms         | 36.55 rq/s          |
| With preloading    | 825             | 17.86 mb            | 1.82 mb                 | 26.21 ms         | 38.42 rq/s          |

As you can see, the test results aren't much different, since this is just a clean application template
that doesn't contain many classes. More discussion of preloading, including benchmarks,
can be found in the [composer's issue](https://github.com/composer/composer/issues/7777).

## Performance Profiling <span id="performance-profiling"></span>

You should profile your code to find out the performance bottlenecks and take appropriate measures accordingly.
The following profiling tools may be useful:

- [Yii debug toolbar and debugger](https://github.com/yiisoft/yii2-debug/blob/master/docs/guide/README.md)
- [Blackfire](https://blackfire.io/)
- [XHProf](https://secure.php.net/manual/en/book.xhprof.php)
- [XDebug profiler](https://xdebug.org/docs/profiler)
