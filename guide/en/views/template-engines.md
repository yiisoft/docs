# Template engines

Yii views support multiple template engines as well as custom engines. By default, Yii uses the PHP engine.
Additionally, [Twig](https://twig.symfony.com/) is available.

## PHP

PHP engine is available by default. The following is the basic template syntax:

```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/**
 * @var App\Blog\Post[] $posts 
 */
?>

Posts:

<dl>
<?php foreach ($posts as $post): ?>
    <dt>Title: <?= Html::encode($post->getTitle()) ?></dt>
    <dd>Description: <?= Html::encode($post->getDescription()) ?></dd>
<?php endforeach; ?>
</dl>
```

At the very top of the template, you can define "uses" for classes to use and declare the type of variables 
so the IDE understands them. The rest is the PHP code.

> [!WARNING]
> `<?=` or `echo` doesn't automatically encode variables for safe use with HTML and you should take care of it by using
> `Html::encode()`.

If you need a sub-view, you can use it like this:

```php
<?php

declare(strict_types=1);

/** 
 * @var Yiisoft\View\View $this
 * @var App\Blog\Post[] $posts 
 */
?>

Title

<?= $this->render('blog/posts', ['posts' => $posts]) ?>
```

### See also

- [yiisoft/view docs](https://github.com/yiisoft/view/blob/master/docs/guide/en/README.md).
- 

## Twig

To use Twig, you need to install the [yiisoft/yii-twig](https://github.com/yiisoft/yii-twig).


> [!NOTE]
> [← Views](view.md) |
> [View injections →](view-injections.md)
