# Application

The primary purpose of the web application in Yii 3 is to process requests in order to get responses.

Typically, application runtime consists of:

1. Startup. There it registers error handler, so it can handle errors occurring and firing `ApplicationStartup` event.
2. Handle requests by passing request object to middleware dispatcher to execute [middleware stack](middleware.md) and
   get response object. In usual PHP applications it is done once. In [environments such as RoadRunner](../tutorial/using-with-event-loop.md)
   it could be done multiple times with the same application instance. Outside of the application response object is converted into actual HTTP response.
3. Shutdown. `ApplicationShutdown` event is called.  
