# 012 - Tests

For each package we are adding unit-tests that are run via [PHPUnit](https://phpunit.de/). When designing tests,
the following guidelines should be taken into account.

- Test class should be marked as `final` by default.
- `@test` annotation must not be used, prefix methods with `test`.
- Test method name must reflect the purpose of the test.
- "should" must not be used in test method name.
- If necessary, desired behavior may be described in test method phpdoc.
- There must be one test per test method.
- Test must be structured as AAA - arrange, act, assert i.e. first we are preparing what's necessary then making calls
  then asserting that everything is correct.
- Test must use public API. Private properties or methods should not be accessed, assumptions on internals
  of the class tested should not be made.
