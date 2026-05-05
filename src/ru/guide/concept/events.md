# Events

Events allow you to run custom code at certain execution points without
changing the code that emits the event.  You attach a custom code called a
listener to an event. When the event is dispatched, the listener is
executed.

For example, when a user signs up, you need to send a welcome email. You can
do it in `SignupService`.  Later, when you also need to resize the user's
avatar image, the service has to know about that too.

A cleaner flow is to dispatch a `UserSignedUp` event from
`SignupService`. The welcome email sender and the avatar processor listen to
this event. Additional signup-related work can be added by registering
another listener.

Yii uses [yiisoft/yii-event](https://github.com/yiisoft/yii-event) for
application event configuration. It builds on the
[yiisoft/event-dispatcher](https://github.com/yiisoft/event-dispatcher)
package, which provides a [PSR-14](https://www.php-fig.org/psr/psr-14/)
compatible event dispatcher.

## Event classes <span id="event-classes"></span>

An event is an object. It usually contains data that listeners need:

```php
final readonly class UserSignedUp
{
    public function __construct(
        public SignupForm $form,
    ) {}
}
```

## Event listeners <span id="event-listeners"></span>

An event listener is a [PHP
callable](https://www.php.net/manual/en/language.types.callable.php) that
receives an event:

```php
static function (UserSignedUp $event): void {
    // Send a welcome email.
}
```

You can also use an invokable class:

```php
final readonly class WelcomeEmailSender
{
    public function __invoke(UserSignedUp $event): void
    {
        // Send a welcome email.
    }
}
```

## Configuring event listeners <span id="configuring-event-listeners"></span>

In an application, configure listeners in:

- `config/events.php` for all application types.
- `config/events-web.php` for web application events.
- `config/events-console.php` for console application events.

The configuration is an array where keys are event class names and values
are lists of listeners:

```php
<?php

declare(strict_types=1);

use App\Event\UserSignedUp;
use App\EventListener\WelcomeEmailSender;
use App\Service\AvatarProcessor;

return [
    UserSignedUp::class => [
        WelcomeEmailSender::class,
        static fn (UserSignedUp $event, AvatarProcessor $avatarProcessor) => $avatarProcessor->resize($event->form),
    ],
];
```

The listener may be a closure, a callable array, an invokable object, an
invokable class name, or a DI alias.  For closure and callable array
listeners, parameters after the first event parameter are resolved from the
DI container.  Invokable class names are instantiated by the container.

Dependencies are resolved when the event is dispatched.

## Dispatching events <span id="dispatching-events"></span>

To dispatch an event, use `Psr\EventDispatcher\EventDispatcherInterface`:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

final readonly class SignupService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function signup(SignupForm $form): void
    {
        // Sign up the user.

        $this->eventDispatcher->dispatch(new UserSignedUp($form));
    }
}
```

The dispatcher asks a listener provider for listeners that match the event
and calls them one by one.

## Event listener order <span id="event-listener-order"></span>

When several listeners are configured for the same event, they are called in
the order they are listed in the config.  If an event implements
`Psr\EventDispatcher\StoppableEventInterface`, the dispatcher checks
`isPropagationStopped()` before calling the next listener. When it returns
`true`, the dispatcher stops processing the event.

Keep listeners independent where possible. Ordering is useful for technical
needs, but business logic is usually easier to maintain when each listener
can run on its own.

## Event hierarchy <span id="event-hierarchy"></span>

Events don't have names or wildcard matching. Event class names, interfaces,
and inheritance can be used when one listener should handle several related
events:

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
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (DocumentEvent $event): void {
        // Log document events.
    });

$provider = new Provider($listeners);
```

## Manual listener provider setup <span id="manual-listener-provider-setup"></span>

In an application, use event configuration. For package-level code or tests,
you can create a listener provider manually:

```php
use Yiisoft\EventDispatcher\Dispatcher\Dispatcher;
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (UserSignedUp $event): void {
        // Send a welcome email.
    });

$provider = new Provider($listeners);
$dispatcher = new Dispatcher($provider);

$dispatcher->dispatch(new UserSignedUp($form));
```

`ListenerCollection::add()` returns a new collection instance. Assign the result when building a collection step by step:

```php
$listeners = new ListenerCollection();
$listeners = $listeners->add(
    static function (UserSignedUp $event): void {
        // Send a welcome email.
    },
    UserSignedUp::class,
);
```
