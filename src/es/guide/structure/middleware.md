# Middleware

Yii trabaja con HTTP mediante una capa de abstracción construida sobre las
[interfaces de mensajes HTTP de PSR-7](https://www.php-fig.org/psr/psr-7/) y
las [interfaces de manejadores de solicitudes y middlewares de
PSR-15](https://www.php-fig.org/psr/psr-15/).

La aplicación se compone de uno o varios middlewares. Los middlewares se
ejecutan entre la solicitud y la respuesta. Cuando se solicita una URL, el
objeto de solicitud se pasa al despachador de middlewares, que empieza a
ejecutar los middlewares uno tras otro. Cada middleware, dada la solicitud,
puede:

- Pasar la solicitud al siguiente middleware y realizar algún trabajo antes
  o después.
- Formar la respuesta y devolverla.

Según los middlewares que se usen, el comportamiento de la aplicación puede
variar mucho.

![Middleware](/images/guide/middleware.svg)

En la imagen anterior, cada middleware envuelve al anterior. También se
puede representar así:

![Middleware](/images/guide/middleware_alternative.svg)

## Usar middlewares

Con Yii se puede usar cualquier middleware compatible con
[PSR-15](https://www.php-fig.org/psr/psr-15/), y hay muchos. Supongamos que
necesitas añadir autenticación básica a una de las URL de la aplicación. Los
middlewares que dependen de la URL se configuran con el router, así que
tienes que cambiar la factoría del router.

El middleware de autenticación lo implementa el paquete
`middlewares/http-authentication`, así que ejecuta `composer require
middlewares/http-authentication` en el directorio raíz de la aplicación.

Ahora registra el middleware en la configuración del contenedor DI,
`config/web.php`:

```php
<?php
\Middlewares\BasicAuthentication::class => [
    'class' => \Middlewares\BasicAuthentication::class,
    '__construct()' => [
        'users' => [
            'foo' => 'bar',
        ],
    ],
    'realm()' => ['Access to the staging site via basic auth'],
    'attribute()' => ['username'],
],
```

En `config/routes.php`, añade una nueva ruta:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Route;
use App\Controller\SiteController;
use Middlewares\BasicAuthentication;


return [
    //...
    Route::get('/basic-auth')
        ->action([SiteController::class, 'auth'])
        ->name('site/auth')
        ->prependMiddleware(BasicAuthentication::class)
];
```

Al configurar el enrutamiento, asocias la URL `/basic-auth` a una cadena de
middlewares formada por la autenticación básica y la propia acción. Una
cadena es un middleware especial que ejecuta todos los middlewares con los
que se ha configurado.

La acción en sí podría ser la siguiente:

```php
public function auth(ServerRequestInterface $request): ResponseInterface
{
    $response = $this->responseFactory->createResponse();
    $response->getBody()->write('Hi ' . $request->getAttribute('username'));
    return $response;
}
```

El middleware de autenticación básica escribió el atributo `username` en la
solicitud, así que puedes acceder a ese dato si lo necesitas.

Para aplicar un middleware a toda la aplicación, independientemente de la
URL, ajusta `config/application.php`:

```php
return [
    Yiisoft\Yii\Http\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            ErrorCatcher::class,
                            BasicAuthentication::class,
                            SessionMiddleware::class,
                            CsrfTokenMiddleware::class,
                            Router::class,
                        ]
                    );
            }),
            'fallbackHandler' => Reference::to(NotFoundHandler::class),
        ],
    ],
];
```

## Crear tu propio middleware

Para crear un middleware, tienes que implementar el único método `process`
de `Psr\Http\Server\MiddlewareInterface`:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface;
```

Hay varias formas de gestionar una solicitud, y la elección depende de lo
que deba conseguir el middleware.

### Formar una respuesta directamente

Para responder directamente, hace falta una factoría de respuestas que se
pasa mediante el constructor:

```php
<?php
declare(strict_types=1);

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final readonly class RespondingMiddleware implements MiddlewareInterface
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory
    )
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

### Delegar la gestión en el siguiente middleware

Si el middleware no está pensado para formar una respuesta ni para cambiar la solicitud, o si esta vez no puede hacer nada,
la gestión puede dejarse al siguiente middleware de la pila:  

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    return $handler->handle($request);    
}
```

Si necesitas pasar datos al siguiente middleware, puedes usar los atributos
de la solicitud:

```php
$request = $request->withAttribute('answer', 42);
return $handler->handle($request);
``` 

Para obtenerlos en el siguiente middleware:

```php
$answer = $request->getAttribute('answer');
```

### Capturar la respuesta para manipularla

Puede que quieras capturar la respuesta para manipularla. Puede ser útil
para añadir cabeceras CORS, comprimir el contenido con gzip, etc.

```php
$response = $handler->handle($request);
// gestión adicional
return $response;
```
