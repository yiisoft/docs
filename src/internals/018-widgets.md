# 018 - Widgets

Unlike regular classes, widgets are used in view templates, so syntax is important.
It should be both easy to write,
easy to read and not too verbose because similar constructs are meant to be used over and over again.

## Class names

Widgets aren't postfixed or prefixed.

## Inheritance

Inheritance is allowed with some restrictions:

- If a class isn't abstract, it should be final.
- Hierarchy should be kept as linear as possible.

## Immutability

Widgets should:

- Have no state.
- Be immutable.

## Methods

### Names

- Unlike other classes, methods that return a clone of the object with some properties modified aren't prefixed.
- Keep method names as short as possible but don't hurt readability.

### Boolean flags

The method that corresponds to the boolean attribute should be named after the attribute and accept a boolean flag argument.
