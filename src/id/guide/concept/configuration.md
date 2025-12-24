# Konfigurasi

Ada banyak cara untuk mengonfigurasi aplikasi Anda. Kita akan fokus pada
konsep yang digunakan dalam [template proyek
default](https://github.com/yiisoft/app).

Konfigurasi Yii3 adalah bagian dari aplikasi. Anda dapat mengubah banyak
aspek cara kerja aplikasi dengan mengedit konfigurasi di bawah `config/`.

## Plugin konfigurasi

Dalam template aplikasi digunakan
[yiisoft/config](https://github.com/yiisoft/config). Karena menulis semua
konfigurasi aplikasi dari awal adalah proses yang melelahkan, banyak paket
menyediakan konfigurasi default, dan plugin ini membantu menyalin
konfigurasi tersebut ke dalam aplikasi.

Untuk menawarkan konfigurasi default, `composer.json` paket harus memiliki
bagian `config-plugin`. Saat menginstal atau memperbarui paket dengan
Composer, plugin membaca bagian `config-plugin` untuk setiap dependensi,
menyalin berkas-berkas tersebut ke `config/packages/` aplikasi jika belum
ada, dan menulis rencana penggabungan ke
`config/packages/merge_plan.php`. Rencana penggabungan mendefinisikan
bagaimana menggabungkan konfigurasi menjadi satu array besar yang siap
diteruskan ke [DI container](di-container.md).

Lihat apa yang ada di `composer.json` bawaan "yiisoft/app":

```json
"config-plugin-options": {
  "output-directory": "config/packages"
},
"config-plugin": {
    "common": "config/common/*.php",
    "params": [
        "config/params.php",
        "?config/params-local.php"
    ],
    "web": [
        "$common",
        "config/web/*.php"
    ],
    "console": [
        "$common",
        "config/console/*.php"
    ],
    "events": "config/events.php",
    "events-web": [
        "$events",
        "config/events-web.php"
    ],
    "events-console": [
        "$events",
        "config/events-console.php"
    ],
    "providers": "config/providers.php",
    "providers-web": [
        "$providers",
        "config/providers-web.php"
    ],
    "providers-console": [
        "$providers",
        "config/providers-console.php"
    ],
    "routes": "config/routes.php"
},
```

Terdapat banyak konfigurasi bernama yang didefinisikan. Untuk setiap nama,
ada sebuah konfigurasi.

Sebuah string berarti plugin mengambil konfigurasi apa adanya dan
menggabungkannya dengan konfigurasi bernama sama dari paket yang Anda
butuhkan. Hal ini terjadi jika paket-paket tersebut memiliki `config-plugin`
di `composer.json` mereka.

Array berarti plugin akan menggabungkan banyak berkas sesuai urutan yang
ditentukan.

`?` di awal path berkas menunjukkan bahwa berkas tersebut mungkin tidak
ada. Dalam kasus ini, berkas akan dilewati.

`$` di awal nama berarti referensi ke konfigurasi bernama lain.

`params` agak istimewa karena dicadangkan untuk parameter
aplikasi. Nilai-nilai ini otomatis tersedia sebagai `$params` di semua
berkas konfigurasi lainnya.

Anda dapat mempelajari lebih lanjut tentang fitur plugin konfigurasi [dari
dokumentasinya](https://github.com/yiisoft/config/blob/master/README.md).

## Berkas konfigurasi

Sekarang, setelah Anda tahu bagaimana plugin merangkai konfigurasi, lihat
direktori `config`:

```
common/
    application-parameters.php
    i18n.php
    router.php
console/
packages/
    yiisoft/
    dist.lock
    merge_plan.php
web/
    application.php
    psr17.php
events.php
events-console.php
events-web.php
params.php
providers.php
providers-console.php
providers-web.php
routes.php
```

### Konfigurasi container

Aplikasi terdiri dari sekumpulan layanan yang terdaftar di [dependency
container](di-container.md). Berkas konfigurasi yang bertanggung jawab atas
konfigurasi langsung dependency container berada di bawah direktori
`common/`, `console/` dan `web/`. Kita menggunakan `web/` untuk konfigurasi
khusus aplikasi web dan `console/` untuk konfigurasi khusus perintah
konsol. Baik web maupun console berbagi konfigurasi di bawah `common/`.

```php
<?php

declare(strict_types=1);

use App\ApplicationParameters;

/** @var array $params */

return [
    ApplicationParameters::class => [
        'class' => ApplicationParameters::class,
        'charset()' => [$params['app']['charset']],
        'name()' => [$params['app']['name']],
    ],
];
```

Plugin konfigurasi meneruskan variabel khusus `$params` ke semua berkas
konfigurasi. Potongan kode di atas meneruskan nilainya ke layanan.

Panduan tentang ["Dependency injection and container"](di-container.md)
menjelaskan format konfigurasi dan gagasan dependency injection secara
rinci.

Untuk kenyamanan, ada konvensi penamaan untuk kunci string kustom:

1. Awali dengan nama paket seperti `yiisoft/cache-file/custom-definition`.
2. Jika konfigurasi untuk aplikasi itu sendiri, lewati prefiks paket,
   mis. `custom-definition`.

### Service provider

Sebagai alternatif untuk mendaftarkan dependensi secara langsung, Anda dapat
menggunakan service provider. Pada dasarnya, ini adalah kelas yang, dengan
parameter tertentu, mengonfigurasi dan mendaftarkan layanan dalam
container. Mirip dengan tiga berkas konfigurasi dependency yang dijelaskan
sebelumnya, ada tiga konfigurasi untuk menentukan service provider:
`providers-console.php` untuk perintah konsol, `providers-web.php` untuk
aplikasi web dan `providers.php` untuk keduanya:

```php
/* @var array $params */

// ...
use App\Provider\CacheProvider;
use App\Provider\MiddlewareProvider;
// ...

return [
    // ...
    'yiisoft/yii-web/middleware' => MiddlewareProvider::class,
    'yiisoft/cache/cache' =>  [
        'class' => CacheProvider::class,
        '__construct()' => [
            $params['yiisoft/cache-file']['file-cache']['path'],
        ],
    ],
    // ...
```

Dalam konfigurasi ini kunci adalah nama provider. Menurut konvensi ini
berupa `vendor/package-name/provider-name`. Nilainya adalah nama kelas
provider. Kelas-kelas ini bisa dibuat di proyek itu sendiri atau disediakan
oleh paket.

Jika Anda perlu mengonfigurasi beberapa opsi untuk sebuah layanan, mirip
dengan konfigurasi container langsung, ambil nilai dari `$params` dan
teruskan ke provider.

Provider harus mengimplementasikan satu metode, `public function
register(Container $container): void`. Dalam metode ini Anda perlu
menambahkan layanan ke container menggunakan metode `set()`. Di bawah ini
contoh provider untuk layanan cache:

```php
use Psr\Container\ContainerInterface;
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;
use Yiisoft\Cache\File\FileCache;
use Yiisoft\Di\Container;
use Yiisoft\Di\Support\ServiceProvider;

final readonly class CacheProvider extends ServiceProvider
{
    public function __construct(
        private string $cachePath = '@runtime/cache'
    )
    {
        $this->cachePath = $cachePath;
    }

    public function register(Container $container): void
    {
        $container->set(CacheInterface::class, function (ContainerInterface $container) {
            $aliases = $container->get(Aliases::class);

            return new FileCache($aliases->get($this->cachePath));
        });

        $container->set(YiiCacheInterface::class, Cache::class);
    }
}
```

### Rute

Anda dapat mengonfigurasi bagaimana aplikasi web merespons URL tertentu di
`config/routes.php`:

```php
use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')->action([SiteController::class, 'index'])->name('site/index')
];
``` 

Baca lebih lanjut tentang ini di ["Routes"](../runtime/routing.md).

### Event

Banyak layanan memancarkan event tertentu yang dapat Anda kaitkan. Anda
dapat melakukannya melalui tiga berkas konfigurasi: `events-web.php` untuk
event aplikasi web, `events-console.php` untuk event konsol dan `events.php`
untuk keduanya. Konfigurasinya berupa array di mana kunci adalah nama event
dan nilainya adalah array handler:

```php
return [
    EventName::class => [
        // Just a regular closure, it will be called from the Dispatcher "as is".
        static fn (EventName $event) => someStuff($event),
        
        // A regular closure with an extra dependency. All the parameters after the first one (the event itself)
        // will be resolved from your DI container within `yiisoft/injector`.
        static fn (EventName $event, DependencyClass $dependency) => someStuff($event),
        
        // An example with a regular callable. If the `staticMethodName` method has some dependencies,
        // they will be resolved the same way as in the earlier example.
        [SomeClass::class, 'staticMethodName'],
        
        // Non-static methods are allowed too. In this case, `SomeClass` will be instantiated by your DI container.
        [SomeClass::class, 'methodName'],
        
        // An object of a class with the `__invoke` method implemented
        new InvokableClass(),
        
        // In this case, the `InvokableClass` with the `__invoke` method will be instantiated by your DI container
        InvokableClass::class,
        
        // Any definition of an invokable class may be here while your `$container->has('the definition)` 
        'di-alias'
    ],
];
```

Baca lebih lanjut di ["Events"](events.md).


### Parameter

Parameter di `config/params.php` menyimpan nilai konfigurasi yang digunakan
dalam berkas konfigurasi lain untuk mengonfigurasi layanan dan service
provider.

> [!TIP]
> Jangan gunakan parameter, konstanta, atau variabel lingkungan secara langsung dalam aplikasi Anda, konfigurasikan
> layanan sebagai gantinya.

`params.php` aplikasi bawaan terlihat seperti berikut:

```php
<?php

declare(strict_types=1);

use App\Command\Hello;
use App\ViewInjection\ContentViewInjection;
use App\ViewInjection\LayoutViewInjection;
use Yiisoft\Definitions\Reference;
use Yiisoft\Yii\View\CsrfViewInjection;

return [
    'app' => [
        'charset' => 'UTF-8',
        'locale' => 'en',
        'name' => 'My Project',
    ],

    'yiisoft/aliases' => [
        'aliases' => [
            '@root' => dirname(__DIR__),
            '@assets' => '@root/public/assets',
            '@assetsUrl' => '/assets',
            '@baseUrl' => '/',
            '@message' => '@root/resources/message',
            '@npm' => '@root/node_modules',
            '@public' => '@root/public',
            '@resources' => '@root/resources',
            '@runtime' => '@root/runtime',
            '@vendor' => '@root/vendor',
            '@layout' => '@resources/views/layout',
            '@views' => '@resources/views',
        ],
    ],

    'yiisoft/yii-view' => [
        'injections' => [
            Reference::to(ContentViewInjection::class),
            Reference::to(CsrfViewInjection::class),
            Reference::to(LayoutViewInjection::class),
        ],
    ],

    'yiisoft/yii-console' => [
        'commands' => [
            'hello' => Hello::class,
        ],
    ],
];
```

Untuk kenyamanan, ada konvensi penamaan mengenai parameter:

1. Kelompokkan parameter berdasarkan nama paket seperti
   `yiisoft/cache-file`.
2. Jika parameter untuk aplikasi itu sendiri, seperti pada `app`, lewati
   prefiks paket.
3. Jika ada banyak layanan dalam paket, seperti `file-target` dan
   `file-rotator` dalam paket `yiisoft/log-target-file`, kelompokkan
   parameter berdasarkan nama layanan.
4. Gunakan `enabled` sebagai nama parameter agar Anda dapat menonaktifkan
   atau mengaktifkan layanan, mis. `yiisoft/yii-debug`.

### Konfigurasi paket

Plugin konfigurasi yang dijelaskan menyalin konfigurasi paket default ke
direktori `packages/`. Setelah disalin, Anda memiliki konfigurasi tersebut,
sehingga Anda dapat menyesuaikannya sesuka hati. `yiisoft/` pada template
default mewakili vendor paket. Karena hanya paket `yiisoft` yang ada di
template, ada satu direktori. `merge_plan.php` digunakan saat runtime untuk
mendapatkan urutan bagaimana konfigurasi digabungkan. Perlu dicatat bahwa
untuk kunci konfigurasi harus ada satu sumber kebenaran. Satu konfigurasi
tidak dapat menimpa nilai konfigurasi lain.

`dist.lock` digunakan oleh plugin untuk melacak perubahan dan menampilkan
diff antara konfigurasi saat ini dan contoh konfigurasi.
