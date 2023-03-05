# 012 - Tests

For each package we are adding unit-tests that are run via [PHPUnit](https://phpunit.de/). When designing tests,
the following guidelines should be taken into account.

- Test class should be marked as `final` by default.
- `@test` annotation must not be used, prefix methods with `test`.
- Test method name must reflect the purpose of the test.
- "should" must not be used in test method name.
- If necessary, test method phpdoc may describe desired behavior.
- Test must be structured as AAA - arrange, act, assert i.e. first we are preparing what's necessary then making calls
  then asserting everything is correct.
- There must be one test case per test method i.e. a single AAA.
- Test must use public API. Private properties or methods should not be accessed, assumptions on internals
  of the class tested should not be made.
- Tests should not rely on composer-config-plugin and DI container unless necessary.
