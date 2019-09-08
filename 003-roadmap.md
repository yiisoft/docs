# 003 - Roadmap

We want Yii 3 to:

- Not limit developer in choosing architecture. Allow anything from "classic" MVC to DDD.
- Be based on best practices such as SOLID, GRASP etc. and teach them to community.
- Keep most good things from Yii 2.
- Be more open to global PHP community and infrastructure.

## PSRs compliance

PSR compliance helps with customizability, ability to use general PHP libraries and implement less wrappers.
Here's the list of PSRs we want to implement.

### PSR-3 Logger

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/log).

- [x] Framework packages should depend on interface only.
- [x] Split drivers into packages.
- [x] Clean up code.
- [ ] Fix email target.

### PSR-4 Autoloading

- [x] Autoloading is fine already.
- [ ] Document on how it works.

### PSR-7 HTTP message

- [x] Remove our own implementation. At least for now.
- [x] Framework packages should depend on interfaces only.
- [ ] Implement decorators for Request, ServerRequest, Response adding handy methods.

### PSR-11 Container

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/di).

- [x] Framework packages should not use container directly. One should be able to instantiate everything manually.
- [x] Finish refactoring.
- [x] Remove all framework-specific implementations from the package. Move to framework.
- [ ] [Implement autoloader fallback](https://github.com/yiisoft/di/issues/88)

### PSR-12 Code style

- [ ] Make sure code follows it.
- [x] Automate fixing style before release.

### PSR-13 Hypermedia links

### PSR-14 Event dispatcher

- [x] [Implement as a separate library](https://github.com/yiisoft/event-dispatcher).
- [x] Use in other packages.
- [x] Polish.

### PSR-15 HTTP handlers

- [x] Rewrite HTTP flow to PSR-7 request-reponse + formatting response via emitter.
- [x] Provide SAPI emitter out of the box.
- [x] Make it possible to use alternative emitters such as RoadRunner.
- [x] Support middleware.
- [ ] Implement filters as middleware:
  - [ ] Rate limiting
  - [ ] Basic auth
  - [ ] Digest auth
- [x] Re-implement router w/ middleware support for route groups.
- [x] Filters should be middlewares.

### PSR-16 Simple cache

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/cache).

- [x] Framework packages should depend on interfaces only.
- [x] Split drivers into packages.
- [x] Clean up code.

### PSR-17 HTTP factories

- [x] Use PSR factories.

### PSR-18 HTTP client

- [ ] Remove our own implementation. At least for now.
- [ ] Framework packages should depend on interfaces only.

## Stricter types

- [ ] Make sure PHP 7.2 type hinting is used everywhere.
- [ ] Make sure types are as definitive as possible. Avoid varying types if possible.

## Single application template

- [x] Drop basic/advanced.
- [ ] Create a [single application template that works out of the box](https://github.com/yiisoft/yii-project-template).

## Router

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/router).

- [x] DSL for configuration.
- [x] Ability to route to any callable.
- [x] Named routes.
- [x] Route groups w/ middleware support.

## Best practices and SOLID compliance of all classes/packages

- [ ] Make sure interfaces follow "interface segregation" principle.
- [ ] Do not use public properties.
- [x] Do not use `init()`.
- [x] Do not inherit from `BaseObject` or `Component`. Remove these.
- [x] No globals.
- [ ] No static calls except helpers that are final.
- [ ] Prefer throwing exceptions to fixing input.

## Development toolkit

- [ ] Release command line tool
- [x] Development command line tool (symlinks packages into usable application)

## Console

- [x] Separate web and console application
- [x] Possibly eliminate base application (still needed)
- [x] Create interface for console (using Symfony one)
- [x] Implementation may be one of the popular ones (using Symfony one)
- [ ] Port useful commands
- [x] Ensure application can add commands via config

## Documentation

- [ ] Follow best practices.
- [ ] Don't use "MVC" term.
- [ ] Upgrading from Yii 2.

## RBAC

RBAC is implemented as [framework-independent package](https://github.com/yiisoft/rbac).

- [ ] Make sure it follows best practices.
- [ ] Split drivers into packages.

## View

View is implemented as [framework-independent package](https://github.com/yiisoft/view).

- [ ] Finish refactoring.
- [ ] Port widgets.
- [ ] Rethink and implement active form widgets.
- [ ] Implement caching widgets.

## Data abstractions and Grid

- [ ] Finish [data abstractions](https://github.com/yiisoft/data).
- [ ] Port sort, make it use data abstractions. Should be part of [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [ ] Port paging, make it use data abstractions. Should be part of [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [ ] Port grid, make it use data abstractions. Should be part of [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [ ] Port list, make it use data abstractions. Should be part of [yii-dataview](https://github.com/yiisoft/yii-dataview).

## Debug toolbar

- [ ] Port debug toolbar.

## Gii

- [ ] Port Gii.

## Infrastructure

- [ ] Cover composer config plugin with tests.

## Others

- [x] [Decide on namespaces](https://forum.yiiframework.com/t/lowercase-or-camelcase-namespaces/124983/52).
- [x] [Clean up error handler](https://github.com/yiisoft/yii2/issues/14348). Make sure error handler catches fatals and is using response.
- [x] Make validators independent from models to allow reusing them in handlers.
- [x] [Split IdentityInterface](https://github.com/yiisoft/yii2/issues/13825).
