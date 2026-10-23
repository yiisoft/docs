# A

## action

Action is a callable, class, or class method that handles a matched route
and returns a response.  Read more in ["Actions"](structure/action.md).

## alias

Alias is a string used by Yii to refer to the class or directory such as
`@app/vendor`.  Read more in ["Aliases"](concept/aliases.md).

## application

Application is an object that starts up, handles a request through
configured middleware, and shuts down.  Read more in
["Application"](structure/application.md).

## asset

Asset refers to a resource file. Typically, it contains JavaScript or CSS
code but can be any static content accessed via HTTP.  Read more in
["Assets"](views/asset.md).

## asset bundle

Asset bundle is a PHP class that declares a group of CSS, JavaScript, image,
or font files that should be published and registered together.  Read more
in ["Asset Bundles"](views/asset.md#asset-bundles).

## authentication

Authentication is the process of determining the identity of the current
user.  Read more in ["Authentication"](security/authentication.md).

## authorization

Authorization is the process of checking whether an authenticated or
anonymous user is allowed to perform an action.  Read more in
["Authorization"](security/authorization.md).

## autoloading

Autoloading is the process of loading PHP classes automatically when they
are first used.  Read more in ["Class autoloading"](concept/autoloading.md).

# B

## bootstrap

Bootstrap is application startup code that prepares services, configuration,
and runtime state before request handling.  Read more in
["Configuration"](concept/configuration.md).

# C

## configuration

Configuration may refer either to the process of setting properties of an
object or to a configuration file that stores settings for an object, or a
class of objects.  Read more in ["Configuration"](concept/configuration.md).

## container

Container is an object that creates services, resolves their dependencies,
and returns configured instances.  Read more in ["DI
container"](concept/di-container.md#di-container).

## controller

Controller is a class that groups action methods for related routes.  Read
more in ["Actions"](structure/action.md).

## cookie

Cookie is a small piece of data stored by a browser and sent with later
requests to the same site.  Read more in ["Cookies"](runtime/cookies.md).

## CSRF

CSRF means cross-site request forgery, an attack where another site tries to
make a user's browser submit an unwanted request to your application.  Read
more in ["Avoiding CSRF"](security/best-practices.md#avoiding-csrf).

# D

## DI

Dependency injection is a programming technique where an object receives its
dependencies from the outside.  Read more in ["Dependency injection and
container"](concept/di-container.md).

# E

## entry script

Entry script is the first PHP script executed for a web or console
application.  Read more in ["Entry scripts"](structure/entry-script.md).

## event

Event is an object that represents something that happened and can be passed
to listeners.  Read more in ["Events"](concept/events.md).

# H

## handler

Handler is callable code selected by routing or middleware to process a
request and produce a response.  Read more in ["Routing and URL
generation"](runtime/routing.md).

# I

## installation

Installation is a process of preparing something to work either by following
a readme file or by executing a specially prepared script. In the case of
Yii, it's setting permissions and fulfilling software requirements.

# L

## layout

Layout is a view template that wraps page-specific content with shared page
structure.  Read more in ["Working with
layouts"](views/view.md#working-with-layouts).

# M

## migration

Migration is a versioned PHP class that applies or reverts a database schema
or data change.  Read more in ["Migrations"](databases/db-migrations.md).

## middleware

Middleware is a processor in the request processing stack. Given a request,
it may either produce a response or do some action and pass processing to
the next middleware.  Read more in ["Middleware"](structure/middleware.md).

## model

Model is an object that represents application data and usually contains
validation or business rules for that data.  Read more in ["Working with
forms"](start/forms.md).

## module

The module is a namespace that groups some code based on a use-case. It's
typically used within the main application and may contain any source code,
define additional URL handlers or console commands.

# N

## namespace

Namespace refers to a [PHP language
feature](https://www.php.net/manual/en/language.namespaces.php) to group
multiple classes under a certain name.

# P

## package

A package usually refers to [Composer
package](https://getcomposer.org/doc/). It's code ready for reuse and
redistribution installable automatically via a package manager.

## parameter

Parameter is a configuration value that can be used by application or
package config files.  Read more in
["Parameters"](concept/configuration.md#parameters).

# Q

## queue

A queue is a data structure that processes items in first-in, first-out
order.  Yii has a [yiisoft/queue](https://github.com/yiisoft/queue) package.

# R

## request

Request is a PSR-7 object that represents an incoming HTTP message,
including method, URI, headers, body, uploaded files, and attributes.  Read
more in ["Request"](runtime/request.md).

## response

Response is a PSR-7 object that represents an outgoing HTTP message,
including status code, headers, and body.  Read more in
["Response"](runtime/response.md).

## route

Route describes which request method and URL pattern should be handled by
which action or middleware.  Read more in ["Routing and URL
generation"](runtime/routing.md).

## rule

The rule usually refers to a validation rule of the
[yiisoft/validator](https://github.com/yiisoft/validator) package.  It holds
a set of parameters for checking if a data set is valid.  "Rule handler"
does the actual processing.

# S

## service

Service is a focused object that performs application work or provides
infrastructure behavior and is usually stored in the DI container.  Read
more in ["Service components"](structure/service.md).

## service provider

Service provider is a class that registers related service definitions for
the DI container.  Read more in ["Service
providers"](concept/configuration.md#service-providers).

## session

Session is server-side storage associated with a browser across multiple
requests.  Read more in ["Sessions"](runtime/sessions.md).

# T

## template

Template is a file used by a view or template engine to produce presentation
output such as HTML.  Read more in ["Views"](views/view.md).

# V

## vendor

A vendor is an organization or individual developer providing code in the
form of packages.  It also may refer to [Composer's `vendor`
directory](https://getcomposer.org/doc/).

## view

View is responsible for presenting data to end users, usually by executing a
template with provided data.  Read more in ["Views"](views/view.md).

# W

## widget

Widget is a reusable view component that renders a piece of user interface.
Read more in ["Widgets"](views/widget.md).
