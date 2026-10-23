# 019 — Estilo de código das views

O código PHP nos arquivos de view não deve ser complicado.  O código deve
conter a lógica responsável por formatar os dados, mas não a lógica para
buscar esses dados.

## Cabeçalho

O cabeçalho do arquivo de view é usado para colocar o phpdoc que descreve as
variáveis disponíveis e para importar classes:

```php
<?php

declare(strict_types=1);

/** @var Post $post */
/** @var string $name */

use Yiisoft\Html\Html;
```

## Estruturas de controle

Prefira a sintaxe alternativa para estruturas de controle como `foreach` e
`if`:

```php
<?php foreach ($posts as $post): ?>   
    <h2><?= Html::encode($post->getTitle()) ?></h2>
    <p><?= Html::encode($post->getDescription()) ?></p>
<?php endforeach; ?>
```

## Short echo

Prefira o short echo:

```php
<?= Html::encode($name) ?>
```

## Métodos de classe

Todos os métodos de classe usados em arquivos de view devem ser públicos,
mesmo que a view seja renderizada pela própria classe.
