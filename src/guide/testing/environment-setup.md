# Testing environment setup

Use a dedicated test environment. It should have its own configuration, runtime directory, and database connection.
This keeps tests repeatable and protects development data.

A typical setup includes:

- `APP_ENV=test` or an equivalent environment flag.
- A database created only for tests.
- Separate cache, session, and queue storage.
- Local implementations for external services such as mailers, payment providers, and HTTP APIs.
- A test bootstrap that loads Composer autoloading and prepares the application configuration.

## Reset state

Reset application state before each test or test group. The exact reset strategy depends on the storage:

- Recreate the schema, truncate tables, or wrap tests in transactions for database state.
- Clear cache pools, runtime directories, and generated files.
- Reset session and cookie storage.
- Empty queues and captured outgoing messages.
- Restore fake clocks, random generators, and global configuration overrides.

Use the same reset rules for local runs and CI. A test suite should pass when run from a clean checkout and when run
after another test suite.

## Run tests locally

Use the command configured by the project. For a project that uses PHPUnit directly, the command can look like this:

```shell
APP_ENV=test vendor/bin/phpunit
```

When the application runs in Docker, run the test command inside the test container and point it to the test
environment files. Keep host services, container services, and CI services configured the same way where possible.
