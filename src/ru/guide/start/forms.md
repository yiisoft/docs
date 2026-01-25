# Работа с формами

Этот раздел улучшает пример "Говорим «Привет»". Вместо использования URL,
теперь вы запросите сообщение от пользователя через форму.

В этом руководстве вы узнаете, как:

* Создать модель формы для представления данных, введенных пользователем
  через форму.
* Объявить правила для проверки введённых данных.
* Построить HTML-форму в представлении.

## Установка пакет форм

Чтобы установить пакет для работы с формами, выполните следующую команду в
директории вашего приложения:

```
composer require yiisoft/form-model
```

Для Docker это будет:

```
make composer require yiisoft/form-model
```

## Создание формы <span id="creating-form"></span>

Данные, которые будут запрошены у пользователя, будут представлены классом
`Form`, как показано ниже, и сохранены в файле `/src/Web/Echo/Form.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Label;
use Yiisoft\Validator\Rule\Length;

final class Form extends FormModel
{
    #[Label('The message to be echoed')]
    #[Length(min: 2)]
    public string $message = '';
}
```

В приведенном выше примере класс `Form` имеет одно строковое свойство
`$message`, длина которого должна быть не менее двух символов. Также для
свойства задана пользовательская метка.

## Использование формы <span id="using-form"></span> 

Теперь, когда у вас есть форма, используйте её в вашем обработчике из
раздела "[Говорим «Привет»](hello.md)".

Вот что у вас получится в файле `/src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\FormModel\FormHydrator;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
        private FormHydrator $formHydrator,
    ) {}

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $form = new Form();        

        $this->formHydrator->populateFromPostAndValidate($form, $request);

        return $this->viewRenderer->render(__DIR__ . '/template', [
            'form' => $form,
        ]);
    }
}
```

Вместо чтения из роута вы заполняете форму из данных POST запроса и
проверяете её с помощью `FormHydrator`. Затем вы передаёте форму в
представление.

Чтобы форма работала, нужно разрешить GET-запросы для отображения формы и
POST-запросы для отправки данных. Настройте ваш роут в
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Http\Method;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::methods([Method::GET, Method::POST], '/say')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

## Настройка представления

Для отображения формы необходимо изменить ваше представление
`src/Web/Echo/template.php`:

```php
<?php
use App\Web\Echo\Form;
use Yiisoft\FormModel\Field;
use Yiisoft\Html\Html;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\Csrf;

/**
 * @var Form $form
 * @var string[] $errors
 * @var UrlGeneratorInterface $urlGenerator
 * @var Csrf $csrf
 */

$htmlForm = Html::form()
    ->post($urlGenerator->generate('echo/say'))
    ->csrf($csrf);
?>

<?= $htmlForm->open() ?>
    <?= Field::text($form, 'message')->required() ?>
    <?= Html::submitButton('Say') ?>
<?= $htmlForm->close() ?>

<?php if ($form->isValid()): ?>
    Echo said: <?= Html::encode($form->message) ?>
<?php endif ?>
```

Если форма валидна, вы отобразите сообщение. Остальной код инициализирует и
отображает форму.

Инициализируйте `$htmlForm` с типом POST и URL обработчика, используя URL
генератор. Вы можете получить к нему доступ как `$urlGenerator` во всех
представлениях. Передайте в форму CSRF-токен `$csrf`, который доступен в
представлениях благодаря инъекция из `config/common/params.php`:

```php
'yiisoft/yii-view-renderer' => [
    'injections' => [
        Reference::to(CsrfViewInjection::class),
    ],
],
```

Шаблон отображает значение CSRF-токена как скрытое поле, чтобы убедиться,
что запрос исходит со страницы формы, а не с другого веб-сайта. Он будет
отправлен вместе с POST-данными формы. Его отсутствие приведёт к [HTTP-коду
ответа 422](https://tools.ietf.org/html/rfc4918#section-11.2).

`Field::text()` выводит поле \"message\" и автоматически заполняет значение,
экранирует его, отображает метку и ошибки валидации.

Теперь, если вы отправите пустое сообщение, вы получите ошибку валидации:
"The message to be echoed must contain at least 2 characters."

## Проверка работы <span id="trying-it-out"></span>

Чтобы увидеть, как это работает, откройте в браузере следующий URL:

```
http://localhost:8080/say
```

Вы увидите страницу с полем ввода и меткой, указывающей, какие данные нужно
ввести. Также есть кнопка отправки с надписью \"Say\". Если нажать её без
ввода данных, появится сообщение о том, что поле обязательно для
заполнения. Если ввести один символ, отобразится ошибка валидации.

![Форма с ошибкой валидации](/images/guide/start/form-error.png)

После того как вы введёте корректное сообщение и нажмёте кнопку отправки,
страница отобразит введённые вами данные.

![Успешная отправка формы](/images/guide/start/form-success.png)

## Краткое содержание <span id="summary"></span>

В этом разделе руководства вы узнали, как создать класс модели формы для
представления данных пользователя и валидации этих данных.

Вы также узнали, как получать информацию от пользователей и показывать её в
браузере. Обычно на это уходит много времени при разработке приложения, но
виджеты Yii значительно упрощают работу.

В следующем разделе вы узнаете, как работать с базами данных, которые
необходимы почти в каждом приложении.
