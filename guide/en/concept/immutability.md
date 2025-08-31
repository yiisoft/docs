# Immutability

Immutability means an object's state cannot change after it has been created. 
Instead of modifying an instance, you create a new instance with the desired changes. 
This approach is common for value objects such as Money, IDs, and DTOs. It helps to avoid accidental side effects:
methods cannot silently change shared state, which makes code easier to reason about.

## Mutable pitfalls (what we avoid)

```php
// A shared base query built once and reused:
$base = Post::find()->where(['status' => Post::STATUS_PUBLISHED]);

// Somewhere deep in the code we only need one post:
$one = $base->limit(1)->one(); // mutates the underlying builder (sticky limit!)

// Later we reuse the same $base expecting a full list:
$list = $base->orderBy(['created_at' => SORT_DESC])->all();
// Oops: still limited to 1 because the previous limit(1) modified $base.
```

## Creating an immutable object in PHP

With modern PHP (8.2+), use `readonly` properties or a `readonly` class. 
That way, once constructed, properties cannot be reassigned at all. 
You still provide `with`- methods that return a new instance with changed data if you need to define an interface
or need validation.

```php
readonly final class Money
{
    public function __construct(
        public int $amount,
        public string $currency,
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
// $price is still 1000 USD, $discounted is 800 USD
```

- `readonly` prevents property reassignment after construction; attempting to do so is a runtime error.
- We mark the class `final` to prevent subclass mutations; alternatively, design for extension carefully.
- Validate in the constructor and `with*` methods so every instance is always valid.

## Using clone (and why it is cheap)

PHP's clone performs a shallow copy of the object. For immutable value objects that contain only scalars 
or other immutable objects, shallow cloning is enough and fast. In modern PHP, cloning small value objects is 
inexpensive in both time and memory.

If your object holds mutable sub-objects that must also be copied, implement `__clone` to deep-clone them:

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
        // Money is immutable in our example, so deep clone is not required.
        // If it were mutable, you could do: $this->total = clone $this->total;
    }

    public function withTotal(Money $total): self
    {
        $clone = clone $this;
        $clone->total = $total;
        return $clone;
    }
}
```

## Usage style

- Build a value object once and pass it around. If you need a change, use a `with*` method that returns a new instance.
- Prefer scalar/immutable fields inside immutable objects; if a field can mutate, isolate it and deep-clone in `__clone`
  when needed.

Immutability aligns well with Yii's preference for predictable, side-effect-free code and makes services, caching,
and configuration more robust.
