Saying Hello
============

> Note: This document reflects current configuration. Yii team is going to make it significantly simpler before release.

This section describes how to create a new "Hello" page in your application.
To achieve this goal, you will define a route, create [a handler](structure/handler.md)
and use [view](structure/views.md) to get content for response:

* The application will dispatch the request to the handler
* and the handler will in turn use view to render a template that shows the word "Hello" to the end user.

Through this tutorial, you will learn three things:

1. how to create an handler to respond to requests,
2. how to create a [view](structure/view.md) to compose the response's content, and
3. how an application dispatches requests to [handlers](structure/handler.md).


## Creating a Handler <span id="creating-handler"></span>

For the "Hello" task, you will create a `Hello` class with `say` method that reads
a `message` parameter from the request and displays that message back to the user. If the request
does not provide a `message` parameter, the action will display the default "Hello" message.

Create `Controller/Hello.php`:

```php
<?php
namespace App\Controller;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class Hello
{
    private $responseFactory;

    public function __construct(ResponseFactoryInterface $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }    

    public function say(ServerRequestInterface $request): ResponseInterface
    {
        $message = $request->getAttribute('message', 'Hello!');
        
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . $this->encodeHtml($message));
        return $response;
    }
    
    private function encodeHtml(string $string): string
    {
        return htmlspecialchars($string, ENT_QUOTES | ENT_SUBSTITUTE);
    }

}
```

The `say` method in our example is given `$request` parameter that we can use to obtain
message, whose value defaults to `"Hello"` (in exactly
the same way you set a default value for any function or method argument in PHP). When the application
receives a request and determines that the `say` action is responsible for handling said request, the application will
populate this parameter with the same named parameter found in the request. In other words, if the request includes
a `message` parameter with a value of `"Goodbye"`, the `$message` variable within the action will be assigned that value.

## Configuring router

Now in order to map our handler to URL we need to configure router. We will use a factory
to create configured router. Create `src/Factory/AppRouterFactory`:

```php
<?php
namespace App\Factory;

use Psr\Container\ContainerInterface;
use Yiisoft\Router\FastRoute\FastRouteFactory;
use Yiisoft\Router\Route;
use Yiisoft\Router\RouterFactory;
use Yiisoft\Web\Middleware\Controller;
use App\Controller\Hello;

class AppRouterFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $routes = [
            Route::get('/say')->to(new Controller(Hello::class, 'say', $container)),
            Route::get('/say/{message}')->to(new Controller(Hello::class, 'say', $container)),
        ];

        return (new RouterFactory(new FastRouteFactory(), $routes))($container);
    }

    public static function __set_state(array $state): self
    {
        return new self();
    }
}
```

In the above we are using FastRoute as routing engine and configuring two routes. For each route
a "controller" `Hello` will be created and its "action" method `say` will be invoked. 

The factory class should be used in the DI container to define router instance. In order
to do that edit `config/web.php` by adding:

```php
use Yiisoft\Router\RouterInterface;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Router\UrlMatcherInterface;
use App\Factory\AppRouterFactory;

return [
    // ...
    RouterInterface::class => new AppRouterFactory(),
    UrlMatcherInterface::class => Reference::to(RouterInterface::class),
    UrlGeneratorInterface::class => Reference::to(RouterInterface::class),
];
```

## Creating a View Template <span id="creating-view-template"></span>

[Views templates](structure/view.md) are scripts you write to generate a response's body.
For the "Hello" task, you will create a `say` view that prints the `message` parameter received from the action method:

```php
<?php
use Yiisoft\Yii\Helper\Html;
?>
<?= Html::encode($message) ?>
```

Note that in the above code, the `message` parameter is [[yii\helpers\Html::encode()|HTML-encoded]]
before being printed. This is necessary as the parameter comes from an end user, making it vulnerable to
[cross-site scripting (XSS) attacks](http://en.wikipedia.org/wiki/Cross-site_scripting) by embedding
malicious JavaScript code in the parameter.

Naturally, you may put more content in the `say` view. The content can consist of HTML tags, plain text, and even PHP statements.
In fact, the `say` view is just a PHP script that is executed by the ...

The content printed by the view script will be returned ... The application will in turn output this result to the end user.


## Trying it Out <span id="trying-it-out"></span>

After creating the action and the view, you may access the new page by accessing the following URL:

```
http://localhost:8080/say/Hello+World
```

![Hello World](images/start-hello-world.png)

This URL will result in a page displaying "Hello World".

If you omit the `message` parameter in the URL, you would see the page display just "Hello".


## Summary <span id="summary"></span>

In this section, you have touched the handler and view parts of the typical web application.
You created a handler as part of a class to handle a specific request. And you also created a view
to compose the response's content. In this simple example, no data source was involved as the only data used was the `message` parameter.

You have also learned about routing in Yii, which act as the bridge between user requests and handlers.

In the next section, you will learn how to fetch data, and add a new page containing an HTML form.
