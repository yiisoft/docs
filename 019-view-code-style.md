# 019 — View code style

The PHP code in the view files shouldn't be complicated.
The code must contain the logic responsible for formatting the data, but not the logic for requesting this data.

## Heading

View file heading is used to place phpdoc describing variables available and to import classes:

```php
<?php

declare(strict_types=1);

/** @var Post $post */
/** @var string $name */

use Yiisoft\Html\Html;
```

## Control structures

Alternative syntax for control structures such as `foreach` and `if` is preferred:

```php
<?php foreach ($posts as $post): ?>   
    <h2><?= Html::encode($post->getTitle()) ?></h2>
    <p><?= Html::encode($post->getDescription()) ?></p>
<?php endforeach; ?>
```

## Short echo

Short echo is preferred:

```php
<?= Html::encode($name) ?>
```

## Class methods

All class methods used in view files must be public regardless if the view is rendered by the class itself. 
