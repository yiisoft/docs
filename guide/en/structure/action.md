# Actions

In a web application, the request URL determines what's executed. Matching is made by a router 
configured with multiple routes. Each route can be attached to a middleware that, given request, produces
a response. Since middleware overall could be chained and can pass actual handling to the next middleware,
we call the middleware actually doing the job an action.

There are multiple ways to describe an action. The simplest one is using a closure:

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

It's fine for simple handling since any more complicated one would require getting dependencies, so
a good idea would be moving the handling to a class method. Callback middleware could be used for the purpose:

```php
use Yiisoft\Router\Route;

Route::get('/')->action([FrontPageAction::class, 'run']),
```

The class itself would be like:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

final readonly class FrontPageAction
{
    public function run(ServerRequestInterface $request): ResponseInterface
    {
        // build response for a front page    
    }
}
```

For many cases, it makes sense to group handling for many routes into a single class:


```php
use Yiisoft\Router\Route;

Route::get('/post/index')->action([PostController::class, 'actionIndex']),
Route::get('/post/view/{id:\d+}')->action([PostController::class, 'actionView']),
```

The class itself would look like the following:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

final readonly class PostController
{
    public function actionIndex(ServerRequestInterface $request): ResponseInterface
    {
        // render posts list
    }
    
    
    public function actionView(ServerRequestInterface $request): ResponseInterface
    {
        // render a single post      
    }
}
```

We usually call such a class "controller."

## Autowiring

Both constructors of action-classes and action-methods are automatically getting services from
 the dependency injection container:

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
        // render posts list
    }
    
    
    public function actionView(ServerRequestInterface $request): ResponseInterface
    {
        // render a single post      
    }
}
```

In the above example `PostRepository` is injected automatically via constructor. That means it is available in every
action. Logger is injected into `index` action only. 

