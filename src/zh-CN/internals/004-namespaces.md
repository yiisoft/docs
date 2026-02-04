# 004 — 命名空间

包命名空间规则如下：

1. 命名空间部分使用 PascalCase（帕斯卡命名法）。
2. 根供应商命名空间是 `Yiisoft`。
3. 包名称部分用于命名空间。
4. 形容词添加到名词后，作为单个部分。


一些示例：

| Package                    | Namespace                 |
|----------------------------|---------------------------|
| yiisoft/yii-web            | Yiisoft\Yii\Web           |
| yiisoft/di                 | Yiisoft\Di                |
| yiisoft/db-mysql           | Yiisoft\Db\Mysql          |
| yiisoft/friendly-exception | Yiisoft\FriendlyException |

## 参考资料

- [国际论坛讨论](https://forum.yiiframework.com/t/use-yiisoft-as-a-root-namespace-instead-of-yii-for-yii-3-packages/125734)
