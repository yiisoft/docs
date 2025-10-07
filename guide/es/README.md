# La Guía Definitiva de Yii 3.0

Esta guía se publica bajo los [Términos de documentación de
Yii](https://www.yiiframework.com/license#docs)).

Introducción
------------

* [Acerca de Yii](intro/what-is-yii.md)
* [Actualizar desde la Version 2.0](intro/upgrade-from-v2.md)


Primeros Pasos
---------------

* [Qué Necesitas Saber](start/prerequisites.md)
* [Creating a project](start/creating-project.md) +
* [Ejecutando Aplicaciones](start/workflow.md)
* [Hola Mundo](start/hello.md)
* [Trabajar con Formularios](start/forms.md)
* [Trabajar con Bases de Datos](start/databases.md)
* [Generación de Código con Gii](start/gii.md)
* [Adentrarse en Yii](start/looking-ahead.md)


Estructura De Una Aplicación
---------------------

* [Información General de Estructura de Una
  Aplicación](structure/overview.md)
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
* [Immutability](concept/immutability.md) +

Gestión de las Peticiones
-----------------

* [Enrutamiento y Creación de las URL](runtime/routing.md)
* [Peticiones (Requests)](runtime/request.md)
* [Respuestas (Responses)](runtime/response.md)
* [Sesiones (Sessions)](runtime/sessions.md)
* [Cookies](runtime/cookies.md)
* [Manejo de Errores](runtime/handling-errors.md)
* [Registros (logs)](runtime/logging.md)

Vistas
-----

* [Vistas](views/view.md)
* [Motores de Plantillas](views/template-engines.md)
* [View injections](views/view-injections.md) +
* [Scripts, styles and metatags](views/script-style-meta.md)
* [Assets](views/asset.md)
* [Widgets](views/widget.md)

Trabajar con Bases de Datos
----------------------

* [Objeto de Acceso a Datos](db-dao.md): Conexión a una base de datos,
  consultas básicas, transacciones y manipulación de esquemas
* [Constructor de Consultas](db-query-builder.md): Consulta de la base de
  datos utilizando una capa simple de abstracción
* [Active Record](db-active-record.md): ORM Active Record, recuperación y
  manipulación de registros y definición de relaciones
* [Migraciones](db-migrations.md)

Obtener Datos de los Usuarios
-----------------------

* [Crear Formularios](input/forms.md)
* [Validar
  Datos](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md)
* [Carga de Archivos](input/file-upload.md)
* [Obtener Datos de Formularios Tabulados (Tabular
  Input)](input/tabular-input.md)


Visualizar Datos
---------------

* [Formato de Datos](output/formatting.md)
* [Paginación](output/pagination.md)
* [Ordenamiento](output/sorting.md)
* [Proveedores de Datos](output/data-providers.md)
* [Widgets de Datos](output/data-widgets.md)

Seguridad
--------

* [Información General de Seguridad](security/overview.md)
* [Autenticación](security/authentication.md)
* [Autorización](security/authorization.md)
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


REST APIs -
-----------

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

* Depurador y Barra de Herramientas de Depuración
* Generación de Código con Gii
* Generación de Documentación de API


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
* [Using Yii with Swoole](tutorial/using-yii-with-swoole.md) +

Widgets
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap
  widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


Clases Auxiliares
-------

* [Arrays](https://github.com/yiisoft/arrays/)
* [Files](https://github.com/yiisoft/files/)
* [Html](https://github.com/yiisoft/html/)
* [Json](https://github.com/yiisoft/json)
* [Network utilities](https://github.com/yiisoft/network-utilities/)
* [VarDumper](https://github.com/yiisoft/var-dumper)
* [Strings](https://github.com/yiisoft/strings)

Extras +
------

* [Glossary](glossary.md)
