# 不可变性

不可变性是指对象在创建后其状态不能被改变。您不能修改一个已有实例，而是创建一个包含所需更改的新实例。这种方式常用于值对象，如 Money、ID 和
DTO。它有助于避免意外的副作用：方法不能静默修改共享状态，从而使代码更易于理解。

## 可变对象的陷阱（我们要避免的）

```php
// A shared base query built once and reused:
$base = Post::find()->where(['status' => Post::STATUS_PUBLISHED]);

// Somewhere deep in the code we only need one post:
$one = $base->limit(1)->one(); // mutates the underlying builder (sticky limit!)

// Later we reuse the same $base expecting a full list:
$list = $base->orderBy(['created_at' => SORT_DESC])->all();
// Oops: still limited to 1 because the previous limit(1) modified $base.
```

## 在 PHP 中创建不可变对象

PHP 中没有直接修改实例的方式，但可以使用 clone 创建一个包含所需更改的新实例。这正是 `with*` 方法的作用。

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
// $price is still 1000 USD, $discounted is 800 USD
```

- 将类标记为 `final` 以防止子类修改状态；也可以谨慎地设计以支持扩展。
- 在构造函数和 `with*` 方法中进行验证，确保每个实例始终处于有效状态。

> [!TIP]
> 如果您定义的是简单的 DTO，可以使用现代 PHP 的 `readonly` 关键字并将属性设为 `public`。`readonly` 关键字
> 可确保属性在对象创建后无法被修改。

## 使用 clone（以及为何开销低）

PHP 的 clone 对对象执行浅拷贝。对于只包含标量或其他不可变对象的不可变值对象，浅拷贝已经足够且速度很快。在现代 PHP
中，克隆小型值对象在时间和内存方面的开销都很低。

如果对象持有也需要复制的可变子对象，请实现 `__clone` 来对其进行深拷贝：

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
        // Money is immutable in our example, so a deep clone is not required.
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

## 使用风格

- 一次性构建值对象并传递使用。如需更改，使用返回新实例的 `with*` 方法。
- 不可变对象内部优先使用标量或不可变字段；如果某个字段可能发生变化，请将其隔离，并在需要时在 `__clone` 中对其进行深拷贝。

不可变性与 Yii 对可预测、无副作用代码的偏好高度契合，能使服务、缓存和配置更加健壮。
