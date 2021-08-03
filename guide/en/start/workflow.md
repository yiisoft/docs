# Running Applications

After installing Yii, you have a working Yii application that can be launched via `./yii serve` and then
accessed via the URL `http://localhost:8080/`. This section will introduce the application's built-in functionality,
how the code is organized, and how the application handles requests in general.

> Info: For simplicity, throughout this "Getting Started" tutorial we use "serve" command. It should not be used
> to serve the project in production. When setting up a real server, use `app/public` as the document root.
  
Note that unlike the framework itself, after you install a project template, it is all yours. You're free to add or delete
code and overall modify it as you need.


## Functionality <span id="functionality"></span>

The application installed contains only the homepage, displayed when you access the URL `http://localhost:8080/`.
It shares a common layout that could be reused on further pages.

<!--
You should also see a toolbar at the bottom of the browser window.
This is a useful [debugger tool](https://github.com/yiisoft/yii-debug) provided by Yii to record and display a lot of
debugging information, such as log messages, response statuses, the database queries run, and so on.
-->

Additionally, to the web application, there is a console script accessible via `./yii`.
This script can be used to run background and maintenance tasks for the application, which are described
in the [Console Application Section](../tutorial/console.md).


## Application Structure <span id="application-structure"></span>

The most important directories and files in your application are (assuming the application's root directory is `app`):

```
config/                   Configuration files.
    common/               Configs applied to both console and web.
    console/              Configs applied to console.
    packages/             Packages configuration.
    web/                  Configs applied to web.
    events.php            Event handlers for both console and web.
    events-console.php    Event handlers for console.
    events-web.php        Event handlers for web.
    params.php            Parameters that are passed to configs.
    providers.php         Service providers for both console and web.
    providers-console.php Service providers for console.
    providers-web.php     Service providers for web.
    routes.php            Defines how URLs are mapped to their handlers.
docs/                     Documentation.
public/                   Files publically accessible from the Internet.
    assets/               Published assets.
    index.php             Entry script.
    index-test.php        Entry script for running tests with Codeception.
resources/                Application resources.
    assets/               Asset bundle resources.
    message/              Message translations.
    views/                View templates.
      layout/             View layouts.
runtime/                  Files generated during runtime.
src/                      Application source code.
    Asset/                Asset bundle definitions.
    Command/              Console commands.
    Controller/           Web controller classes.
    Handler/              Custom handler for 404.
    ViewInjection/        Injections that bring additional variables into view templates.
tests/                    A set of Codeception tests for the application.
vendor/                   Installed Composer packages.
ApplicationRunner.php     Contains the process of running the application.
Installer.php             Additional actions done on Composer commands.
```

In general, the files in the application can be divided into two types: those under `app/public` and those
under other directories. The former can be directly accessed via HTTP (i.e., in a browser), while the latter cannot
and should not be.

Each application has an entry script `public/index.php` which is the only Web accessible PHP script in the application.
The entry script is using application runner to create an instance an incoming request with the help of one of PSR-7 packages
and passes it to [application](../structure/application.md) instance. An application contains a set of
middleware that are executed sequentially processing the request. The result is passed further to emitter
that takes care of sending a response to the browser.

Depending on the middleware used, the application may behave differently. By default, there is a router
that, based on URL requested and configuration, chooses a handler that is executed to produce a response.

You can learn more about the application template from
the [yiisoft/app package documentation](https://github.com/yiisoft/app/blob/master/README.md).

## Request Lifecycle <span id="request-lifecycle"></span>

The following diagram shows how an application handles a request.

![Request Lifecycle](img/request-lifecycle.svg)

1. A user makes a request to the [entry script](../structure/entry-script.md) `public/index.php`.
2. The entry script with the help of application runner loads
   the container [configuration](../concept/configuration.md) and creates
   an [application](../structure/application.md) instance and services necessary to handle the request.
3. Request factory creates a request object based on raw request that came from a user.
4. Application passes request object through middleware array configured. One of these is typically a router.
5. Router finds out what handler to execute based on request and configuration.
6. The handler may load some data, possibly from a database.
7. The handler forms a response by using data. Either directly or with the help of the view package.
8. Emitter receives the response and takes care of sending the response to the user's browser.
