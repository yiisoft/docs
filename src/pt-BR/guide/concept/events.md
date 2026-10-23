# Eventos

Eventos permitem executar código personalizado em determinados pontos da
execução, sem alterar o código que emite o evento.  Você associa a um evento
um código personalizado chamado listener. Quando o evento é disparado, o
listener é executado.

Por exemplo, quando um usuário se cadastra, você precisa enviar um e-mail de
boas-vindas. Dá para fazer isso no `SignupService`.  Mais tarde, quando você
também precisar redimensionar a imagem de avatar do usuário, o serviço vai
ter que saber disso também.

Um fluxo mais limpo é disparar um evento `UserSignedUp` a partir do
`SignupService`. O remetente do e-mail de boas-vindas e o processador de
avatar escutam esse evento. Trabalho adicional relacionado ao cadastro pode
ser incluído registrando outro listener.

O Yii usa o [yiisoft/yii-event](https://github.com/yiisoft/yii-event) para a
configuração de eventos da aplicação. Ele é construído sobre o pacote
[yiisoft/event-dispatcher](https://github.com/yiisoft/event-dispatcher), que
fornece um event dispatcher compatível com
[PSR-14](https://www.php-fig.org/psr/psr-14/).

## Classes de evento

Um evento é um objeto. Normalmente ele contém os dados de que os listeners
precisam:

```php
final readonly class UserSignedUp
{
    public function __construct(
        public SignupForm $form,
    ) {}
}
```

## Listeners de eventos

Um listener de evento é um [callable do
PHP](https://www.php.net/manual/en/language.types.callable.php) que recebe
um evento:

```php
static function (UserSignedUp $event): void {
    // Envia um e-mail de boas-vindas.
}
```

Você também pode usar uma classe invocável:

```php
final readonly class WelcomeEmailSender
{
    public function __invoke(UserSignedUp $event): void
    {
        // Envia um e-mail de boas-vindas.
    }
}
```

## Configurando listeners de eventos

Em uma aplicação, configure os listeners em:

- `config/events.php` para todos os tipos de aplicação.
- `config/events-web.php` para eventos da aplicação web.
- `config/events-console.php` para eventos da aplicação de console.

A configuração é um array em que as chaves são os nomes das classes de
evento e os valores são listas de listeners:

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

O listener pode ser uma closure, um array callable, um objeto invocável, o
nome de uma classe invocável ou um alias de DI.  Para listeners do tipo
closure e array callable, os parâmetros depois do primeiro (o evento) são
resolvidos pelo container de DI.  Nomes de classes invocáveis são
instanciados pelo container.

As dependências são resolvidas quando o evento é disparado.

## Disparando eventos

Para disparar um evento, use `Psr\EventDispatcher\EventDispatcherInterface`:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

final readonly class SignupService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function signup(SignupForm $form): void
    {
        // Cadastra o usuário.

        $this->eventDispatcher->dispatch(new UserSignedUp($form));
    }
}
```

O dispatcher pede a um listener provider os listeners que correspondem ao
evento e os chama um por um.

## Ordem dos listeners

Quando vários listeners são configurados para o mesmo evento, eles são
chamados na ordem em que aparecem na configuração.  Se um evento implementa
`Psr\EventDispatcher\StoppableEventInterface`, o dispatcher verifica
`isPropagationStopped()` antes de chamar o próximo listener. Quando ele
retorna `true`, o dispatcher para de processar o evento.

Mantenha os listeners independentes sempre que possível. A ordem é útil para
necessidades técnicas, mas a lógica de negócio costuma ser mais fácil de
manter quando cada listener consegue rodar sozinho.

## Hierarquia de eventos

Eventos não têm nomes nem correspondência por curinga. Nomes de classes de
evento, interfaces e herança podem ser usados quando um listener precisa
tratar vários eventos relacionados:

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

Com a interface, você pode escutar todos os eventos relacionados a
documentos:

```php
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (DocumentEvent $event): void {
        // Registra em log os eventos de documentos.
    });

$provider = new Provider($listeners);
```

## Configuração manual do listener provider

Em uma aplicação, use a configuração de eventos. Para código de pacotes ou
testes, você pode criar um listener provider manualmente:

```php
use Yiisoft\EventDispatcher\Dispatcher\Dispatcher;
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (UserSignedUp $event): void {
        // Envia um e-mail de boas-vindas.
    });

$provider = new Provider($listeners);
$dispatcher = new Dispatcher($provider);

$dispatcher->dispatch(new UserSignedUp($form));
```

`ListenerCollection::add()` retorna uma nova instância da coleção. Atribua o resultado ao montar uma coleção passo a passo:

```php
$listeners = new ListenerCollection();
$listeners = $listeners->add(
    static function (UserSignedUp $event): void {
        // Envia um e-mail de boas-vindas.
    },
    UserSignedUp::class,
);
```
