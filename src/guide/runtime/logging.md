# Logging

Yii relies on [PSR-3 interfaces](https://www.php-fig.org/psr/psr-3/) for logging, so you could configure any PSR-3
compatible logging library to do the actual job.

Yii provides its own logger that's highly customizable and extensible.
Using it, you can log various types of messages, filter them,
and gather them at different targets, such as files or emails.

Using the Yii logging framework involves the following steps:
 
* Record [log messages](#log-messages) at various places in your code;
* Configure [log targets](#log-targets) in the application configuration to filter and export log messages;
* Examine the filtered logged messages exported by different targets (e.g. the Yii debugger).

In this section, the focus in on the first two steps.

## Log Messages <span id="log-messages"></span>

To record log messages, you need an instance of PSR-3 logger.
A class that writes log messages should receive it as a dependency:

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

Recording a log message is as simple as calling one of the following logging methods that correspond to log levels:

- `emergency` - System is unusable.
- `alert` - Action must be taken immediately.
  Example: Entire website down, database unavailable, etc.
  This should trigger the SMS alerts and wake you up.
- `critical` - Critical conditions. Example: Application component unavailable, unexpected exception.
- `error` - Runtime errors that don't require immediate action but should typically be logged and monitored.
- `warning` - Exceptional occurrences that aren't errors. Example: Use of deprecated APIs, poor use of an API,
  undesirable things that aren't necessarily wrong.
- `notice` - Normal but significant events.
- `info` - Interesting events. Example: User logs in, SQL logs.
- `debug` - Detailed debug information.

Each method has two arguments.
The first is a message.
The Second is a context array that typically has structured data that
doesn't fit a message well but still does offer important information.
In case you provide an exception as context, you should pass the "exception" key.
Another special key is "category." Categories are handy to better organize and filter log messages.

```php
use \Psr\Log\LoggerInterface;

final readonly class MyService
{
    public function __construct(
        private LoggerInterface $logger
    )
    {    
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
the constant appears.
For example, it's equal to the string `'App\\Service\\MyService::serve'` if the above line of code is called within
this method.

> [!IMPORTANT]
> The logging methods described above are actually shortcuts to the [[\Psr\Log\LoggerInterface::log()]].

Note that PSR-3 package provides `\Psr\Log\NullLogger` class that provides the same set of methods but doesn't log
anything. That means that you don't have to check if logger is configured with `if ($logger !== null)` and, instead,
can assume that logger is always present.


## Log targets <span id="log-targets"></span>

A log target is an instance of a class that extends the [[\Yiisoft\Log\Target]]. It filters the log messages by their
severity levels and categories and then exports them to some medium. For example,
a [[\Yiisoft\Log\Target\File\FileTarget|file target]]exports the filtered log messages to a file,
while a [[Yiisoft\Log\Target\Email\EmailTarget|email target]] exports the log messages to specified email addresses.

You can register many log targets in an application by configuring them through the `\Yiisoft\Log\Logger` constructor:

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
* the second target selects emergency, alert, and critical messages under the categories whose names start with
`Yiisoft\Cache\`, and sends them in an email to both `admin@example.com` and `developer@example.com`.

Yii comes with the following built-in log targets. Please refer to the API documentation about these classes to 
learn how to configure and use them. 

* [[\Yiisoft\Log\PsrTarget]]: passes log messages to another PSR-3 compatible logger.
* [[\Yiisoft\Log\StreamTarget]]: writes log messages into a specified output stream.
* [[\Yiisoft\Log\Target\Db\DbTarget]]: saves log messages in database.
* [[\Yiisoft\Log\Target\Email\EmailTarget]]: sends log messages to pre-specified email addresses.
* [[\Yiisoft\Log\Target\File\FileTarget]]: saves log messages in files.
* [[\Yiisoft\Log\Target\Syslog\SyslogTarget]]: saves log messages to syslog by calling the PHP function `syslog()`.

In the following, we will describe the features common to all log targets.


### Message Filtering <span id="message-filtering"></span>

For each log target, you can configure its levels and categories to specify 
which severity levels and categories of the messages the target should process.

The target `setLevels()` method takes an array consisting of one or several of `\Psr\Log\LogLevel` constants.

By default, the target will process messages of *any* severity level.

The target `setCategories()` method takes an array consisting of message category names or patterns.
A target will only process messages whose category can be found or match one of the patterns in this array.
A category pattern is a category name prefix with an asterisk `*` at its end. A category name matches a category pattern
if it starts with the same prefix of the pattern. For example, `Yiisoft\Cache\Cache::set` and `Yiisoft\Cache\Cache::get`
both match the pattern `Yiisoft\Cache\*`.

By default, the target will process messages of *any* category.

Besides allowing the categories by the `setCategories()` method, you may also
deny certain categories by the `setExcept()` method.
If the category of a message is found or matches one of the patterns in this property,
the target will NOT process it.
 
The following target configuration specifies that the target should only process error and warning messages
under the categories whose names match either `Yiisoft\Cache\*` or `App\Exceptions\HttpException:*`,
but not `App\Exceptions\HttpException:404`.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);
$fileTarget->setCategories(['Yiisoft\Cache\*', 'App\Exceptions\HttpException:*']);
$fileTarget->setExcept(['App\Exceptions\HttpException:404']);
```

### Message Formatting <span id="message-formatting"></span>

Log targets export the filtered log messages in a certain format.
For example, if you install a log target of the class [[\Yiisoft\Log\Target\File\FileTarget]],
you may find a log message similar to the following in the log file:

```
2020-12-05 09:27:52.223800 [info][application] Some message

Message context:

time: 1607160472.2238
memory: 4398536
category: 'application'
```

By default, log messages have the following format:

```
Timestamp Prefix[Level][Category] Message Context
```

You may customize this format by calling [[\Yiisoft\Log\Target::setFormat()|setFormat()]] method,
which takes a PHP callable returning a custom-formatted message.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');

$fileTarget->setFormat(static function (\Yiisoft\Log\Message $message) {
    $category = strtoupper($message->context('category'));
    return "({$category}) [{$message->level()}] {$message->message()}";
});

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->info('Text message', ['category' => 'app']);

// Result:
// (APP) [info] Text message
```

In addition, if you're comfortable with the default message format but need to change the timestamp format
or add custom data to the message, you can call the [[\Yiisoft\Log\Target::setTimestampFormat()|setTimestampFormat()]]
and [[\Yiisoft\Log\Target::setPrefix()|setPrefix()]] methods. For example, the following code changes the timestamp
format and configures a log target to prefix each log message with the current user ID
(IP address and Session ID are removed for privacy reasons).

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$userId = '123e4567-e89b-12d3-a456-426655440000';

// Default: 'Y-m-d H: i: s.u'
$fileTarget->setTimestampFormat('D d F Y');
// Default: ''
$fileTarget->setPrefix(static fn () => "[{$userId}]");

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->info('Text', ['category' => 'user']);

// Result:
// Fri 04 December 2020 [123e4567-e89b-12d3-a456-426655440000][info][user] Text
// Message context: ...
// Common context: ...
```

The PHP callable that's passed to the [[\Yiisoft\Log\Target::setFormat()|setFormat()]]
and [[\Yiisoft\Log\Target::setPrefix()|setPrefix()]] methods has the following signature:

```php
function (\Yiisoft\Log\Message $message, array $commonContext): string;
```

Besides message prefixes, log targets also append some common context information to each of the log messages.
You may adjust this behavior by calling target [[\Yiisoft\Log\Target::setCommonContext()|setCommonContext()]]
method, passing an array of data in the `key => value` format that you want to include.
For example, the following log target configuration specifies that only the
value of the `$_SERVER` variable will be appended to the log messages.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setCommonContext(['server' => $_SERVER]);
```


### Message Trace Level <span id="trace-level"></span>

During development, it's often desirable to see where each log message is coming from.
You can achieve this by calling the [[\Yiisoft\Log\Logger::setTraceLevel()|setTraceLevel()]] method like the following:

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setTraceLevel(3);
```

This application configuration sets the trace level to be 3, so each log message will be appended with at most three
levels of the call stack at which the log message is recorded. You can also set a list of paths to exclude
from the trace by calling the [[\Yiisoft\Log\Logger::setExcludedTracePaths()|setExcludedTracePaths()]] method.

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setExcludedTracePaths(['/path/to/file', '/path/to/folder']);
```

> [!IMPORTANT]
> Getting call stack information isn't trivial. Therefore, you should only use this feature during development
or when debugging an application.


### Message flushing and exporting <span id="flushing-exporting"></span>

As aforementioned, log messages are maintained in an array by [[\Yiisoft\Log\Logger|logger object]]. To limit the
memory consumption by this array, the logger will flush the recorded messages to the [log targets](#log-targets)
each time the array accumulates a certain number of log messages. You can customize this number by calling
the [[\Yiisoft\Log\Logger::setFlushInterval()]] method:


```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setFlushInterval(100); // default is 1000
```

> [!IMPORTANT]
> Message flushing also occurs when the application ends,
which ensures log targets can receive complete log messages.

When the [[\Yiisoft\Log\Logger|logger object]] flushes log messages to [log targets](#log-targets),
they don't get exported immediately. Instead, the message exporting only occurs when a log target
 accumulates a certain number of the filtered messages. You can customize this number by calling the
[[\Yiisoft\Log\Target::setExportInterval()|setExportInterval()]] method of individual
[log targets](#log-targets), like the following:

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

> [!NOTE]
> Frequent message flushing and exporting will degrade the performance of your application.


### Toggling log targets <span id="toggling-log-targets"></span>

You can enable or disable a log target by calling its [[\Yiisoft\Log\Target::enable()|enable()] ]
and [[\Yiisoft\Log\Target::disable()|disable()]] methods.
You may do so via the log target configuration or by the following PHP statement in your code:

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$logger = new \Yiisoft\Log\Logger([$fileTarget, /*Other targets*/]);

foreach ($logger->getTargets() as $target) {
    if ($target instanceof \Yiisoft\Log\Target\File\FileTarget) {
        $target->disable();
    }
}
```

To check whether the log target is enabled, call the `isEnabled()` method.
You also may pass callable to [[\Yiisoft\Log\Target::setEnabled()|setEnabled()]]
to define a dynamic condition for whether the log target should be enabled or not.


### Creating new targets <span id="new-targets"></span>

Creating a new log target class is straightforward. You mainly need to implement the [[\Yii\Log\Target::export()]]
abstract method that sends all accumulated log messages to a designated medium.

The following protected methods will also be available for child targets:

- `getMessages` - Get a list of log messages ([[\Yii\Log\Message]] instances).
- `getFormattedMessages` - Get a list of log messages formatted as strings.
- `formatMessages` - Get all log messages formatted as a string.
- `getCommonContext` - Get an array with common context data in the `key => value` format.

For more details, you may refer to any of the log target classes included in the package.

> [!TIP]
> Instead of creating your own loggers, you may try any PSR-3 compatible logger such
as [Monolog](https://github.com/Seldaek/monolog) by using [[\Yii\Log\PsrTarget]].

```php
/**
 * @var \Psr\Log\LoggerInterface $psrLogger
 */

$psrTarget = new \Yiisoft\Log\PsrTarget($psrLogger);
$logger = new \Yiisoft\Log\Logger([$psrTarget]);

$logger->info('Text message');
```
