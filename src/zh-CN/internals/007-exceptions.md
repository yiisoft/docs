# 007 — 异常

- 抛出异常而不是返回错误代码。
- 异常类名必须以 `Exception` 作为后缀。
- 使用语法正确的错误消息，包括结束标点符号，即大多数异常必须以句号结尾。
- `\InvalidArgumentException` 必须直接使用。不应该有从它继承的异常。
- `\InvalidArgumentException` 绝不能被捕获。

## 参考资料

- [国际社区讨论和投票](https://forum.yiiframework.com/t/naming-exceptions/126613/6)
- [俄罗斯社区讨论和投票](https://yiiframework.ru/forum/viewtopic.php?f=39&t=51290)
