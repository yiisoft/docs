# The Definitive Guide to Yii 3.0

This guide is released under the [Terms of Yii Documentation](http://www.yiiframework.com/doc/terms/).

Introduction +
------------

* [About Yii](intro/what-is-yii.md) +
* [Upgrading from Version 2.0](intro/upgrade-from-v2.md) +


Getting Started -
---------------

* [What do you need to know](start/prerequisites.md) +
* [Installing Yii](start/installation.md) +
* [Running Applications](start/workflow.md) +
* [Saying Hello](start/hello.md) +
* [Working with Forms](start/forms.md) +
* [Working with Databases](start/databases.md) !
* [Generating Code with Gii](start/gii.md) -
* [Looking Ahead](start/looking-ahead.md) +


Application Structure +
---------------------

* [Application Structure Overview](structure/overview.md) +
* [Entry Scripts](structure/entry-script.md) +
* [Application](structure/application.md) +
* [Service components](structure/service.md) +
* [Actions](structure/action.md) +
* [Domain](structure/domain.md) +
* [Middleware](structure/middleware.md) +
* [Packages](structure/package.md) +

Key Concepts -
------------

* [Class autoloading](concept/autoloading.md) +
* [Dependency Injection Container](concept/di-container.md) +
* [Configuration](concept/configuration.md) +
* [Aliases](concept/aliases.md) +
* [Events](concept/events.md) +

Handling Requests -
-----------------

* [Request Handling Overview](runtime/overview.md) -
* [Bootstrapping](runtime/bootstrapping.md) -
* [Routing and URL generation](runtime/routing.md) +
* [Request](runtime/request.md) +
* [Response](runtime/response.md) +
* [Sessions](runtime/sessions.md) +
* [Cookies](runtime/cookies.md) +
* [Flash messages](runtime/flash-messages.md) -
* [Handling Errors](runtime/handling-errors.md) !
* [Logging](runtime/logging.md) +

Views -
-----

* [Views](views/view.md) -
* [Widgets](views/widget.md) -
* [Assets](views/asset.md) -
* [Working with Client Scripts](views/client-scripts.md) -
* [Theming](views/theming.md) -
* [Template Engines](views/template-engines.md) -


Working with Databases -
----------------------

* [Database Access Objects](db-dao.md): Connecting to a database, basic queries, transactions, and schema manipulation
* [Query Builder](db-query-builder.md): Querying the database using a simple abstraction layer
* [Active Record](db-active-record.md): The Active Record ORM, retrieving and manipulating records, and defining relations
* [Migrations](db-migrations.md): Apply version control to your databases in a team development environment

Getting Data from Users -
-----------------------

* [Creating Forms](input/forms.md) -
* [Validating Input](input/validation.md) -
* [Uploading Files](input/file-upload.md) -
* [Collecting Tabular Input](input/tabular-input.md) -


Displaying Data -
---------------

* [Data Formatting](output/formatting.md) -
* [Pagination](output/pagination.md) -
* [Sorting](output/sorting.md) -
* [Data Providers](output/data-providers.md) -
* [Data Widgets](output/data-widgets.md) -

Security +-
--------

* [Security Overview](security/overview.md) +
* [Authentication](security/authentication.md) +
* [Authorization](security/authorization.md) +-
* [Working with Passwords](security/passwords.md) +
* [Cryptography](security/cryptography.md) +
* [Best Practices](security/best-practices.md) +


Caching -
-------

* [Caching Overview](caching/overview.md) -
* [Data Caching](caching/data.md) -
* [Fragment Caching](caching/fragment.md) -
* [Page Caching](caching/page.md) -
* [HTTP Caching](caching/http.md) -


RESTful Web Services -
--------------------

* [Quick Start](rest/quick-start.md)
* [Resources](rest/resources.md)
* [Controllers](rest/controllers.md)
* [Routing](rest/routing.md)
* [Authentication](rest/authentication.md)
* [Rate Limiting](rest/rate-limiting.md)
* [Versioning](rest/versioning.md)
* [Error Handling](rest/error-handling.md)

Development Tools -
-----------------

* Debug Toolbar and Debugger
* Generating Code using Gii
* Generating API Documentation


Testing -
-------

* [Testing Overview](testing/overview.md)
* [Testing environment setup](testing/environment-setup.md)
* [Unit Tests](testing/unit.md)
* [Functional Tests](testing/functional.md)
* [Acceptance Tests](testing/acceptance.md)
* [Fixtures](testing/fixtures.md)


Special Topics -
--------------

* [Building Application from Scratch](tutorial/start-from-scratch.md) -
* [Console Applications](tutorial/console-applications.md) +
* [Docker](tutorial/docker.md) -
* [Internationalization](tutorial/i18n.md) -
* [Mailing](tutorial/mailing.md) -
* [Performance Tuning](tutorial/performance-tuning.md) +
* [Using Yii with event loop](tutorial/using-with-event-loop.md) +
* [Using Yii with RoadRunner](tutorial/using-yii-with-roadrunner.md) +
* [Using Yii with Swoole](using-yii-with-swoole.md) +

Widgets -
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap Widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


Helpers -
-------

* [Helpers Overview](helper-overview.md)
* [ArrayHelper](helper/array.md)
* [Html](helper-html.md)
* [Url](helper-url.md)

Extras
------

* [Glossary](glossary.md)
