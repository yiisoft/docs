# Symfony Scheduler integration guide

The [Symfony Scheduler](https://symfony.com/doc/current/scheduler.html) component manages task scheduling within your PHP application, like running a task each night at 3 AM, every two weeks except for holidays or any other custom schedule you might need.

## Installation

```shell
composer require symfony/scheduler
```

## How to use with Yii

### 1. Create a Message and Handler.

```php
namespace App\Messages;

final readonly class MyMessage
{
    public function __construct(public string $content)
    {
    }
}
```

```php
namespace App\Messages;

use Psr\Log\LoggerInterface;

final readonly class MyMessageHandler
{
    public function __construct(private LoggerInterface $logger)
    {
    }
    public function __invoke(MyMessage $message): void
    {
        // ...
       $this->logger->info("The message with the content '$message->content' has been received.");
    }
}
```

### 2. Attaching Recurring Messages to a Schedule.

```php
namespace App\Scheduler;

use App\Messages\MyMessage;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;

class MyScheduleProvider implements ScheduleProviderInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->with(
                RecurringMessage::every(
                    '10 seconds',
                    new MyMessage('Hello Symfony Scheduler!'))
            );
    }
}
```

### 3. Configure the Symfony Scheduler.

Depending on your needs, the Symfony Scheduler component offers two ways to consume messages: using the `messenger:consume` command or [creating a worker programmatically](https://symfony.com/doc/current/scheduler.html#creating-a-consumer-programmatically). The example uses the [symfony/messenger](https://packagist.org/packages/symfony/messenger) package to consume messages.


Install the Symfony Messenger package:
```shell
composer require symfony/messenger
```

Install the Symfony Cache package:
```shell
composer require ymfony/cache
```

Implement the ServiceProviderInterface. This instance of the ServiceProviderInterface is used to configure certain Symfony Messenger commands.

```php
namespace App\Services;

use Psr\Container\ContainerInterface;
use Symfony\Contracts\Service\ServiceProviderInterface;

final readonly class ServiceProvider implements ServiceProviderInterface
{
    /**
     * @param ContainerInterface $container
     * @param array<string, string> $serviceMap
     */
    public function __construct(
        private ContainerInterface $container,
        private array              $serviceMap)
    {
    }

    /**
     * @inheritDoc
     */
    public function get(string $id): mixed
    {
        return $this->container->get($id);
    }

    public function has(string $id): bool
    {
        return $this->container->has($id);
    }

    /**
     * @inheritDoc
     */
    public function getProvidedServices(): array
    {
        return $this->serviceMap;
    }
}
```

Configure the Symfony Scheduler and Symfony Messenger dependencies in the `config/common/di/application.php`:
```php
use App\Messages\MyMessage;
use App\Messages\MyMessageHandler;
use App\Scheduler\MyScheduleProvider;
use App\Services\ServiceProvider;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Container\ContainerInterface;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\Messenger\Command\ConsumeMessagesCommand;
use Symfony\Component\Messenger\Command\DebugCommand;
use Symfony\Component\Messenger\Command\FailedMessagesRemoveCommand;
use Symfony\Component\Messenger\Command\FailedMessagesRetryCommand;
use Symfony\Component\Messenger\Command\FailedMessagesShowCommand;
use Symfony\Component\Messenger\Command\SetupTransportsCommand;
use Symfony\Component\Messenger\Command\StatsCommand;
use Symfony\Component\Messenger\EventListener\StopWorkerOnRestartSignalListener;
use Symfony\Component\Messenger\Handler\HandlersLocator;
use Symfony\Component\Messenger\MessageBus;
use Symfony\Component\Messenger\Middleware\HandleMessageMiddleware;
use Symfony\Component\Messenger\RoutableMessageBus;
use Symfony\Component\Scheduler\Generator\MessageGenerator;
use Symfony\Component\Scheduler\Messenger\SchedulerTransport;
use Symfony\Contracts\Service\ServiceProviderInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Definitions\Reference;

class_alias(MessageBus::class, 'MyMessageBus');

return [
    // ...
    CacheItemPoolInterface::class => static function (ContainerInterface $container) {
        return new FilesystemAdapter(directory: $container->get(Aliases::class)->get('@runtime'));
    }, //One of the following adapters can be used instead: Psr16Adapter, RedisAdapter, MemcachedAdapter, DoctrineDbalAdapter, and so forth.


    'SchedulerTransport' => static function () {
        return new SchedulerTransport(
            new MessageGenerator(
                new MyScheduleProvider(),
                'MySchedule'
            )
        );
    },

    MyMessageBus::class => static function (ContainerInterface $container) {
        return new MyMessageBus([
            new HandleMessageMiddleware(new HandlersLocator([
                MyMessage::class => [$container->get(MyMessageHandler::class)]
            ])),
        ]);
    },

    EventDispatcherInterface::class => static function (ContainerInterface $container) {
        $eventDispatcher = new EventDispatcher();
        $eventDispatcher->addSubscriber($container->get(StopWorkerOnRestartSignalListener::class));
        return $eventDispatcher;
    },
    ServiceProviderInterface::class => [
        'class' => ServiceProvider::class,
        '__construct()' => [
            'container' => Reference::to(ContainerInterface::class),
            'serviceMap' => [
                'SchedulerTransport' => SchedulerTransport::class
            ]
        ],
    ],

    ConsumeMessagesCommand::class => static function (ContainerInterface $container) {
        return new ConsumeMessagesCommand(
            $container->get(RoutableMessageBus::class),
            $container,
            $container->get(EventDispatcherInterface::class),
            $container->get(LoggerInterface::class),
            array_keys($container->get(ServiceProviderInterface::class)->getProvidedServices())
        );
    },
    DebugCommand::class => [
        '__construct()' => [
            'mapping' => [
                MyMessageBus::class => [Reference::to(MyMessageHandler::class)]
            ]
        ],
    ],
    FailedMessagesRemoveCommand::class => [
        '__construct()' => [
            'globalFailureReceiverName' => null,
            'failureTransports' => Reference::to(ServiceProviderInterface::class)
        ],
    ],
    FailedMessagesRetryCommand::class => [
        '__construct()' => [
            'globalReceiverName' => null,
            'failureTransports' => Reference::to(ServiceProviderInterface::class),
            'messageBus' => Reference::to(MyMessageBus::class),
            'eventDispatcher' => Reference::to(EventDispatcherInterface::class),
            'logger' => Reference::to(LoggerInterface::class),
        ],
    ],
    FailedMessagesShowCommand::class => [
        '__construct()' => [
            'globalFailureReceiverName' => null,
            'failureTransports' => Reference::to(ServiceProviderInterface::class)
        ],
    ],
    SetupTransportsCommand::class => static function (ContainerInterface $container) {
        return new SetupTransportsCommand(
            $container,
            array_keys($container->get(ServiceProviderInterface::class)->getProvidedServices())
        );
    },
    StatsCommand::class => static function (ContainerInterface $container) {
        return new StatsCommand(
            $container,
            array_keys($container->get(ServiceProviderInterface::class)->getProvidedServices())
        );
    },
];
```

### 4. Integrate the Symfony Messenger commands into the Yii console.

Add the commands to `config/console/commands.php`:
```php
use Symfony\Component\Messenger\Command\ConsumeMessagesCommand;
use Symfony\Component\Messenger\Command\DebugCommand;
use Symfony\Component\Messenger\Command\FailedMessagesRemoveCommand;
use Symfony\Component\Messenger\Command\FailedMessagesRetryCommand;
use Symfony\Component\Messenger\Command\FailedMessagesShowCommand;
use Symfony\Component\Messenger\Command\SetupTransportsCommand;
use Symfony\Component\Messenger\Command\StatsCommand;
use Symfony\Component\Messenger\Command\StopWorkersCommand;

return [
    // ...
    'symfony:messenger:consume' => ConsumeMessagesCommand::class,
    'symfony:messenger:debug' => DebugCommand::class,
    'symfony:messenger:failed:remove' => FailedMessagesRemoveCommand::class,
    'symfony:messenger:failed:retry' => FailedMessagesRetryCommand::class,
    'symfony:messenger:failed:show' => FailedMessagesShowCommand::class,
    'symfony:messenger:setup-transports' => SetupTransportsCommand::class,
    'symfony:messenger:stats' => StatsCommand::class,
    'symfony:messenger:stop-workers' => StopWorkersCommand::class
];
```

### 5. Consume messages.

Example:
```bash
./yii symfony:messenger:consume SchedulerTransport --bus=MyMessageBus
```
