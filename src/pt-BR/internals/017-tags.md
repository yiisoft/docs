# 017 - Tags

Diferente das classes comuns, as tags são usadas em templates de view, então
a sintaxe é importante.  Ela deve ser fácil de escrever, fácil de ler e não
muito verbosa, porque construções parecidas são usadas repetidas vezes.

## Nomes de classes

- As tags não têm prefixo nem sufixo, a menos que sejam uma classe base
  abstrata.
- Se a tag representa uma especificação, use o nome usado na especificação.

## Herança

A herança é permitida com algumas restrições:

- Se uma classe não é abstrata, ela deve ser final.
- A hierarquia deve ser mantida o mais linear possível.

## Imutabilidade

As tags devem:

- Não ter estado.
- Ser imutáveis. Todo método que modifica uma configuração retorna um clone
  com a configuração alterada.
- Não ter efeitos colaterais. Várias chamadas do mesmo método com o mesmo
  argumento devem dar o mesmo resultado.

## Métodos

### Nomes

- Diferente de outras classes, os métodos que retornam um clone do objeto
  com algumas propriedades modificadas não têm prefixo.
- Mantenha os nomes dos métodos o mais curtos possível, sem prejudicar a
  legibilidade.
- Se a tag representa uma especificação, use o nome usado na especificação.

### Flags booleanas

O método que corresponde a um atributo booleano deve ter o nome do atributo
e aceitar um argumento booleano como flag.
