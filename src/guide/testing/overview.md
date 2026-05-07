# Testing

Tests help keep Yii applications and packages safe to change. Use the smallest test type that can prove the behavior:

1. Unit tests.
2. Functional tests.
3. End-to-end tests.

This order keeps feedback fast. Unit tests are the cheapest to write and run. Functional tests cover application
integration through a real request and response. End-to-end tests exercise the application through an HTTP server or
browser and are best reserved for the flows that must work from the user's point of view.

## Test types

Unit tests check a small unit of code in isolation: a value object, service, middleware, handler, validator, or domain
operation. They should avoid bootstrapping the whole application when a direct object call is enough.

Functional tests run application code in the same PHP process. For web functionality, create a PSR-7
`ServerRequestInterface`, pass it to the application or middleware stack, and assert on the returned PSR-7
`ResponseInterface`. This tests routing, middleware, container configuration, and response creation without starting a
web server.

End-to-end tests use the application the same way a user or external system uses it: through HTTP requests, a browser,
or another real client. They are useful for forms, authentication flows, JavaScript behavior, and integration with
services that are hard to represent in-process.

## Application state

Tests should start from a known application state and leave the application ready for the next test. Reset the same
state that a real application changes:

- Database rows.
- Cache entries.
- Sessions and cookies.
- Uploaded or generated files.
- Queues and outgoing messages.
- Time, random values, and other process-wide fakes.

Prefer a separate test environment, separate test database, and isolated runtime directories. A test that depends on
leftover data from a previous test can pass locally and fail in CI.

## Quality gates

Automated tests are only one part of the feedback loop. Static analysis checks type contracts and unreachable or unsafe
code paths before the code runs. Mutation testing changes small parts of the source code and checks whether the test
suite fails; surviving mutations point to assertions that are missing or too weak.

Run unit and functional tests frequently during development. Run end-to-end tests, static analysis, and mutation testing
in CI or before releases, based on the project's size and cost of failure.
