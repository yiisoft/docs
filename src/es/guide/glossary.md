# A

## acción (action)

Una acción es un callable, una clase o un método de clase que gestiona una
ruta coincidente y devuelve una respuesta. Más información en
["Acciones"](structure/action.md).

## alias

Un alias es una cadena que Yii usa para referirse a una clase o a un
directorio, como `@app/vendor`. Más información en
["Alias"](concept/aliases.md).

## aplicación (application)

La aplicación es un objeto que se inicia, gestiona una solicitud a través de
los middlewares configurados y finaliza. Más información en
["Aplicación"](structure/application.md).

## asset

Un asset es un archivo de recursos. Normalmente contiene código JavaScript o
CSS, pero puede ser cualquier contenido estático al que se accede por
HTTP. Más información en ["Assets"](views/asset.md).

## asset bundle (paquete de assets)

Un paquete de assets es una clase PHP que declara un grupo de archivos CSS,
JavaScript, imágenes o fuentes que deben publicarse y registrarse
juntos. Más información en ["Paquetes de
assets"](views/asset.md#asset-bundles).

## autenticación (authentication)

La autenticación es el proceso de determinar la identidad del usuario
actual. Más información en ["Autenticación"](security/authentication.md).

## autorización (authorization)

La autorización es el proceso de comprobar si un usuario autenticado o
anónimo tiene permiso para realizar una acción. Más información en
["Autorización"](security/authorization.md).

## autocarga (autoloading)

La autocarga es el proceso de cargar las clases PHP automáticamente la
primera vez que se usan. Más información en ["Autocarga de
clases"](concept/autoloading.md).

# B

## bootstrap (arranque)

El arranque (bootstrap) es el código de inicio de la aplicación que prepara
los servicios, la configuración y el estado de ejecución antes de gestionar
las solicitudes. Más información en
["Configuración"](concept/configuration.md).

# C

## configuración (configuration)

La configuración puede referirse al proceso de establecer las propiedades de
un objeto o a un archivo de configuración que guarda los ajustes de un
objeto o de una clase de objetos. Más información en
["Configuración"](concept/configuration.md).

## contenedor (container)

El contenedor es un objeto que crea servicios, resuelve sus dependencias y
devuelve instancias configuradas. Más información en ["Contenedor
DI"](concept/di-container.md#contenedor-di).

## controlador (controller)

Un controlador es una clase que agrupa los métodos de acción de rutas
relacionadas. Más información en ["Acciones"](structure/action.md).

## cookie

Una cookie es un pequeño fragmento de datos que el navegador guarda y envía
en las solicitudes posteriores al mismo sitio. Más información en
["Cookies"](runtime/cookies.md).

## CSRF

CSRF significa falsificación de solicitudes entre sitios (cross-site request
forgery), un ataque en el que otro sitio intenta que el navegador de un
usuario envíe una solicitud no deseada a tu aplicación. Más información en
["Evitar CSRF"](security/best-practices.md#avoiding-csrf).

# D

## DI

La inyección de dependencias (DI, dependency injection) es una técnica de
programación en la que un objeto recibe sus dependencias desde fuera. Más
información en ["Inyección de dependencias y
contenedor"](concept/di-container.md).

# E

## entry script (script de entrada)

El script de entrada es el primer script PHP que se ejecuta en una
aplicación web o de consola. Más información en ["Scripts de
entrada"](structure/entry-script.md).

## evento (event)

Un evento es un objeto que representa algo que ha ocurrido y que se puede
pasar a los listeners. Más información en ["Eventos"](concept/events.md).

# H

## handler (manejador)

Un manejador es código callable que el enrutamiento o un middleware
selecciona para procesar una solicitud y producir una respuesta. Más
información en ["Enrutamiento y generación de URL"](runtime/routing.md).

# I

## instalación (installation)

La instalación es el proceso de preparar algo para que funcione, ya sea
siguiendo un archivo readme o ejecutando un script preparado para ello. En
el caso de Yii, consiste en establecer los permisos y cumplir los requisitos
de software.

# L

## layout

Un layout es una plantilla de vista que envuelve el contenido propio de cada
página con la estructura común de la página. Más información en ["Trabajar
con layouts"](views/view.md#working-with-layouts).

# M

## migración (migration)

Una migración es una clase PHP versionada que aplica o revierte un cambio en
el esquema o en los datos de la base de datos. Más información en
["Migraciones"](databases/db-migrations.md).

## middleware

Un middleware es un procesador de la pila de procesamiento de
solicitudes. Dada una solicitud, puede producir una respuesta o realizar
alguna acción y pasar el procesamiento al siguiente middleware. Más
información en ["Middleware"](structure/middleware.md).

## modelo (model)

Un modelo es un objeto que representa datos de la aplicación y que suele
contener reglas de validación o de negocio para esos datos. Más información
en ["Trabajar con formularios"](start/forms.md).

## módulo (module)

Un módulo es un espacio de nombres que agrupa código según un caso de
uso. Normalmente se usa dentro de la aplicación principal y puede contener
cualquier código fuente, definir manejadores de URL adicionales o comandos
de consola.

# N

## namespace (espacio de nombres)

Un espacio de nombres es una [funcionalidad del lenguaje
PHP](https://www.php.net/manual/en/language.namespaces.php) que permite
agrupar varias clases bajo un nombre determinado.

# P

## paquete (package)

Un paquete suele referirse a un [paquete de
Composer](https://getcomposer.org/doc/). Es código listo para reutilizarse y
redistribuirse que se puede instalar automáticamente con un gestor de
paquetes.

## parámetro (parameter)

Un parámetro es un valor de configuración que pueden usar los archivos de
configuración de la aplicación o de los paquetes. Más información en
["Parámetros"](concept/configuration.md#parametros).

# Q

## queue (cola)

Una cola es una estructura de datos que procesa los elementos en orden de
llegada (el primero en entrar es el primero en salir). Yii tiene el paquete
[yiisoft/queue](https://github.com/yiisoft/queue).

# R

## request (solicitud)

La solicitud es un objeto PSR-7 que representa un mensaje HTTP entrante, con
su método, URI, cabeceras, cuerpo, archivos subidos y atributos. Más
información en ["Solicitud"](runtime/request.md).

## response (respuesta)

La respuesta es un objeto PSR-7 que representa un mensaje HTTP saliente, con
su código de estado, cabeceras y cuerpo. Más información en
["Respuesta"](runtime/response.md).

## ruta (route)

Una ruta describe qué método de solicitud y qué patrón de URL debe gestionar
cada acción o middleware. Más información en ["Enrutamiento y generación de
URL"](runtime/routing.md).

## regla (rule)

Una regla suele referirse a una regla de validación del paquete
[yiisoft/validator](https://github.com/yiisoft/validator). Contiene un
conjunto de parámetros para comprobar si un conjunto de datos es válido. El
procesamiento real lo hace el "manejador de la regla" (rule handler).

# S

## servicio (service)

Un servicio es un objeto con un propósito concreto que realiza trabajo de la
aplicación o aporta comportamiento de infraestructura, y que normalmente se
guarda en el contenedor DI. Más información en ["Componentes de
servicio"](../cookbook/organizing-code/service.md).

## service provider (proveedor de servicios)

Un proveedor de servicios es una clase que registra definiciones de
servicios relacionados en el contenedor DI. Más información en ["Proveedores
de servicios"](concept/configuration.md#proveedores-de-servicios).

## sesión (session)

La sesión es un almacenamiento en el servidor asociado a un navegador a lo
largo de varias solicitudes. Más información en
["Sesiones"](runtime/sessions.md).

# T

## template (plantilla)

Una plantilla es un archivo que usa una vista o un motor de plantillas para
generar la salida de presentación, como HTML. Más información en
["Vistas"](views/view.md).

# V

## vendor

Un vendor es una organización o un desarrollador individual que proporciona
código en forma de paquetes. También puede referirse al [directorio `vendor`
de Composer](https://getcomposer.org/doc/).

## vista (view)

La vista se encarga de presentar los datos a los usuarios finales,
normalmente ejecutando una plantilla con los datos proporcionados. Más
información en ["Vistas"](views/view.md).

# W

## widget

Un widget es un componente de vista reutilizable que renderiza una parte de
la interfaz de usuario. Más información en ["Widgets"](views/widget.md).
