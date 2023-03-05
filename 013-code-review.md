# 013 - Code Review

Code reviews are essential for success of the project and are as important as contributing code.

Reviews are handled via GitHub pull requests. When the request is ready for review "status: code review" label
added to it.

[Full list of pull requests that need review](https://github.com/search?q=org%3Ayiisoft+label%3A"status%3Acode+review"&state=open&type=Issues)
is available at GitHub.

## Guidelines

- Check out pull request branch, open project in IDE, get a big picture.
- Does pull request make sense overall?
- Run tests and/or application using code from the pull request. Are these OK? 
- Read all lines of code in the pull request.
- Could it be done simpler?
- Are there security issues?
- Are there performance issues?
- When leaving comments be polite.
- Avoid code formatting comments.

## Mandatory parts

- [ ] Tests that fail without code and pass with code.
- [ ] Type hints.
- [ ] `declare(strict_types=1)`.
- [ ] Documentation: phpdoc, yiisoft/docs.
- [ ] Changelog entry (if package is stable).
