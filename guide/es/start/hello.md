# Saying Hello

> [!NOTE]
> This document reflects the current configuration. Yii team is going to make it significantly simpler before release.

This section describes how to create a new "Hello" page in your application.
To achieve this goal, you will define a route, create [a handler](../structure/handler.md)
and use [view](../structure/views.md) to get content for response:

* The application will dispatch the request to the handler
* and the handler will in turn use view to render a template that shows the word "Hello" to the end user.

Through this tutorial, you will learn three things:

1. how to create a handler to respond to requests,
2. how to create a [view](../structure/view.md) to compose the response's content, and
3. how an application dispatches requests to [handlers](../structure/handler.md).


## Creating a Handler <span id="creating-handler"></span>

For the "Hello" task, you will create a `Hello` class with `say` method that reads
a `message` parameter from the request and displays that message back to the user. If the request
does not provide a `message` parameter, the action will display the default "Hello" message.

Create `src/Controller/Hello.php`:

```php
<?php
namespace App\Controller;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Html\Html;

class Hello
{
    private ResponseFactoryInterface $responseFactory;

    public function __construct(ResponseFactoryInterface $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }    

    public function say(ServerRequestInterface $request): ResponseInterface
    {
        $message = $request->getAttribute('message', 'Hello!');
        
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

The `say` method in our example is given `$request` parameter that we can use to obtain
message, whose value defaults to `"Hello"` (in 
the same way you set a default value for any function or method argument in PHP). When the application
receives a request and determines that the `say` action is responsible for handling said request, the application will
populate this parameter with the same named parameter found in the request. In other words, if the request includes
a `message` parameter with a value of `"Goodbye"`, the `$message` variable within the action will be assigned that value.

The response returned goes through [middleware stack](../structure/middleware.md) and then is outputted to end user
via emitter.

## Configuring router

Now to map our handler to URL we need to configure router. We will use a factory
to create the configured router. Create `src/Factory/AppRouterFactory`:

```php
<?php
namespace App\Factory;

use Psr\Container\ContainerInterface;
use Yiisoft\Router\FastRoute\UrlMatcher;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;
use Yiisoft\Router\RouteCollection;
use Yiisoft\Router\RouteCollectorInterface;
use App\Controller\Hello;

class AppRouterFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $routes = [
            Route::get('/say', [Hello::class, 'say']),
            Route::get('/say/{message}', [Hello::class, 'say']),
        ];

        $collector =  $container->get(RouteCollectorInterface::class);
        $collector->addGroup(Group::create(null, $routes));

        return new UrlMatcher(new RouteCollection($collector));
    }
}
```

In the above we are using FastRoute as routing engine and configuring two routes. For each route
a "controller" `Hello` will be created and its "action" method `say` will be invoked. 

The factory class should be used in the DI container to define router instance. To do that edit `config/web.php` by adding:

```php
use Yiisoft\Router\FastRoute\UrlGenerator;
use Yiisoft\Router\GroupFactory;
use Yiisoft\Router\RouteCollectorInterface;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Router\UrlMatcherInterface;
use App\Factory\AppRouterFactory;

return [
    // ...
    
    RouteCollectorInterface::class => new GroupFactory(),
    UrlMatcherInterface::class => new AppRouterFactory(),
    UrlGeneratorInterface::class => UrlGenerator::class,
];
```

## Trying it out <span id="trying-it-out"></span>

After creating the action and the view, start a web server with `./yii serve` and follow the following URL:

```
http://localhost:8080/say/Hello+World
```

This URL will result in a page displaying "The message is: Hello World".

If you omit the `message` parameter in the URL, you would see the page display "The message is: Hello!".

## Creating a View Template <span id="creating-view-template"></span>

Usually the task is more complicated than printing out hello world and involves rendering some complex
HTML. For this task it is handy to use [views templates](structure/view.md). They are scripts you
write to generate a response's body.

For the "Hello" task, you will create a `/views/say/say.php` view that prints the `message` parameter received from the action method:

```php
<?php
use Yiisoft\Html\Html;
?>
<?= Html::encode($message) ?>
```

Note that in the above code, the `message` parameter is HTML-encoded
before being printed. This is necessary as the parameter comes from an end user, making it vulnerable to
[cross-site scripting (XSS) attacks](https://en.wikipedia.org/wiki/Cross-site_scripting) by embedding
malicious JavaScript code in the parameter.

Naturally, you may put more content in the `say` view. The content can consist of HTML tags, plain text, and even
PHP statements. In fact, the `say` view is a PHP script that is executed by the view service.

To use the view we need to modify `src/Controller/Hello.php`:

```php
<?php
namespace App\Controller;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\View\ViewContextInterface;
use Yiisoft\View\WebView;

class Hello implements ViewContextInterface
{
    private ResponseFactoryInterface $responseFactory;
    private Aliases $aliases;
    private WebView $view;

    public function __construct(ResponseFactoryInterface $responseFactory, Aliases $aliases, WebView $view)
    {
        $this->responseFactory = $responseFactory;
        $this->aliases = $aliases;
        $this->view = $view;
    }    

    public function say(ServerRequestInterface $request): ResponseInterface
    {
        $message = $request->getAttribute('message', 'Hello!');
        
        return $this->render('say', [
            'message' => $message,
        ]);
    }
    
    private function render(string $view, array $parameters = []): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $content = $this->view->render($view, $parameters, $this);
        $response->getBody()->write($content);

        return $response;
    }

    public function getViewPath(): string
    {
        return $this->aliases->get('@views') . '/say';
    }
}
```

Here we're using `ViewContextInterface` tell a `view` service where to get templates. Producing response from a
template and parameters is done with `render()` method.

Sine we've used aliases, we have to configure them in DI container:

```php
use Yiisoft\Aliases\Aliases;

return [
    Aliases::class => [
        '__class' => Aliases::class,
        '__construct()' => [
            '@root' => dirname(__DIR__),
            '@views' => '@root/views',
        ],
    ],
];
```

TODO: Rewrite when application template is available. Should be way simpler then.

## Summary <span id="summary"></span>

In this section, you have touched the handler and view parts of the typical web application.
You created a handler as part of a class to handle a specific request. And you also created a view
to compose the response's content. In this simple example, no data source was involved as the only data used was the `message` parameter.

You have also learned about routing in Yii, which act as the bridge between user requests and handlers.

In the next section, you will learn how to fetch data, and add a new page containing an HTML form.
