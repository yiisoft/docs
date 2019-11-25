# Application

The web application in Yii 3 accepts an instance of middleware dispatcher, emitter and error handler. When being constructed,
it registers error handler so it can handle errors occuring. On each request:

1. It is calling dispatcher with a request object to execute [middleware stack](middleware.md) and get response.
2. Using emitter and response object it actually forms HTTP response that is sent to client browser.  
3. After response is done, it resets dispatcher state so another request could be handled. In usual PHP applications it's
   not the case since context is destroyed and re-created but in [environments such as RoadRunner](../tutorial/using-with-event-loop.md)
   such state reset is necessary. 
