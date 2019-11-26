# 010 - Code Style

Code formatting used in Yii 3 packages is based on [PSR-12](https://www.php-fig.org/psr/psr-12/) with additional rules
added on top of it.

## Property, constant and method placement

Order should be the following:

- Constants
- Properties
- Methods
  
## Comments

Inline comments are to be avoided except when code could not be understood without them. A good example is
a workaround for a bug in a certain PHP version.

Method comment is necessary except it adds nothing to what method name and signature already has.

Class comment should describe the purpose of the class.

## No alignment

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

## Additional conventions

- [Namespaces](004-namespaces.md)
- [Exceptions](007-exceptions.md)
- [Interfaces](008-interfaces.md)

