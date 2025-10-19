# Using Yii with event loop

A normal PHP web request execution cycle consists of setting up an environment, getting a request, processing it to form a response
and sending the result. After the response is sent, execution is terminated and its context is lost. So, for the further 
 request, the whole sequence is repeated. Such an approach has a big advantage in ease of development since a developer doesn't
have to take much care about memory leaks or properly clean up context. On the other side, initializing everything for
every request takes time and overall consumes up to 50% of processing resources.

There is an alternative way of running an application. Event loop. The idea is to initialize everything possible at once
and then process a number of requests using it. Such an approach is usually called event loop.

There are multiple tools that could be used to achieve it. Notably, [FrankenPHP](https://frankenphp.dev/), 
[RoadRunner](https://roadrunner.dev/) and [Swoole](https://www.swoole.co.uk/).

## Event loop implications

Event loop worker basically looks like the following:

```php
initializeContext();
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
}
```

Usually, there are multiple workers processing requests at the same time as with traditional php-fpm.

That means that there's more to consider when developing applications.

### Processing is blocking

Worker process requests one by one that's current processing is blocking processing next request. That means that
long-running processes, same as in general PHP applications, should be put into a background via using a queue.

### Services and state

Since the context in the event loop is shared between all request-responses processed by a single worker, all changes
in the state of a service made by the previous request may affect the current request. Moreover, it can be a security problem
if data from one user is available to another user.

There are two ways of dealing with it. First, you can avoid having state by making services stateless. PHP's `readonly`
keyword may be handy for it. Second, you can reset the services' state at the end of the request processing. 
In this case, a state resetter will help you:

```php
initializeContext();
$resetter = $container->get(\Yiisoft\Di\StateResetter::class);
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
   $resetter->reset(); // We should reset the state of such services on every request.
}
```

## Integrations

- [RoadRunner](using-yii-with-roadrunner.md)
- [Swoole](using-yii-with-swoole.md)
