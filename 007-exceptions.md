# 007 - Exceptions

- Throw exceptions instead of returning an error code.
- Exception class name must be suffixed with `Exception`.
- Use grammatically correct error messages including ending punctuation i.e. most exceptions must end with period.
- `\InvalidArgumentException` must be used directly. There should be no exceptions inherited from it.
- `\InvalidArgumentException` must never be caught.

## References

- [International community discussion and poll](https://forum.yiiframework.com/t/naming-exceptions/126613/6)
- [Russian community discussion and poll](https://yiiframework.ru/forum/viewtopic.php?f=39&t=51290)
