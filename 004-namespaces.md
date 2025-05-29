# 004 — Namespaces

Package namespace rules are the following:

1. PascalCase is used for namespace parts.
2. Root vendor namespace is `Yiisoft`.
3. Package name parts are used in namespace.
4. Adjective is added to a noun and is a single part.


Some examples:

| Package                    | Namespace                 |
|----------------------------|---------------------------|
| yiisoft/yii-web            | Yiisoft\Yii\Web           |
| yiisoft/di                 | Yiisoft\Di                |
| yiisoft/db-mysql           | Yiisoft\Db\Mysql          |
| yiisoft/friendly-exception | Yiisoft\FriendlyException |

## References

- [International forum discussion](https://forum.yiiframework.com/t/use-yiisoft-as-a-root-namespace-instead-of-yii-for-yii-3-packages/125734)
