# Custom hydrator type casters

[Yii Hydrator](https://github.com/yiisoft/hydrator) creates objects and fills them with data from arrays. It's used
directly and by packages built on top of it:

- [Yii Input HTTP](https://github.com/yiisoft/input-http) fills request input objects from query parameters, request
  body, and, with the help of [Yii Router](https://github.com/yiisoft/router), route arguments;
- [Yii Form Model](https://github.com/yiisoft/form-model) provides `FormHydrator` that fills form models from submitted
  data.

The incoming data is usually "raw": HTTP requests, database rows, and queue messages contain strings, numbers, and
arrays. Before assigning a value to a property or passing it to a constructor parameter, the hydrator converts it to
the declared type. This conversion is done by a *type caster*. By writing your own type caster, you teach the hydrator
to create your types, such as value objects, from raw data.

## Why custom type casters

Out of the box, the hydrator uses a composite type caster with two casters:

- `PhpNativeTypeCaster` casts values to built-in PHP types (`int`, `string`, `bool`, `array`, and so on);
- `HydratorTypeCaster` creates nested objects from arrays using the hydrator itself.

That's enough for DTOs with scalar properties, but not for a rich domain model. Consider a property typed as `UserId`,
`Email`, or `Money`. The incoming value is a string, and neither of the default casters knows how to turn it into such
an object. So you end up declaring the property as `string` and converting it by hand wherever it's used:

```php
final class CreatePostForm extends FormModel
{
    public string $authorId = '';
}

// In every action that uses the form:
try {
    $authorId = new UserId($form->authorId);
} catch (InvalidArgumentException) {
    // Report the error somehow.
}
```

With a type caster for `UserId`, the property is declared with its real type, and the conversion happens during
hydration:

```php
final class CreatePostForm extends FormModel
{
    public ?UserId $authorId = null;
}

// $form->authorId is already an instance of UserId.
```

The conversion logic lives in a single place: once registered, the caster is applied to every property and constructor
parameter of the matching type, in every object the hydrator creates.

Typical use cases are:

- value objects for entity IDs, emails, phone numbers, money amounts, and so on;
- types from third-party libraries, such as UUIDs, dates, or currencies;
- consistent normalization of values, for example, parsing dates in a format specific to your application.

## Anatomy of a type caster

A type caster implements `Yiisoft\Hydrator\TypeCaster\TypeCasterInterface` with a single method:

```php
public function cast(mixed $value, TypeCastContext $context): Result;
```

- `$value` is the raw value to convert.
- `$context` is a `Yiisoft\Hydrator\TypeCaster\TypeCastContext`. Its `getReflectionType()` method returns the declared
  type of the target property or constructor parameter. Use it to decide whether the caster supports the target type.
- The method returns a `Yiisoft\Hydrator\Result`: `Result::success($convertedValue)` if the conversion succeeded or
  `Result::fail()` if the caster can't handle the value.

Follow these rules when writing a type caster:

1. **Check the target type first.** If the declared type isn't the one your caster is responsible for, return
   `Result::fail()` right away so other casters can handle the value.
2. **Handle both named and union types.** A nullable type such as `?Email` (or `Email|null`) is represented by
   `ReflectionNamedType`, while `Email|string` is represented by `ReflectionUnionType`. In the latter case, look for
   your type among its subtypes.
3. **Don't handle `null` yourself.** If the value is `null`, just return `Result::fail()`. `PhpNativeTypeCaster`
   returns `null` for any type that allows it, so a `null` value assigned to `?Email` stays `null`.
4. **Accept already converted values.** If the value is already an instance of the target type, return it as is.
5. **Fail instead of throwing.** If the value can't be converted, for example, a malformed string, return
   `Result::fail()`. An exception would break the whole hydration.

Keep in mind that a failed cast is silent. If no caster succeeds, the hydrator doesn't set the property, so it keeps its
default value, and no error is reported. Reporting the problem to the user is the job of the validation that runs after
hydration. See [Null and invalid values](#null-and-invalid-values) for an example.

## Registering a type caster

Type casters are combined with `CompositeTypeCaster`. It tries the casters one by one and uses the result of the first
one that succeeds. To add your caster, redefine `TypeCasterInterface` in the DI container configuration, for example,
in `config/common/di/hydrator.php`:

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

Since the first successful result wins, the order matters:

- Put custom casters before `PhpNativeTypeCaster`. Otherwise, for a property declared as `UserId|string`,
  `PhpNativeTypeCaster` accepts a string as is, and your caster never runs.
- Keep the default casters in the list. Without `PhpNativeTypeCaster`, scalar values won't be cast to built-in types,
  and without `HydratorTypeCaster`, nested objects won't be created from arrays.

If a caster has dependencies, take it from the container:

```php
TypeCasterInterface::class => static fn(ContainerInterface $container) => new CompositeTypeCaster(
    $container->get(MoneyTypeCaster::class),
    new PhpNativeTypeCaster(),
    new HydratorTypeCaster(),
),
```

## Example: UUID value objects

Entity IDs are often represented as value objects instead of plain strings: `UserId`, `PostId`, `OrderId`, and so on.
Such objects make method signatures self-documenting and prevent passing a post ID where a user ID is expected.
Let's write a type caster that creates them from UUID strings.

### Value objects

All ID value objects extend an abstract `UuidValue` class. The example uses
[ramsey/uuid](https://github.com/ramsey/uuid) to validate and generate UUIDs:

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
use function strtolower;

abstract readonly class UuidValue implements Stringable
{
    private string $value;

    final public function __construct(string $value)
    {
        if (!Uuid::isValid($value)) {
            throw new InvalidArgumentException(sprintf('"%s" is not a valid UUID.', $value));
        }
        $this->value = strtolower($value);
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

The constructor is final, so `new static()` is safe and every child class can be created from a string the same way.
A concrete ID is just an empty child class:

```php
<?php

declare(strict_types=1);

namespace App\User;

use App\Shared\Uuid\UuidValue;

final readonly class UserId extends UuidValue
{
}
```

`PostId` and other IDs are defined the same way.

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
     * @return class-string<UuidValue>|null
     */
    private function findUuidValueClass(?ReflectionType $type): ?string
    {
        $types = match (true) {
            $type instanceof ReflectionNamedType => [$type],
            $type instanceof ReflectionUnionType => $type->getTypes(),
            default => [],
        };

        foreach ($types as $subType) {
            if (
                $subType instanceof ReflectionNamedType
                && !$subType->isBuiltin()
                && is_subclass_of($subType->getName(), UuidValue::class)
            ) {
                return $subType->getName();
            }
        }

        return null;
    }
}
```

The caster follows the rules described above. Note that the class to create is taken from the declared type, not from
the value: all IDs share the same UUID format, and a string alone can't tell whether it's a user ID or a post ID. As
a result, a single caster serves all `UuidValue` child classes, and adding a new ID class doesn't require any changes in
it.

Register `UuidValueTypeCaster` as shown in the [Registering a type caster](#registering-a-type-caster) section.

### Using the value objects

Now any class that's populated by the hydrator can declare ID value objects directly.

#### Hydrator

The same string becomes a different value object depending on the type of the property:

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

// $filter->authorId is UserId, $filter->postId is PostId.
// $filter->authorId->equals($filter->postId) returns false.
```

#### Request input

The [Yii Input HTTP](https://github.com/yiisoft/input-http) package uses the hydrator to fill request input objects, so
the same type caster works for query parameters, request body, and route arguments. The `RouteArgument` attribute
comes from [Yii Router](https://github.com/yiisoft/router). Extend `AbstractInput` to get the input validated after
hydration:

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
            // Return an error response.
        }

        // $input->id is PostId, $input->authorId is UserId.
        // ...
    }
}
```

#### Form model

`FormHydrator` from [Yii Form Model](https://github.com/yiisoft/form-model) populates form models with the same
hydrator, so form properties can be typed as value objects too:

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
            // $form->authorId is UserId.
            // ...
        }

        // ...
    }
}
```

### Null and invalid values

Here is what happens with a property declared as `?UserId` for different input values:

| Input value                              | Handled by             | Property value                   |
|------------------------------------------|------------------------|----------------------------------|
| `'0192f2a4-7a4b-7c3e-9a1b-3f5c8d2e6a10'` | `UuidValueTypeCaster`  | `UserId` instance                |
| `null`                                   | `PhpNativeTypeCaster`  | `null`                           |
| `'not-a-uuid'`                           | none, all casters fail | default value, `null` in example |

The last row is the important one: the hydrator doesn't report the malformed value. With the `Required` rule, as in
the examples above, validation catches it with the "cannot be blank" error. But if the property is optional, an invalid
UUID is silently turned into `null` and is indistinguishable from a missing value. If that's not acceptable, keep
the raw value for validation: declare the property as `string`, validate its format, and convert it to the value object
after validation.

## When to use a type caster

A type caster fits well when the conversion:

- depends only on the value and the declared type;
- is the same everywhere in the application;
- doesn't need I/O, such as database queries or HTTP calls.

Value objects for IDs, emails, and money amounts match all three. Keep the conversion in a dedicated mapper or a domain
factory instead when it needs a database lookup (for example, turning an ID into a loaded entity), depends on context
such as the current user, combines several input fields into one object, or differs between use cases.
