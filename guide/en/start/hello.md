# Saying hello

This section describes how to create a new "Hello" page in your application.
It's a simple page that will echo back whatever you pass to it or, if nothing passed, will just say "Hello!".

To achieve this goal, you will define a route and create [a handler](../structure/handler.md) that does the job and
forms the response.
Then you will improve it to use [view](../structure/views.md) for building the response.

Through this tutorial, you will learn three things:

1. How to create a handler to respond to a request.
2. How to map URL to the handler.
3. How to create a [view](../structure/view.md) to compose the response's content.

## Creating a handler <span id="creating-handler"></span>

For the "Hello" task, you will create a handler class that reads
a `message` parameter from the request and displays that message back to the user. If the request
doesn't provide a `message` parameter, the action will display the default "Hello" message.

Create `src/Controller/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Controller\Echo;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Html\Html;
use Yiisoft\Router\CurrentRoute;

final readonly class Action
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(CurrentRoute $currentRoute): ResponseInterface
    {
        $message = $currentRoute->getArgument('message', 'Hello!');

        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

The `__invoke` method in your example is given `$currentRoute` parameter that you can use to get
a message, whose value defaults to `"Hello"`. If the request is made to `/say/Goodbye`,
the `$message` variable within the action will be assigned "Goodbye" value.

The response returned goes through [middleware stack](../structure/middleware.md) into emitter that outputs response
to the end user.

## Configuring router

Now, to map your handler to URL, you need to add a route in `config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(\App\Controller\HomePage\Action::class)
                ->name('home'),
            Route::get('/say[/{message}]')
                ->action(\App\Controller\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

In the above you're mapping `/say[/{message}]` pattern to `\App\Controller\Echo\Action`. For a request its instance will
be created and `__invoke()` method will be called. The pattern `{message}` part makes anything specified in this place
to be written to `message` request attribute. `[]` means that this part of the pattern is optional. 

You also give a `echo/say` name to this route to be able to generate URLs pointing to it.

## Trying it out <span id="trying-it-out"></span>

After creating the action and the view, start a web server with `make up` and follow the following URL:

```
http://localhost/say/Hello+World
```

This URL will result in a page displaying "The message is: Hello World".

If you omit the `message` parameter in the URL, you would see the page display "The message is: Hello!".

## Creating a View Template <span id="creating-view-template"></span>

Usually, the task is more complicated than printing out "hello world" and involves rendering some complex
HTML. For this task, it's handy to use [views templates](../structure/view.md). They're scripts you
write to generate a response's body.

For the "Hello" task, create a `src/Controller/Echo/template.php` template that prints the `message` parameter received
from the action method:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

Note that in the above code, the `message` parameter is HTML-encoded
before being printed. This is necessary as the parameter comes from an end user, making it vulnerable to
[cross-site scripting (XSS) attacks](https://en.wikipedia.org/wiki/Cross-site_scripting) by embedding
malicious JavaScript in the parameter.

Naturally, you may put more content in the `say` view. The content can consist of HTML tags, plain text, and even
PHP statements. In fact, the `say` view is a PHP script executed by the view service.

To use the view, you need to change `src/Controller/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Controller\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
    ) {}

    public function __invoke(CurrentRoute $currentRoute): ResponseInterface
    {
        $message = $currentRoute->getArgument('message', 'Hello!');

        return $this->viewRenderer->render(__DIR__ . '/template', [
            'message' => $message,
        ]);
    }
}
```

Now open your browser and check it again. It should give you a similar text but with a layout applied.

Also, you've separated the part about how it works and part of how it's presented. In the larger applications, 
it helps a lot to deal with complexity.

## Summary <span id="summary"></span>

In this section, you've touched the handler and template parts of the typical web application.
You created a handler as part of a class to handle a specific request. You also created a view
to compose the response's content. In this simple example, no data source was involved as the only data used was
the `message` parameter.

You've also learned about routing in Yii, which acts as the bridge between user requests and handlers.

In the next section, you will learn how to fetch data and add a new page containing an HTML form.
