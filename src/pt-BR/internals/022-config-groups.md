# 022 — Grupos de configuração

Este documento define a convenção de nomes para os grupos do framework
usados com o [yiisoft/config](https://github.com/yiisoft/config).  Observe
que esta não é uma convenção de nomes para arquivos de configuração.  Eles
podem ter qualquer nome e são mapeados para os nomes de grupo via
`composer.json`.

## Sufixos dos nomes de grupos de configuração

- O sufixo "web" se aplica apenas à web, ou seja, geração clássica de HTML
  no servidor, REST, RPC etc.
- O sufixo "console" se aplica ao console
- Se não houver sufixo, o grupo é "common" e se aplica tanto à web quanto ao
  console
- "web" e "console" podem sobrescrever o que está definido em "common"

## Parâmetros

Parâmetros de configuração da aplicação usados em todas as configurações.

- `params` — parâmetros comuns
- `params-web` — parâmetros da aplicação web
- `params-console` — parâmetros da aplicação de console

## Container

Configuração do [yiisoft/di](https://github.com/yiisoft/di).

### Definições

- `di` — definições comuns do container
- `di-web` — definições do container para web
- `di-console` — definições do container para console

### Providers

- `di-providers` — providers comuns do container
- `di-providers-web` — providers do container para web
- `di-providers-console` — providers do container para console

### Delegates

- `di-delegates` — delegates comuns do container
- `di-delegates-web` — delegates do container para web
- `di-delegates-console` — delegates do container para console

### Tags

- `di-tags` — tags comuns do container
- `di-tags-web` — tags do container para web
- `di-tags-console` — tags do container para console

## Eventos

Configuração do [yiisoft/yii-event](https://github.com/yiisoft/yii-event).

- `events` — eventos comuns
- `events-web` — eventos da web
- `events-console` — eventos do console

## Bootstrap

Bootstrap da aplicação para o
[yiisoft/yii-runner](https://github.com/yiisoft/yii-runner).

- `bootstrap` — bootstrap comum
- `bootstrap-web` — bootstrap da web
- `bootstrap-console` — bootstrap do console

## Outros

- `routes` — rotas do [yiisoft/router](https://github.com/yiisoft/router)
- `widgets` — configuração padrão de widgets do
  [yiisoft/widget](https://github.com/yiisoft/widget)
