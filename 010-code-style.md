# 010 - Code Style

Code formatting used in Yii 3 packages is based on [PSR-1](https://www.php-fig.org/psr/psr-1/) and
[PSR-12](https://www.php-fig.org/psr/psr-12/) with additional rules added on top of it.

## Names

- Use English only.
- Use the shortest possible, but an explanatory name.
- Never trim or abbreviate name.

## Types

- Declare [argument and return types](https://www.php.net/manual/en/migration70.new-features.php) where possible.
- [Use types for properties](https://wiki.php.net/rfc/typed_properties_v2).
- Use strict typing.

## Comments

Inline comments are to be avoided except when code could not be understood without them. A good example is
a workaround for a bug in a certain PHP version.

Method comment is necessary except it adds nothing to what method name and signature already has.

Class comment should describe the purpose of the class.

[See PHPDoc](https://github.com/yiisoft/docs/blob/master/014-docs.md#phpdoc).

## Formatting

### No alignment

Property, variable and constant value assignments should not be aligned. Same applies to phpdoc tags.
The reason is that aligned statements often cause larger diff and even conflicts.

```php
final class X
{
    const A = 'test';
    const BBB = 'test';
    
    private int $property = 42;
    private int $test = 123;
    
    /**
     * @param int $number Just a number.
     * @param array $options Well... options!
     */
    public function doIt(int $number, array $options): void
    {
        $test = 123;
        $anotherTest = 123;
    }
}
```

## Strings

- When no variables involved, use `'Hello!'`
- To get variables into string prefer `"Hello, $username!"`

## Classes and interfaces

### Final by default

Classes should be `final` by default.

### Private by default

Constants, properties and methods should be private by default.

### Composition over inheritance

Prefer [composition over inheritance](guide/en/concept/di-container.md).

### Property, constant and method order

Order should be the following:

- Constants
- Properties
- Methods

Within each category items should be sorted by visibility:

- public
- protected
- private

### Abstract classes

Abstract classes *should not* be prefixed or postfixed with `Abstract`.

#### Immutable methods

Immutable method convention is the following:

```php
public function withName(string $name): self
{
    $new = clone $this;
    $new->name = $name;
    return $new; 
}
```

1. Cloned object name is `$new`.
2. Return type is `self`.

#### Boolean check methods

Methods that are there to check if something is true should be named like the following:

```php
public function isDeleted(): bool;
public function hasName(): bool;
public function canDoIt(): bool;
```

#### Flags in methods 

Boolean flags in methods are better to be avoided. It is a sign the method may be doing too much and there
should be two methods instead of one.

```php
public function login(bool $refreshPage = true): void;
```

Is better to be two methods:

```php
public function login(): void;
public function refreshPage(): void;
```

## Variables

Add an underscore (`_`) prefix for unused variables. For example:

```php
foreach ($items as $key => $_value) {
    echo $key;
}
```

## Imports

Prefer importing classes and functions to using fully qualified names:

```php
use Yiisoft\Arrays\ArrayHelper;
use Yiisoft\Validator\DataSetInterface;
use Yiisoft\Validator\HasValidationErrorMessage;
use Yiisoft\Validator\Result;

use function is_iterable;
```

## Additional conventions

- [Namespaces](004-namespaces.md)
- [Exceptions](007-exceptions.md)
- [Interfaces](008-interfaces.md)

