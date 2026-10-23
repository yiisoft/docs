# 003 — Roadmap

Queremos que o Yii 3:

- Não limite o desenvolvedor na escolha da arquitetura. Permita qualquer
  coisa, do MVC "clássico" ao DDD.
- Seja baseado em boas práticas como SOLID, GRASP etc. e as ensine à
  comunidade.
- Mantenha a maior parte das coisas boas do Yii 2.
- Seja mais aberto à comunidade e à infraestrutura PHP global.

## Conformidade com PSRs

A conformidade com PSRs ajuda na personalização, permite usar bibliotecas
PHP gerais e implementar menos wrappers.  Aqui está a lista de PSRs que
queremos implementar.

### PSR-3 Logger

Implementado como um [pacote separado que não depende de um
framework](https://github.com/yiisoft/log).

- [x] Os pacotes do framework devem depender apenas da interface.
- [x] Separar os drivers em pacotes.
- [x] Limpar o código.
- [x] [Corrigir o destino de
  e-mail](https://github.com/yiisoft/log-target-email).

### PSR-4 Autoloading

- [x] O autoloading já está bom.
- [x] Documentar como funciona.

### PSR-7 HTTP message

- [x] Remover nossa própria implementação. Pelo menos por enquanto.
- [x] Os pacotes do framework devem depender apenas de interfaces.

### PSR-11 Container

Implementado como um [pacote separado que não depende de um
framework](https://github.com/yiisoft/di).

- [x] Os pacotes do framework não devem usar o container diretamente. Deve
  ser possível instanciar tudo manualmente.
- [x] Terminar a refatoração.
- [x] Remover do pacote todas as implementações específicas do
  framework. Movê-las para o framework.
- [x] [Implementar fallback para o
  autoloader](https://github.com/yiisoft/di/issues/88)

### PSR-12 Code style

- [x] Garantir que o código o siga.
- [x] Automatizar a correção de estilo antes do release.

### PSR-14 Event dispatcher

- [x] [Implementar como uma biblioteca
  separada](https://github.com/yiisoft/event-dispatcher).
- [x] Usar em outros pacotes.
- [x] Polir.

### PSR-15 HTTP handlers

- [x] Reescrever o fluxo HTTP para requisição-resposta PSR-7 + formatação da
  resposta via emitter.
- [x] Oferecer um emitter SAPI pronto para uso.
- [x] Possibilitar o uso de emitters alternativos, como o RoadRunner.
- [x] Suportar middleware.
- [x] Implementar filtros como middleware:
  - [x] [Limitação de taxa](https://github.com/yiisoft/yii-web/issues/63)
  - [x] [Autenticação](https://github.com/yiisoft/yii-web/issues/114)
- [x] Reimplementar o router com suporte a middleware para grupos de rotas.
- [x] Filtros devem ser middlewares.

### PSR-16 Simple cache

Implementado como um [pacote separado que não depende de um
framework](https://github.com/yiisoft/cache).

- [x] Os pacotes do framework devem depender apenas de interfaces.
- [x] Separar os drivers em pacotes.
- [x] Limpar o código.

### PSR-17 HTTP factories

- [x] Usar as factories PSR.

### PSR-18 HTTP client

- [x] Remover nossa própria implementação. Pelo menos por enquanto.
- [x] Os pacotes do framework devem depender apenas de interfaces.

## Tipos mais estritos

- [x] Garantir que type hints sejam usados em todo lugar.
- [x] Garantir que os tipos sejam o mais definidos possível. Evitar tipos
  variáveis sempre que possível.

## Template de aplicação único

- [x] Abandonar basic/advanced.
- [x] Criar um [template de aplicação único que funcione de
  imediato](https://github.com/yiisoft/app).

## Router

Implementado como um [pacote separado que não depende de um
framework](https://github.com/yiisoft/router).

- [x] DSL para configuração.
- [x] Possibilidade de rotear para qualquer callable.
- [x] Rotas nomeadas.
- [x] Grupos de rotas com suporte a middleware.

## Boas práticas e conformidade com SOLID em todas as classes/pacotes

- [x] Garantir que as interfaces sigam o princípio de "segregação de
  interfaces".
- [x] Não usar propriedades públicas.
- [x] Não usar `init()`.
- [x] Não herdar de `BaseObject` ou `Component`. Removê-los.
- [x] Nada de globais.
- [x] Nada de chamadas estáticas, exceto helpers finais.
- [x] Preferir lançar exceções a corrigir a entrada.

## Kit de ferramentas de desenvolvimento

- [x] Ferramenta de linha de comando para release
- [x] Ferramenta de linha de comando para desenvolvimento (cria symlinks dos
  pacotes em uma aplicação utilizável)

## Console

- [x] Separar aplicação web e aplicação de console
- [x] Possivelmente eliminar a aplicação base (ainda é necessária)
- [x] Criar uma interface para o console (usando a do Symfony)
- [x] A implementação pode ser uma das populares (usando a do Symfony)
- [x] Garantir que a aplicação possa adicionar comandos via configuração

## Documentação

- [ ] Seguir boas práticas.
- [ ] Não usar o termo "MVC".
- [ ] Upgrade a partir do Yii 2.

## RBAC

O RBAC é implementado como [um pacote independente de
framework](https://github.com/yiisoft/rbac).

- [x] Terminar a refatoração.
- [x] Garantir que siga boas práticas.
- [x] Separar os drivers em pacotes.

## View

A view é implementada como [pacote independente de
framework](https://github.com/yiisoft/view).

- [x] Terminar a refatoração ([veja as
  issues](https://github.com/yiisoft/view/issues)).
- [x] Portar os widgets.
- [x] Repensar e implementar os widgets de active form.
- [x] Implementar widgets de cache.

## Abstrações de dados e grid

- [x] Terminar as [abstrações de dados](https://github.com/yiisoft/data).
- [x] Portar a ordenação, usando abstrações de dados. Deve fazer parte do
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Portar a paginação, usando abstrações de dados. Deve fazer parte do
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Portar o grid, usando abstrações de dados. Deve fazer parte do
  [yii-dataview](https://github.com/yiisoft/yii-dataview).
- [x] Portar a lista, usando abstrações de dados. Deve fazer parte do
  [yii-dataview](https://github.com/yiisoft/yii-dataview).

## Validadores

- [x] Terminar o redesign do [pacote
  principal](https://github.com/yiisoft/validator)
- [x] Portar os validadores necessários

## Debug toolbar

- [x] Portar a debug toolbar.

## Gii

- [x] Portar o Gii.

## Infraestrutura

- [x] Cobrir o [config](https://github.com/yiisoft/config) com testes.
- [x] Lançar uma versão estável do
  [config](https://github.com/yiisoft/config).

## Outros

- [x] [Decidir sobre os
  namespaces](https://forum.yiiframework.com/t/lowercase-or-camelcase-namespaces/124983/52).
- [x] [Limpar o error
  handler](https://github.com/yiisoft/yii2/issues/14348). Garantir que o
  error handler capture erros fatais e use a resposta.
- [x] Tornar os validadores independentes dos models para permitir
  reutilizá-los em handlers.
- [x] [Dividir a
  IdentityInterface](https://github.com/yiisoft/yii2/issues/13825).
