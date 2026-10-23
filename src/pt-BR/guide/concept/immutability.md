# Imutabilidade

Imutabilidade significa que o estado de um objeto não pode mudar depois que
ele é criado.  Em vez de modificar uma instância, você cria uma nova
instância com as mudanças desejadas.  Essa abordagem é comum em value
objects como Money, IDs e DTOs. Ela ajuda a evitar efeitos colaterais
acidentais: os métodos não conseguem alterar silenciosamente um estado
compartilhado, o que torna o código mais fácil de entender.

## Armadilhas da mutabilidade (o que evitamos)

```php
// Uma query base compartilhada, montada uma vez e reutilizada:
$base = Post::find()->where(['status' => Post::STATUS_PUBLISHED]);

// Em algum lugar profundo do código, precisamos de um só post:
$one = $base->limit(1)->one(); // altera o builder subjacente (o limit fica grudado!)

// Depois reutilizamos o mesmo $base esperando a lista completa:
$list = $base->orderBy(['created_at' => SORT_DESC])->all();
// Ops: continua limitado a 1, porque o limit(1) anterior modificou $base.
```

## Criando um objeto imutável em PHP

Não há como modificar uma instância diretamente, mas você pode usar clone
para criar uma nova instância com as mudanças desejadas.  É isso que os
métodos `with*` fazem.

```php
final class Money
{
    public function __construct(
        private int $amount,
        private string $currency,
    ) {
        $this->validateAmount($amount);
        $this->validateCurrency($currency);
    }
    
    private function validateAmount(string $amount) 
    {
     if ($amount < 0) {
            throw new InvalidArgumentException('Amount must be positive.');
        }
    }
    
    private function validateCurrency(string $currency)
    {
        if (!in_array($currency, ['USD', 'EUR'])) {
            throw new InvalidArgumentException('Invalid currency. Only USD and EUR are supported.');
        }
    } 

    public function withAmount(int $amount): self
    {
        $this->validateAmount($amount);
    
        if ($amount === $this->amount) {
            return $this;
        }
    
        $clone = clone $this;
        $clone->amount = $amount;
        return $clone;
    }
    
    public function withCurrency(string $currency): self
    {
        $this->validateCurrency($currency);
    
        if ($currency === $this->currency) {
            return $this;
        }
    
        $clone = clone $this;
        $clone->currency = $currency;
        return $clone;
    }
    
    public function amount(): int 
    {
        return $this->amount;
    }
    
    public function currency(): string 
    {
        return $this->currency;
    }

    public function add(self $money): self
    {
        if ($money->currency !== $this->currency) {
            throw new InvalidArgumentException('Currency mismatch. Cannot add money of different currency.');
        }
        return $this->withAmount($this->amount + $money->amount);
    }
}

$price = new Money(1000, 'USD');
$discounted = $price->withAmount(800);
// $price continua 1000 USD, $discounted é 800 USD
```

- Marcamos a classe como `final` para impedir mutações por subclasses; como
  alternativa, projete a extensão com cuidado.
- Valide no construtor e nos métodos `with*`, para que toda instância seja
  sempre válida.

> [!TIP]
> Se você define um DTO simples, pode usar o `readonly` do PHP moderno e deixar as propriedades `public`. A palavra-chave `readonly`
> garante que as propriedades não possam ser modificadas depois que o objeto é criado.

## Usando clone (e por que é barato)

O clone do PHP faz uma cópia rasa do objeto. Para value objects imutáveis
que contêm apenas escalares ou outros objetos imutáveis, a clonagem rasa é
suficiente e rápida. No PHP moderno, clonar value objects pequenos é barato
em tempo e em memória.

Se o seu objeto guarda subobjetos mutáveis que também precisam ser copiados,
implemente `__clone` para fazer a clonagem profunda deles:

```php
final class Order
{
    public function __construct(
        private Money $total
    ) {}
    
    public function total(): Money 
    {
        return $this->total;
    }

    public function __clone(): void
    {
        // Money é imutável no nosso exemplo, então a clonagem profunda não é necessária.
        // Se fosse mutável, você poderia fazer: $this->total = clone $this->total;
    }

    public function withTotal(Money $total): self
    {
        $clone = clone $this;
        $clone->total = $total;
        return $clone;
    }
}
```

## Estilo de uso

- Crie um value object uma vez e passe-o adiante. Se precisar de uma
  mudança, use um método `with*` que retorna uma nova instância.
- Prefira campos escalares/imutáveis dentro de objetos imutáveis; se um
  campo puder mudar, isole-o e faça a clonagem profunda em `__clone` quando
  necessário.

A imutabilidade combina bem com a preferência do Yii por código previsível e
sem efeitos colaterais, e torna serviços, cache e configuração mais
robustos.
