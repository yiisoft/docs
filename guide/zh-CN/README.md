# Yii 3.0 权威指南

本教程的发布遵循[Yii 文档使用许可](http://www.yiiframework.com/doc/terms/).

介绍 +
------------

* [关于 Yii](intro/what-is-yii.md) +
* [从Yii2.0版本升级](intro/upgrade-from-v2.md) +


入门 -
---------------

* [你需要知道什么](start/prerequisites.md) +
* [安装 Yii](start/installation.md) +
* [运行应用](start/workflow.md) +
* [第一次问候](start/hello.md) +
* [使用 Forms](start/forms.md) -
* [玩转 Databases](start/databases.md) !
* [用 Gii 生成代码](start/gii.md) -
* [更上一层楼](start/looking-ahead.md) -


应用结构 +
---------------------

* [应用结构概述](structure/overview.md) +
* [入口脚本](structure/entry-script.md) +
* [应用](structure/application.md) +
* [应用组件](structure/service.md) +
* [动作](structure/action.md) +
* [域](structure/domain.md) +
* [中间件](structure/middleware.md) +
* [程序包](structure/package.md) +

关键概念 -
------------

* [Class autoloading](concept/autoloading.md) +
* [Dependency Injection Container](concept/di-container.md) +
* [Configuration](concept/configuration.md) !
* [Aliases](concept/aliases.md) +
* [Events](concept/events.md) +

请求处理 -
-----------------

* [Request Handling Overview](runtime/overview.md) -
* [Bootstrapping](runtime/bootstrapping.md) -
* [Routing and URL Creation](runtime/routing.md) -
* [Request](runtime/request.md) +
* [Response](runtime/response.md) +
* [Sessions](runtime/sessions.md) +
* [Cookies](runtime/cookies.md) +
* [Flash messages](runtime/flash-messages.md) -
* [Handling Errors](runtime/handling-errors.md) !
* [Logging](runtime/logging.md) +

视图 -
-----

* [Views](views/view.md) -
* [Widgets](views/widget.md) -
* [Assets](views/asset.md) -
* [Working with Client Scripts](views/client-scripts.md) -
* [Theming](views/theming.md) -
* [Template Engines](views/template-engines.md) -


玩转 Databases -
----------------------

* [Database Access Objects](db-dao.md): Connecting to a database, basic queries, transactions, and schema manipulation
* [Query Builder](db-query-builder.md): Querying the database using a simple abstraction layer
* [Active Record](db-active-record.md): The Active Record ORM, retrieving and manipulating records, and defining relations
* [Migrations](db-migrations.md): Apply version control to your databases in a team development environment

接收用户数据 -
-----------------------

* [Creating Forms](input/forms.md) -
* [Validating Input](input/validation.md) -
* [Uploading Files](input/file-upload.md) -
* [Collecting Tabular Input](input/tabular-input.md) -


显示数据 -
---------------

* [Data Formatting](output/formatting.md) -
* [Pagination](output/pagination.md) -
* [Sorting](output/sorting.md) -
* [Data Providers](output/data-providers.md) -
* [Data Widgets](output/data-widgets.md) -

安全 +-
--------

* [Security Overview](security/overview.md) +
* [Authentication](security/authentication.md) +
* [Authorization](security/authorization.md) +-
* [Working with Passwords](security/passwords.md) +
* [Cryptography](security/cryptography.md) +
* [Best Practices](security/best-practices.md) +


缓存 -
-------

* [Caching Overview](caching/overview.md) -
* [Data Caching](caching/data.md) -
* [Fragment Caching](caching/fragment.md) -
* [Page Caching](caching/page.md) -
* [HTTP Caching](caching/http.md) -


RESTful Web 服务 -
--------------------

* [Quick Start](rest/quick-start.md)
* [Resources](rest/resources.md)
* [Controllers](rest/controllers.md)
* [Routing](rest/routing.md)
* [Authentication](rest/authentication.md)
* [Rate Limiting](rest/rate-limiting.md)
* [Versioning](rest/versioning.md)
* [Error Handling](rest/error-handling.md)

开发工具 -
-----------------

* [Debug Toolbar and Debugger](https://www.yiiframework.com/extension/yiisoft/yii2-debug/doc/guide)
* [Generating Code using Gii](https://www.yiiframework.com/extension/yiisoft/yii2-gii/doc/guide)
* [Generating API Documentation](https://www.yiiframework.com/extension/yiisoft/yii2-apidoc)


测试 -
-------

* [Testing Overview](testing/overview.md)
* [Testing environment setup](testing/environment-setup.md)
* [Unit Tests](testing/unit.md)
* [Functional Tests](testing/functional.md)
* [Acceptance Tests](testing/acceptance.md)
* [Fixtures](testing/fixtures.md)


高级专题 -
--------------

* [Building Application from Scratch](tutorial/start-from-scratch.md) -
* [Console Applications](tutorial/console-applications.md) +
* [Docker](tutorial/docker.md) -
* [Internationalization](tutorial/i18n.md) -
* [Mailing](tutorial/mailing.md) -
* [Performance Tuning](tutorial/performance-tuning.md) +
* [Using Yii with event loop](tutorial/using-with-event-loop.md) +
* [Using Yii with RoadRunner](tutorial/using-yii-with-roadrunner.md) +

小部件 -
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap Widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


助手类 -
-------

* [Helpers Overview](helper-overview.md)
* [ArrayHelper](helper/array.md)
* [Html](helper-html.md)
* [Url](helper-url.md)
