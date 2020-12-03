# 010 - Code Style

Code formatting used in Yii 3 packages is based on [PSR-12](https://www.php-fig.org/psr/psr-12/) with additional rules
added on top of it.

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
class X
{
    const A = 'test';
    const BBB = 'test';
    
    private $property = 42;
    private $test = 123;
    
    /**
     * @param int $number just a number
     * @param array $options well... options!
     */
    public function doit(int $number, array $options)
    {
        $test = 123;
        $a = 123;
    }
}
```

## Strings

- When no variables involved, use `'Hello!'`
- To get variables into string prefer `"Hello, $username!"`

## Classes and interfaces

### Property, constant and method order

Order should be the following:

- Constants
- Properties
- Methods

### Abstract classes

Abstract classes *should not* be prefixed or postfixed with `Abstract`.

### Methods

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

