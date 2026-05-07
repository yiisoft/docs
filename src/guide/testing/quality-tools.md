# Static analysis and mutation testing

Tests execute selected examples. Static analysis and mutation testing add different feedback.

Static analysis reads the code and checks type contracts, control flow, unreachable code, invalid calls, and other
issues before the code runs. Common PHP tools include [Psalm](https://psalm.dev/) and
[PHPStan](https://phpstan.org/).

Mutation testing changes small parts of the source code and runs the test suite against each change. If the tests still
pass, the changed code is a surviving mutation. Surviving mutations often mean that assertions are missing, too broad,
or checking implementation details instead of behavior. A common PHP mutation testing tool is
[Infection](https://infection.github.io/).

## When to run them

Run static analysis in CI for every pull request. Run it locally before pushing changes that affect shared interfaces,
container configuration, or generated types.

Mutation testing is more expensive. Run it for packages, domain code, and critical services where test strength matters.
For large applications, start with a small source path and expand the scope as the suite becomes faster and more stable.

Use these tools with tests. Static analysis finds many type and flow problems. Mutation testing shows whether tests
would catch behavior changes.
