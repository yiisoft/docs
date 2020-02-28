# Domain

Domain or domain model is what makes the project unique. With requirements and terminology of the problem being solved
in mind (the problem context), we build an abstraction that consists of entities, their relationships, and logic that
operates these entities. To focus on the complex part of the problem, domain is, ideally, separated from
infrastructure part of the system (i.e., how to save data into database, how to form HTTP response etc.).

> Note: Such isolation is suitable for complex systems. If your project domain is basically create/read/update/delete
> for a set of records with not much complex logic it makes no sense to apply complex solution to a simple problem.
> Individual concepts of domain design below could be applied separately so make sure to check these even if your
> project isn't that complicated. 

## Bounded context

It is nearly impossible to build a model that solves multiple problems that is not too complicated by itself. Therefore,
it is a good practice to divide domain into several use-cases and have a separate model for each use-case.
Such separated models are called "bounded contexts".

## Building blocks

There are various building blocks that are typically used when describing domain models. It is not mandatory to use
all of them.

### Entity

Entity is an uniquely identifiable object such as user, product, payment etc. When comparing them, you're checking ID,
not the attribute values. If there are two objects with different attributes but the same ID, they are considered
being the same thing.

### Value object

Value object describes an object by its characteristics. For example, a price that consists of value and currency. When
comparing such objects you're checking actual values. If they match, object is considered being the same.

### Aggregate

Aggregate is a set of domain objects such as entities and value objects and additional data that could be treated as
a single unit. It usually represents a compound object from domain model such as shop order or HR person dossier.

One of the components of an aggregate is called a root. The root identifies an aggregate as a whole and should be used
to access it.

### Domain event

An aggregate, while processed, may raise events. For example, when order is confirmed, `OrderConfirmed` event would
be risen so other parts of the system may react on these.

### Data transfer object

Data transfer object or DTO is an object which only purpose is to hold data as is. It is commonly used to pass data
between different services.

### Service

Service is a class that contains a standalone operation within the context of your domain model. See "[service 
components](service.md)".

### Repository

Repository task is to abstract away how domain objects are obtained. These are usually separated in two parts: an interface
that stays in the domain layer and implementation that is situated in infrastructure layer. In such way domain doesn't
care how data is obtained and saves and may be focused around the complicated business logic instead.

Repository is usually implemented as a service.

### Instantiating building blocks

Entity, value object, aggregate and domain event are not services and should not be instantiated through DI container.
Using `new` is the way to go with these.

## References

- [BoundedContext by Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html)
- [ValueObject by Martin Fowler](https://martinfowler.com/bliki/ValueObject.html)
- [Aggregate by Marting Fowler](https://martinfowler.com/bliki/DDD_Aggregate.html)

