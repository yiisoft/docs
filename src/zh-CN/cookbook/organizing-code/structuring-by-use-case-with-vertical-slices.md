# 使用垂直切片按用例组织代码

在构建应用程序时，以易于理解、支持和扩展的方式组织代码非常重要。一种流行的方法是使用垂直切片按用例组织代码。

垂直切片是自包含的功能片段，涵盖整个技术栈，从用户界面到数据访问层。开发人员围绕特定用例组织每个切片，例如创建新用户或更新产品。

当按类型（如模型、视图、控制器、辅助函数等）以经典方式组织代码时，很容易忽视全局以及不同代码片段如何交互以支持特定功能或用例。随着应用程序的增长，这可能导致代码重复、紧密耦合和可维护性差。

另一方面，按用例组织代码使开发人员专注于特定功能或工作流程，并理解不同代码片段如何协同工作以支持该功能。这种方法还有助于将相关代码保存在单个目录中，使其更易于导航和支持。垂直切片还鼓励使用领域驱动设计概念，如实体、仓储和服务，这有助于促进良好的关注点分离和模块化。

此外，按用例组织代码可以使测试和调试应用程序变得更容易，因为用例命名空间将每个功能或工作流程封装在自己的目录中，具有清晰的边界和定义良好的接口。

以下是使用垂直切片组织的 PHP 应用程序的示例目录结构：

```
src/
└── Blog/
    ├── Model/
    │   ├── Comment.php
    │   ├── CommentRepository.php
    │   ├── Post.php
    │   └── PostRepository.php
    ├── Service/ 
    │   └── MarkdownProcessor.php
    ├── UseCase/
    │   ├── CreateComment/
    │   │   ├── CreateCommentAction.php
    │   │   ├── CreateCommentRequest.php
    │   ├── CreatePost/
    │   │   ├── CreatePostAction.php
    │   │   ├── CreatePostRequest.php
    │   ├── DeleteComment/
    │   │   ├── DeleteCommentAction.php
    │   │   ├── DeleteCommentRequest.php
    │   ├── DeletePost/
    │   │   ├── DeletePostAction.php
    │   │   ├── DeletePostRequest.php
    │   ├── ListComments/
    │   │   ├── ListCommentsAction.php
    │   ├── ListPosts/
    │   │   ├── ListPostsAction.php
    │   ├── UpdatePost/
    │   │   ├── UpdatePostAction.php
    │   │   ├── UpdatePostRequest.php
    │   ├── ViewPost/
    │   │   ├── ViewPostAction.php
    │   ├── Rss/
    │   │   ├── RssAction.php
    |   |   ├── RssBuilder.php
```

每个垂直切片都有自己的目录，其中包含与用例相关的代码。

用例子目录及其各自的类在每个目录中按类型组织，如果某个类型只有一个类，则省略目录。如果代码在多个用例之间共享，则将其向上移动一级，例如 `Model`
或 `Service`。

## 参考资料

- [应用程序结构概述](../../guide/structure/overview.md)
