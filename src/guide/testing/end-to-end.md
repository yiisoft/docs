# End-to-end tests

End-to-end tests run the application through a real client. The client can be a browser, command-line HTTP client, or
another system that talks to the application over HTTP.

Use end-to-end tests for user-visible flows:

- Sign in and sign out.
- Form submission and validation messages.
- JavaScript behavior.
- File uploads.
- Integration with reverse proxies, headers, cookies, and redirects.

These tests are slower and more sensitive to infrastructure than unit and functional tests. Keep them focused on
critical flows and cover detailed business rules with lower-level tests.

## Environment

Run end-to-end tests against a dedicated test environment. The web server, PHP process, database, cache, and external
service fakes should match the way the application runs in development or CI.

Prepare state before each scenario:

- Load only the records required by the scenario.
- Clear session and cookie storage.
- Clear generated files and outgoing messages.
- Stop background workers or make their effects deterministic.

After the test, assert on user-visible output and durable effects such as database rows or generated files.
