# Running applications

After installing Yii, you have a working Yii application.
This section introduces the application's built-in functionality,
how the code is organized, and how the application handles requests in general.

Note that unlike the framework itself, after you install a project template, it's all yours.
You're free to add or delete code and overall change it as you need.

## Functionality <span id="functionality"></span>

The installed application has only the homepage, which displays when you access the URL `http://localhost/`.
It shares a common layout that you can reuse on further pages.

<!--
You should also see a toolbar at the bottom of the browser window.
This is useful [debugger tool](https://github.com/yiisoft/yii-debug) provided by Yii to record and display a lot of
debugging information, such as log messages, response statuses, the database queries run, and so on.
-->

In addition to the web application, you can access a console script via `APP_ENV=dev ./yii` or, in case of Docker, `make yii`.
Use this script to run background and maintenance tasks for the application, which the
[Console Application Section](../tutorial/console-applications.md) describes.


## Application structure <span id="application-structure"></span>

The most important directories and files in your application are (assuming the application's root directory is `app`):

```
assets/                   Application assets to be published.
config/                   Configuration.
    common/               Configs applied to both console and web.
        di/               DI container configuration.
        aliasess.php      Aliases.
        application.php   Application configuration.
        bootstrap.php     Bootstrap configuration.
        params.php        Various parameters used in DI configs.
        routes.php        Application routes.
    console/              Configs applied to console.
        commands.php      Registered console commands.
        params.php        Various parameters used in DI configs.
    web/                  Configs applied to web.
       di/                DI container configuration.
       params.php         Various parameters used in DI configs.
    environments/         Environment-based configs.
        dev/              Configs applied in dev environment.
            params.php    Various parameters used in DI configs.
        prod/             Configs applied in prod environment.
            params.php    Various parameters used in DI configs.
        test/             Configs applied in test environment.
            params.php    Various parameters used in DI configs.    
    configuration.php     Defines how to read application configs.
    .merge-plan.php       Merge plan to assemble configs according to. Build using `configuration.php`.
docker/                   Docker configuration.
    dev/                  Dev environment.
        .env              Environment variables.
        compose.yml       Services for dev environment.
    prod/                 Prod environment.
        .env              Environment variables.
        compose.yml       Services for prod environment.
    test/                 Test environment.
        .env              Environment variables.
        compose.yml       Services for test environment.
    .env                  Common environment variables.
    compose.yml           Common services.
    Dockerfile            Images to use.
public/                   Files publically accessible from the Internet.
    assets/               Published assets.
    index.php             Entry script for web.
runtime/                  Files generated during runtime.
src/                      Application source code.
    Command/              Console commands.
    Controller/           Controllers.
    Handler/              Custom handler for 404.
    Layout/               Layouts.
    autoload.php          Autoloader.
    Environment.php       Environment helper.
tests/                    A set of Codeception tests for the application.  
vendor/                   Installed Composer packages.
.gitignore                Files and directories to be ignored by Git.
.php-cs-fixer.php         PHP Coding Standards Fixer configuration.
c3.php                    Codeception code coverage script.
condeception.yml          Codeception configuration.
composer.json             Composer configuration.
composer.lock             Composer lock file.
Makefile                  Makefile with shortcut commands.
psalm.xml                 Psalm configuration.
rector.php                Rector configuration.
yii                       Console application entry point.
```

In general, the files in the application fall into two groups: those under `app/public` and those
under other directories. You can access the former directly via HTTP (i.e., in a browser), while you shouldn't expose the latter.

Each application has an entry script `public/index.php`, the only web-accessible PHP script in the application.
The entry script uses an [application runner](https://github.com/yiisoft/yii-runner) to create an instance of
an incoming request with the help of one of PSR-7 packages and passes it to an [application](../structure/application.md)
instance. The application executes a set of middleware sequentially to process the request.
It then passes the result to the emitter, which sends the response to the browser.

Depending on the middleware you use, the application may behave differently. By default, a router
uses the requested URL and configuration to choose a handler and execute it to produce a response.

You can learn more about the application template from
the [yiisoft/app package documentation](https://github.com/yiisoft/app/blob/master/README.md).

## Request Lifecycle <span id="request-lifecycle"></span>

The following diagram shows how an application handles a request.

![Request Lifecycle](img/request-lifecycle.svg)

1. A user makes a request to the [entry script](../structure/entry-script.md) `public/index.php`.
2. The entry script with the help of the application runner loads
   the container [configuration](../concept/configuration.md) and creates
   an [application](../structure/application.md) instance and services necessary to handle the request.
3. Request factory creates a request object based on a raw request that came from a user.
4. Application passes a request object through a middleware array configured. One of these is typically a router.
5. The Router finds out what handler to execute based on request and configuration.
6. The handler may load some data, possibly from a database.
7. The handler forms a response by using data. Either directly or with the help of the view package.
8. Emitter receives the response and takes care of sending the response to the user's browser.
