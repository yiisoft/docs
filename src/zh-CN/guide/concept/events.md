# 事件

事件允许您在特定执行点执行自定义代码，而无需修改现有代码。您可以将称为“处理器”的自定义代码附加到事件，以便在触发事件时，处理器会自动执行。

例如，当用户注册时，您需要发送欢迎邮件。您可以直接在 `SignupService` 中执行此操作，但如果您还需要调整用户头像图片的大小，则必须再次更改
`SignupService` 代码。换句话说，`SignupService` 将与发送欢迎邮件的代码和调整头像图片大小的代码耦合。
 
为避免这种情况，您可以触发 `UserSignedUp` 事件，
然后完成注册流程，而不是明确告知注册后要做什么。发送邮件的代码和调整头像图片大小的代码将附加到该事件，
因此，它们将被执行。如果您以后需要在注册时执行更多操作，您可以附加额外的事件
处理器，而无需修改 `SignupService`。
 
要触发事件并将处理器附加到这些事件，Yii 有一个称为事件调度器的特殊服务。它可以从 [yiisoft/event-dispatcher
包](https://github.com/yiisoft/event-dispatcher) 获取。

## 事件处理器 <span id="event-handlers"></span>

事件处理器是 [PHP
callable](https://www.php.net/manual/en/language.types.callable.php)，当它附加的事件被触发时执行。

事件处理器的签名是：

```php
function (EventClass $event) {
    // handle it
}
```

## 附加事件处理器 <span id="attaching-event-handlers"></span>

您可以按如下方式将处理器附加到事件：

```php
use Yiisoft\EventDispatcher\Provider\Provider;

final readonly class WelcomeEmailSender
{
    public function __construct(Provider $provider)
    {
        $provider->attach([$this, 'handleUserSignup']);
    }

    public function handleUserSignup(UserSignedUp $event)
    {
        // handle it    
    }
}
```

`attach()` 方法接受一个回调。根据此回调参数的类型，确定事件类型。

## 事件处理器顺序

您可以将一个或多个处理器附加到单个事件。当事件被触发时，附加的处理器将按照它们附加到事件的顺序被调用。如果事件实现了
`Psr\EventDispatcher\StoppableEventInterface`，当 `isPropagationStopped()` 返回
`true` 时，事件处理器可以停止执行其后的其余处理器。

一般来说，最好不要依赖事件处理器的顺序。

## 触发事件 <span id="raising-events"></span>

事件按如下方式触发：

```php
use Psr\EventDispatcher\EventDispatcherInterface;

final readonly class SignupService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher
    )
    {
    }

    public function signup(SignupForm $form)
    {
        // handle signup

        $event = new UserSignedUp($form);
        $this->eventDispatcher->dispatch($event);
    }
}
```

首先，您创建一个事件，并为其提供可能对处理器有用的数据。然后您调度该事件。

事件类本身可能如下所示：

```php
final readonly class UserSignedUp
{
    public function __construct(
        public SignupForm $form
    )
    {
    }
}
```

## 事件层次结构

事件故意没有任何名称或通配符匹配。事件类名称以及类/接口层次结构和组合可用于实现极大的灵活性：

```php
interface DocumentEvent
{
}

final readonly class BeforeDocumentProcessed implements DocumentEvent
{
}

final readonly class AfterDocumentProcessed implements DocumentEvent
{
}
```

使用接口，您可以监听所有与文档相关的事件：


```php
$provider->attach(function (DocumentEvent $event) {
    // log events here
});
``` 

## 分离事件处理器 <span id="detaching-event-handlers"></span>

要从事件中分离处理器，您可以调用 `detach()` 方法：


```php
$provider->detach(DocmentEvent::class);
```

## 配置应用程序事件

您通常通过应用程序配置来分配事件处理器。有关详细信息，请参阅 ["配置"](configuration.md)。
