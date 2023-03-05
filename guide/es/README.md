# La Guía Definitiva de Yii 3.0

Esta guía se publica bajo los [Términos de documentación de Yii](http://www.yiiframework.com/doc/terms/).

Introducción
------------

* [Acerca de Yii](intro/what-is-yii.md)
* [Actualizar desde la Version 2.0](intro/upgrade-from-v2.md)


Primeros Pasos
---------------

* [Qué Necesitas Saber](start/prerequisites.md)
* [Instalación de Yii](start/installation.md)
* [Ejecutando Aplicaciones](start/workflow.md)
* [Hola Mundo](start/hello.md)
* [Trabajar con Formularios](start/forms.md)
* [Trabajar con Bases de Datos](start/databases.md)
* [Generación de Código con Gii](start/gii.md)
* [Adentrarse en Yii](start/looking-ahead.md)


Estructura De Una Aplicación
---------------------

* [Información General de Estructura de Una Aplicación](structure/overview.md)
* [Scripts de Entrada](structure/entry-script.md)
* [Applicación](structure/application.md)
* [Componentes de Servicios](structure/service.md)
* [Acciones](structure/action.md)
* [Dominio](structure/domain.md)
* [Lógica de Intercambio (middleware)](structure/middleware.md)
* [Paquetes](structure/package.md)

Conceptos Clave
------------

* [Autocarga de Clases (Autoloading)](concept/autoloading.md)
* [Contenedor de Inyección de Dependencia](concept/di-container.md)
* [Configuración](concept/configuration.md)
* [Alias](concept/aliases.md)
* [Eventos](concept/events.md)

Gestión de las Peticiones
-----------------

* [Información General de Gestión de las Peticiones](runtime/overview.md)
* [Bootstrapping](runtime/bootstrapping.md)
* [Enrutamiento y Creación de las URL](runtime/routing.md)
* [Peticiones (Requests)](runtime/request.md)
* [Respuestas (Responses)](runtime/response.md)
* [Sesiones (Sessions)](runtime/sessions.md)
* [Cookies](runtime/cookies.md)
* [Mensajes Flash](runtime/flash-messages.md)
* [Manejo de Errores](runtime/handling-errors.md)
* [Registros (logs)](runtime/logging.md)

Vistas
-----

* [Vistas](views/view.md)
* [Widgets](views/widget.md)
* [Assets](views/asset.md)
* [Trabajando con Scripts de Cliente](views/client-scripts.md)
* [Temas](views/theming.md)
* [Motores de Plantillas](views/template-engines.md)


Trabajar con Bases de Datos
----------------------

* [Objeto de Acceso a Datos](db-dao.md): Conexión a una base de datos, consultas básicas, transacciones y manipulación de esquemas
* [Constructor de Consultas](db-query-builder.md): Consulta de la base de datos utilizando una capa simple de abstracción
* [Active Record](db-active-record.md): ORM Active Record, recuperación y manipulación de registros y definición de relaciones
* [Migraciones](db-migrations.md): Control de versiones de bases de datos en el entorno de desarrollo en equipo

Obtener Datos de los Usuarios
-----------------------

* [Crear Formularios](input/forms.md)
* [Validar Datos](input/validation.md)
* [Carga de Archivos](input/file-upload.md)
* [Obtener Datos de Formularios Tabulados (Tabular Input)](input/tabular-input.md)


Visualizar Datos
---------------

* [Formato de Datos](output/formatting.md)
* [Paginación](output/pagination.md)
* [Ordenamiento](output/sorting.md)
* [Proveedores de Datos](output/data-providers.md)
* [Widgets de Datos](output/data-widgets.md)

Seguridad-
--------

* [Información General de Seguridad](security/overview.md)
* [Autenticación](security/authentication.md)
* [Autorización](security/authorization.md)-
* [Trabajar con Contraseñas](security/passwords.md)
* [Criptografía](security/cryptography.md)
* [Buenas Prácticas](security/best-practices.md)


Caché
-------

* [Información General de Caché](caching/overview.md)
* [Caché de Datos](caching/data.md)
* [Caché de Fragmentos](caching/fragment.md)
* [Caché de Páginas](caching/page.md)
* [Caché HTTP](caching/http.md)


Servicios Web RESTful
--------------------

* [Inicio Rápido](rest/quick-start.md)
* [Recursos](rest/resources.md)
* [Controladores](rest/controllers.md)
* [Enrutamiento](rest/routing.md)
* [Autentificación](rest/authentication.md)
* [Límite de Solicitudes por Cliente (Rate Limiting)](rest/rate-limiting.md)
* [Gestión de Versiones](rest/versioning.md)
* [Manejo de Errores](rest/error-handling.md)

Herramientas de Desarrollo
-----------------

* [Depurador y Barra de Herramientas de Depuración](https://www.yiiframework.com/extension/yiisoft/yii2-debug/doc/guide)
* [Generación de Código con Gii](https://www.yiiframework.com/extension/yiisoft/yii2-gii/doc/guide)
* [Generación de Documentación de API](https://www.yiiframework.com/extension/yiisoft/yii2-apidoc)


Pruebas (Testing)
-------

* [Información General de Pruebas](testing/overview.md)
* [Configuración del Entorno de Pruebas](testing/environment-setup.md)
* [Pruebas Unitarias](testing/unit.md)
* [Pruebas Funcionales](testing/functional.md)
* [Pruebas de Aceptación](testing/acceptance.md)
* [Datos de Prueba (Fixtures)](testing/fixtures.md)


Temas Especiales
--------------

* [Creación de una Aplicación Desde Cero](tutorial/start-from-scratch.md)
* [Comandos de Consola](tutorial/console-applications.md)
* [Docker](tutorial/docker.md)
* [Internacionalización](tutorial/i18n.md)
* [Envío de Correos Electrónicos](tutorial/mailing.md)
* [Ajustes de Rendimiento](tutorial/performance-tuning.md)
* [Utilizar Yii con Bucle de Eventos](tutorial/using-with-event-loop.md)
* [Utilizar Yii con RoadRunner](tutorial/using-yii-with-roadrunner.md)

Widgets
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap Widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


Clases Auxiliares
-------

* [Información General de Clases Auxiliares](helper-overview.md)
* [ArrayHelper](helper/array.md)
* [Html](helper-html.md)
* [Url](helper-url.md)
