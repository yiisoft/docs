# Aliases

Anda dapat menggunakan alias untuk merepresentasikan path file atau URL
sehingga Anda tidak perlu menulis path absolut atau URL secara hard-code di
proyek Anda. Sebuah alias harus diawali karakter `@` agar dapat dibedakan
dari path file dan URL biasa. Alias yang
didefinisikan tanpa `@` di awal akan diprefiks otomatis dengan karakter `@`.

Aplikasi Yii bawaan memiliki beberapa alias yang sudah didefinisikan di
`config/params.php`. Misalnya, alias `@public` merepresentasikan
path web root; `@baseUrl` merepresentasikan URL dasar untuk aplikasi Web
yang sedang berjalan.

## Defining aliases <span id="defining-aliases"></span>

Anda dapat mendefinisikan sebuah alias melalui `config/params.php` aplikasi:

```php
return [
    // ...
    
    'yiisoft/aliases' => [
        'aliases' => [
            // ...
        
            // an alias of a file path
            '@foo' => '/path/to/foo',
        
            // an alias of a URL
            '@bar' => 'https://www.example.com',
        
            // an alias of a concrete file that contains a \foo\Bar class 
            '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
        ],
    ],
];
```

> [!NOTE]
> Path file atau URL yang dialias tidak harus selalu merujuk pada file atau sumber daya yang benar-benar ada.

Dengan alias yang telah didefinisikan, Anda dapat menurunkan alias baru
dengan menambahkan garis miring `/` diikuti satu atau beberapa segmen path.
Sebagai contoh, `@foo` adalah alias akar (root), sedangkan
`@foo/bar/file.php` adalah alias turunan.

Anda dapat mendefinisikan sebuah alias menggunakan alias lain (baik alias
akar maupun turunan):

```php
'@foobar' => '@foo/bar',
```

The `yiisoft/aliases` parameter initializes `Aliases` service from
[`yiisoft/aliases`](https://github.com/yiisoft/aliases) package.  You can
set extra aliases in runtime by using the service:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Menggunakan aliases di konfigurasi <span id="using-aliases-in-configuration"></span>

Disarankan untuk me-resolve alias pada level konfigurasi, sehingga service
menerima URL dan path sebagai string siap pakai:

```php
<?php

declare(strict_types=1);

use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\File\FileCache;

/* @var $params array */

return [
    FileCache::class => static fn (Aliases $aliases) => new FileCache(
        $aliases->get($params['yiisoft/cache-file']['fileCache']['path'])
    ),
];
```

## Me-resolve alias <span id="resolving-aliases"></span>

Anda dapat menggunakan layanan `Aliases`:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // https://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

Path/URL yang direpresentasikan oleh alias turunan ditentukan dengan
mengganti bagian alias akar dengan path/URL yang sesuai
pada alias turunan tersebut.

> [!NOTE]
> Metode `get()` tidak memeriksa apakah path/URL hasilnya merujuk pada file atau sumber daya yang ada.


Alias akar juga dapat berisi karakter garis miring `/`. Metode `get()` cukup
cerdas untuk menentukan bagian mana
dari sebuah alias yang merupakan alias akar, sehingga dapat menentukan path
file atau URL yang sesuai dengan benar:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@foo', '/path/to/foo');
    $aliases->set('@foo/bar', '/path2/bar');

    $aliases->get('@foo/test/file.php'); // /path/to/foo/test/file.php
    $aliases->get('@foo/bar/file.php'); // /path2/bar/file.php
} 
```

Jika `@foo/bar` tidak didefinisikan sebagai alias akar, pernyataan terakhir
akan menghasilkan `/path/to/foo/bar/file.php`.


## Alias bawaan <span id="predefined-aliases"></span>

[Aplikasi Yii](https://github.com/yiisoft/app) mendefinisikan serangkaian
alias untuk mereferensikan path file dan URL yang umum digunakan:

- `@root` - direktori dasar dari aplikasi yang sedang berjalan.
- `@assets` - direktori publik aplikasi tempat aset dipublikasikan.
- `@assetsUrl` - URL direktori dasar tempat aset dipublikasikan.
- `@baseUrl` - URL dasar aplikasi Web yang sedang berjalan. Bawaannya `/`.
- `@npm` - direktori paket Node.
- `@bower` - direktori paket bower.
- `@vendor` - direktori `vendor` milik Composer.
- `@public` - direktori publik aplikasi yang berisi `index.php`.
- `@runtime` - path runtime aplikasi yang sedang berjalan. Bawaannya
  `@root/runtime`.
- `@layout` - direktori berkas layout.
- `@resources` - direktori yang berisi view, sumber aset, dan sumber daya
  lainnya.
- `@views` - direktori dasar template view aplikasi.
