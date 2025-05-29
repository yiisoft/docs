# 012 — Tests

For each package, we're adding unit-tests that are run via [PHPUnit](https://phpunit.de/).
When designing tests, the following guidelines should be taken into account.

- Test class should be marked as `final` by default.
- `@test` annotation must not be used, prefix methods with `test`.
- The test method name must reflect the purpose of the test.
- "should" must not be used in the test method name.
- If necessary, the test method phpdoc may describe the desired behavior.
- The test must follow AAA: first arrange the necessary preconditions, then act, then assert expected results.
- There must be one test case per test method that's a single AAA.
- Test must use public API.
  Private properties or methods shouldn't be accessed, assumptions on internals
  of the class tested shouldn't be made.
- Tests shouldn't rely on composer-config-plugin and DI container unless necessary.
