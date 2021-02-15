# 017 - Tags

Unlike regular classes, tags are used in view templates so syntax is very important. It should be both
easy to write, easy to read and not too verbose because similar constructs are meant to be used over and over again.

## Class names

Tags are not postfixed or prefixed unless it is an abstract base class.

## Inheritance

Inheritance is allowed with some restrictions:

- If class is not abstract, it should be final.
- Hierarchy should be kept as linear as possible.

## Immutability

Tags should:

- Have no state.
- Be immutable. Every method that modifies a setting, returns a clone with the setting changed.
- Be free of side effects. Multiple calls of the same method with the same argument should give the same result.

## Method names

Unlike other classes, methods that return a clone of the object with some properties modified, are not prefixed:

```php
<?= A::tag()->href('https://www.yiiframework.com/') ?>
```
