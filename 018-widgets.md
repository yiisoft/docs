# 018 - Widgets

Unlike regular classes, widgets are used in view templates so syntax is very important. It should be both
easy to write, easy to read and not too verbose because similar constructs are meant to be used over and over again.

## Class names

Widgets are not postfixed or prefixed.

## Inheritance

Inheritance is allowed with some restrictions:

- If class is not abstract, it should be final.
- Hierarchy should be kept as linear as possible.

## Immutability

Widgets should:

- Have no state.
- Be immutable.

## Methods

### Names

- Unlike other classes, methods that return a clone of the object with some properties modified, are not prefixed.
- Keep method names as short as possible but do not hurt readability.

### Boolean flags

Method that correspond to boolean attribute should be named after the attribute and accept a boolean flag argument.
