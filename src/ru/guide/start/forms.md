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

## Custom validation <span id="custom-validation"></span>

Validation attributes are Yii Validator rules. For common checks, first look
for an existing rule. For example, to validate a UUID string, use `Uuid`:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Uuid;

final class Form extends FormModel
{
    #[Uuid]
    public string $id = '';
}
```

When a field needs application-specific validation that isn't covered by a
built-in rule, use `Callback`. This is useful for one-off checks or for
delegating to a domain/library method. With PHP attributes, use the `method`
option because PHP attributes can't contain closures. For example, the
following form validates a card number checksum:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Label;
use Yiisoft\Validator\Result;
use Yiisoft\Validator\Rule\Callback;
use Yiisoft\Validator\Rule\Required;
use Yiisoft\Validator\ValidationContext;

final class Form extends FormModel
{
    #[Label('Card number')]
    #[Required]
    #[Callback(method: 'validateCardNumberChecksum', skipOnError: true)]
    public string $cardNumber = '';

    private function validateCardNumberChecksum(mixed $value, Callback $rule, ValidationContext $context): Result
    {
        if (!is_string($value)) {
            return (new Result())->addError('Card number must be a string.');
        }

        $digits = str_replace([' ', '-'], '', $value);

        if ($digits === '' || !ctype_digit($digits)) {
            return (new Result())->addError('Card number must contain digits only.');
        }

        $sum = 0;
        $double = false;

        foreach (array_reverse(str_split($digits)) as $digit) {
            $number = (int) $digit;

            if ($double) {
                $number *= 2;
                if ($number > 9) {
                    $number -= 9;
                }
            }

            $sum += $number;
            $double = !$double;
        }

        if ($sum % 10 !== 0) {
            return (new Result())->addError('Card number checksum is invalid.');
        }

        return new Result();
    }
}
```

The callback method returns a `Result`: return an empty result when the
value is valid or add an error when it isn't.  The method body can call any
validation code your application already uses, such as
`App\Payment\CardNumber::hasValidChecksum($value)`.

For validation logic reused in several forms, create a custom Yii Validator
rule and handler instead of copying callback methods. See the [custom rule
guide](https://github.com/yiisoft/validator/blob/master/docs/guide/en/creating-custom-rules.md)
for the rule/handler structure.

## Validating several fields together <span id="cross-field-validation"></span>

Property attributes are enough when each field can be validated
independently. When a rule depends on several fields, put a `Callback` rule
on the form model class and attach an error to the field that should display
it.

For example, a report filter may require the start date to be earlier than
or equal to the end date:

```php
<?php

declare(strict_types=1);

namespace App\Web\Report;

use DateTimeImmutable;
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Result;
use Yiisoft\Validator\Rule\Callback;
use Yiisoft\Validator\Rule\Date\Date;
use Yiisoft\Validator\Rule\Required;
use Yiisoft\Validator\ValidationContext;

#[Callback(method: 'validateDateRange')]
final class ReportFilterForm extends FormModel
{
    #[Required]
    #[Date(format: 'php:Y-m-d')]
    public string $dateFrom = '';

    #[Required]
    #[Date(format: 'php:Y-m-d')]
    public string $dateTo = '';

    public function validateDateRange(mixed $value, Callback $rule, ValidationContext $context): Result
    {
        $result = new Result();

        if ($this->dateFrom === '' || $this->dateTo === '') {
            return $result;
        }

        $dateFrom = $this->parseDate($this->dateFrom);
        $dateTo = $this->parseDate($this->dateTo);

        if ($dateFrom === null || $dateTo === null) {
            return $result;
        }

        if ($dateFrom > $dateTo) {
            $result->addError('The start date must be earlier than or equal to the end date.', [], ['dateFrom']);
        }

        return $result;
    }

    private function parseDate(string $value): ?DateTimeImmutable
    {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = DateTimeImmutable::getLastErrors();

        if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return null;
        }

        return $date;
    }
}
```

The class-level `Callback` receives the whole object as `$value`, but using
`$this` is usually clearer in a form model method. Returning an empty
`Result` means the cross-field rule passed. The third argument of
`addError()` is the value path; `['dateFrom']` makes the error appear on the
`dateFrom` field when rendering the form.

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
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
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
