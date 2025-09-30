# Dependency injection dan container

## Dependency injection <span id="dependency-injection"></span>

Ada dua cara untuk menggunakan kembali (re-use) sesuatu dalam OOP: pewarisan (inheritance) dan komposisi (composition).

Pewarisan itu sederhana:

```php
class Cache
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget extends Cache
{
    public function render(): string
    {
        $output = $this->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

Masalahnya, kedua kelas ini menjadi saling terkait secara berlebihan (coupled) atau saling bergantung sehingga menjadi lebih rapuh.

Cara lain untuk menangani ini adalah komposisi:


```php
interface CacheInterface
{
    public function getCachedValue($key);
}

final readonly class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget
{
    public function __construct(
        private CacheInterface $cache
    )
    {
    }
    
    public function render(): string
    {
        $output = $this->cache->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

Kita menghindari pewarisan yang tidak perlu dan menggunakan interface untuk mengurangi keterikatan (coupling). Anda dapat mengganti implementasi cache tanpa mengubah `CachedWidget`, sehingga komponennya menjadi lebih stabil.

`CacheInterface` di sini adalah sebuah dependency: sebuah objek yang menjadi ketergantungan objek lain.
Proses memasukkan instance dependency ke dalam objek (`CachedWidget`) disebut dependency injection.
Ada banyak cara untuk melakukannya:

- Injeksi konstruktor (Constructor injection). Terbaik untuk dependency yang wajib.
- Injeksi metode (Method injection). Terbaik untuk dependency yang opsional.
- Injeksi properti (Property injection). Sebaiknya dihindari di PHP kecuali mungkin untuk data transfer object.


## DI container <span id="di-container"></span>

Menginjeksikan dependency dasar itu sederhana dan mudah. Anda memilih tempat di mana Anda tidak peduli tentang dependency,
biasanya sebuah action handler (penangan aksi), yang biasanya tidak akan Anda unit-test, membuat instance dependency yang dibutuhkan
dan meneruskannya ke kelas-kelas yang bergantung.

Cara ini bekerja baik saat jumlah dependency sedikit dan tidak ada dependency bersarang. Ketika jumlahnya banyak dan setiap dependency
memiliki dependency sendiri, membuat keseluruhan hirarki menjadi proses yang melelahkan, membutuhkan banyak kode, dan dapat menyebabkan
kesalahan yang sulit dideteksi.

Selain itu, banyak dependency, seperti pembungkus (wrapper) API pihak ketiga tertentu, sama untuk setiap kelas yang menggunakannya.
Jadi masuk akal untuk:

- Menentukan cara membuat instance pembungkus API tersebut sekali saja.
- Membuatnya saat diperlukan dan hanya sekali per permintaan.

Itulah fungsi dependency container.

Dependency injection (DI) container adalah sebuah objek yang tahu bagaimana membuat dan mengonfigurasi objek serta
semua objek dependensinya. [Artikel Martin Fowler](https://martinfowler.com/articles/injection.html) menjelaskan dengan baik
mengapa DI container berguna. Di sini kita akan menjelaskan penggunaan DI container yang disediakan oleh Yii.

Yii menyediakan fitur DI container melalui paket [yiisoft/di](https://github.com/yiisoft/di) dan
paket [yiisoft/injector](https://github.com/yiisoft/injector).

### Mengonfigurasi container <span id="configuring-container"></span>

Karena untuk membuat objek baru Anda membutuhkan dependency-nya, Anda harus mendaftarkannya sedini mungkin.
Anda dapat melakukannya di konfigurasi aplikasi, mis. `config/web.php`. Untuk layanan berikut:

```php
final class MyService implements MyServiceInterface
{
    public function __construct(int $amount)
    {
    }

    public function setDiscount(int $discount): void
    {
    
    }
}
```

konfigurasinya bisa seperti:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

Itu setara dengan:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

Ada metode tambahan untuk mendeklarasikan dependency:

```php
return [
    // declare a class for an interface, resolve dependencies automatically
    EngineInterface::class => EngineMarkOne::class,

    // array definition (same as above)
    'full_definition' => [
        'class' => EngineMarkOne::class,
        '__construct()' => [42], 
        '$propertyName' => 'value',
        'setX()' => [42],
    ],

    // closure
    'closure' => static function(ContainerInterface $container) {
        return new MyClass($container->get('db'));
    },

    // static call
    'static_call' => [MyFactory::class, 'create'],

    // instance of an object
    'object' => new MyClass(),
];
```

### Menginjeksikan dependency <span id="injecting-dependencies"></span>

Mereferensikan container secara langsung dalam sebuah kelas adalah ide yang buruk karena kode menjadi tidak generik, terikat pada antarmuka container
dan, yang lebih buruk, dependency menjadi tersembunyi. Karena itu, Yii membalik kontrol dengan secara otomatis menginjeksikan
objek dari container ke beberapa konstruktor dan metode berdasarkan tipe argumen metode.

Ini terutama dilakukan pada konstruktor dan metode penangan aksi:

```php
use \Yiisoft\Cache\CacheInterface;

final readonly class MyController
{
    public function __construct(
        private CacheInterface $cache
    )
    {
        $this->cache = $cache;    
    }

    public function actionDashboard(RevenueReport $report)
    {
        $reportData = $this->cache->getOrSet('revenue_report', function() use ($report) {
            return $report->getData();               
        });

        return $this->render('dashboard', [
           'reportData' => $reportData,
        ]);
    }
}
```

Karena [yiisoft/injector](https://github.com/yiisoft/injector) yang membuat dan memanggil action handler, ia
memeriksa tipe argumen konstruktor dan metode, mengambil dependency dengan tipe tersebut dari container dan meneruskannya sebagai argumen. Hal ini biasanya disebut auto-wiring. Ini juga berlaku untuk sub-dependency: jika Anda tidak memberikan dependency secara eksplisit, container akan memeriksa apakah ia memiliki dependency tersebut terlebih dahulu.
Cukup deklarasikan dependency yang Anda butuhkan, dan dependency itu akan diambil dari container secara otomatis.


## Referensi <span id="references"></span>

- [Inversion of Control Containers and the Dependency Injection pattern by Martin Fowler](https://martinfowler.com/articles/injection.html)
