# Immutability

Immutability berarti status (state) sebuah objek tidak dapat diubah setelah objek tersebut dibuat.
Alih-alih memodifikasi sebuah instance, Anda membuat instance baru dengan perubahan yang diinginkan.
Pendekatan ini umum untuk objek bernilai (value objects) seperti Money, ID, dan DTO. Ini membantu menghindari efek samping yang tidak disengaja:
metode tidak dapat diam-diam mengubah state yang dibagi, sehingga kode menjadi lebih mudah untuk dipahami.

## Perangkap mutable (yang kita hindari)

```php
// A shared base query built once and reused:
$base = Post::find()->where(['status' => Post::STATUS_PUBLISHED]);

// Somewhere deep in the code we only need one post:
$one = $base->limit(1)->one(); // mutates the underlying builder (sticky limit!)

// Later we reuse the same $base expecting a full list:
$list = $base->orderBy(['created_at' => SORT_DESC])->all();
// Oops: still limited to 1 because the previous limit(1) modified $base.
```

## Membuat objek immutable di PHP

Tidak ada cara langsung untuk memodifikasi sebuah instance, tetapi Anda dapat menggunakan clone untuk membuat instance baru dengan perubahan yang diinginkan.
Itulah yang dilakukan metode `with*`.

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

- Kita menandai kelas sebagai `final` untuk mencegah perubahan oleh subclass; sebagai alternatif, rancang ekstensi dengan hati-hati.
- Lakukan validasi di konstruktor dan metode `with*` sehingga setiap instance selalu valid.

> [!TIP]
> Jika Anda mendefinisikan DTO sederhana, Anda dapat menggunakan kata kunci `readonly` di PHP modern dan membiarkan properti `public`. Kata kunci `readonly` memastikan properti tidak dapat diubah setelah objek dibuat.

## Menggunakan clone (dan mengapa ini murah)

Clone PHP melakukan salinan dangkal (shallow copy) dari objek. Untuk objek nilai immutable yang hanya berisi skalar
atau objek immutable lainnya, cloning dangkal sudah cukup dan cepat. Di PHP modern, cloning objek nilai kecil
murah baik dari segi waktu maupun memori.

Jika objek Anda memegang sub-objek yang mutable dan juga harus disalin, implementasikan `__clone` untuk melakukan deep-clone pada sub-objek tersebut:

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

## Gaya penggunaan

- Bangun sebuah value object sekali lalu teruskan. Jika Anda perlu mengubahnya, gunakan metode `with*` yang mengembalikan instance baru.
- Utamakan field skalar/immutable di dalam objek immutable; jika sebuah field dapat berubah, isolasi dan lakukan deep-clone di `__clone` bila diperlukan.

Immutability sejalan dengan preferensi Yii untuk kode yang dapat diprediksi dan bebas efek samping, serta membuat layanan, caching,
dan konfigurasi menjadi lebih tangguh.
