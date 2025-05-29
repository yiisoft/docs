# 009 — Design Decisions

In this document, we list important design decisions taken during Yii3 development.

## Remove magic properties

Magic properties in Yii 2 were an interesting idea that allowed a developer to start with
public property and then seamlessly migrate to using getter/setter called via magic
methods without changing the code.

The main reason for removal in Yii 3 is that it resulted in using public
properties everywhere, thus lack of encapsulation and code fragility.

## Remove the service locator

Service locator both Yii 1 and Yii 2 was convenient but was also abused a lot.
Although a dependency injection container was available in Yii 2, service locator
was generally preferred to cause both a dependency on the service locator itself,
high coupling, hard to test code.

Yii 3 relies on dependency injection only lowering coupling significantly and
making code way more testable.

## Extract general packages

Yii 1 and Yii 2 were fully closed communities. All the code we had wasn't useful
outside Yii, and most of the "external" code wasn't useful in Yii without
wrappers. It was noted many times by communities external to Yii that many parts
of Yii are well-designed and unique, and they'd use these if these were available
as standalone packages.

As part of Yii 3 packages such as cache, RBAC, view, etc. were extracted into
framework-independent packages. Benefits are:

- Increased usage and contribution
- Yii team could delegate maintenance
- Independent releases are possible

## Adopt PSRs

The team adopted some PSRs in Yii 2, such as PSR-4 and PSR-2.
Interfaces in general weren't, although Yii is part of PHP-FIG.
Mainly because when Yii 2 was released, these were either in the making or not adopted enough.

Yii3 benefits from PSRs since there are nowadays many ready-to-use libraries
that one can get via Composer: cache backends, middleware, loggers, DI containers,
etc.

By implementing PSRs in general packages, we allow these to be used in more
projects, thus raising the contribution level.

## Improve DI container

The problem with the Yii 2 container was that it's tailored to be used with Yii 2
components.
API isn't well-designed to be used with general PHP classes.

In Yii3, we ensured that container can be used to conveniently configure any
PHP class.

That should result in the absence of Yii-specific wrapper packages and more direct
usages of Composer packages.

## Adopt strict types

Strict types were introduced because:

- PHP 7 is now mainstream
- While they solve no significant Yii 2 problems, they help to avoid many day-to-day
  development issues

## Adopt SemVer

Yii 2 has its own version policy. Problems:

- It wasn't standard
- Composer relies on SemVer
- It's hard to support a framework built on top of packages if the versioning policy
  isn't strict

## Prevent validators mutating data

In Yii 1 and Yii 2, validators such as "date" were mutating data.
It was confusing for a validation process not initially meant to mutate data it validates.

[See related discussion](https://forum.yiiframework.com/t/saving-or-killing-non-validation-in-validators/126086).
