# 018 - Widgets

Diferente das classes comuns, os widgets são usados em templates de view,
então a sintaxe é importante.  Ela deve ser fácil de escrever, fácil de ler
e não muito verbosa, porque construções parecidas são usadas repetidas
vezes.

## Nomes de classes

Os widgets não têm prefixo nem sufixo.

## Herança

A herança é permitida com algumas restrições:

- Se uma classe não é abstrata, ela deve ser final.
- A hierarquia deve ser mantida o mais linear possível.

## Imutabilidade

Os widgets devem:

- Não ter estado.
- Ser imutáveis.

## Métodos

### Nomes

- Diferente de outras classes, os métodos que retornam um clone do objeto
  com algumas propriedades modificadas não têm prefixo.
- Mantenha os nomes dos métodos o mais curtos possível, sem prejudicar a
  legibilidade.

### Flags booleanas

O método que corresponde a um atributo booleano deve ter o nome do atributo
e aceitar um argumento booleano como flag.
