# Trabajar con formularios

Esta sección sigue mejorando el ejemplo de "Decir hola". En lugar de usar la
URL, ahora pedirás al usuario un mensaje mediante un formulario.

Con este tutorial aprenderás a:

* Crear un modelo de formulario que represente los datos que introduce un
  usuario a través de un formulario.
* Declarar reglas para validar los datos introducidos.
* Construir un formulario HTML en una vista.

## Instalar el paquete de formularios

Para instalar el paquete de formularios, ejecuta el siguiente comando en el
directorio de tu aplicación:

```
composer require yiisoft/form-model
```

Con Docker sería:

```
make composer require yiisoft/form-model
```

## Crear un formulario

Los datos que se pedirán al usuario se representarán mediante una clase
`Form`, como la que se muestra a continuación, guardada en el archivo
`/src/Web/Echo/Form.php`:

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

En el ejemplo anterior, `Form` tiene una única propiedad de tipo cadena,
`$message`, cuya longitud debe ser de al menos dos caracteres. También hay
una etiqueta personalizada para la propiedad.

> Nota: los atributos de validación son reglas de Yii Validator. Para las comprobaciones habituales, busca primero una regla existente. Si un campo
> necesita además una validación específica de la aplicación, usa `Callback` para esa lógica de dominio. Con atributos de PHP, usa la opción `method`,
> porque los atributos de PHP no pueden contener closures. Por ejemplo, valida la sintaxis del UUID con `Uuid` y añade
> `#[Callback(method: 'validateUuidV7', skipOnError: true)]` solo cuando tu dominio requiera específicamente la versión 7 de UUID.

```php
use Yiisoft\Validator\Result;
use Yiisoft\Validator\Rule\Callback;
use Yiisoft\Validator\Rule\Uuid;

#[Uuid(skipOnError: true)]
#[Callback(method: 'validateUuidV7', skipOnError: true)]
public string $id = '';

private function validateUuidV7(mixed $value): Result
{
    return \App\Support\Uuid::isVersion7($value)
        ? new Result()
        : (new Result())->addError('ID must be a UUID version 7.');
}
```

El método callback devuelve un `Result`: devuelve un resultado vacío cuando
el valor es válido o añade un error cuando no lo es. El cuerpo del método
puede llamar a cualquier código de validación que tu aplicación ya use, como
`App\Support\Uuid::isValid($value, 'v7')`. Consulta los [detalles de la
regla
Callback](https://github.com/yiisoft/validator/blob/master/docs/guide/en/built-in-rules-callback.md)
para ver ejemplos completos y las firmas de método disponibles.

Para la lógica de validación que se reutiliza en varios formularios, crea
una regla y un manejador personalizados de Yii Validator en lugar de copiar
métodos callback. Consulta la [guía de reglas
personalizadas](https://github.com/yiisoft/validator/blob/master/docs/guide/en/creating-custom-rules.md)
para ver la estructura de regla y manejador.

## Validación personalizada

Los atributos de validación son reglas de Yii Validator. Para las
comprobaciones habituales, busca primero una regla existente. Por ejemplo,
para validar una cadena UUID, usa `Uuid`:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Uuid;

final class Form extends FormModel
{
    #[Uuid]
    public string $id = '';
}
```

Cuando un campo necesita una validación específica de la aplicación que no
cubre ninguna regla integrada, usa `Callback`. Es útil para comprobaciones
puntuales o para delegar en un método del dominio o de una biblioteca. Con
atributos de PHP, usa la opción `method`, porque los atributos de PHP no
pueden contener closures. Por ejemplo, el siguiente formulario valida la
suma de verificación de un número de tarjeta:

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

El método callback devuelve un `Result`: devuelve un resultado vacío cuando
el valor es válido o añade un error cuando no lo es. El cuerpo del método
puede llamar a cualquier código de validación que tu aplicación ya use, como
`App\Payment\CardNumber::hasValidChecksum($value)`.

Para la lógica de validación que se reutiliza en varios formularios, crea
una regla y un manejador personalizados de Yii Validator en lugar de copiar
métodos callback. Consulta la [guía de reglas
personalizadas](https://github.com/yiisoft/validator/blob/master/docs/guide/en/creating-custom-rules.md)
para ver la estructura de regla y manejador.

## Validar varios campos a la vez

Los atributos de propiedad bastan cuando cada campo puede validarse de forma
independiente. Cuando una regla depende de varios campos, pon una regla
`Callback` en la clase del modelo de formulario y asocia el error al campo
que debe mostrarlo.

Por ejemplo, un filtro de informes puede exigir que la fecha de inicio sea
anterior o igual a la fecha de fin:

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

El `Callback` a nivel de clase recibe el objeto completo como `$value`, pero
en un método del modelo de formulario suele ser más claro usar
`$this`. Devolver un `Result` vacío significa que la regla entre campos se
ha cumplido. El tercer argumento de `addError()` es la ruta del valor:
`['dateFrom']` hace que el error aparezca en el campo `dateFrom` al
renderizar el formulario.

## Usar el formulario

Ahora que tienes un formulario, úsalo en tu acción de "[Decir
hola](hello.md)".

Este es el resultado final en `/src/Web/Echo/Action.php`:

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

En lugar de leer de la ruta, rellenas el formulario con los datos POST de la
solicitud y lo validas con la ayuda de `FormHydrator`. Después pasas el
formulario a la vista.

Para que el formulario funcione, hay que permitir tanto GET, para mostrar el
formulario, como POST, para enviar los datos. Ajusta tu ruta en
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

## Ajustar la vista

Para renderizar un formulario, tienes que cambiar la vista,
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

Si el formulario es válido, muestras un mensaje. El resto inicializa y
renderiza el formulario.

Primero, inicializas `$htmlForm` con el tipo POST y la URL de acción
generada con la ayuda del generador de URL, al que puedes acceder como
`$urlGenerator` en todas las vistas. También tienes que pasar el token CSRF
al formulario; está disponible en todas las vistas como `$csrf` gracias a
las inyecciones de vista indicadas en `config/common/params.php`:

```php
'yiisoft/yii-view-renderer' => [
    'injections' => [
        Reference::to(CsrfViewInjection::class),
    ],
],
```

La plantilla renderiza el valor del token CSRF como un campo oculto para
garantizar que la solicitud procede de la página del formulario y no de otro
sitio web. Se enviará junto con los datos POST del formulario. Si se omite,
se obtiene un [código de respuesta HTTP
422](https://tools.ietf.org/html/rfc4918#section-11.2).

Usas `Field::text()` para mostrar el campo "message", que se encarga de
rellenar el valor, escaparlo y renderizar la etiqueta del campo y los
errores de validación.

Ahora, si envías un mensaje vacío, obtendrás un error de validación: "The
message to be echoed must contain at least 2 characters."

## Probarlo

Para ver cómo funciona, accede con tu navegador a la siguiente URL:

```
http://localhost:8080/say
```

Verás una página con un campo de formulario y una etiqueta que indica qué
datos introducir. Además, el formulario tiene un botón de envío con el texto
"Say". Si pulsas el botón de envío sin introducir nada, verás que el campo
es obligatorio. Si introduces un solo carácter, el formulario mostrará un
mensaje de error junto al campo problemático.

![Formulario con un error de validación](/images/guide/start/form-error.png)

Después de introducir un mensaje válido y pulsar el botón de envío, la
página repite los datos que has introducido.

![Formulario con un mensaje de éxito](/images/guide/start/form-success.png)

## Resumen

En esta sección de la guía has aprendido a crear una clase de modelo de
formulario para representar los datos del usuario y validarlos.

También has aprendido a obtener datos de los usuarios y a mostrarlos de
nuevo en el navegador. Es una tarea que podría llevarte mucho tiempo al
desarrollar una aplicación, pero Yii proporciona widgets potentes que la
facilitan.

En la siguiente sección aprenderás a trabajar con bases de datos, que se
necesitan en casi todas las aplicaciones.
