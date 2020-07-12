# Actions

In a web application what is executed is determined by request URL. Matching is made by router that is
configured with multiple routes. Each route can be attached a middleware that, given request, produces
a response. Since middleware overall could be chained and can pass actual handling to next middleware,
we call the middleware actually doing the job an action.

There are multiple ways to describe an action. Simplest one is using a closure:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\Route;

Route::get('/', function (ServerRequestInterface $request) use ($responseFactory): ResponseInterface {
    $response = $responseFactory->createResponse();
    $response->getBody()->write('You are at homepage.');
    return $response;
}));
```

It is fine for simple handling since any more complicated one would require getting dependencies so
a good idea would be moving the handling to a class method. Callback middleware could be used for the purpose:

```php
use Yiisoft\Router\Route;

Route::get('/', [FrontPageAction::class, 'run']),
```

The class itself would like:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class FrontPageAction
{
    public function run(ServerRequestInterface $request): ResponseInterface
    {
        // build response for a front page    
    }
}
```

For many cases it makes sense to group handling for multiple routes into a single class:


```php
use Yiisoft\Router\Route;

Route::get('/post/index', [PostController::class, 'actionIndex']),
Route::get('/post/view/{id:\d+}', [PostController::class, 'actionView']),
```

The class itself would look like the following:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class PostController
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

We usually call this class a "controller".

## Autowiring

Both constructors of action-classes and action-methods are automatically getting services from
dependency injection container:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;

class PostController
{
    private $postRepository;

    public function __construct(PostRepository $postRepository)
    {
        $this->postRepository = $postRepository;
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

