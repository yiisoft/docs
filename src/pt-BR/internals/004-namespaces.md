# 004 — Namespaces

As regras de namespace dos pacotes são as seguintes:

1. As partes do namespace usam PascalCase.
2. O namespace raiz do vendor é `Yiisoft`.
3. As partes do nome do pacote são usadas no namespace.
4. Um adjetivo é unido ao substantivo e forma uma única parte.


Alguns exemplos:

| Pacote                     | Namespace                 |
|----------------------------|---------------------------|
| yiisoft/yii-web            | Yiisoft\Yii\Web           |
| yiisoft/di                 | Yiisoft\Di                |
| yiisoft/db-mysql           | Yiisoft\Db\Mysql          |
| yiisoft/friendly-exception | Yiisoft\FriendlyException |

## Referências

- [Discussão no fórum
  internacional](https://forum.yiiframework.com/t/use-yiisoft-as-a-root-namespace-instead-of-yii-for-yii-3-packages/125734)
