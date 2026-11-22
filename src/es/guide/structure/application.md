# Aplicación

El propósito principal de la aplicación web y de su runner en Yii3 es
procesar solicitudes para obtener respuestas.

Normalmente, la ejecución consta de:

1. Arranque. Obtener la configuración, crear una instancia del contenedor y
   realizar inicializaciones adicionales del entorno, como registrar el
   manejador de errores para que pueda gestionar los errores que se
   produzcan. Lanzar el evento `ApplicationStartup`.
2. Gestionar las solicitudes pasando los objetos de solicitud al despachador
   de middlewares para que ejecute la [pila de middlewares](middleware.md) y
   obtener un objeto de respuesta. En las aplicaciones PHP habituales, esto
   se hace una sola vez. En [entornos como
   RoadRunner](../tutorial/using-with-event-loop.md), puede hacerse varias
   veces con la misma instancia de la aplicación. El objeto de respuesta se
   convierte en una respuesta HTTP real mediante un emisor. Lanzar el evento
   `AfterEmit`.
3. Cierre. Lanzar el evento `ApplicationShutdown`.
