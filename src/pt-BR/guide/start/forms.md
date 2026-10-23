# Trabalhando com formulários

Esta seção continua a melhorar o "Dizendo olá". Em vez de usar a URL, agora
você vai pedir a mensagem ao usuário por meio de um formulário.

Neste tutorial, você vai aprender a:

* Criar um form model para representar os dados que o usuário informa em um
  formulário.
* Declarar regras para validar os dados informados.
* Montar um formulário HTML em uma view.

## Instalando o pacote de formulários

Para instalar o pacote de formulários, rode o seguinte comando no diretório
da sua aplicação:

```
composer require yiisoft/form-model
```

No Docker, fica assim:

```
make composer require yiisoft/form-model
```

## Criando um formulário

Os dados que serão pedidos ao usuário ficam representados por uma classe
`Form`, como mostrado abaixo, salva no arquivo `/src/Web/Echo/Form.php`:

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

No exemplo acima, o `Form` tem uma única propriedade string, `$message`,
cujo tamanho deve ser de pelo menos dois caracteres. Também há um label
personalizado para a propriedade.

> Nota: os atributos de validação são regras do Yii Validator. Para verificações comuns, procure primeiro uma regra existente. Se um campo
> também precisar de validação específica da aplicação, use `Callback` para essa lógica de domínio. Com atributos PHP, use a opção `method`,
> porque atributos PHP não podem conter closures. Por exemplo, valide a sintaxe do UUID com `Uuid` e só então adicione
> `#[Callback(method: 'validateUuidV7', skipOnError: true)]` quando o seu domínio exigir especificamente UUID versão 7.

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

O método de callback retorna um `Result`: retorne um resultado vazio quando
o valor for válido ou adicione um erro quando não for.  O corpo do método
pode chamar qualquer código de validação que a sua aplicação já usa, como
`App\Support\Uuid::isValid($value, 'v7')`.  Veja os [detalhes da regra
Callback](https://github.com/yiisoft/validator/blob/master/docs/guide/en/built-in-rules-callback.md)
para exemplos completos e as assinaturas de método disponíveis.

Para uma lógica de validação reaproveitada em vários formulários, crie uma
regra e um handler personalizados do Yii Validator em vez de copiar métodos
de callback. Veja o [guia de regras
personalizadas](https://github.com/yiisoft/validator/blob/master/docs/guide/en/creating-custom-rules.md)
para a estrutura de regra/handler.

## Validação personalizada

Os atributos de validação são regras do Yii Validator. Para verificações
comuns, procure primeiro uma regra existente. Por exemplo, para validar uma
string UUID, use `Uuid`:

```php
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Uuid;

final class Form extends FormModel
{
    #[Uuid]
    public string $id = '';
}
```

Quando um campo precisa de uma validação específica da aplicação que nenhuma
regra embutida cobre, use `Callback`. Isso é útil para verificações pontuais
ou para delegar a um método do domínio ou de uma biblioteca. Com atributos
PHP, use a opção `method`, porque atributos PHP não podem conter
closures. Por exemplo, o formulário a seguir valida o dígito verificador de
um número de cartão:

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

O método de callback retorna um `Result`: retorne um resultado vazio quando
o valor for válido ou adicione um erro quando não for.  O corpo do método
pode chamar qualquer código de validação que a sua aplicação já usa, como
`App\Payment\CardNumber::hasValidChecksum($value)`.

Para uma lógica de validação reaproveitada em vários formulários, crie uma
regra e um handler personalizados do Yii Validator em vez de copiar métodos
de callback. Veja o [guia de regras
personalizadas](https://github.com/yiisoft/validator/blob/master/docs/guide/en/creating-custom-rules.md)
para a estrutura de regra/handler.

## Validando vários campos juntos

Atributos nas propriedades bastam quando cada campo pode ser validado de
forma independente. Quando uma regra depende de vários campos, coloque uma
regra `Callback` na classe do form model e associe o erro ao campo que deve
exibi-lo.

Por exemplo, um filtro de relatório pode exigir que a data inicial seja
anterior ou igual à data final:

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

O `Callback` no nível da classe recebe o objeto inteiro como `$value`, mas
usar `$this` costuma ser mais claro em um método do form model. Retornar um
`Result` vazio significa que a regra entre campos passou. O terceiro
argumento de `addError()` é o caminho do valor; `['dateFrom']` faz o erro
aparecer no campo `dateFrom` quando o formulário é renderizado.

## Usando o formulário

Agora que você tem um formulário, use-o na sua action do "[Dizendo
olá](hello.md)".

Este é o resultado final em `/src/Web/Echo/Action.php`:

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

Em vez de ler da rota, você preenche o formulário com os dados POST da
requisição e o valida com a ajuda do `FormHydrator`. Depois, passa o
formulário para a view.

Para o formulário funcionar, precisamos permitir tanto GET, para renderizar
o formulário, quanto POST, para enviar os dados.  Ajuste a sua rota em
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

## Ajustando a view

Para renderizar um formulário, você precisa alterar a sua view,
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

Se o formulário for válido, você exibe uma mensagem. O restante inicializa e
renderiza o formulário.

Primeiro, você inicializa `$htmlForm` com o tipo POST e a URL da action
gerada com a ajuda do gerador de URLs.  Você pode acessá-lo como
`$urlGenerator` em todas as views. Também precisa passar o token CSRF para o
formulário, que também está disponível em toda view como `$csrf` graças às
view injections listadas em `config/common/params.php`:

```php
'yiisoft/yii-view-renderer' => [
    'injections' => [
        Reference::to(CsrfViewInjection::class),
    ],
],
```

O template renderiza o valor do token CSRF como um input oculto para
garantir que a requisição vem da página do formulário e não de outro
site. Ele é enviado junto com os dados POST do formulário. Sem ele, o
resultado seria o [código de resposta HTTP
422](https://tools.ietf.org/html/rfc4918#section-11.2).

Você usa `Field::text()` para exibir o campo "message", então ele cuida de
preencher o valor, escapá-lo e renderizar o label do campo e os erros de
validação.

Agora, se você enviar uma mensagem vazia, vai receber um erro de validação:
"The message to be echoed must contain at least 2 characters."

## Testando

Para ver como funciona, acesse a seguinte URL no navegador:

```
http://localhost:8080/say
```

Você vai ver uma página com um campo de formulário e um label indicando qual
dado informar.  O formulário também tem um botão "submit" com o texto
"Say". Se você clicar no botão "submit" sem digitar nada, vai ver que o
campo é obrigatório. Se digitar um único caractere, o formulário mostra uma
mensagem de erro ao lado do campo com problema.

![Formulário com erro de validação](/images/guide/start/form-error.png)

Depois de digitar uma mensagem válida e clicar no botão "submit", a página
mostra de volta os dados que você digitou.

![Formulário com mensagem de sucesso](/images/guide/start/form-success.png)

## Resumo

Nesta seção do guia, você aprendeu a criar uma classe de form model para
representar os dados do usuário e validar esses dados.

Você também aprendeu a receber dados dos usuários e a exibi-los de volta no
navegador.  Essa é uma tarefa que pode tomar muito tempo no desenvolvimento
de uma aplicação, mas o Yii oferece widgets poderosos que a tornam fácil.

Na próxima seção, você vai aprender a trabalhar com bancos de dados, que são
necessários em quase toda aplicação.
