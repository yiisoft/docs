# Konfigurasi

Ada banyak cara untuk mengonfigurasi aplikasi Anda. Kita akan fokus pada konsep yang digunakan dalam
[template proyek default](https://github.com/yiisoft/app).

Konfigurasi Yii3 adalah bagian dari aplikasi. Anda dapat mengubah banyak aspek cara kerja aplikasi dengan mengedit
konfigurasi di dalam `config/`.

## Plugin konfigurasi

Dalam template aplikasi digunakan [yiisoft/config](https://github.com/yiisoft/config). Karena menulis seluruh konfigurasi
aplikasi dari awal adalah proses yang melelahkan, banyak paket menawarkan konfigurasi default, dan plugin membantu
menyalin konfigurasi-konfigurasi tersebut ke dalam aplikasi.

Untuk menawarkan konfigurasi default, `composer.json` dari paket harus memiliki bagian `config-plugin`.
Saat memasang atau memperbarui paket dengan Composer, plugin membaca bagian `config-plugin` untuk setiap dependensi,
menyalin berkas-berkas tersebut ke `config/packages/` aplikasi jika belum ada dan menulis rencana penggabungan ke
`config/packages/merge_plan.php`. Rencana penggabungan mendefinisikan bagaimana menggabungkan konfigurasi-konfigurasi menjadi
satu array besar yang siap diteruskan ke [DI container](di-container.md).

Lihat apa yang ada di `composer.json` "yiisoft/app" secara default:

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

Terdapat banyak konfigurasi bernama. Untuk setiap nama ada sebuah konfigurasi.

String berarti plugin mengambil konfigurasi apa adanya dan menggabungkannya dengan konfigurasi bernama sama dari paket yang Anda butuhkan.
Hal ini terjadi jika paket-paket tersebut memiliki `config-plugin` di `composer.json` mereka.

Array berarti plugin akan menggabungkan banyak berkas sesuai urutan yang ditentukan.

`?` di awal jalur berkas menunjukkan bahwa berkas tersebut mungkin tidak ada. Dalam kasus ini, berkas dilewati.

`$` di awal nama berarti referensi ke konfigurasi bernama lain.

`params` agak istimewa karena dicadangkan untuk parameter aplikasi. Ini otomatis tersedia sebagai `$params` di semua berkas konfigurasi lainnya.

Anda dapat mempelajari lebih lanjut tentang fitur plugin konfigurasi [dari dokumentasinya](https://github.com/yiisoft/config/blob/master/README.md).

## Berkas konfigurasi

Sekarang, setelah Anda tahu bagaimana plugin merakit konfigurasi, lihat direktori `config`:

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

Aplikasi terdiri dari sekumpulan layanan yang terdaftar di dalam [dependency container](di-container.md). Berkas-berkas konfigurasi
yang bertanggung jawab untuk konfigurasi langsung dependency container berada di bawah direktori `common/`, `console/` dan `web/`.
Kita menggunakan `web/` untuk konfigurasi spesifik aplikasi web dan `console/` untuk konfigurasi spesifik perintah konsol. Baik web maupun
console berbagi konfigurasi di bawah `common/`.

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

Plugin konfigurasi meneruskan variabel khusus `$params` ke semua berkas konfigurasi.
Kode di atas meneruskan nilainya ke layanan.

Panduan ["Dependency injection and container"](di-container.md) menjelaskan
format konfigurasi dan gagasan dependency injection secara rinci.

Untuk kenyamanan, ada konvensi penamaan untuk kunci string kustom:

1. Awali dengan nama paket seperti `yiisoft/cache-file/custom-definition`.
2. Jika konfigurasi untuk aplikasi itu sendiri, lewati prefix paket, misalnya `custom-definition`.

### Service provider

Sebagai alternatif mendaftarkan dependensi secara langsung, Anda dapat menggunakan service provider. Pada dasarnya, ini adalah kelas-kelas yang
mengonfigurasi dan mendaftarkan layanan di dalam container berdasarkan parameter yang diberikan. Mirip dengan tiga berkas konfigurasi
dependensi yang dijelaskan sebelumnya, ada tiga konfigurasi untuk menentukan service provider: `providers-console.php` untuk perintah konsol,
`providers-web.php` untuk aplikasi web dan `providers.php` untuk keduanya:

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

Dalam konfigurasi ini kunci adalah nama provider. Menurut konvensi, ini berupa `vendor/package-name/provider-name`. Nilai adalah nama kelas provider.
Kelas-kelas ini bisa dibuat dalam proyek itu sendiri atau disediakan oleh paket.

Jika Anda perlu mengonfigurasi beberapa opsi untuk sebuah layanan, mirip dengan konfigurasi container langsung, ambil nilai
dari `$params` dan teruskan ke provider.

Provider harus mengimplementasikan satu metode, `public function register(Container $container): void`. Dalam metode ini Anda
perlu menambahkan layanan ke container menggunakan metode `set()`. Di bawah ini adalah contoh provider untuk layanan cache:

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

### Routes

Anda dapat mengonfigurasi bagaimana aplikasi web merespons URL tertentu di `config/routes.php`:

```php
use App\Controller\SiteController;
use Yiisoft\Router\Route;

return [
    Route::get('/')->action([SiteController::class, 'index'])->name('site/index')
];
``` 

Baca lebih lanjut tentang ini di ["Routes"](../runtime/routing.md).

### Events

Banyak layanan memancarkan event tertentu yang bisa Anda lampirkan (attach).
Anda dapat melakukannya melalui tiga berkas konfigurasi: `events-web.php` untuk event aplikasi web,
`events-console.php` untuk event konsol dan `events.php` untuk keduanya.
Konfigurasinya adalah sebuah array di mana kunci adalah nama event dan nilainya adalah array handler:

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

Read more about it in ["Events"](events.md).


Baca lebih lanjut mengenai ini di ["Events"](events.md).

### Parameter

Parameter pada `config/params.php` menyimpan nilai konfigurasi yang digunakan di berkas konfigurasi lain untuk mengonfigurasi layanan
dan service provider.

> [!TIP]
> Jangan menggunakan parameter, konstanta, atau variabel environment secara langsung di aplikasi Anda; konfigurasikan
> layanan sebagai gantinya.

Params `params.php` aplikasi default terlihat seperti berikut:

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

Untuk kenyamanan, terdapat konvensi penamaan mengenai parameter:

1. Kelompokkan parameter berdasarkan nama paket seperti `yiisoft/cache-file`.
2. Jika parameter untuk aplikasi itu sendiri, seperti `app`, lewati prefix paket.
3. Jika terdapat banyak layanan dalam paket, seperti `file-target` dan `file-rotator` di paket `yiisoft/log-target-file`,
   kelompokkan parameter berdasarkan nama layanan.
4. Gunakan `enabled` sebagai nama parameter agar dapat menonaktifkan atau mengaktifkan sebuah layanan, misalnya `yiisoft/yii-debug`.

### Konfigurasi paket

Plugin konfigurasi yang dijelaskan menyalin konfigurasi paket default ke direktori `packages/`. Setelah disalin Anda
menjadi pemilik konfigurasi tersebut, sehingga Anda dapat menyesuaikannya sesuka hati. `yiisoft/` dalam template default menunjukkan vendor paket. Karena
hanya paket `yiisoft` yang ada di template, terdapat satu direktori. `merge_plan.php` digunakan saat runtime untuk mendapatkan urutan
bagaimana konfigurasi-konfigurasi digabungkan.
Perlu dicatat bahwa untuk kunci konfigurasi seharusnya ada satu sumber kebenaran (single source of truth).
Satu konfigurasi tidak bisa menimpa nilai dari konfigurasi lain.

`dist.lock` digunakan oleh plugin untuk melacak perubahan dan menampilkan diff antara konfigurasi saat ini dan contoh.
