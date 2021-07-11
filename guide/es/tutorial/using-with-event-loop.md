# Using Yii with event loop

Normal PHP web request execution cycle consist of setting up environment, getting response, processing it to form response
and sending response. After response is sent, execution is terminated and its context is lost. So for the subsequent 
request the whole sequence is repeated. Such approach has a big advantage in ease of development since developer does not
have to take much care about memory leaks or properly cleaning up context. On the other side, initializing everything for
every request takes time and overall consumes up to 50% of processing resources.

There is an alternative way of running an application. Event loop. The idea is to initilize everything possible once
and then process a number of requests using it. Such approach is usually called event loop.

There are multiple tools that could be used to achieve it. Notably, [RoadRunner](https://roadrunner.dev/) and
[Swoole](https://www.swoole.co.uk/).

## Event loop implications

Event loop worker basically looks the following:

```php
initializeContext();
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
}
```

Usually there are muliple workers processing requests at the same time same as with traditional php-fpm.

That means that there's more to consider when developing applications.

### Processing is blocking

Worker process requests one by one i.e., current processing is blocking processing next request. That means that
long running processes, same as in general PHP applications, should be put into background via using a queue.

### Services and state

Since context in event loop is shared between all request-responses processed by a single worker, all changes
in the state of a service made by previous request may affect current request. Moreover, it can be a security problem
if data from one user would be available to another user.

There are two ways dealing with it. First, you can avoid having state by making services stateless. Second, you can
clean up services at the end of the request processing.

## Integrations

- [RoadRunner](using-yii-with-roadrunner.md)
- [Swoole](using-yii-with-swoole.md)
