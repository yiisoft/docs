# 017 - Tags

Unlike regular classes, tags are used in view templates, so syntax is important.
It should be both easy to write, easy to read and not too verbose because similar constructs
are meant to be used over and over again.

## Class names

- Tags aren't postfixed or prefixed unless it's an abstract base class.
- If the tag represents a specification, use a name used in the specification. 

## Inheritance

Inheritance is allowed with some restrictions:

- If a class isn't abstract, it should be final.
- Hierarchy should be kept as linear as possible.

## Immutability

Tags should:

- Have no state.
- Be immutable. Every method that modifies a setting returns a clone with the setting changed.
- Be free of side effects. Many calls of the same method with the same argument should give the same result.

## Methods

### Names

- Unlike other classes, methods that return a clone of the object with some properties modified aren't prefixed.
- Keep method names as short as possible but don't hurt readability.
- If the tag represents a specification, use a name used in the specification.

### Boolean flags

The method that corresponds to the boolean attribute should be named after the attribute and accept a boolean flag argument. 
