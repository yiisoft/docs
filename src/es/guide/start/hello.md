# Decir hola

Esta sección describe cómo crear una nueva página "Hello" en tu
aplicación. Es una página sencilla que devuelve lo que le pases o, si no le
pasas nada, simplemente dice "Hello!".

Para conseguirlo, definirás una ruta y crearás [un
manejador](../structure/action.md) que haga el trabajo y construya la
respuesta. Después lo mejorarás para que use una [vista](../views/view.md)
al construir la respuesta.

Con este tutorial aprenderás tres cosas:

1. Cómo crear un manejador que responda a una solicitud.
2. Cómo asociar una URL al manejador.
3. Cómo usar una [vista](../views/view.md) para componer el contenido de la
   respuesta.

## Crear un manejador

Para la tarea "Hello", crearás una clase manejadora que lee un parámetro
`message` de la solicitud y muestra ese mensaje al usuario. Si la solicitud
no proporciona un parámetro `message`, la acción mostrará el mensaje
predeterminado "Hello".

Crea `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Html\Html;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Action
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

En este ejemplo, el método `__invoke` recibe el parámetro `$message`, que
obtiene el mensaje de la URL gracias al atributo `RouteArgument`. Su valor
predeterminado es `"Hello!"`. Si la solicitud se hace a `/say/Goodbye`, la
acción asigna el valor "Goodbye" a la variable `$message`.

La aplicación pasa la respuesta por la [pila de
middlewares](../structure/middleware.md) hasta el emisor, que envía la
respuesta al usuario final.

## Configurar el router

Ahora, para asociar tu manejador a una URL, tienes que añadir una ruta en
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::get('/say[/{message}]')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

En el código anterior, asocias el patrón `/say[/{message}]` a
`\App\Web\Echo\Action`. Para cada solicitud, el router crea una instancia y
llama al método `__invoke()`. La parte `{message}` del patrón guarda en el
argumento de ruta `message` lo que se indique en esa posición. `[]` marca
esa parte del patrón como opcional.

También le das el nombre `echo/say` a esta ruta para poder generar URL que
apunten a ella.

## Probarlo

Después de crear la acción y la vista, abre
`http://localhost/say/Hello+World` en tu navegador.

Esta URL muestra una página con el texto "The message is: Hello World".

Si omites el parámetro `message` en la URL, la página muestra "The message
is: Hello!".

## Crear una plantilla de vista

Normalmente, la tarea es más complicada que imprimir "hello world" e implica
renderizar un HTML complejo. Para eso resulta práctico usar plantillas de
vista: son scripts que escribes para generar el cuerpo de una respuesta.

Para la tarea "Hello", crea una plantilla `src/Web/Echo/template.php` que
imprima el parámetro `message` recibido del método de acción:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

En el código anterior, el parámetro `message` se codifica en HTML antes de
imprimirlo. Es necesario porque el parámetro procede del usuario final y es
vulnerable a [ataques de cross-site scripting
(XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting), que insertan
JavaScript malicioso en el parámetro.

Naturalmente, puedes poner más contenido en la vista `say`. El contenido
puede incluir etiquetas HTML, texto plano e incluso sentencias PHP. De
hecho, el servicio de vistas ejecuta la vista `say` como un script PHP.

Para usar la vista, tienes que cambiar `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template', [
            'message' => $message,
        ]);
    }
}
```

Ahora abre el navegador y compruébalo de nuevo. Deberías ver un texto
parecido, pero con un layout aplicado.

Además, has separado la parte que define cómo funciona de la parte que
define cómo se presenta. En aplicaciones más grandes, esto ayuda mucho a
gestionar la complejidad.

## Resumen

En esta sección has trabajado con las partes de manejador y de plantilla de
una aplicación web típica. Has creado un manejador como parte de una clase
para gestionar una solicitud concreta. También has creado una vista para
componer el contenido de la respuesta. En este ejemplo sencillo no ha
intervenido ninguna fuente de datos, ya que el único dato usado era el
parámetro `message`.

También has aprendido cómo funciona el enrutamiento en Yii, que actúa como
puente entre las solicitudes de los usuarios y los manejadores.

En la siguiente sección aprenderás a obtener datos y a añadir una página
nueva que contiene un formulario HTML.
