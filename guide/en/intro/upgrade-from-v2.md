# Upgrading from Version 2.0

> If you haven't used Yii 2 you can safely skip this section and get directly to "[getting started](../start/installation.md)"
> section.

While sharing some common ideas and values Yii 3 is conceptually different from Yii 2. There is no easy upgrade
path so first [check maintenance policy and end of life dates for Yii 2](https://www.yiiframework.com/release-cycle)
and consider starting new projects on Yii 3 while keeping existing ones on Yii 2.

## PHP requirements

Yii 3 requires PHP 7.2 or above. As a result, there are language features used that were not used in Yii 2:

- [Type declarations](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Return type declarations](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Class constant visibility](https://www.php.net/manual/en/language.oop5.constants.php)
- [Anonymous classes](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generators](https://www.php.net/manual/en/language.generators.php)
- [Variadic functions](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)

