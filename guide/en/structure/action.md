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

It is fine for very simple handling since any more complicated one would require getting dependencies so
a good idea would be moving the handling to a class method. Callback middleware could be used for the purpose:

```php
use Yiisoft\Router\Route;

Route::get('/', new ActionCaller(FrontPageAction::class, 'run', $container)),
```

The class itself would like:

```php
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class FrontPageAction
{
    public function run(ServerRequestInterface $request): ResponseInterface
    {
        // render front page    
    }
}
```

For many cases it makes sense to group handling for multiple routes into a single class:


```php
use Yiisoft\Router\Route;

Route::get('/post/index', new ActionCaller(PostController::class, 'actionIndex', $container)),
Route::get('/post/view/{id:\d+}', new ActionCaller(PostController::class, 'actionView', $container)),
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

This class is usually called "controller". Above code is quite repetitive so you can use `WebActionsCaller`
middleware:

```php
use Yiisoft\Router\Route;
use Yiisoft\Yii\Web\Middleware\WebActionsCaller;

Route::anyMethod('/post/{action:\w+}', new WebActionsCaller(PostController::class, $container)),
```

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

