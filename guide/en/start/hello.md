# Saying Hello

> Note: This document reflects the current configuration. Yii team is going to make it simpler before release.

This section describes how to create a new "Hello" page in your application. It is a simple page that will
echo back whatever you pass to it or, if nothing passed, will just say "Hello!".

To achieve this goal, you will define a route and create [a handler](../structure/handler.md) that does the job and
forms the response. Then we will improve it to use [view](../structure/views.md) for building the response.

Through this tutorial, you will learn three things:

1. How to create a handler to respond to requests.
2. How to map URL to the handler.
3. How to create a [view](../structure/view.md) to compose the response's content.

## Creating a Handler <span id="creating-handler"></span>

For the "Hello" task, you will create a `EchoController` class with `say` method that reads
a `message` parameter from the request and displays that message back to the user. If the request
does not provide a `message` parameter, the action will display the default "Hello" message.

Create `src/Controller/EchoController.php`:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Html\Html;

class EchoController
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
a message, whose value defaults to `"Hello"` (in 
the same way you set a default value for any function or method argument in PHP). When the application
receives a request and determines that the `say` action is responsible for handling said request, the application will
populate this parameter with the same named parameter found in the request. In other words, if the request includes
a `message` parameter with a value of `"Goodbye"`, the `$message` variable within the action will be assigned that value.

The response returned goes through [middleware stack](../structure/middleware.md) into emitter that outputs response
to the end user.

## Configuring router

Now to map our handler to URL we need to add a route in `config/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Controller\EchoController;
use App\Contact\ContactController;
use App\Controller\SiteController;
use Yiisoft\Router\Route;
use Yiisoft\Http\Method;

return [
    Route::get('/', [SiteController::class, 'index'])->name('site/index'),
    Route::get('/about', [SiteController::class, 'about'])->name('site/about'),
    Route::methods([Method::GET, Method::POST], '/contact', [ContactController::class, 'contact'])
        ->name('contact/form'),
    Route::get('/say[/{message}]', [EchoController::class, 'say'])->name('echo/say'),
];
```

In the above we are mapping `/say[/{message}]` pattern to `EchoController::say()`. For a request its instance will
be created and `say()` method will be called. The pattern `{message}` part means that anything specified in this place
will be written to `message` request attribute. `[]` means that this part of the pattern is optional. 

We also give a `echo/say` name to this route in order to be able to generate URLs pointing to it.

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

For the "Hello" task, create a `/resources/views/echo/say.php` view that prints the `message` parameter received
from the action method:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p><?= Html::encode($message) ?></p>
```

Note that in the above code, the `message` parameter is HTML-encoded
before being printed. This is necessary as the parameter comes from an end user, making it vulnerable to
[cross-site scripting (XSS) attacks](http://en.wikipedia.org/wiki/Cross-site_scripting) by embedding
malicious JavaScript in the parameter.

Naturally, you may put more content in the `say` view. The content can consist of HTML tags, plain text, and even
PHP statements. In fact, the `say` view is a PHP script that is executed by the view service.

To use the view we need to modify `src/Controller/EchoController.php`:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\ViewRenderer;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class EchoController
{
    private ViewRenderer $viewRenderer;
    
    public function __construct(ViewRenderer $viewRenderer)
    {
        $this->viewRenderer = $viewRenderer->withControllerName('echo');
    }

    public function say(ServerRequestInterface $request): ResponseInterface
    {
        $message = $request->getAttribute('message', 'Hello!');

        return $this->viewRenderer->render('say', [
            'message' => $message,
        ]);
    }
}
```

Now open your browser and check it again. It should give you similar text but with a layout applied.

Also, we have separated the part about how it works and part about how it is presented. In the larger applications
it helps a lot to deal with complexity.

## Summary <span id="summary"></span>

In this section, you have touched the handler and view parts of the typical web application.
You created a handler as part of a class to handle a specific request. You also created a view
to compose the response's content. In this simple example, no data source was involved as the only data used was
the `message` parameter.

You have also learned about routing in Yii, which act as the bridge between user requests and handlers.

In the next section, you will learn how to fetch data, and add a new page containing an HTML form.
