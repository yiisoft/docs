# 003 — Roadmap

We want Yii 3 to:

- Not limit a developer to choosing architecture. Allow anything from
  "classic" MVC to DDD.
- Be based on the best practices such as SOLID, GRASP, etc. and teach them
  to the community.
- Keep the most good things from Yii 2.
- Be more open to the global PHP community and infrastructure.

## PSRs compliance

PSR compliance helps with customizability, the ability to use general PHP
libraries and implement fewer wrappers.  Here's the list of PSRs we want to
implement.

### PSR-3 Logger

Implemented as a [separate package that isn't dependent on a
framework](https://github.com/yiisoft/log).

- [x] Framework packages should depend on interface only.
- [x] Split drivers into packages.
- [x] Clean-up code.
- [x] [Fix email target](https://github.com/yiisoft/log-target-email).

### PSR-4 Autoloading

- [x] Autoloading is fine already.
- [x] Document on how it works.

### PSR-7 HTTP message

- [x] Remove our own implementation. At least for now.
- [x] Framework packages should depend on interfaces only.

### PSR-11 Container

Implemented as a [separate package that isn't dependent on a
framework](https://github.com/yiisoft/di).

- [x] Framework packages shouldn't use container directly. One should be
  able to instantiate everything manually.
- [x] Finish refactoring.
- [x] Remove all framework-specific implementations from the package. Move
  to a framework.
- [x] [Implement autoloader
  fallback](https://github.com/yiisoft/di/issues/88)

### PSR-12 Code style

- [x] Make sure the code follows it.
- [x] Automate fixing style before release.

### PSR-14 Event dispatcher

- [x] [Implement as a separate
  library](https://github.com/yiisoft/event-dispatcher).
- [x] Use in other packages.
- [x] Polish.

### PSR-15 HTTP handlers

- [x] Rewrite HTTP flow to PSR-7 request-response + formatting response via
  emitter.
- [x] Offer SAPI emitter out of the box.
- [x] Make it possible to use alternative emitters such as RoadRunner.
- [x] Support middleware.
- [x] Implement filters as middleware:
  - [x] [Rate limiting](https://github.com/yiisoft/yii-web/issues/63)
  - [x] [Authentication](https://github.com/yiisoft/yii-web/issues/114)
- [x] Re-implement router w/ middleware support for route groups.
- [x] Filters should be middlewares.

### PSR-16 Simple cache

Implemented as a [separate package that isn't dependent on a
framework](https://github.com/yiisoft/cache).

- [x] Framework packages should depend on interfaces only.
- [x] Split drivers into packages.
- [x] Clean-up code.

### PSR-17 HTTP factories

- [x] Use PSR factories.

### PSR-18 HTTP client

- [x] Remove our own implementation. At least for now.
- [x] Framework packages should depend on interfaces only.

## Stricter types

- [x] Make sure type hinting is used everywhere.
- [x] Make sure types are as definitive as possible. Avoid varying types if
  possible.

## Single application template

- [x] Drop basic/advanced.
- [x] Create a [single application template that works out of the
  box](https://github.com/yiisoft/app).

## Router

Implemented as a [separate package that isn't dependent on a
framework](https://github.com/yiisoft/router).

- [x] DSL for configuration.
- [x] Ability to route to any callable.
- [x] Named routes.
- [x] Route groups w/ middleware support.

## Best practices and SOLID compliance of all classes/packages

- [x] Make sure interfaces follow the "interface segregation" principle.
- [x] Don't use public properties.
- [x] Don't use `init()`.
- [x] Don't inherit from `BaseObject` or `Component`. Remove these.
- [x] No globals.
- [x] No static calls except helpers that are final.
- [x] Prefer throwing exceptions to fixing input.

## Development toolkit

- [x] Release command line tool
- [x] Development command line tool (symlinks packages into usable
  application)

## Консоль

- [x] Separate web and console application
- [x] Possibly eliminate base application (still needed)
- [x] Create an interface for the console (using Symfony one)
- [x] Implementation may be one of the popular ones (using Symfony one)
- [x] Ensure application can add commands via config

## Документация

- [ ] Follow best practices.
- [ ] Don't use the "MVC" term.
- [ ] Upgrading from Yii 2.

## RBAC

RBAC is implemented as [a framework-independent
package](https://github.com/yiisoft/rbac).

- [x] Finish refactoring.
- [x] Make sure it follows best practices.
- [x] Split drivers into packages.

## View

View is implemented as [framework-independent
package](https://github.com/yiisoft/view).

- [x] Finish refactoring ([see
  issues](https://github.com/yiisoft/view/issues)).
- [x] Port widgets.
- [x] Rethink and implement active form widgets.
- [x] Implement caching widgets.

## Data abstractions and grid

- [x] Finish [data abstractions](https://github.com/yiisoft/data).
- [x] Port sort, use data abstractions. Should be part of
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Port paging, use data abstractions. Should be part of
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Port grid, use data abstractions. Should be part of
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Port list, use data abstractions. Should be part of
  [yii-dataview](https://github.com/yiisoft/yii-dataview).

## Validators

- [x] Finish [the main package](https://github.com/yiisoft/validator)
  redesign
- [x] Port necessary validators

## Debug toolbar

- [x] Port debug toolbar.

## Gii

- [x] Port Gii.

## Infrastructure

- [x] Cover [config](https://github.com/yiisoft/config) with tests.
- [x] Release stable [config](https://github.com/yiisoft/config).

## Others

- [x] [Decide on
  namespaces](https://forum.yiiframework.com/t/lowercase-or-camelcase-namespaces/124983/52).
- [x] [Clean up error
  handler](https://github.com/yiisoft/yii2/issues/14348). Make sure the
  error handler catches fatals and is using response.
- [x] Make validators independent of models to allow reusing them in
  handlers.
- [x] [Split
  IdentityInterface](https://github.com/yiisoft/yii2/issues/13825).
