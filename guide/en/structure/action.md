# Actions

In a web application what is executed is determined by request URL. Matching is made by router that is
configured with multiple routes. Each route can be attached a middleware that, given request, produces
a response. Since middleware overall could be chained and can pass actual handling to next middleware,
we call the middleware actually doing the job an action.

There are multiple way to describe an action. Simplest one is using a closure:

```php

```

It is fine for very simple handling since any more complicated one would require getting dependencies so
a good idea would be moving the handling to a class method. Callback middleware could be used for the purpose:

```php

```

For many cases it makes sense to group handling for multiple routes into a single class:


```php

```

The class itself would look like the following:

```php


```

This class is usually called "controller". Above code is quite repetitive so you can use `Controller`
middleware:

```php

```

## Autowiring

Both constructors of action-classes and action-methods are automatically getting services from
dependency injection container:

```php

```

