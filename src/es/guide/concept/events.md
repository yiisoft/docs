# Eventos

Los eventos te permiten ejecutar código personalizado en determinados puntos
de la ejecución sin cambiar el código que emite el evento. A un evento se le
asocia un código personalizado llamado listener. Cuando se despacha el
evento, se ejecuta el listener.

Por ejemplo, cuando un usuario se registra, tienes que enviarle un correo de
bienvenida. Puedes hacerlo en `SignupService`. Más adelante, cuando también
necesites redimensionar la imagen del avatar del usuario, el servicio tendrá
que saber eso también.

Un flujo más limpio consiste en despachar un evento `UserSignedUp` desde
`SignupService`. El remitente del correo de bienvenida y el procesador de
avatares escuchan este evento. Para añadir más tareas relacionadas con el
registro, basta con registrar otro listener.

Yii usa [yiisoft/yii-event](https://github.com/yiisoft/yii-event) para
configurar los eventos de la aplicación. Se basa en el paquete
[yiisoft/event-dispatcher](https://github.com/yiisoft/event-dispatcher), que
proporciona un despachador de eventos compatible con
[PSR-14](https://www.php-fig.org/psr/psr-14/).

## Clases de eventos

Un evento es un objeto. Normalmente contiene los datos que necesitan los
listeners:

```php
final readonly class UserSignedUp
{
    public function __construct(
        public SignupForm $form,
    ) {}
}
```

## Listeners de eventos

Un listener de eventos es un [callable de
PHP](https://www.php.net/manual/en/language.types.callable.php) que recibe
un evento:

```php
static function (UserSignedUp $event): void {
    // Enviar un correo de bienvenida.
}
```

También puedes usar una clase invocable:

```php
final readonly class WelcomeEmailSender
{
    public function __invoke(UserSignedUp $event): void
    {
        // Enviar un correo de bienvenida.
    }
}
```

## Configurar los listeners de eventos

En una aplicación, los listeners se configuran en:

- `config/events.php` para todos los tipos de aplicación.
- `config/events-web.php` para los eventos de la aplicación web.
- `config/events-console.php` para los eventos de la aplicación de consola.

La configuración es un array cuyas claves son los nombres de las clases de
eventos y cuyos valores son listas de listeners:

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

El listener puede ser una closure, un array callable, un objeto invocable,
el nombre de una clase invocable o un alias del contenedor DI. En los
listeners que son closures o arrays callables, los parámetros que siguen al
primer parámetro (el evento) se resuelven desde el contenedor DI. El
contenedor instancia las clases invocables indicadas por su nombre.

Las dependencias se resuelven cuando se despacha el evento.

## Despachar eventos

Para despachar un evento, usa
`Psr\EventDispatcher\EventDispatcherInterface`:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

final readonly class SignupService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function signup(SignupForm $form): void
    {
        // Registrar al usuario.

        $this->eventDispatcher->dispatch(new UserSignedUp($form));
    }
}
```

El despachador pide a un proveedor de listeners los listeners que coinciden
con el evento y los llama uno a uno.

## Orden de los listeners de eventos

Cuando hay varios listeners configurados para el mismo evento, se llaman en
el orden en que aparecen en la configuración. Si un evento implementa
`Psr\EventDispatcher\StoppableEventInterface`, el despachador comprueba
`isPropagationStopped()` antes de llamar al siguiente listener. Cuando
devuelve `true`, el despachador deja de procesar el evento.

Mantén los listeners independientes siempre que puedas. El orden es útil
para necesidades técnicas, pero la lógica de negocio suele ser más fácil de
mantener cuando cada listener puede ejecutarse por sí solo.

## Jerarquía de eventos

Los eventos no tienen nombres ni coincidencia con comodines. Cuando un
listener debe gestionar varios eventos relacionados, puedes usar los nombres
de las clases de eventos, las interfaces y la herencia:

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

Con la interfaz, puedes escuchar todos los eventos relacionados con
documentos:

```php
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (DocumentEvent $event): void {
        // Registrar en el log los eventos de documentos.
    });

$provider = new Provider($listeners);
```

## Configurar manualmente el proveedor de listeners

En una aplicación, usa la configuración de eventos. En el código de paquetes
o en las pruebas, puedes crear un proveedor de listeners manualmente:

```php
use Yiisoft\EventDispatcher\Dispatcher\Dispatcher;
use Yiisoft\EventDispatcher\Provider\ListenerCollection;
use Yiisoft\EventDispatcher\Provider\Provider;

$listeners = (new ListenerCollection())
    ->add(static function (UserSignedUp $event): void {
        // Enviar un correo de bienvenida.
    });

$provider = new Provider($listeners);
$dispatcher = new Dispatcher($provider);

$dispatcher->dispatch(new UserSignedUp($form));
```

`ListenerCollection::add()` devuelve una nueva instancia de la colección. Asigna el resultado cuando construyas una colección paso a paso:

```php
$listeners = new ListenerCollection();
$listeners = $listeners->add(
    static function (UserSignedUp $event): void {
        // Enviar un correo de bienvenida.
    },
    UserSignedUp::class,
);
```
