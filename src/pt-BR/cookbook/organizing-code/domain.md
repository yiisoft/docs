# Domínio

O domínio, ou modelo de domínio, é o que torna o projeto único. Com os requisitos e a terminologia do problema a ser resolvido
em mente (o contexto do problema), você constrói uma abstração composta por entidades, seus relacionamentos e a lógica que
opera essas entidades. Para focar na parte complexa do problema, o domínio, idealmente, fica separado da
 parte de infraestrutura do sistema (como salvar dados no banco de dados, como montar a resposta HTTP etc.).

> [!NOTE]
> Esse isolamento é adequado para sistemas complexos. Se o domínio do seu projeto é basicamente criar/ler/atualizar/excluir
> um conjunto de registros sem muita lógica complexa, não faz sentido aplicar uma solução complexa a um problema simples.
> Os conceitos individuais de design de domínio abaixo podem ser aplicados separadamente, então vale conferi-los mesmo que o seu
> projeto não seja tão complicado. 

## Bounded context

É quase impossível construir um modelo que resolva vários problemas sem que
ele mesmo fique complicado demais. Por isso, é uma boa prática dividir o
domínio em vários casos de uso e ter um modelo separado para cada um.  Esses
modelos separados são chamados de "bounded contexts".

## Blocos de construção

Existem vários blocos de construção normalmente usados para descrever
modelos de domínio. Não é obrigatório usar todos.

### Entidade

Entidade é um objeto identificável de forma única, como um usuário, um
produto, um pagamento etc. Ao comparar entidades, você verifica o ID, não os
valores dos atributos. Se dois objetos têm atributos diferentes, mas o mesmo
ID, eles são considerados a mesma coisa.

### Value object

Um value object descreve um objeto por suas características. Por exemplo, um
preço composto por valor e moeda. Ao comparar esses objetos, você verifica
os valores de fato. Se eles coincidem, os objetos são considerados iguais.

### Agregado

Agregado é um conjunto de objetos de domínio, como entidades e value
objects, e dados adicionais que podem ser tratados como uma única
unidade. Ele geralmente representa um objeto composto do modelo de domínio,
como um pedido de loja ou o dossiê de uma pessoa no RH.

Um dos componentes de um agregado é chamado de raiz. A raiz identifica o
agregado como um todo e deve ser usada para acessá-lo.

### Evento de domínio

Um agregado, ao ser processado, pode disparar eventos. Por exemplo, quando
um pedido é confirmado, o evento `OrderConfirmed` é disparado para que
outras partes do sistema possam reagir a ele.

### Data transfer object

Data transfer object, ou DTO, é um objeto cujo único propósito é guardar
dados como estão. Ele é comumente usado para passar dados entre diferentes
serviços.

### Serviço

Serviço é uma classe que contém uma operação independente dentro do contexto
do seu modelo de domínio. Veja "[componentes de serviço](service.md)".

### Repositório

A tarefa do repositório é abstrair como os objetos de domínio são
obtidos. Ele geralmente é dividido em duas partes: uma interface, que fica
na camada de domínio, e uma implementação, que fica na camada de
infraestrutura. Dessa forma, o domínio não se importa com como os dados são
obtidos e salvos e pode se concentrar na lógica de negócio complicada.

O repositório geralmente é implementado como um serviço.

### Instanciando os blocos de construção

Entidades, value objects, agregados e eventos de domínio não são serviços e
não devem ser instanciados pelo container de DI.  Use `new` para criá-los.

## Referências

- [BoundedContext, por Martin
  Fowler](https://martinfowler.com/bliki/BoundedContext.html)
- [ValueObject, por Martin
  Fowler](https://martinfowler.com/bliki/ValueObject.html)
- [Aggregate, por Martin
  Fowler](https://martinfowler.com/bliki/DDD_Aggregate.html)

