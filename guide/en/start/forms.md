# Working with Forms

This section continues to improve on "Saying Hello". Instead of using URL, you will now ask user for a message via form.

Through this tutorial, you will learn how to:

* Create a form model to represent the data entered by a user through a form.
* Declare rules to validate the data entered.
* Build an HTML form in a view.

## Installing form package

To install form package, issue the following command in your application directory:

```
composer require yiisoft/form
```

## Creating a form <span id="creating-form"></span>

The data to be requested from the user will be represented by an `EchoForm` class as shown below and
saved in the file `/src/Form/EchoForm.php`:

```php
<?php
namespace App\Form;

use Yiisoft\Form\FormModel;

class EchoForm extends FormModel
{
    private string $message = '';

    public function getMessage(): string
    {
        return $this->message;
    }

    public function attributeLabels(): array
    {
        return [
            'message' => 'Message',
        ];
    }
}
```

The class extends from a base class provided by Yii, commonly used to
represent form data.

The `EchoForm` class has `$message` property and related getter.
These are regular data-related code. `attributeLabels()` method provides labels that you're going to display in a view.

## Using the form <span id="using-form"></span> 

Now, that you have a form, use it in your action from "[Saying Hello](hello.md)".
Here's what you end up with in `/src/Controller/EchoController.php`:

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\Form\EchoForm;
use Yiisoft\Yii\View\ViewRenderer;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Http\Method;

class EchoController
{
    private ViewRenderer $viewRenderer;

    public function __construct(ViewRenderer $viewRenderer)
    {
        $this->viewRenderer = $viewRenderer->withControllerName('echo');
    }

    public function say(ServerRequestInterface $request): ResponseInterface
    {
        $form = new EchoForm();
    
        if ($request->getMethod() === Method::POST) {
            $form->load($request->getParsedBody());
        }

        return $this->viewRenderer->render('say', [
            'form' => $form,
        ]);
    }
}
```

Instead of reading from request directly, you fill your form with the help of `load()` method if the request
method is POST and then pass it to your view.

Now, to allow POST, you need to adjust your route in `config/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Controller\EchoController;
use App\Controller\SiteController;
use Yiisoft\Http\Method;
use Yiisoft\Router\Route;

return [
    Route::get('/')->action([SiteController::class, 'index'])->name('home'),
    Route::methods([Method::GET, Method::POST], '/say[/{message}]')->action([EchoController::class, 'say'])->name('echo/say'),
];
```

## Adjusting view

To render a form, you need to change your view, `resources/views/echo/say.php`:

```php
<?php

use Yiisoft\Form\Widget\Field;
use Yiisoft\Form\Widget\Form;
use Yiisoft\Html\Html;

/* @var \App\Form\EchoForm $form */
/* @var string $csrf */
/* @var \Yiisoft\Router\UrlGeneratorInterface $url */
?>


<?php if (!empty($form->getMessage())): ?>
    <div class="notification is-success">
        The message is: <?= Html::encode($form->getMessage()) ?>
    </div>
<?php endif ?>

<?= Form::widget()
    ->action($url->generate('echo/say'))
    ->options([
        'csrf' => $csrf,
    ])
    ->begin() ?>

<?= Field::widget()->config($form, 'message') ?>

<?= Html::submitButton('Say') ?>

<?= Form::end() ?>
```

If a form has a message set, you're displaying a box with the message. The rest if about rendering the form.

You get the action URL from the URL manager service.
You access it as `$url` that's a default parameter available in all views.
This variable and alike ones such as `$csrf` are provided by view injections listed in `config/params.php`:

```php
'yiisoft/yii-view' => [
    'injections' => [
        Reference::to(ContentViewInjection::class),
        Reference::to(CsrfViewInjection::class),
        Reference::to(LayoutViewInjection::class),
    ],
],
```

By default, `src\ViewInjection\ContentViewInjection` doesn't offer `$url` so you need to add it:

```php
<?php

declare(strict_types=1);

namespace App\ViewInjection;

use App\ApplicationParameters;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\ContentParametersInjectionInterface;

final class ContentViewInjection implements ContentParametersInjectionInterface
{
    private ApplicationParameters $applicationParameters;
    private UrlGeneratorInterface $url;

    public function __construct(
        ApplicationParameters $applicationParameters,
        UrlGeneratorInterface $url

    ) {
        $this->applicationParameters = $applicationParameters;
        $this->url = $url;
    }

    public function getContentParameters(): array
    {
        return [
            'applicationParameters' => $this->applicationParameters,
            'url' => $this->url,
        ];
    }
}
```

You render the value of CSRF token as a hidden input to ensure that the request originates from the form page and not
from another website. It will be submitted along with POST form data. Omitting it would result in
[HTTP response code 422](https://tools.ietf.org/html/rfc4918#section-11.2).

To turn on the CSRF protection, you need to add `CsrfMiddleware` to `config/web/application.php`:

```php
<?php

declare(strict_types=1);

use App\Handler\NotFoundHandler;
use Yiisoft\Csrf\CsrfMiddleware;
use Yiisoft\ErrorHandler\Middleware\ErrorCatcher;
use Yiisoft\Definitions\Reference;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\Injector\Injector;
use Yiisoft\Middleware\Dispatcher\MiddlewareDispatcher;
use Yiisoft\Router\Middleware\Router;
use Yiisoft\Session\SessionMiddleware;

return [
    Yiisoft\Yii\Web\Application::class => [
        '__construct()' => [
            'dispatcher' => DynamicReference::to(static function (Injector $injector) {
                return ($injector->make(MiddlewareDispatcher::class))
                    ->withMiddlewares(
                        [
                            Router::class,
                            CsrfMiddleware::class, // <-- here
                            SessionMiddleware::class,
                            ErrorCatcher::class,
                        ]
                    );
            }),
            'fallbackHandler' => Reference::to(NotFoundHandler::class),
        ],
    ],
];
```

You use `Field` to output "message" field, so it takes case about filling the value, escaping it, rendering field label
and validation errors you're going to take care of next.

## Adding validation

Right now it's possible to submit an empty value. Make it required. Modify `/src/Controller/EchoController.php`:

```php
<?php

namespace App\Controller;

use App\Form\EchoForm;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\Http\Method;
use Yiisoft\Validator\Validator;
use Yiisoft\Yii\View\ViewRenderer;

class EchoController
{
    private ViewRenderer $viewRenderer;

    public function __construct(ViewRenderer $viewRenderer)
    {
        $this->viewRenderer = $viewRenderer->withControllerName('echo');
    }

    public function say(ServerRequestInterface $request, Validator $validator): ResponseInterface
    {
        $form = new EchoForm();

        if ($request->getMethod() === Method::POST) {
            $form->load($request->getParsedBody());
            $validator->validate($form);
        }

        return $this->viewRenderer->render('say', [
            'form' => $form,
        ]);
    }
}

```

You've obtained validator instance through type-hinting and used it to validate the form.
Now you need to add validation rules to `/src/Form/EchoForm.php`:

```php
<?php
namespace App\Form;

use Yiisoft\Form\FormModel;
use Yiisoft\Validator\Rule\Required;

class EchoForm extends FormModel
{
    private string $message = '';

    public function getMessage(): string
    {
        return $this->message;
    }

    public function attributeLabels(): array
    {
        return [
            'message' => 'Message',
        ];
    }

    public function getRules(): array
    {
        return [
            'message' => [
                Required::rule()
            ]
        ];
    }
}
```

Now, in case you will submit an empty message you will get a validation error: "Value cannot be blank."

## Trying it Out <span id="trying-it-out"></span>


To see how it works, use your browser to access the following URL:

```
http://localhost:8080/say
```

You will see a page displaying a form an input field that has a label that indicates what data are to be entered.
Also, there is a submit button labeled "Say". If you click the submit button without entering anything, you will see
an error message displayed next to a problematic input field.

![Form with a validation error](img/form-error.png)

After entering a message and clicking the submit button, you will see a new page
displaying the data that you just entered.

![Form with a success message](img/form-success.png)

## Summary <span id="summary"></span>

In this section of the guide, you've learned how to create a form model class to represent the user data and validate
said data.

You've also learned how to get data from users and how to display data back in the browser.
This is a task that could take you a lot of time when developing an application, but Yii provides powerful widgets
to make this task easy.

In the next section, you will learn how to work with databases, which are needed in nearly every application.
