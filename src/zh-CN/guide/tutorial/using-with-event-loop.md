# 在事件循环中使用 Yii

普通 PHP Web 请求的执行周期包括设置环境、获取请求、处理请求以生成响应
以及发送结果。响应发送后，执行终止，其上下文也随之丢失。因此，对于后续
请求，整个流程会重复执行。这种方式的一大优点是开发简便，开发者无需
过多关注内存泄漏或上下文清理问题。但另一方面，为每个请求初始化所有内容
需要消耗时间，整体上会占用多达 50% 的处理资源。

还有一种运行应用程序的方式——事件循环。其思路是一次性初始化所有可初始化的内容，然后利用它来处理多个请求。这种方式通常被称为事件循环。

可以使用多种工具来实现这一目标，其中较为知名的有
[FrankenPHP](https://frankenphp.dev/)、[RoadRunner](https://roadrunner.dev/)
和 [Swoole](https://www.swoole.co.uk/)。

## 事件循环的影响

事件循环的 worker 基本结构如下：

```php
initializeContext();
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
}
```

通常会有多个 worker 同时处理请求，与传统的 php-fpm 方式类似。

这意味着在开发应用程序时需要考虑更多因素。

### 处理是阻塞的

Worker 逐一处理请求，当前请求的处理会阻塞下一个请求的处理。这意味着与普通 PHP 应用程序一样，耗时较长的任务应通过队列放到后台执行。

### 服务与状态

由于事件循环中的上下文由同一 worker
处理的所有请求-响应共享，上一个请求对服务状态所做的任何修改都可能影响当前请求。此外，如果一个用户的数据可被另一个用户访问，还会带来安全问题。

有两种应对方式。第一种是将服务设计为无状态，从而避免状态问题，PHP 的 `readonly`
关键字在此很有用。第二种是在每次请求处理结束后重置服务状态，此时可以使用状态重置器：

```php
initializeContext();
$resetter = $container->get(\Yiisoft\Di\StateResetter::class);
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
   $resetter->reset(); // We should reset the state of such services on every request.
}
```

## 集成

- [RoadRunner](using-yii-with-roadrunner.md)
- [Swoole](using-yii-with-swoole.md)
