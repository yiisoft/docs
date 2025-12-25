# Saying hello

This section describes how to create a new "Hello" page in your application.
It's a simple page that will echo back whatever you pass to it or, if nothing passed, will just say "Hello!".

To achieve this goal, you will define a route and create [a handler](../structure/handler.md) that does the job and
forms the response.
Then you will improve it to use [view](../views/view.md) for building the response.

Through this tutorial, you will learn three things:

1. How to create a handler to respond to a request.
2. How to map URL to the handler.
3. How to use [view](../views/view.md) to compose the response's content.

## Creating a handler <span id="creating-handler"></span>

For the "Hello" task, you will create a handler class that reads
a `message` parameter from the request and displays that message back to the user. If the request
doesn't provide a `message` parameter, the action will display the default "Hello" message.

Create `src/Web/Echo/Action.php`:

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

In your example, the `__invoke` method receives the `$message` parameter that with the help of `RouteArgument` attribute
gets the message from URL. The value defaults to `"Hello!"`. If the request is made to `/say/Goodbye`,
the action assigns the value "Goodbye" to the `$message` variable.

The application passes the response through the [middleware stack](../structure/middleware.md) to the emitter that
outputs the response to the end user.

## Configuring router

Now, to map your handler to URL, you need to add a route in `config/common/routes.php`:

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

In the above, you map the `/say[/{message}]` pattern to `\App\Web\Echo\Action`. 
For a request, the router creates an instance and calls the `__invoke()` method.
The `{message}` part of the pattern writes anything specified in this place to the `message` request attribute.
`[]` marks this part of the pattern as optional. 

You also give a `echo/say` name to this route to be able to generate URLs pointing to it.

## Trying it out <span id="trying-it-out"></span>

After creating the action and the view open `http://localhost/say/Hello+World` in your browser.

This URL displays a page with "The message is: Hello World".

If you omit the `message` parameter in the URL, the page displays "The message is: Hello!".

## Creating a View Template <span id="creating-view-template"></span>

Usually, the task is more complicated than printing out "hello world" and involves rendering some complex
HTML. For this task, it's handy to use view templates. They're scripts you write to generate a response's body.

For the "Hello" task, create a `src/Web/Echo/template.php` template that prints the `message` parameter received
from the action method:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

In the above code, the `message` parameter uses HTML encoding before you print it. You need that because the parameter comes from an end user and is vulnerable to
[cross-site scripting (XSS) attacks](https://en.wikipedia.org/wiki/Cross-site_scripting) by embedding
malicious JavaScript in the parameter.

Naturally, you may put more content in the `say` view. The content can consist of HTML tags, plain text, and even
PHP statements. In fact, the view service executes the `say` view as a PHP script.

To use the view, you need to change `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
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

Now open your browser and check it again. You should see the similar text but with a layout applied.

Also, you've separated the part about how it works and part of how it's presented. In the larger applications, 
it helps a lot to deal with complexity.

## Summary <span id="summary"></span>

In this section, you've touched the handler and template parts of the typical web application.
You created a handler as part of a class to handle a specific request. You also created a view
to compose the response's content. In this simple example, no data source was involved as the only data used was
the `message` parameter.

You've also learned about routing in Yii, which acts as the bridge between user requests and handlers.

In the next section, you will learn how to fetch data and add a new page containing an HTML form.
