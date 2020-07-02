# 从 Yii 2.0 升级

> 如果你没有使用 Yii 2，你可以安稳地跳过这部分，直接进入到 "[入门](../start/installation.md)" 章节。

虽然Yii 3 与 Yii 2 有一些共同的思想和价值观，但在概念上是不同的。因此，没有简单的升级路径。
首先，[检查 Yii 2 的维护政策和生命结束日期](https://www.yiiframework.com/release-cycle)
然后，在同时保留现有项目的情况下，考虑在 Yii 3 启动新的项目

## PHP 需求

Yii 3 要求 PHP 7.4 或更高版本。因此，它有一些在 Yii 2 中没有使用过的语言特性：

- [类型声明](https://www.php.net/manual/zh/functions.arguments.php#functions.arguments.type-declaration)
- [返回类型声明](https://www.php.net/manual/zh/functions.returning-values.php#functions.returning-values.type-declaration)
- [类常量的可见性](https://www.php.net/manual/zh/language.oop5.constants.php)
- [匿名类](https://www.php.net/manual/zh/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/zh/language.oop5.basic.php#language.oop5.basic.class.class)
- [生成器](https://www.php.net/manual/zh/language.generators.php)
- [变参函数](https://www.php.net/manual/zh/functions.arguments.php#functions.variable-arg-list)

## 初步的重构
在将 Yii 2 的项目移植到 Yii 3 之前重构它，会是一个好主意。这将使移植更加简单，而且，在它还没有移植到 Yii 3 之前，是有利于正在规划的项目。

### 使用DI（依赖注入）代替服务定位器模式

由于 Yii 3 强制你正确地注入依赖关系，因此，预备从使用服务定位器模式 (`Yii::$app->`) 
向 [依赖注入容器](https://www.yiiframework.com/doc/guide/2.0/zh-cn/concept-di-container) 切换会是一个好主意

如果依赖注入容器的使用由于某种原因出现问题，考虑将所有对' Yii::$app-> '的调用移动到控制器动作和小部件，并将依赖项从控制器手动传递给需要它们的对象。

参考 [依赖注入和容器](../concept/di-container.md) 来解释这个概念。

### 引入用于获取数据的存储库

由于Active Record（活动记录）不是 Yii 3 中使用数据库的唯一方法，因此，考虑引入存储库，将获取数据的细节隐藏起来，并将它们收集到一个单独的位置，以后可以重新操作：

```php
class PostRepository
{
    public function getArchive()
    {
        // ...
    }
    
    public function getTop10ForFrontPage()
    {
        // ...
    }

}
```

### 域层与基础结构层分离

如果你有丰富复杂的域，将他从框架提供的基础设施（即包所有的业务逻辑的）与框架无关的类分离会是一个好主意。

### 更多地讲组件

Yii 3 服务在概念上类似于 Yii 2 的组件，因此，将应用程序的可重用部分转移到组件中是一个好主意。
