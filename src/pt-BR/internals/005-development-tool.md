# 005 — Ferramenta de desenvolvimento do Yii

No Yii3, o número de pacotes aumentou bastante para permitir mais reuso e
releases independentes.  Para facilitar o desenvolvimento do próprio
framework, criamos uma ferramenta especial, disponível em
[yiisoft/yii-dev-tool](https://github.com/yiisoft/yii-dev-tool).

```
$ ./yii-dev
  _   _  _  _
 | | | |(_)(_)  Development Tool
 | |_| || || |
  \__, ||_||_|  for Yii 3.0
  |___/

This tool helps with setting up a development environment for Yii 3 packages.

Usage:
  command [options] [arguments]

Options:
  -h, --help  Display this help message

Available commands:
  checkout-branch  Creates, if not exists, and checkout a git branch
  commit           Add and commit changes into each package repository
  install          Install packages
  lint             Check packages according to PSR12 standard
  pull             Pull changes from package repositories
  push             Push changes into package repositories
  replicate        Copy files specified in replicate.php into each package
  status           Show git status of packages
  update           Update packages
```

Há muitos comandos disponíveis. Os mais importantes são `install` e
`update`. O que eles fazem:

1. Instalam/atualizam todos os pacotes listados em
   [`packages.php`](https://github.com/yiisoft/yii-dev-tool/blob/master/packages.php)
   ou um pacote específico dessa lista, se informado.
2. Para cada pacote instalado, verificam no diretório `vendor` se há pacotes
   listados em `packages.php`.  Se houver, substituem o diretório do pacote
   por um symlink para o código-fonte do outro pacote.

Como resultado, você terá muitos pacotes usando uns aos outros, sem precisar
de `git push` e `composer install` / `composer update` durante o
desenvolvimento.

Um [exemplo
detalhado](https://github.com/yiisoft/yii-dev-tool#usage-example) de uso da
ferramenta está disponível no README dela.
