# Acciones

En una aplicación web, la URL de la solicitud determina qué se ejecuta. La
coincidencia la realiza un router configurado con varias rutas. Cada ruta
puede asociarse a un middleware que, dada una solicitud, produce una
respuesta. Como los middlewares pueden encadenarse y pasar la gestión real
al siguiente middleware, llamamos acción al middleware que realmente hace el
trabajo.

Hay varias formas de describir una acción. La más sencilla es usar una
closure:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\Route;

Route::get('/')->action(function (ServerRequestInterface $request) use ($responseFactory): ResponseInterface {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
});
```

Esto sirve para una gestión sencilla, ya que cualquier otra más complicada
requeriría obtener dependencias, así que es buena idea trasladar la gestión
a un método de clase. Para ello se puede usar un middleware de callback:

```php
use Yiisoft\Router\Route;

Route::get('/')->action(FrontPageAction::class),
```

La clase en sí sería así:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

final readonly class FrontPageAction
{
    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        // construir la respuesta para la portada    
    }
}
```

En muchos casos tiene sentido agrupar en una sola clase la gestión de muchas
rutas:


```php
use Yiisoft\Router\Route;

Route::get('/post/index')->action([PostController::class, 'actionIndex']),
Route::get('/post/view/{id:\d+}')->action([PostController::class, 'actionView']),
```

La clase en sí tendría este aspecto:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class PostController
{
    public function actionIndex(ServerRequestInterface $request): ResponseInterface
    {
        // renderizar la lista de posts
    }
    
    
    public function actionView(
        ServerRequestInterface $request,
        #[RouteArgument('id')]
        int $id,
    ): ResponseInterface
    {
        // renderizar un único post por su $id
    }
}
```

Normalmente llamamos a este tipo de clase "controlador".

La parte `{id}` de la ruta `/post/view/{id:\d+}` es un parámetro de ruta con
nombre. Los parámetros de ruta están disponibles en
`Yiisoft\Router\CurrentRoute`. Para recibir uno como argumento de la acción,
añade el atributo `RouteArgument` al parámetro correspondiente. El nombre
del atributo debe coincidir con el nombre del parámetro de ruta.

## Autowiring

Tanto los constructores de las clases de acción como los métodos de acción obtienen automáticamente los servicios
 del contenedor de inyección de dependencias:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;

final readonly class PostController
{
    public function __construct(
        private PostRepository $postRepository
    )
    {
    }

    public function actionIndex(ServerRequestInterface $request, LoggerInterface $logger): ResponseInterface
    {
        $logger->debug('Rendering posts list');
        // renderizar la lista de posts
    }
    
    
    public function actionView(ServerRequestInterface $request): ResponseInterface
    {
        // renderizar un único post      
    }
}
```

En el ejemplo anterior, `PostRepository` se inyecta automáticamente mediante
el constructor. Eso significa que está disponible en todas las acciones. El
logger solo se inyecta en la acción `index`.
