# 010 - Code Style

Code formatting used in Yii 3 packages is based on [PSR-12](https://www.php-fig.org/psr/psr-12/) with additional rules
added on top of it.

## Property placement

Properties are placement at the beginning of the class after constants but before methods.
  
## Comments

Inline comments are to be avoided except when code could not be understood without them. A good example is
a workaround for a bug in a certain PHP version.

Method comment is necessary except it adds nothing to what method name and signature already has.

Class comment should describe the purpose of the class. 

## Additional conventions

- [Namespaces](004-namespaces.md)
- [Exceptions](007-exceptions.md)
- [Interfaces](008-interfaces.md)

