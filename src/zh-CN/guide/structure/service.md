# 服务组件

应用程序可能会变得复杂，因此将业务逻辑或基础设施的专注部分提取到服务组件中是有意义的。它们通常被注入到其他组件或操作处理器中。这通常通过自动装配来完成：

```php
public function actionIndex(CurrentRoute $route, MyService $myService): ResponseInterface
{
    $id = $route->getArgument('id');
    
    // ...
    $extraData = $myService->getExtraData($id);
    
    // ...
}
```

Yii3 在技术上对如何构建服务没有任何限制。通常，无需从基类继承或实现特定接口：

```php
final readonly class MyService
{
    public function __construct(
        private ExtraDataStorage $extraDataStorage
    )
    {
    }

    public function getExtraData(string $id): array
    {
        return $this->extraDataStorage->get($id);
    }
}
```

服务要么执行任务，要么返回数据。它们被创建一次，放入 DI
容器，然后可以多次使用。因此，保持服务无状态是个好主意，即服务本身及其任何依赖都不应保持状态。您可以通过在类级别使用 PHP 的 `readonly`
关键字来确保这一点。

## 服务依赖和配置

服务应始终通过 `__construct()`
定义对其他服务的所有依赖。这既允许您在服务创建后立即使用它，也可以在依赖太多时作为服务承担过多职责的提示。

- 服务创建后，不应在运行时重新配置。
- DI 容器实例通常**不应该**作为依赖注入。优先使用具体接口。
- 如果初始化复杂或“繁重”，请尝试推迟到服务方法被调用时再进行。

配置值也同样适用。它们应作为构造函数参数提供。相关值可以组合到值对象中。例如，数据库连接通常需要 DSN 字符串、用户名和密码。这三个可以合并到 Dsn
类中：

```php
final readonly class Dsn
{
    public function __construct(
        public string $dsn,
        public string $username,
        public string $password
    )
    {
        if (!$this->isValidDsn($dsn)) {
            throw new \InvalidArgumentException('DSN provided is not valid.');
        }
    }
    
    private function isValidDsn(string $dsn): bool
    {
        // check DSN validity    
    }
}
```

## 服务方法

服务方法通常执行某些操作。它可能是完全重复的简单事情，但通常取决于上下文。例如：

```php
final readonly class PostPersister
{
    public function __construct(
        private Storage $db
    )
    {
    }
    
    public function persist(Post $post)
    {
        $this->db->insertOrUpdate('post', $post);    
    }
}
```

有一个将帖子保存到数据库等永久存储的服务。允许与具体存储通信的对象始终相同，因此使用构造函数注入；而要保存的帖子可能不同，因此作为方法参数传递。

## 一切都是服务吗？

通常选择另一种类类型来放置您的代码更合适。请检查：

- 仓库
- 小部件
- [中间件](middleware.md)
- 实体
