# Events

Events allow you to make custom code executed at certain execution points without modifying existing code.
You can attach custom code called "handler" to an event so that when the event is triggered, the handler
gets executed automatically. 

For example, when a user is signed up you need to send a welcome email. You can do it right in
the `SignupService` but then when you will additionally need to resize users's avatar image you'll have
to modify `SignupService` code again. In other words, `SignupService` will be coupled to both code sending
welcome email and code resizing avatar image.
 
In order to avoid it, instead of telling what do after signup explicitly we can, instead, raise `UserSignedUp` event
and then finish signup process. The code sending an email and the code resizing avatar image will attach to the event
and therefore will be executed. If you'll ever need to do more on signup, you'll be able to attach additional event
handlers without modifying `SignupService`. 
 
For raising events and attaching handlers to these events, Yii has a special service called event dispatcher.
It is available from [yiisoft/event-dispatcher package](https://github.com/yiisoft/event-dispatcher).

## Event Handlers <span id="event-handlers"></span>

An event handler is a [PHP callable](https://secure.php.net/manual/en/language.types.callable.php) that gets executed
when the event it is attached to is triggered.

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

class WelcomeEmailSender
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

The `attach()` method is accepting a callback. Based on a type of this callback argument event type is
determined.

## Event handlers order

You may attach one or more handlers to a single event. When an event is triggered, the attached handlers
will be called in the order that they were attached to the event. In case an event implements
`Psr\EventDispatcher\StoppableEventInterface`, event handler can stop executing the rest of the handlers 
that follow it if `isPropagationStopped()` returns `true`.

In general, it is better not to rely on the order of event handlers.

## Raising events <span id="raising-events"></span>

Events are raised like the following:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

class SignupService
{
    private EventDispatcherInterface $eventDispatcher;

    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    public function signup(SignupForm $form)
    {
        // handle signup

        $event = new UserSignedUp($form);
        $this->eventDispatcher->dispatch($event);
    }
}
```

First, we are creating an event supplying it with data that may be useful for handlers. Then we are dispatching
the event.

The event class itself may look like the following:

```php
final class UserSignedUp
{
    private SignupForm $form;

    public function __construct(SignupForm $form)
    {
        $this->form = $form;
    }

    public function getSignupForm(): SignupForm
    {
        return $this->form;
    }
}
```

## Events hierarchy

Events do not have any name or wildcard matching on purpose. Event class names and class/interface hierarchy
and composition could be used to achieve great flexibility:

```php
interface DocumentEvent
{
}

class BeforeDocumentProcessed implements DocumentEvent
{
}

class AfterDocumentProcessed implements DocumentEvent
{
}
```

With the interface above listening to all document-related events could be done as:


```php
$provider->attach(function (DocumentEvent $event) {
    // log events here
});
``` 

## Detaching Event Handlers <span id="detaching-event-handlers"></span>

To detach a handler from an event you can call `detach()` method:


```php
$provider->detach(DocmentEvent::class);
```

## Configuring application events

Event handlers are usually assigned via application config. See ["Configuration"](configuration.md) for details.
