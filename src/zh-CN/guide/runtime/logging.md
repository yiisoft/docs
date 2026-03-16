# 日志

Yii 依赖 [PSR-3 接口](https://www.php-fig.org/psr/psr-3/) 进行日志记录，因此您可以配置任何兼容
PSR-3 的日志库来完成实际工作。

Yii
提供了自己的日志记录器，具有高度的可定制性和可扩展性。使用它，您可以记录各种类型的消息，对其进行过滤，并将其收集到不同的目标中，例如文件或电子邮件。

使用 Yii 日志框架涉及以下步骤：
 
* 在代码的各个位置记录 [日志消息](#log-messages)；
* 在应用配置中配置 [日志目标](#log-targets)，以过滤和导出日志消息；
* 检查由不同目标导出的已过滤日志消息（例如 Yii 调试器）。

本节重点介绍前两个步骤。

## 日志消息 <span id="log-messages"></span>

要记录日志消息，您需要一个 PSR-3 日志记录器实例。需要写入日志消息的类应通过依赖注入的方式接收它：

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

记录日志消息非常简单，只需调用以下对应不同日志级别的方法之一：

- `emergency` — 系统不可用。
- `alert` — 必须立即采取行动。示例：整个网站宕机、数据库不可用等。这类事件应触发短信告警并将您唤醒。
- `critical` — 严重状态。示例：应用程序组件不可用、意外异常。
- `error` — 不需要立即处理但通常应记录和监控的运行时错误。
- `warning` — 非错误的异常情况。示例：使用已废弃的 API、不当使用 API、不理想但不一定错误的情况。
- `notice` — 正常但值得关注的事件。
- `info` — 值得关注的事件。示例：用户登录、SQL 日志。
- `debug` — 详细的调试信息。

每个方法有两个参数。第一个是消息内容。第二个是上下文数组，通常包含不适合放入消息中但仍然重要的结构化数据。如果以异常作为上下文，应传入
"exception" 键。另一个特殊键是 "category"（分类），分类有助于更好地组织和过滤日志消息。

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

在为消息选择分类时，可以采用层级命名方案，这将便于 [日志目标](#log-targets) 按分类过滤消息。一种简单而有效的命名方案是使用 PHP
魔术常量 `__METHOD__` 作为分类名称，Yii 框架核心代码也采用了这种方式。

`__METHOD__` 常量的值为其所在方法的名称（前缀为完整类名）。例如，如果上述代码在该方法中调用，其值等于字符串
`'App\\Service\\MyService::serve'`。

> [!IMPORTANT]
> 上述日志方法实际上是 [[\Psr\Log\LoggerInterface::log()]] 的快捷方式。

请注意，PSR-3 包提供了 `\Psr\Log\NullLogger` 类，该类提供相同的方法集但不记录任何内容。这意味着您无需通过 `if
($logger !== null)` 检查日志记录器是否已配置，而可以始终假定日志记录器存在。


## 日志目标 <span id="log-targets"></span>

日志目标是继承自 [[\Yiisoft\Log\Target]]
的类的实例。它按严重级别和分类过滤日志消息，然后将其导出到某种介质。例如，[[\Yiisoft\Log\Target\File\FileTarget|文件目标]]将过滤后的日志消息导出到文件，而
[[Yiisoft\Log\Target\Email\EmailTarget|邮件目标]]则将日志消息发送到指定的电子邮件地址。

您可以通过 `\Yiisoft\Log\Logger` 构造函数配置多个日志目标并在应用中注册它们：

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

在上述代码中，注册了两个日志目标：

* 第一个目标选择 error 和 warning 消息并将其写入 `/path/to/app.log` 文件；
* 第二个目标选择分类名称以 `Yiisoft\Cache\` 开头的 emergency、alert 和 critical 消息，
并通过电子邮件发送给 `admin@example.com` 和 `developer@example.com`。

Yii 内置了以下日志目标。请参阅这些类的 API 文档了解如何配置和使用它们。

* [[\Yiisoft\Log\PsrTarget]]：将日志消息传递给另一个兼容 PSR-3 的日志记录器。
* [[\Yiisoft\Log\StreamTarget]]：将日志消息写入指定的输出流。
* [[\Yiisoft\Log\Target\Db\DbTarget]]：将日志消息保存到数据库。
* [[\Yiisoft\Log\Target\Email\EmailTarget]]：将日志消息发送到预先指定的电子邮件地址。
* [[\Yiisoft\Log\Target\File\FileTarget]]：将日志消息保存到文件。
* [[\Yiisoft\Log\Target\Syslog\SyslogTarget]]：通过调用 PHP 函数 `syslog()`
  将日志消息保存到系统日志。

下面将介绍所有日志目标共有的功能。


### 消息过滤 <span id="message-filtering"></span>

对于每个日志目标，您可以配置其级别和分类，以指定该目标应处理哪些严重级别和分类的消息。

目标的 `setLevels()` 方法接受一个由一个或多个 `\Psr\Log\LogLevel` 常量组成的数组。

默认情况下，目标将处理*任意*严重级别的消息。

目标的 `setCategories()`
方法接受一个由消息分类名称或模式组成的数组。目标只处理分类能在该数组中找到或匹配其中某个模式的消息。分类模式是以星号 `*`
结尾的分类名称前缀。如果分类名称以模式的相同前缀开头，则该名称与该模式匹配。例如，`Yiisoft\Cache\Cache::set` 和
`Yiisoft\Cache\Cache::get` 都匹配模式 `Yiisoft\Cache\*`。

默认情况下，目标将处理*任意*分类的消息。

除了通过 `setCategories()` 方法允许某些分类外，您还可以通过 `setExcept()`
方法排除某些分类。如果消息的分类在该属性中被找到或匹配其中某个模式，目标将不处理该消息。
 
以下目标配置指定该目标只处理分类名称匹配 `Yiisoft\Cache\*` 或 `App\Exceptions\HttpException:*`
但不匹配 `App\Exceptions\HttpException:404` 的 error 和 warning 消息。

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);
$fileTarget->setCategories(['Yiisoft\Cache\*', 'App\Exceptions\HttpException:*']);
$fileTarget->setExcept(['App\Exceptions\HttpException:404']);
```

### 消息格式化 <span id="message-formatting"></span>

日志目标以特定格式导出过滤后的日志消息。例如，如果安装了 [[\Yiisoft\Log\Target\File\FileTarget]]
类的日志目标，可以在日志文件中找到类似如下的日志消息：

```
2020-12-05 09:27:52.223800 [info][application] Some message

Message context:

time: 1607160472.2238
memory: 4398536
category: 'application'
```

默认情况下，日志消息的格式如下：

```
Timestamp Prefix[Level][Category] Message Context
```

您可以通过调用 [[\Yiisoft\Log\Target::setFormat()|setFormat()]]
方法来自定义此格式，该方法接受一个返回自定义格式消息的 PHP 可调用对象。

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

此外，如果您对默认消息格式满意，但需要更改时间戳格式或向消息添加自定义数据，可以调用
[[\Yiisoft\Log\Target::setTimestampFormat()|setTimestampFormat()]] 和
[[\Yiisoft\Log\Target::setPrefix()|setPrefix()]]
方法。例如，以下代码更改了时间戳格式，并配置日志目标为每条日志消息添加当前用户 ID 前缀（出于隐私原因，IP 地址和 Session ID 已移除）。

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

传递给 [[\Yiisoft\Log\Target::setFormat()|setFormat()]] 和
[[\Yiisoft\Log\Target::setPrefix()|setPrefix()]] 方法的 PHP 可调用对象具有以下签名：

```php
function (\Yiisoft\Log\Message $message, array $commonContext): string;
```

除消息前缀外，日志目标还会向每条日志消息追加一些公共上下文信息。
您可以通过调用目标的 [[\Yiisoft\Log\Target::setCommonContext()|setCommonContext()]]
方法来调整此行为，传入希望包含的 `key => value` 格式的数据数组。
例如，以下日志目标配置指定只将 `$_SERVER` 变量的值追加到日志消息中。

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setCommonContext(['server' => $_SERVER]);
```


### 消息追踪级别 <span id="trace-level"></span>

在开发过程中，了解每条日志消息的来源通常很有必要。您可以通过如下方式调用
[[\Yiisoft\Log\Logger::setTraceLevel()|setTraceLevel()]] 方法来实现：

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setTraceLevel(3);
```

此应用配置将追踪级别设置为 3，因此每条日志消息最多会附加记录该消息时的三层调用栈。您还可以通过调用
[[\Yiisoft\Log\Logger::setExcludedTracePaths()|setExcludedTracePaths()]]
方法设置要从追踪中排除的路径列表。

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setExcludedTracePaths(['/path/to/file', '/path/to/folder']);
```

> [!IMPORTANT]
> 获取调用栈信息并非轻量操作。因此，您应仅在开发阶段
或调试应用程序时使用此功能。


### 消息刷新与导出 <span id="flushing-exporting"></span>

如前所述，日志消息由 [[\Yiisoft\Log\Logger|日志对象]]
维护在一个数组中。为限制该数组的内存占用，每当数组累积到一定数量的日志消息时，日志记录器会将已记录的消息刷新到[日志目标](#log-targets)。您可以通过调用
[[\Yiisoft\Log\Logger::setFlushInterval()]] 方法自定义此数量：


```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setFlushInterval(100); // default is 1000
```

> [!IMPORTANT]
> 消息刷新也会在应用程序结束时发生，
这确保日志目标能接收到完整的日志消息。

当 [[\Yiisoft\Log\Logger|日志对象]] 将日志消息刷新到 [日志目标](#log-targets) 时，
消息并不会立即被导出。消息导出只在日志目标
累积了一定数量的已过滤消息后才会发生。您可以通过调用各个
[日志目标](#log-targets) 的 [[\Yiisoft\Log\Target::setExportInterval()|setExportInterval()]] 方法
来自定义此数量，如下所示：

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(100); // default is 1000
```

由于刷新和导出间隔的设置，默认情况下调用任何日志方法时，您不会立即在日志目标中看到该日志消息。这对某些长期运行的控制台应用程序可能是个问题。要使每条日志消息立即出现在日志目标中，应将刷新间隔和导出间隔都设置为
1，如下所示：

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(1);

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->setFlushInterval(1);
```

> [!NOTE]
> 频繁的消息刷新和导出会降低应用程序的性能。


### 启用/禁用日志目标 <span id="toggling-log-targets"></span>

您可以通过调用日志目标的 [[\Yiisoft\Log\Target::enable()|enable()]] 和
[[\Yiisoft\Log\Target::disable()|disable()]] 方法来启用或禁用它。您可以通过日志目标配置或在代码中使用以下
PHP 语句来实现：

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$logger = new \Yiisoft\Log\Logger([$fileTarget, /*Other targets*/]);

foreach ($logger->getTargets() as $target) {
    if ($target instanceof \Yiisoft\Log\Target\File\FileTarget) {
        $target->disable();
    }
}
```

要检查日志目标是否已启用，可调用 `isEnabled()` 方法。您还可以向
[[\Yiisoft\Log\Target::setEnabled()|setEnabled()]] 传入可调用对象，以动态定义日志目标的启用条件。


### 创建新目标 <span id="new-targets"></span>

创建新的日志目标类非常简单。您主要需要实现 [[\Yii\Log\Target::export()]]
抽象方法，该方法负责将所有累积的日志消息发送到指定的介质。

以下受保护的方法也可在子目标中使用：

- `getMessages` — 获取日志消息列表（[[\Yii\Log\Message]] 实例）。
- `getFormattedMessages` — 获取格式化为字符串的日志消息列表。
- `formatMessages` — 获取所有日志消息格式化后的单个字符串。
- `getCommonContext` — 获取包含公共上下文数据的 `key => value` 格式数组。

更多详情，请参阅包中包含的任意日志目标类。

> [!TIP]
> 无需自己创建日志记录器，您可以通过 [[\Yii\Log\PsrTarget]] 使用任何兼容 PSR-3 的日志库，
例如 [Monolog](https://github.com/Seldaek/monolog)。

```php
/**
 * @var \Psr\Log\LoggerInterface $psrLogger
 */

$psrTarget = new \Yiisoft\Log\PsrTarget($psrLogger);
$logger = new \Yiisoft\Log\Logger([$psrTarget]);

$logger->info('Text message');
```
