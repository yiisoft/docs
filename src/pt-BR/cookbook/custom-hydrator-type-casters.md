# Type casters personalizados para o hydrator

O [Yii Hydrator](https://github.com/yiisoft/hydrator) cria objetos e os
preenche com dados de arrays. Ele é usado diretamente e por pacotes
construídos sobre ele:

- O [Yii Input HTTP](https://github.com/yiisoft/input-http) preenche objetos
  de entrada da requisição a partir de parâmetros da query string, do corpo
  da requisição e, com a ajuda do [Yii
  Router](https://github.com/yiisoft/router), dos argumentos da rota.
- O [Yii Form Model](https://github.com/yiisoft/form-model) fornece o
  `FormHydrator`, que preenche form models com os dados enviados.

Os dados recebidos geralmente são "brutos": requisições HTTP, linhas do
banco de dados e mensagens de fila contêm strings, números e arrays. Antes
de atribuir um valor a uma propriedade ou passá-lo a um parâmetro do
construtor, o hydrator o converte para o tipo declarado. Um *type caster*
faz essa conversão. Ao escrever seu próprio type caster, você ensina o
hydrator a criar seus tipos, como value objects, a partir de dados brutos.

## Por que type casters personalizados

Por padrão, o hydrator usa um type caster composto com dois casters:

- `PhpNativeTypeCaster` converte valores para tipos nativos do PHP, como
  `int`, `string`, `bool` e `array`.
- `HydratorTypeCaster` cria objetos aninhados a partir de arrays usando o
  próprio hydrator.

Isso basta para DTOs com propriedades escalares, mas não para um modelo de
domínio rico. Considere uma propriedade tipada como `UserId`, `Email` ou
`Money`. O valor recebido é uma string, e nenhum dos casters padrão sabe
transformá-lo em um objeto desses. Assim, você acaba declarando a
propriedade como `string` e convertendo-a manualmente onde quer que ela seja
usada:

```php
final class CreatePostForm extends FormModel
{
    public string $authorId = '';
}

// Em toda action que usa o formulário:
try {
    $authorId = new UserId($form->authorId);
} catch (InvalidArgumentException) {
    // Reporte o erro de alguma forma.
}
```

Com um type caster para `UserId`, você pode declarar a propriedade com seu
tipo real. A conversão acontece durante a hidratação:

```php
final class CreatePostForm extends FormModel
{
    public ?UserId $authorId = null;
}

// $form->authorId já é uma instância de UserId.
```

A lógica de conversão fica em um único lugar. Depois que você registra o
caster, o hydrator o aplica a todas as propriedades e parâmetros de
construtor do tipo correspondente em todos os objetos que ele cria.

Casos de uso típicos:

- value objects, como IDs de entidades, e-mails, números de telefone e
  valores monetários.
- tipos de bibliotecas de terceiros, como UUIDs, datas ou moedas.
- normalização consistente de valores, por exemplo, interpretar datas em um
  formato específico da sua aplicação.

## Anatomia de um type caster

Um type caster implementa `Yiisoft\Hydrator\TypeCaster\TypeCasterInterface`,
que tem um único método:

```php
public function cast(mixed $value, TypeCastContext $context): Result;
```

- `$value` é o valor bruto a ser convertido.
- `$context` é um `Yiisoft\Hydrator\TypeCaster\TypeCastContext`. Seu método
  `getReflectionType()` retorna o tipo declarado da propriedade ou do
  parâmetro de construtor de destino. Use-o para decidir se o caster suporta
  o tipo de destino.
- O método retorna um `Yiisoft\Hydrator\Result`:
  `Result::success($convertedValue)` se a conversão deu certo ou
  `Result::fail()` se o caster não consegue lidar com o valor.

Siga estas regras ao escrever um type caster:

1. **Verifique o tipo de destino primeiro.** Se o tipo declarado não for
   aquele pelo qual seu caster é responsável, retorne `Result::fail()`
   imediatamente para que outros casters possam lidar com o valor.
2. **Trate tipos nomeados e tipos união.** O PHP representa um tipo anulável
   como `?Email` (ou `Email|null`) com `ReflectionNamedType` e
   `Email|string` com `ReflectionUnionType`. No segundo caso, procure seu
   tipo entre os subtipos.
3. **Não trate `null` você mesmo.** Se o valor for `null`, apenas retorne
   `Result::fail()`. O `PhpNativeTypeCaster` retorna `null` para qualquer
   tipo que o permita, então um valor `null` atribuído a `?Email` continua
   `null`.
4. **Aceite valores já convertidos.** Se o valor já for uma instância do
   tipo de destino, retorne-o como está.
5. **Falhe em vez de lançar exceções.** Se seu caster não consegue converter
   o valor, por exemplo, uma string malformada, retorne
   `Result::fail()`. Uma exceção quebraria toda a hidratação.

Tenha em mente o que acontece quando nenhum caster tem sucesso:

- Para uma propriedade, a conversão falha silenciosamente. O hydrator não
  define a propriedade nem reporta um erro, então a propriedade mantém seu
  valor padrão. Reportar o problema ao usuário é papel da validação que roda
  após a hidratação.  Veja [Valores nulos e
  inválidos](#valores-nulos-e-invalidos) para um exemplo.
- Para um parâmetro de construtor, o hydrator omite o argumento. Se o
  parâmetro tiver um valor padrão, ele é usado.  Caso contrário, a criação
  do objeto falha com `WrongConstructorArgumentsCountException`, mesmo para
  um parâmetro anulável sem valor padrão.

## Registrando um type caster

Combine type casters com `CompositeTypeCaster`. Ele tenta os casters um a um
e usa o resultado do primeiro que tiver sucesso. Para adicionar seu caster,
redefina `TypeCasterInterface` na configuração do container de DI, por
exemplo, em `config/common/di/hydrator.php`. A implementação de
`HydratorInterface` do container usa essa cadeia, assim como os pacotes que
dependem dela, como o Yii Input HTTP:

```php
<?php

declare(strict_types=1);

use App\Shared\Uuid\UuidValueTypeCaster;
use Yiisoft\Hydrator\TypeCaster\CompositeTypeCaster;
use Yiisoft\Hydrator\TypeCaster\HydratorTypeCaster;
use Yiisoft\Hydrator\TypeCaster\PhpNativeTypeCaster;
use Yiisoft\Hydrator\TypeCaster\TypeCasterInterface;

return [
    TypeCasterInterface::class => static fn() => new CompositeTypeCaster(
        new UuidValueTypeCaster(),
        new PhpNativeTypeCaster(),
        new HydratorTypeCaster(),
    ),
];
```

Como o primeiro resultado bem-sucedido vence, a ordem importa:

- Coloque os casters personalizados antes do `PhpNativeTypeCaster`. Caso
  contrário, para uma propriedade declarada como `UserId|string`, o
  `PhpNativeTypeCaster` aceita a string como está, e seu caster nunca é
  executado.
- Mantenha os casters padrão na lista. O `PhpNativeTypeCaster` converte
  valores escalares para tipos nativos, e o `HydratorTypeCaster` cria
  objetos aninhados a partir de arrays.

Se um caster tiver dependências, obtenha-o do container:

```php
<?php

declare(strict_types=1);

use App\Shared\Money\MoneyTypeCaster;
use Psr\Container\ContainerInterface;
use Yiisoft\Hydrator\TypeCaster\CompositeTypeCaster;
use Yiisoft\Hydrator\TypeCaster\HydratorTypeCaster;
use Yiisoft\Hydrator\TypeCaster\PhpNativeTypeCaster;
use Yiisoft\Hydrator\TypeCaster\TypeCasterInterface;

return [
    TypeCasterInterface::class => static fn(ContainerInterface $container) => new CompositeTypeCaster(
        $container->get(MoneyTypeCaster::class),
        new PhpNativeTypeCaster(),
        new HydratorTypeCaster(),
    ),
];
```

### Registrando para form models

O `FormHydrator` do Yii Form Model não usa `TypeCasterInterface`. Sua
configuração de DI cria um hydrator dedicado com sua própria cadeia de type
casters, então adicione seu caster lá também:

```php
<?php

declare(strict_types=1);

use App\Shared\Uuid\UuidValueTypeCaster;
use Yiisoft\Definitions\DynamicReference;
use Yiisoft\FormModel\FormHydrator;
use Yiisoft\FormModel\NonArrayTypeCaster;
use Yiisoft\Hydrator\Hydrator;
use Yiisoft\Hydrator\TypeCaster\CompositeTypeCaster;
use Yiisoft\Hydrator\TypeCaster\HydratorTypeCaster;
use Yiisoft\Hydrator\TypeCaster\NullTypeCaster;
use Yiisoft\Hydrator\TypeCaster\PhpNativeTypeCaster;

return [
    FormHydrator::class => [
        '__construct()' => [
            'hydrator' => DynamicReference::to([
                'class' => Hydrator::class,
                '__construct()' => [
                    'typeCaster' => new CompositeTypeCaster(
                        new NullTypeCaster(emptyString: true),
                        new UuidValueTypeCaster(),
                        new PhpNativeTypeCaster(),
                        new NonArrayTypeCaster(),
                        new HydratorTypeCaster(),
                    ),
                ],
            ]),
        ],
    ],
];
```

Essa definição substitui a do pacote, então mantenha os type casters
dele. Este exemplo usa a lista do `config/di.php` do Yii Form Model
1.1. Confira com a versão que você usa. O `NullTypeCaster` transforma
strings vazias enviadas por formulários em `null` para propriedades
anuláveis, por isso ele continua em primeiro.

## Exemplo: value objects de UUID

IDs de entidades frequentemente usam value objects, como `UserId`, `PostId`
e `OrderId`, em vez de strings simples.  Esses objetos tornam as assinaturas
dos métodos autodocumentadas e impedem que você passe um ID de post onde um
método espera um ID de usuário.  O exemplo a seguir mostra como escrever um
type caster que os cria a partir de strings UUID.

### Value objects

Todos os value objects de ID estendem uma classe abstrata `UuidValue`. O
exemplo usa [ramsey/uuid](https://github.com/ramsey/uuid) para validar e
gerar UUIDs:

```shell
composer require ramsey/uuid
```

```php
<?php

declare(strict_types=1);

namespace App\Shared\Uuid;

use InvalidArgumentException;
use Ramsey\Uuid\Uuid;
use Stringable;

use function sprintf;

abstract readonly class UuidValue implements Stringable
{
    private string $value;

    final public function __construct(string $value)
    {
        if (!Uuid::isValid($value)) {
            throw new InvalidArgumentException(sprintf('"%s" is not a valid UUID.', $value));
        }
        $this->value = Uuid::fromString($value)->toString();
    }

    public static function generate(): static
    {
        return new static(Uuid::uuid7()->toString());
    }

    public function equals(self $other): bool
    {
        return $other instanceof static && $other->value === $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

O construtor é final, então `new static()` é seguro e cria todas as classes
filhas a partir de uma string da mesma forma.  Um ID concreto é apenas uma
classe filha vazia:

```php
<?php

declare(strict_types=1);

namespace App\User;

use App\Shared\Uuid\UuidValue;

final readonly class UserId extends UuidValue
{
}
```

Defina `PostId` e outros IDs da mesma forma.

### Type caster

```php
<?php

declare(strict_types=1);

namespace App\Shared\Uuid;

use Ramsey\Uuid\Uuid;
use ReflectionNamedType;
use ReflectionType;
use ReflectionUnionType;
use Yiisoft\Hydrator\Result;
use Yiisoft\Hydrator\TypeCaster\TypeCastContext;
use Yiisoft\Hydrator\TypeCaster\TypeCasterInterface;

use function count;
use function is_string;
use function is_subclass_of;

final readonly class UuidValueTypeCaster implements TypeCasterInterface
{
    public function cast(mixed $value, TypeCastContext $context): Result
    {
        $class = $this->findUuidValueClass($context->getReflectionType());
        if ($class === null) {
            return Result::fail();
        }

        if ($value instanceof $class) {
            return Result::success($value);
        }

        if (!is_string($value) || !Uuid::isValid($value)) {
            return Result::fail();
        }

        return Result::success(new $class($value));
    }

    /**
     * Retorna a classe filha de `UuidValue` a partir do tipo declarado, ou `null` se não houver nenhuma ou houver várias
     * delas, como em `UserId|PostId`.
     *
     * @return class-string<UuidValue>|null
     */
    private function findUuidValueClass(?ReflectionType $type): ?string
    {
        $types = match (true) {
            $type instanceof ReflectionNamedType => [$type],
            $type instanceof ReflectionUnionType => $type->getTypes(),
            default => [],
        };

        $classes = [];
        foreach ($types as $subType) {
            if (
                $subType instanceof ReflectionNamedType
                && !$subType->isBuiltin()
                && is_subclass_of($subType->getName(), UuidValue::class)
            ) {
                $classes[] = $subType->getName();
            }
        }

        return count($classes) === 1 ? $classes[0] : null;
    }
}
```

O caster segue as [regras para escrever um type
caster](#anatomia-de-um-type-caster). Ele escolhe a classe a ser criada a
partir do tipo declarado. Todos os IDs compartilham o mesmo formato UUID,
então uma string sozinha não diz se é um ID de usuário ou de post. Por isso,
um único caster atende todas as classes filhas de `UuidValue`, e adicionar
uma nova classe de ID não exige mudanças no caster. Pelo mesmo motivo, o
caster falha para um tipo com várias classes de ID, como
`UserId|PostId`. Não há como escolher a correta.

Registre o `UuidValueTypeCaster` como mostrado na seção [Registrando um type
caster](#registrando-um-type-caster), incluindo a [configuração para form
models](#registrando-para-form-models) se você usa o Yii Form Model.

### Usando os value objects

Agora qualquer classe preenchida pelo hydrator pode declarar value objects
de ID diretamente.

#### Hydrator

A mesma string se torna um value object diferente dependendo do tipo da
propriedade:

```php
use App\Post\PostId;
use App\User\UserId;
use Yiisoft\Hydrator\HydratorInterface;

final class CommentFilter
{
    public ?UserId $authorId = null;
    public ?PostId $postId = null;
}

/** @var HydratorInterface $hydrator */
$filter = $hydrator->create(CommentFilter::class, [
    'authorId' => '0192f2a4-7a4b-7c3e-9a1b-3f5c8d2e6a10',
    'postId' => '0192f2a4-7a4b-7c3e-9a1b-3f5c8d2e6a10',
]);

// $filter->authorId é UserId, $filter->postId é PostId.
// $filter->authorId->equals($filter->postId) retorna false.
```

#### Entrada da requisição <a id="entrada-da-requisicao"></a>

O pacote [Yii Input HTTP](https://github.com/yiisoft/input-http) usa o
hydrator para preencher objetos de entrada da requisição, então o mesmo type
caster funciona para parâmetros da query string, corpo da requisição e
argumentos da rota. O atributo `RouteArgument` vem do [Yii
Router](https://github.com/yiisoft/router). Estenda `AbstractInput` para que
a entrada seja validada após a hidratação:

```php
<?php

declare(strict_types=1);

namespace App\Post\Update;

use App\Post\PostId;
use App\User\UserId;
use Yiisoft\Input\Http\AbstractInput;
use Yiisoft\Input\Http\Attribute\Parameter\Body;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Validator\Rule\Required;

final class UpdatePostInput extends AbstractInput
{
    #[RouteArgument('id')]
    #[Required]
    public ?PostId $id = null;

    #[Body('author_id')]
    #[Required]
    public ?UserId $authorId = null;
}
```

```php
use Psr\Http\Message\ResponseInterface;

final readonly class Action
{
    public function __invoke(UpdatePostInput $input): ResponseInterface
    {
        if (!$input->getValidationResult()->isValid()) {
            // Retorne uma resposta de erro.
        }

        // $input->id é PostId, $input->authorId é UserId.
        // ...
    }
}
```

#### Form model

O `FormHydrator` do [Yii Form Model](https://github.com/yiisoft/form-model)
preenche form models. Depois que você [registra o caster para form
models](#registrando-para-form-models), também pode declarar propriedades de
formulário como value objects:

```php
<?php

declare(strict_types=1);

namespace App\Post\Create;

use App\User\UserId;
use Yiisoft\FormModel\FormModel;
use Yiisoft\Validator\Rule\Length;
use Yiisoft\Validator\Rule\Required;

final class CreatePostForm extends FormModel
{
    #[Required]
    #[Length(min: 2)]
    public string $title = '';

    #[Required]
    public ?UserId $authorId = null;
}
```

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Yiisoft\FormModel\FormHydrator;

final readonly class Action
{
    public function __construct(
        private FormHydrator $formHydrator,
    ) {}

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $form = new CreatePostForm();

        if ($this->formHydrator->populateFromPostAndValidate($form, $request)) {
            // $form->authorId é UserId.
            // ...
        }

        // ...
    }
}
```

### Valores nulos e inválidos <a id="valores-nulos-e-invalidos"></a>

Veja o que acontece com uma propriedade declarada como `?UserId` para
diferentes valores de entrada:

| Valor de entrada                         | Tratado por            | Valor da propriedade             |
|------------------------------------------|------------------------|----------------------------------|
| `'0192f2a4-7a4b-7c3e-9a1b-3f5c8d2e6a10'` | `UuidValueTypeCaster`  | instância de `UserId`            |
| `null`                                   | `PhpNativeTypeCaster`  | `null`                           |
| `'not-a-uuid'`                           | nenhum, todos falham   | valor padrão, `null` no exemplo  |

A última linha é a importante: o hydrator não reporta o valor malformado.
Com a regra `Required`, a validação o detecta com o erro "cannot be blank".
Veja os exemplos de [entrada da requisição](#entrada-da-requisicao) e [form
model](#form-model).  Mas, se a propriedade for opcional, um UUID inválido é
silenciosamente transformado em `null` e fica indistinguível de um valor
ausente. Se isso não for aceitável, mantenha o valor bruto para validação:
declare a propriedade como `string`, valide seu formato e converta-a para o
value object após a validação.

## Quando usar um type caster

Um type caster é uma boa escolha quando a conversão:

- depende apenas do valor e do tipo declarado.
- é a mesma em toda a aplicação.
- não precisa de I/O, como consultas ao banco de dados ou chamadas HTTP.

Value objects para IDs, e-mails e valores monetários atendem aos três
critérios. Mantenha a conversão em um mapper dedicado ou em uma factory de
domínio quando ela:

- precisa consultar o banco de dados, por exemplo, transformar um ID em uma
  entidade carregada.
- depende de contexto, como o usuário atual.
- combina vários campos de entrada em um único objeto.
- difere entre casos de uso.
