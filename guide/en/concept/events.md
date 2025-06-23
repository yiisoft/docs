# Events

Events allow you to make custom code executed at certain execution points without modifying existing code.
You can attach a custom code called "handler" to an event so that when the event is triggered, the handler
gets executed automatically. 

For example, when a user is signed up, you need to send a welcome email. You can do it right in
the `SignupService` but then, when you additionally need to resize user's avatar image, you'll have
to change `SignupService` code again. In other words, `SignupService` will be coupled to both code sending
welcome email and code resizing avatar image.
 
To avoid it, instead of telling what do after signup explicitly you can, instead, raise `UserSignedUp` event
and then finish a signup process. The code sending an email and the code resizing avatar image will attach to the event
 and, therefore, will be executed. If you'll ever need to do more on signup, you'll be able to attach extra event
handlers without modifying `SignupService`. 
 
For raising events and attaching handlers to these events, Yii has a special service called event dispatcher.
It's available from [yiisoft/event-dispatcher package](https://github.com/yiisoft/event-dispatcher).

## Event Handlers <span id="event-handlers"></span>

An event handler is [PHP callable](https://www.php.net/manual/en/language.types.callable.php) that gets executed
when the event it's attached to is triggered.

The signature of an event handler is:

```php
function (EventClass $event) {
    // handle it
}
```

## Attaching event handlers <span id="attaching-event-handlers"></span>

You can attach a handler to an event like the following:

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

The `attach()` method is accepting a callback. Based on the type of this callback argument, the event type is
determined.

## Event handlers order

You may attach one or more handlers to a single event. When an event is triggered, the attached handlers
will be called in the order that they were attached to the event. In case an event implements
`Psr\EventDispatcher\StoppableEventInterface`, event handler can stop executing the rest of the handlers 
that follow it if `isPropagationStopped()` returns `true`.

In general, it's better not to rely on the order of event handlers.

## Raising events <span id="raising-events"></span>

Events are raised like the following:

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

First, you create an event supplying it with data that may be useful for handlers. Then you dispatch the event.

The event class itself may look like the following:

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

## Events hierarchy

Events don't have any name or wildcard matching on purpose. Event class names and class/interface hierarchy
and composition could be used to achieve great flexibility:

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

With the interface, you can listen to all document-related events:


```php
$provider->attach(function (DocumentEvent $event) {
    // log events here
});
``` 

## Detaching event handlers <span id="detaching-event-handlers"></span>

To detach a handler from an event you can call `detach()` method:


```php
$provider->detach(DocmentEvent::class);
```

## Configuring application events

You usually assign event handlers via application config. See ["Configuration"](configuration.md) for details.
