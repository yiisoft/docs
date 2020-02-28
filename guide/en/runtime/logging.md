# Logging

Yii relies on [PSR-3 interfaces](https://www.php-fig.org/psr/psr-3/) for logging so any PSR-3 compatible logging library
could be configured to do the actual job.

Yii provides its own logger that is highly customizable and extensible. Using it, you can easily log various types of
messages, filter them, and gather them at different targets, such as files or emails.

Using the Yii logging framework involves the following steps:
 
* Record [log messages](#log-messages) at various places in your code;
* Configure [log targets](#log-targets) in the application configuration to filter and export log messages;
* Examine the filtered logged messages exported by different targets (e.g. the [Yii debugger](../tool/debugger.md)).

In this section, we will mainly describe the first two steps.

## Log Messages <span id="log-messages"></span>

In order to record log messages you need an instance of PSR-3 logger. A class that writes log messages should receive
it as dependency:

```php
class MyService
{
    private $logger;
    
    public function __construct(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;    
    }
}
```

Recording log messages is as simple as calling one of the following logging methods that correspond to log levels:

- `emergency` - System is unusable.
- `alert` -  Action must be taken immediately. Example: Entire website down, database unavailable, etc. This should trigger
  the SMS alerts and wake you up.
- `critical` - Critical conditions. Example: Application component unavailable, unexpected exception.
- `error` - Runtime errors that do not require immediate action but should typically be logged and monitored.
- `warning` - Exceptional occurrences that are not errors. Example: Use of deprecated APIs, poor use of an API,
  undesirable things that are not necessarily wrong.
- `notice` - Normal but significant events.
- `info` - Interesting events. Example: User logs in, SQL logs.
- `debug` - Detailed debug information.

Each method has two arguments. First is a message. Second is context array that typically contains structured data that
doesn't fit message well but still does provide important information. In case exception is provided as context, it should
be passed in "exception" key. Another special key is "category". Categories are handy to better organize and filter
log messages.

```php
class MyService
{
    private $logger;
    
    public function __construct(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;    
    }

    public function serve(): void
    {
        $this->logger->info('MyService is serving', ['context' => __METHOD__]);    
    }
}
```

When deciding on a category for a message, you may choose a hierarchical naming scheme, which will make it easier for 
[log targets](#log-targets) to filter messages based on their categories. A simple yet effective naming scheme
is to use the PHP magic constant `__METHOD__` for the category names. This is also the approach used in the core 
Yii framework code.

The `__METHOD__` constant evaluates as the name of the method (prefixed with the fully qualified class name) where 
the constant appears. For example, it is equal to the string `'App\\Service\\MyService::serve'` if 
the above line of code is called within this method.

> Info: The logging methods described above are actually shortcuts to the [[\Psr\Log\LoggerInterface::log()]].

Note that PSR-3 package provides `\Psr\Log\NullLogger` class that provides the same set of methods but does not log
anything. That means that you don't have to check if logger is configured with `if ($logger !== null)` and, instead,
can assume that logger is always present.


## Log Targets <span id="log-targets"></span>

A log target is an instance of a class that extends the [[\Yiisoft\Log\Target]]. It filters the log messages by their
severity levels and categories and then exports them to some medium. For example, a [[\Yiisoft\Log\Target\File\FileTarget|file target]]
exports the filtered log messages to a file, while an [[Yiisoft\Log\Target\Email\EmailTarget|email target]] exports
the log messages to specified email addresses.

You can register multiple log targets in an application by configuring them through the `\Yiisoft\Log\Logger` constructor:

```php
use \Psr\Log\LogLevel;

$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);

$emailTarget = new \Yiisoft\Log\Target\Email\EmailTarget($mailer, ['to' => 'log@example.com']);
$emailTarget->setLevels([LogLevel::EMERGENCY, LogLevel::ALERT, LogLevel::CRITICAL]);
$emailTarget->setCategories(['Yiisoft\Cache\*']); 

$logger = new \Yiisoft\Log\Logger([
    $fileTarget,
    $emailTarget
]);
```

In the above code, two log targets are registered: 

* the first target selects error and warning messages and writes them to `/path/to/app.log` file;
* the second target selects emergency, alert and critical messages under the categories whose names start with
`Yiisoft\Cache\`, and sends them in an email to both `admin@example.com` and `developer@example.com`.

Yii comes with the following built-in log targets. Please refer to the API documentation about these classes to 
learn how to configure and use them. 

* [[\Yiisoft\Log\Target\Email\EmailTarget]]: sends log messages to pre-specified email addresses.
* [[\Yiisoft\Log\Target\File\FileTarget]]: saves log messages in files.
* [[\Yiisoft\Log\Target\Syslog\SyslogTarget]]: saves log messages to syslog by calling the PHP function `syslog()`.

In the following, we will describe the features common to all log targets.

  
### Message Filtering <span id="message-filtering"></span>

For each log target, you can configure its levels and categories to specify, which severity levels and categories of the
messages the target should process.

The target `setLevels()` method takes an array consisting of one or several of `\Psr\Log\LogLevel` constants.

By default, the target will process messages of *any* severity level.

The target `setCategories()` method takes an array consisting of message category names or patterns.
A target will only process messages whose category can be found or match one of the patterns in this array.
A category pattern is a category name prefix with an asterisk `*` at its end. A category name matches a category pattern
if it starts with the same prefix of the pattern. For example, `Yiisoft\Cache\Cache::set` and `Yiisoft\Cache\Cache::get`
both match the pattern `Yiisoft\Cache\*`.

By default, the target will process messages of *any* category.

Besides whitelisting the categories by the `setCategories()` method, you may also
blacklist certain categories by the `setExcept()` method. If the category of a message
is found or matches one of the patterns in this property, it will NOT be processed by the target.
 
The following target configuration specifies that the target should only process error and warning messages
under the categories whose names match either `Yiisoft\Cache\*` or `App\Exceptions\HttpException:*`, but not `App\Exceptions\HttpException:404`.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);
$fileTarget->setCategories(['Yiisoft\Cache\*', 'App\Exceptions\HttpException:*']);
$fileTarget->setExcept(['App\Exceptions\HttpException:404']);
```

### Message Formatting <span id="message-formatting"></span>

Log targets export the filtered log messages in a certain format. For example, if you install
a log target of the class [[\Yiisoft\Log\Target\File\FileTarget]], you may find a log message similar to the following in the
log file:

```
2014-10-04 18:10:15 [::1][][-][trace][yii\base\Module::getModule] Loading module: debug
```

By default, log messages will be formatted as follows by the [[\Yiisoft\Log\Target::formatMessage()]]:

```
Timestamp [IP address][User ID][Session ID][Severity Level][Category] Message Text
```

You may customize this format by calling `setPrefix()` method, which takes a PHP callable
returning a customized message prefix. For example, the following code configures a log target to prefix each
log message with the current user ID (IP address and Session ID are removed for privacy reasons).

```php
$userId = ...

$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setPrefix(function (string $message) use ($userId) {
    return "[$userID]";
});
```

Besides message prefixes, log targets also append some context information to each batch of log messages.
By default, the values of these global PHP variables are included: `$_GET`, `$_POST`, `$_FILES`, `$_COOKIE`,
`$_SESSION` and `$_SERVER`. You may adjust this behavior by calling target `setLogVars()` method
with the names of the global variables that you want to include by the log target. For example, the following
log target configuration specifies that only the value of the `$_SERVER` variable will be appended to the log messages.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLogVars(['_SERVER']);
```

You may configure `logVars` to be an empty array to totally disable the inclusion of context information.
Or if you want to implement your own way of providing context information, you may override the
`getContextMessage()` method.

### Message Trace Level <span id="trace-level"></span>

During development, it is often desirable to see where each log message is coming from. This can be achieved by
calling the [[\Yiisoft\Log\Logger::setTraceLevel|setTraceLevel]] method like the following:

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setTraceLevel(3);
```

The above application configuration sets trace level to be 3 so each log message will be appended with at most 3
levels of the call stack at which the log message is recorded.

> Info: Getting call stack information is not trivial. Therefore, you should only use this feature during development
or when debugging an application.


### Message Flushing and Exporting <span id="flushing-exporting"></span>

As aforementioned, log messages are maintained in an array by the [[\Yiisoft\Log\Logger|logger object]]. To limit the
memory consumption by this array, the logger will flush the recorded messages to the [log targets](#log-targets)
each time the array accumulates a certain number of log messages. You can customize this number by calling
the [[\Yiisoft\Log\Logger::setFlushInterval()]] method:


```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setFlushInterval(100); // default is 1000
```

> Info: Message flushing also occurs when the application ends, which ensures log targets can receive complete log messages.

When the [[\Yiisoft\Log\Logger|logger object]] flushes log messages to [log targets](#log-targets), they do not get exported
immediately. Instead, the message exporting only occurs when a log target accumulates certain number of the filtered
messages. You can customize this number by calling the [[\Yiisoft\Log\Target::setExportInterval()|setExportInterval()]]
method of individual [log targets](#log-targets), like the following,

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(100); // default is 1000
```

Because of the flushing and exporting level setting, by default when you call any logging
method, you will NOT see the log message immediately in the log targets. This could be a problem for some long-running
console applications. To make each log message appear immediately in the log targets, you should set both
flush interval and export interval to be 1, as shown below:

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(1);

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->setFlushInterval(1);
```

> Note: Frequent message flushing and exporting will degrade the performance of your application.


### Toggling Log Targets <span id="toggling-log-targets"></span>

You can enable or disable a log target by calling its [[\Yiisoft\Log\Target::setEnabled()|setEnabled()]] method.
You may do so via the log target configuration or by the following PHP statement in your code:

```php
$logger->getTarget('file')->setEnabled(false);
```

The above code requires you to name a target as `file`:

```php
$logger = new \Yiisoft\Log\Logger(['file' => $fileTarget]);
```

You also may pass a callable to [[\Yiisoft\Log\Target::setEnabled()|setEnabled()]] to
define a dynamic condition for whether the log target should be enabled or not.

### Creating New Targets <span id="new-targets"></span>

Creating a new log target class is very simple. You mainly need to implement the [[\Yii\Log\Target::export()]] method
sending the content of the [[\Yii\Log\Target::messages]] array to a designated medium. You may call the
[[\Yii\Log\Target::formatMessage()]] method to format each message. For more details, you may refer to any of the
log target classes included in the Yii release.

> Tip: Instead of creating your own loggers you may try any PSR-3 compatible logger such
  as [Monolog](https://github.com/Seldaek/monolog) by using [[\Yii\Log\PsrTarget]].
