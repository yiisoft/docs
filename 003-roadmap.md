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

- [ ] Framework packages should depend on interface only.
- [ ] Split drivers into packages.

### PSR-4 Autoloading

- [x] Autoloading is fine already.
- [ ] Docuement on how it works.

### PSR-7 HTTP message

- [ ] Remove our own implementation. At least for now.
- [ ] Framework packages should depend on interfaces only.
- [ ] Implement decorators for Request, ServerRequest, Response adding handy methods.

### PSR-11 Container

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/di).

- [ ] Framework packages should not use container directly including interface. One should be able to instantiate everything manually.
- [ ] Finish refactoring.
- [ ] Remove all framework-specific implementations from the package. Move to framework.

### PSR-12 Code style

- [ ] Make sure code follows it.
- [ ] Automate fixing style before release.

### PSR-13 Hypermedia links

### PSR-14 Event dispatcher

- [x] [Implement as a separate library](https://github.com/yiisoft/event-dispatcher).
- [ ] Use in other packages.
- [ ] Polish.

### PSR-15 HTTP handlers

- [ ] Rewrite HTTP flow to PSR-7 request-reponse + formatting response via emitter.
- [ ] Provide SAPI emitter out of the box.
- [ ] Make it possible to use alternative emitters such as RoadRunner.
- [ ] Support middleware.
- [ ] Implement filters as middleware:
  - [ ] Rate limiting
  - [ ] Basic auth
  - [ ] Digest auth
- [ ] Re-implement router w/ middleware support for route groups.
- [ ] Filters should be middlewares.

### PSR-16 Simple cache

Implemented as a [separate package that is not dependent on a framework](https://github.com/yiisoft/cache).

- [ ] Framework packages should depend on interfaces only.
- [ ] Split drivers into packages.

### PSR-17 HTTP factories

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

- [ ] DSL for configuration.
- [ ] Ability to route to any callable.
- [ ] Named routes.
- [ ] Route groups w/ middleware support.

## Best practices and SOLID compliance of all classes/packages

- [ ] Make sure interfaces follow "interface segregation" principle.
- [ ] Do not use public properties.
- [ ] Do not use `init()`.
- [ ] Do not inherit from `BaseObject` or `Component`. Remove these.
- [ ] No globals.
- [ ] No static calls except helpers that are final.
- [ ] Prefer throwing exceptions to fixing input.

## Development toolkit

- [ ] Release command line tool
- [ ] Development command line tool (symlinks packages into usable application)

## Console

- [ ] Separate web and console application
- [ ] Possibly eliminate base application
- [ ] Create interface for console
- [ ] Implementation may be one of the popular ones

## Documentation

- [ ] Follow best practices.
- [ ] Don't use "MVC" term.
- [ ] [Upgrading from Yii 2](https://github.com/yiisoft/yii-core/blob/master/UPGRADE.md).

## RBAC

RBAC is implemented as [framework-independent package](https://github.com/yiisoft/rbac).

- [ ] Make sure it follows best practices.
- [ ] Split drivers into packages.

## View

View is implemented as [framework-independent package](https://github.com/yiisoft/view).

## Others

- [ ] [Decide on namespaces](https://forum.yiiframework.com/t/lowercase-or-camelcase-namespaces/124983/52).
- [ ] [Clean up error handler](https://github.com/yiisoft/yii2/issues/14348). Make sure error handler catches fatals and is using response.
- [ ] Make validators independent from models to allow reusing them in handlers.
- [ ] [Split IdentityInterface](https://github.com/yiisoft/yii2/issues/13825).
