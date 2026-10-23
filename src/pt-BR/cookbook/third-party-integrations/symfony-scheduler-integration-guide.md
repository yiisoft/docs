# Guia de integração com o Symfony Scheduler

O componente [Symfony
Scheduler](https://symfony.com/doc/current/scheduler.html) gerencia o
agendamento de tarefas na sua aplicação PHP, como rodar uma tarefa toda
noite às 3h, a cada duas semanas exceto em feriados, ou qualquer outro
agendamento personalizado de que você precise.

## Instalação

```shell
composer require symfony/scheduler
```

## Como usar com o Yii

### 1. Crie uma Message e um Handler.

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

### 2. Associe mensagens recorrentes a um Schedule.

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

### 3. Configure o Symfony Scheduler.

Dependendo das suas necessidades, o componente Symfony Scheduler oferece
duas formas de consumir mensagens: usando o comando `messenger:consume` ou
[criando um worker
programaticamente](https://symfony.com/doc/current/scheduler.html#creating-a-consumer-programmatically).
O exemplo usa o pacote
[symfony/messenger](https://packagist.org/packages/symfony/messenger) para
consumir as mensagens.


Instale o pacote Symfony Messenger:
```shell
composer require symfony/messenger
```

Instale o pacote Symfony Cache:
```shell
composer require symfony/cache
```

Implemente a ServiceProviderInterface. Essa instância da
ServiceProviderInterface é usada para configurar alguns comandos do Symfony
Messenger.

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

Configure as dependências do Symfony Scheduler e do Symfony Messenger em
`config/common/di/application.php`:
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

### 4. Integre os comandos do Symfony Messenger ao console do Yii.

Adicione os comandos em `config/console/commands.php`:
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

### 5. Consuma as mensagens.

Exemplo:
```bash
./yii symfony:messenger:consume SchedulerTransport --bus=MyMessageBus
```
