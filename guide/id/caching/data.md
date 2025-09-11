# Caching data

Caching data adalah tentang menyimpan beberapa variabel PHP ke dalam cache
dan mengambilnya kembali dari cache.
Ini juga menjadi fondasi untuk fitur caching yang lebih lanjut, seperti
[caching halaman](page.md).

Untuk menggunakan cache, pasang paket
[yiisoft/cache](https://github.com/yiisoft/cache):

```shell
composer require yiisoft/cache
```

Kode berikut adalah pola penggunaan umum caching data, di mana `$cache`
merujuk ke
instance `Cache` dari paket tersebut:

```php
public function getTopProducts(\Yiisoft\Cache\CacheInterface $cache): array
{
    $key = ['top-products', $count = 10];
    
    // Try retrieving $data from cache.
    $data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
        // Can't find $data in a cache, calculate it from scratch.
        return getTopProductsFromDatabase($count);
    }, 3600);
    
    return $data;
}
```

Ketika cache memiliki data yang terkait dengan `$key`, ia akan mengembalikan
nilai yang di-cache.
Jika tidak, ia akan mengeksekusi fungsi anonim yang diberikan untuk
menghitung nilai yang akan di-cache dan dikembalikan.

Jika fungsi anonim membutuhkan beberapa data dari scope luar, Anda dapat
meneruskannya menggunakan pernyataan `use`.

## Cache handlers

Layanan cache menggunakan handler cache yang kompatibel dengan
[PSR-16](https://www.php-fig.org/psr/psr-16/) yang merepresentasikan
berbagai
penyimpanan cache, seperti memori, berkas, dan basis data.

Yii menyediakan handler berikut:

- `NullCache` — placeholder cache yang tidak melakukan caching nyata. Tujuan
  handler ini adalah menyederhanakan
    kode yang perlu memeriksa ketersediaan cache. Misalnya, selama
  pengembangan atau jika server tidak memiliki
    dukungan cache, Anda dapat mengonfigurasi layanan cache untuk
  menggunakan handler ini.
    Saat Anda mengaktifkan dukungan cache nyata, Anda dapat beralih
  menggunakan handler cache yang sesuai.
    Pada kedua kasus, Anda dapat menggunakan kode yang sama tanpa
  pemeriksaan tambahan.
- `ArrayCache` — menyediakan caching hanya untuk permintaan saat ini dengan
  menyimpan nilai dalam sebuah array.
- [APCu](https://github.com/yiisoft/cache-apcu) — menggunakan ekstensi PHP
  [APC](https://secure.php.net/manual/en/book.apc.php).
    Ini bisa dianggap sebagai opsi tercepat saat berurusan dengan cache
  untuk aplikasi terpusat (mis., satu
    server, tanpa load balancer khusus, dll.).
- [Database](https://github.com/yiisoft/cache-db) — menggunakan tabel basis
  data untuk menyimpan data yang di-cache.
- [File](https://github.com/yiisoft/cache-file) — menggunakan berkas standar
  untuk menyimpan data yang di-cache. Ini sangat cocok
    untuk menyimpan potongan data besar, seperti konten halaman.
- [Memcached](https://github.com/yiisoft/cache-memcached) — uses a PHP
  [memcached](https://secure.php.net/manual/en/book.memcached.php)
  extension. You can consider this option as the fastest one when dealing
  with cache in a distributed application
  (e.g., with several servers, load balancers, etc.)
- [Wincache](https://github.com/yiisoft/cache-wincache) — uses PHP [WinCache](https://iis.net/downloads/microsoft/wincache-extension)
  ([see also](https://secure.php.net/manual/en/book.wincache.php)) extension.

[Anda dapat menemukan lebih banyak handler di
packagist.org](https://packagist.org/providers/psr/simple-cache-implementation).

> [!TIP]
> Anda dapat menggunakan penyimpanan cache yang berbeda dalam aplikasi yang sama. Strategi umum adalah:
> - Gunakan penyimpanan cache berbasis memori untuk menyimpan data kecil tetapi sering digunakan (mis., statistik)
> - Gunakan penyimpanan cache berbasis berkas atau basis data untuk menyimpan data besar dan jarang digunakan (mis., konten halaman)

Handler cache biasanya disetel dalam [dependency injection
container](../concept/di-container.md) sehingga dapat
dikonfigurasi dan diakses secara global.

Karena semua handler cache mendukung kumpulan API yang sama, Anda dapat
menukar handler cache yang digunakan
dengan yang lain. Anda dapat melakukannya dengan mengonfigurasi ulang
aplikasi tanpa mengubah kode yang menggunakan cache.

### Cache keys

Sebuah kunci mengidentifikasi secara unik setiap item data yang disimpan di
cache. Saat Anda menyimpan sebuah item data,
Anda harus menentukan kunci untuknya. Nantinya, ketika Anda mengambil item
data tersebut, Anda perlu memberikan
kunci yang sesuai.

Anda dapat menggunakan string atau nilai arbitrer sebagai kunci
cache. Ketika kunci bukan string, ia akan
diserialisasi menjadi string secara otomatis.

Strategi umum dalam mendefinisikan kunci cache adalah menyertakan semua
faktor penentu dalam bentuk array.

Ketika aplikasi yang berbeda menggunakan penyimpanan cache yang sama, Anda
harus menentukan prefiks kunci cache yang unik
untuk setiap aplikasi guna menghindari konflik kunci cache.
Anda dapat melakukannya dengan menggunakan dekorator
`\Yiisoft\Cache\PrefixedCache`:

```php
$arrayCacheWithPrefix = new \Yiisoft\Cache\PrefixedCache(new \Yiisoft\Cache\ArrayCache(), 'myapp_');
$cache = new \Yiisoft\Cache\Cache($arrayCacheWithPrefix);
```

### Cache expiration

Item data yang disimpan di cache akan tetap di sana selamanya kecuali
dihapus karena beberapa kebijakan
caching. Misalnya, ruang cache penuh dan penyimpanan cache menghapus data
tertua.
Untuk mengubah perilaku ini, Anda dapat menyetel parameter TTL saat
memanggil metode untuk menyimpan item data:

```php
$ttl = 3600;
$data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
return getTopProductsFromDatabase($count);
}, $ttl);
```

Parameter `$ttl` menunjukkan berapa detik item data dapat tetap valid di
cache. Ketika Anda mengambil
item data tersebut, jika waktu kedaluwarsanya telah lewat, metode akan
mengeksekusi fungsi dan menyetel nilai yang dihasilkan
ke dalam cache.

You may set the default TTL for the cache:

```php
$cache = new \Yiisoft\Cache\Cache($arrayCache, 60 * 60); // 1 hour
```

Selain itu, Anda dapat menginvalidasi kunci cache secara eksplisit:

```php
$cache->remove($key);
```

### Invalidation dependencies

Selain pengaturan kedaluwarsa, perubahan pada yang disebut sebagai
**ketergantungan invalidasi** juga dapat menginvalidasi item data yang
di-cache.
Misalnya, `\Yiisoft\Cache\Dependency\FileDependency` merepresentasikan
ketergantungan pada waktu modifikasi sebuah berkas.
Ketika ketergantungan ini berubah, itu berarti ada sesuatu yang memodifikasi
berkas terkait.
Akibatnya, konten berkas yang usang yang ditemukan di cache harus
diinvalidasi.

Ketergantungan cache adalah objek dari kelas turunan
`\Yiisoft\Cache\Dependency\Dependency`. Ketika Anda
menyimpan sebuah item data ke cache, Anda dapat menyertakan objek
ketergantungan cache terkait. Contohnya,

```php
/**
 * @var callable $callable
 * @var \Yiisoft\Cache\CacheInterface $cache
 */

use Yiisoft\Cache\Dependency\TagDependency;

// Set many cache values marking both with a tag.
$cache->getOrSet('item_42_price', $callable, null, new TagDependency('item_42'));
$cache->getOrSet('item_42_total', $callable, 3600, new TagDependency('item_42'));

// Trigger invalidation by tag.
TagDependency::invalidate($cache, 'item_42');
```

Berikut ringkasan ketergantungan cache yang tersedia:

- `\Yiisoft\Cache\Dependency\ValueDependency`: menginvalidasi cache ketika
  nilai yang ditentukan berubah.
- `\Yiisoft\Cache\Dependency\CallbackDependency`: menginvalidasi cache
  ketika hasil dari callback PHP yang ditentukan
    berbeda.
- `\Yiisoft\Cache\Dependency\FileDependency`: menginvalidasi cache ketika
  waktu modifikasi terakhir berkas berbeda.
- `\Yiisoft\Cache\Dependency\TagDependency`: mengaitkan item data yang
  di-cache dengan satu atau banyak tag. Anda dapat menginvalidasi
    item data yang di-cache dengan tag tertentu dengan memanggil
  `TagDependency::invalidate()`.

Anda dapat mengombinasikan banyak ketergantungan menggunakan
`\Yiisoft\Cache\Dependency\AnyDependency` atau
`\Yiisoft\Cache\Dependency\AllDependencies`.

Untuk mengimplementasikan ketergantungan Anda sendiri, turunkan dari
`\Yiisoft\Cache\Dependency\Dependency`.

### Cache stampede prevention

[Cache stampede](https://en.wikipedia.org/wiki/Cache_stampede) adalah jenis
kegagalan berantai yang dapat terjadi ketika sistem komputasi paralel masif
dengan mekanisme cache berada di bawah beban tinggi.
Perilaku ini terkadang juga disebut dog-piling.

The `\Yiisoft\Cache\Cache` uses a built-in "Probably early expiration"
algorithm that prevents cache stampede.  This algorithm randomly fakes a
cache miss for one user while others are still served the cached value.  You
can control its behavior with the fifth optional parameter of `getOrSet()`,
which is a float value called `$beta`.  By default, beta is `1.0`, which is
usually enough.  The higher the value, the earlier cache will be re-created.

```php
/**
 * @var mixed $key
 * @var callable $callable
 * @var \DateInterval $ttl
 * @var \Yiisoft\Cache\CacheInterface $cache
 * @var \Yiisoft\Cache\Dependency\Dependency $dependency
 */

$beta = 2.0;
$cache->getOrSet($key, $callable, $ttl, $dependency, $beta);
```
