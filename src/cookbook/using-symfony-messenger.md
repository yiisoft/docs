# Using Symfony Messenger

The [Symfony Messenger](https://symfony.com/doc/current/components/messenger.html) component helps applications send and receive messages to/from other applications or via message queues.

## Installation

```shell
composer require symfony/messenger
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

### 2. Implement the ServiceProviderInterface.

This instance of the ServiceProviderInterface is used to configure certain Symfony Messenger commands.

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

### 3. Configure the Symfony Messenger dependencies in the `config/common/di/application.php` file.

Example uses the [symfony/doctrine-messenger](https://packagist.org/packages/symfony/doctrine-messenger) package for transport:

```php
use App\Messages\MyMessage;
use App\Messages\MyMessageHandler;
use App\Services\ServiceProvider;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\Configuration;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\ORMSetup;
use Doctrine\ORM\Proxy\ProxyFactory;
use Doctrine\ORM\Tools\Console\EntityManagerProvider;
use Doctrine\ORM\Tools\Console\EntityManagerProvider\SingleManagerProvider;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Messenger\Bridge\Doctrine\Transport\Connection;
use Symfony\Component\Messenger\Bridge\Doctrine\Transport\DoctrineTransport;
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
use Symfony\Component\Messenger\Middleware\SendMessageMiddleware;
use Symfony\Component\Messenger\RoutableMessageBus;
use Symfony\Component\Messenger\Transport\Sender\SendersLocator;
use Symfony\Component\Messenger\Transport\Serialization\PhpSerializer;
use Symfony\Component\Messenger\Transport\Serialization\SerializerInterface;
use Symfony\Contracts\Service\ServiceProviderInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Definitions\Reference;

class_alias(MessageBus::class, 'MyMessageBus');

return [
    // ...
    CacheItemPoolInterface::class => static function (ContainerInterface $container) {
        return new FilesystemAdapter(directory: $container->get(Aliases::class)->get('@runtime'));
    }, //One of the following adapters can be used instead: Psr16Adapter, RedisAdapter, MemcachedAdapter, DoctrineDbalAdapter, and so forth.

    Configuration::class => static function (ContainerInterface $container) use ($params) {
        $config = ORMSetup::createAttributeMetadataConfiguration( // on PHP >= 8.4, use ORMSetup::createAttributeMetadataConfig()
            paths: $params['doctrine']['paths'],
            isDevMode: $params['doctrine']['isDevMode'],
            cache: $container->get(CacheItemPoolInterface::class));
        $config->setAutoGenerateProxyClasses(ProxyFactory::AUTOGENERATE_FILE_NOT_EXISTS_OR_CHANGED);
        return $config;
    },

    EntityManagerInterface::class => static function (ContainerInterface $container) use ($params) {
        $configuration = $container->get(Configuration::class);
        return new EntityManager(
            DriverManager::getConnection(
                $params['doctrine']['connection'],
                $configuration
            ),
            $configuration);
    },
    EntityManagerProvider::class => SingleManagerProvider::class,

    SerializerInterface::class => PhpSerializer::class,
    'DoctrineTransport' => static function (ContainerInterface $container) use ($params) {
        $configuration = $container->get(Configuration::class);
        $connection = new Connection([], DriverManager::getConnection(
            $params['doctrine']['connection'],
            $configuration
        ));
        return new DoctrineTransport($connection, $container->get(SerializerInterface::class));
    },

    MyMessageBus::class => static function (ContainerInterface $container) {
        return new MyMessageBus([
            new SendMessageMiddleware(sendersLocator: new SendersLocator([
                MyMessage::class => ['DoctrineTransport']
            ], $container)),
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
                'DoctrineTransport' => DoctrineTransport::class
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

### 5. Dispatch a message.

Example:

```php
use App\Messages\MyMessage
use MyMessageBus;
use Psr\Http\Message\ResponseInterface;

final readonly class MyController
{
    public function __construct(private MyMessageBus $bus)
    {
    }
    
    public function sendMessage(): ResponseInterface
    {
        $this->bus->dispatch(new MyMessage('Hello Symfony Messenger!'));
        // ...
    }
}
```

### 6. Consume messages.

Example:
```bash
./yii symfony:messenger:consume DoctrineTransport --bus=MyMessageBus
```
