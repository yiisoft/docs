# Inmutabilidad

La inmutabilidad significa que el estado de un objeto no puede cambiar
después de crearlo. En lugar de modificar una instancia, creas una nueva
instancia con los cambios deseados. Este enfoque es habitual en los objetos
de valor, como Money, los identificadores y los DTO. Ayuda a evitar efectos
secundarios accidentales: los métodos no pueden cambiar en silencio un
estado compartido, lo que hace que el código sea más fácil de entender.

## Problemas de la mutabilidad (lo que evitamos)

```php
// Una consulta base compartida que se construye una vez y se reutiliza:
$base = Post::find()->where(['status' => Post::STATUS_PUBLISHED]);

// En algún lugar profundo del código solo necesitamos un post:
$one = $base->limit(1)->one(); // modifica el query builder subyacente (¡el límite se queda pegado!)

// Más tarde reutilizamos el mismo $base esperando una lista completa:
$list = $base->orderBy(['created_at' => SORT_DESC])->all();
// Vaya: sigue limitado a 1 porque el limit(1) anterior modificó $base.
```

## Crear un objeto inmutable en PHP

No hay una forma directa de modificar una instancia, pero puedes usar clone
para crear una nueva instancia con los cambios deseados. Eso es lo que hacen
los métodos `with*`.

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
// $price sigue siendo 1000 USD y $discounted es 800 USD
```

- Marcamos la clase como `final` para evitar mutaciones en subclases; otra
  opción es diseñarla con cuidado para que se pueda extender.
- Valida en el constructor y en los métodos `with*` para que todas las
  instancias sean siempre válidas.

> [!TIP]
> Si defines un DTO sencillo, puedes usar `readonly` del PHP moderno y dejar las propiedades como `public`. La palabra clave `readonly`
> garantiza que las propiedades no se puedan modificar después de crear el objeto.

## Usar clone (y por qué es barato)

El clone de PHP hace una copia superficial del objeto. En los objetos de
valor inmutables que solo contienen escalares u otros objetos inmutables, la
clonación superficial es suficiente y rápida. En el PHP moderno, clonar
objetos de valor pequeños es barato tanto en tiempo como en memoria.

Si tu objeto contiene subobjetos mutables que también hay que copiar,
implementa `__clone` para clonarlos en profundidad:

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
        // En nuestro ejemplo, Money es inmutable, así que no hace falta una clonación profunda.
        // Si fuera mutable, podrías hacer: $this->total = clone $this->total;
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

- Construye un objeto de valor una vez y pásalo de un lado a otro. Si
  necesitas un cambio, usa un método `with*` que devuelva una nueva
  instancia.
- Usa preferentemente campos escalares o inmutables dentro de los objetos
  inmutables; si un campo puede mutar, aíslalo y clónalo en profundidad en
  `__clone` cuando haga falta.

La inmutabilidad encaja bien con la preferencia de Yii por un código
predecible y sin efectos secundarios, y hace que los servicios, la caché y
la configuración sean más robustos.
