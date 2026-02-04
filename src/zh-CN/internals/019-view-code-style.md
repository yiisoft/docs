# 019 — 视图代码风格

视图文件中的 PHP 代码不应该太复杂。代码必须包含负责格式化数据的逻辑，但不应包含请求数据的逻辑。

## 文件头部

视图文件头部用于放置描述可用变量的 phpdoc 和导入类：

```php
<?php

declare(strict_types=1);

/** @var Post $post */
/** @var string $name */

use Yiisoft\Html\Html;
```

## 控制结构

优先使用控制结构（如 `foreach` 和 `if`）的替代语法：

```php
<?php foreach ($posts as $post): ?>   
    <h2><?= Html::encode($post->getTitle()) ?></h2>
    <p><?= Html::encode($post->getDescription()) ?></p>
<?php endforeach; ?>
```

## 短标签输出

优先使用短标签输出：

```php
<?= Html::encode($name) ?>
```

## 类方法

视图文件中使用的所有类方法都必须是 public 的，无论视图是否由类本身渲染。
