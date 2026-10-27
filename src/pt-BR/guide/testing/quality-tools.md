# Análise estática e qualidade de código

O template de aplicação Yii inclui ferramentas de análise estática e de
qualidade de código junto com a suíte de testes.

## Psalm

Execute o Psalm localmente:

```shell
vendor/bin/psalm
```

Execute o Psalm no Docker:

```shell
make psalm
```

O template guarda a configuração do Psalm em `psalm.xml`. O workflow do
GitHub Actions executa o Psalm nas versões de PHP suportadas.

Quando o Psalm reportar um problema, corrija o código ou adicione uma
anotação de tipo precisa. Mantenha as supressões restritas e locais à linha
ou ao método que precisa delas.

## Composer Dependency Analyser

O Composer Dependency Analyser verifica se o `composer.json` corresponde às
classes usadas pela aplicação.

Execute-o localmente:

```shell
vendor/bin/composer-dependency-analyser --config=composer-dependency-analyser.php
```

Execute-o no Docker:

```shell
make composer-dependency-analyser
```

Use essa verificação depois de adicionar ou remover o uso de pacotes em
`src`, `config` ou `tests`.

## PHP CS Fixer

O PHP CS Fixer aplica o estilo de código do projeto definido em
`.php-cs-fixer.php`.

Execute-o localmente:

```shell
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
```

Execute-o no Docker:

```shell
make cs-fix
```

Faça o commit das mudanças de formatação junto com o código que as exige.

## Rector

O Rector aplica as atualizações e refatorações de código configuradas em
`rector.php`.

Visualize as mudanças localmente:

```shell
vendor/bin/rector --dry-run
```

Aplique as mudanças localmente:

```shell
vendor/bin/rector
```

Execute-o no Docker:

```shell
make rector
```

Revise as mudanças do Rector antes de fazer o commit. A refatoração
automatizada pode alterar o comportamento quando regras personalizadas ou
caminhos amplos estão configurados.

## Verificações de pull request

Uma verificação local prática antes de abrir um pull request é:

```shell
APP_ENV=test vendor/bin/codecept build
APP_ENV=test vendor/bin/codecept run
vendor/bin/psalm
vendor/bin/composer-dependency-analyser --config=composer-dependency-analyser.php
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
```

Com Docker:

```shell
make codecept build
make test
make psalm
make composer-dependency-analyser
make cs-fix
```
