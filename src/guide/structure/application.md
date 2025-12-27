# Application

The primary purpose of the web application and its runner in Yii3 is to process requests to get responses.

Typically, the runtime consists of:

1. Startup. Get config, create an instance of container and do additional environment initialization
   such as registering error handler, so it can handle errors occurring. Fire `ApplicationStartup` event.
2. Handle requests via passing request objects to middleware dispatcher to execute [middleware stack](middleware.md) and
   get a response object. In usual PHP applications, it's done once. In [environments such as RoadRunner](../tutorial/using-with-event-loop.md),
   it could be done multiple times with the same application instance. Response object is converted into an actual HTTP response by using emitter.
   Fire `AfterEmit` event.
3. Shutdown. Fire `ApplicationShutdown` event.  
