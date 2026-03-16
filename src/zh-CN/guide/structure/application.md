# 应用

Yii3 中 Web 应用程序及其运行器的主要目的是处理请求以获取响应。

通常，运行时由以下部分组成：

1. 启动。获取配置，创建容器实例，并进行额外的环境初始化，例如注册错误处理器以处理发生的错误。触发 `ApplicationStartup` 事件。
2. 通过将请求对象传递给中间件调度器来处理请求，以执行[中间件栈](middleware.md)并获取响应对象。在普通的 PHP
   应用程序中，这只执行一次。在 [RoadRunner
   等环境](../tutorial/using-with-event-loop.md)中，可以使用同一应用程序实例执行多次。响应对象通过发射器转换为实际的
   HTTP 响应。触发 `AfterEmit` 事件。
3. 关闭。触发 `ApplicationShutdown` 事件。
