# 概述

Yii 应用程序代码通常按上下文分组到模块中。在每个模块中，可以按类型进行进一步分组。

例如，如果应用程序是一个在线商店，上下文可以是：

- 客户
  - 个人资料
  - 产品列表
  - 结账
- 物流
- 配送
  - 地址
- 帮助台
  - 支持
  - 索赔
  - 退货
- 财务
  - 退货
  - 交易
  - 税务

对于位于 `App\Customer` 命名空间下的“Customer”上下文，结构将是：

```
App/
  Customer/                          <-- 模块命名空间
    Entity/
      Customer.php                   <-- "Profile" 和 "Checkout" 共用的实体
    Profile/
      Widget/
        Gravatar.php
      ProfileRepository.php          <-- 仓库通常特定于上下文
      ProfileController.php          <-- "Customer\Profile" 入口点
    ProductList/                     <-- 模块命名空间
      Entity/                        <-- "Customer\ProductList" 特有的实体
        Category.php
        Product.php
      ProductsListController.php     <-- "Customer\ProductList" 入口点
    Checkout/                        <-- 模块命名空间
      CheckoutController.php
```

一个上下文可以包含子上下文。如果一个类被多个上下文共享，它将被移动到两个上下文的共同祖先中。

一个上下文可以有
[一个称为“动作”或“控制器”的入口点](action.md)。它的工作是获取[请求实例](../runtime/request.md)，以适当的格式将其传递给
[领域层](domain.md)，并根据领域层的返回创建 [响应](../runtime/response.md)。

此外，Yii 应用程序还具有以下内容：

* [入口脚本](entry-script.md)：它们是最终用户可以直接访问的 PHP
  脚本。它们负责启动请求处理周期。通常，单个入口脚本处理整个应用程序。
* [服务](service.md)：它们通常是在依赖容器中注册的无状态对象，并提供各种操作方法。
* [中间件](middleware.md)：它们表示需要在操作处理器实际处理每个请求之前和之后调用的代码。
