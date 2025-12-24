# Eventos

Los eventos permiten ejecutar código personalizado en ciertos puntos de
ejecución sin modificar el código existente.
A un evento se le puede acoplar un código especial llamado gestor (handler),
de manera que una vez que el evento se dispare (triggered),
el código se ejecuta de manera automática.

Por ejemplo, cuando un usuario se registra debes enviarle un correo
electrónico de bienvenida. Puedes realizar esto directamente en
`RegistroService`,
pero luego adicionalmente debes redimensionar la imagen del avatar del
usuario, y tendrás que modificar nuevamente `RegistroService`.
En otras palabras, a `RegistroService` se le acoplan el codigo de enviar un
correo de bienvenida y redimensionar la imagen del avatar.
 
Para evitar todo eso, en vez de decir explicitamente qué hacer despues de un registro, podemos levantar el evento `UsuarioRegistrado`
y luego finalizar el proceso de registro. El código que envía el correo y el código que redimensiona la imagen de avatar se adjuntan al evento
y por lo tanto serán ejecutados cuando el evento se dispara. Si alguna vez se necesita hacer más cosas en el proceso de registro, puedes añadir distintos gestores de
eventos sin necesidad de modificar `RegistroService`.
 
Para levantar eventos y acoplar gestores a esos eventos, Yii tiene un
servicio especial llamado despachador de eventos.
Se encuentra disponible en el [paquete
yiisoft/event-dispatcher](https://github.com/yiisoft/event-dispatcher).

## Gestores de Eventos <span id="event-handlers"></span>

An event handler is [PHP
callable](https://www.php.net/manual/en/language.types.callable.php) that
gets executed when the event it's attached to is triggered.

La firma de un gestor de eventos es:

```php
function (EventClass $event) {
    // gestionar evento
}
```

## Acoplar Gestores de Eventos <span id="attaching-event-handlers"></span>

Puedes acoplar un gestor a un evento como se demuestra a continuación:

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
        // gestionar evento
    }
}
```

El método `attach()` acepta funciones de retorno (callbacks). Dependiendo
del argumento de la función de retorno
se determina el tipo de evento.

## Orden de Gestores de Eventos

Se puede acoplar uno o más gestores a un único evento. Cuando se lanza un
evento, se ejecutarán los gestores adjuntos
en el orden que se hayan añadido al evento. En el caso que un evento
implemente `Psr\EventDispatcher\StoppableEventInterface`,
el gestor de eventos puede detener la ejecución del resto de los gestores
que le siguen si `isPropagationStopped()` devuelve `true`.

En general, lo mejor es no depender del orden de los gestores de eventos.

## Lanzamiento de Eventos <span id="raising-events"></span>

Los eventos se lanzan de la siguiente forma:

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

Primero, estamos creando un evento entregandole datos que pueden ser útiles
para los gestores. Luego, se lanza el evento.

La clase del evento en sí se podría ver como esto:

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

## Jerarquía de Eventos

Los eventos no tienen nombre o wildcard matching por una razón. Los nombres
de clases de los eventos y la jerarquía de clases/interfaces
y composición se puede utilizar para obtener mayor flexibilidad:

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

Para que la interface de arriba escuche todos los eventos relacionados con
documentos, se puede realizar de la siguiente forma:


```php
$provider->attach(function (DocumentEvent $event) {
    // log events here
});
``` 

## Desacoplar Gestores de Eventos <span id="detaching-event-handlers"></span>

Para desacoplar un gestor de eventos puedes llamar al método `detach()`:


```php
$provider->detach(DocmentEvent::class);
```

## Configuring application events

You usually assign event handlers via application config. See
["Configuration"](configuration.md) for details.
