# 010 — Code style

Code formatting used in Yii 3 packages is based on [PSR-1](https://www.php-fig.org/psr/psr-1/) and
[PSR-12](https://www.php-fig.org/psr/psr-12/) with extra rules added on top of it.

## Names

- Use English only.
- Use camelCase notation, including abbreviations (e.g., `enableIdn`).
- Use the shortest possible, but an explanatory name.
- Never trim or abbreviate a name.
- Postfix classes, interfaces, traits and variables, which is a [collection](https://en.wikipedia.org/wiki/Collection_(abstract_data_type)), with `Collection`.

## Types

- Declare [argument and return types](https://www.php.net/manual/en/migration70.new-features.php) where possible.
- [Use types for properties](https://wiki.php.net/rfc/typed_properties_v2).
- Use strict typing. Avoid mixed and union types where possible except compatible types such as `string|Stringable`.

## Comments

Inline comments are to be avoided unless code couldn't be understood without them.
A good example is a workaround for a bug in a certain PHP version.

Method comment is necessary except it adds nothing to what method name and signature already has.

Class comment should describe the purpose of the class.

[See PHPDoc](https://github.com/yiisoft/docs/blob/master/014-docs.md#phpdoc).

## Formatting

### No alignment

Property, variable and constant value assignments shouldn't be aligned.
The same applies to phpdoc tags. The reason is that aligned statements often cause larger diff and even conflicts.

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

### Chain calls

Chained calls should be formatted for better readability.
If it's a long chain that doesn't fit the line length of 120 characters, then each call should on a new line:

```php
$object
    ->withName('test')
    ->withValue(87)
    ->withStatus(Status::NEW)
    ->withAuthor($author)
    ->withDeadline($deadline);
```

If it's a short chain, it's alright for it to be on a single line:

```php
$object = $object->withName('test');
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

Prefer [composition to inheritance](guide/en/concept/di-container.md).

### Property, constant and method order

Order should be the following:

- Constants
- Properties
- Methods

Within each category, items should be sorted by visibility:

- public
- protected
- private

### Abstract classes

Abstract classes *shouldn't* be prefixed or postfixed with `Abstract`.

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

Boolean flags in methods are better to be avoided. It's a sign the method may be doing too much, and there
should be two methods instead of one.

```php
public function login(bool $refreshPage = true): void;
```

It is better to be two methods:

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

