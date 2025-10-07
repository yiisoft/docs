# Class autoloading

Karena Yii menggunakan [Composer](https://getcomposer.org) untuk mengelola
paket, Yii secara otomatis memuat kelas dari paket-paket tersebut
tanpa perlu melakukan `require` file-nya secara eksplisit.
Saat Composer memasang paket, ia menghasilkan sebuah [autoloader yang
kompatibel PSR-4](https://www.php-fig.org/psr/psr-4/).
Untuk menggunakannya, lakukan `require_once` terhadap autoloader
`/vendor/autoload.php` di file entry point `index.php` Anda.

Anda dapat menggunakan autoloader tidak hanya untuk paket yang diinstal,
tetapi juga untuk aplikasi Anda sendiri karena aplikasi Anda juga merupakan
sebuah paket.
Untuk memuat kelas-kelas dari namespace tertentu, tambahkan berikut ini ke
`composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Di mana `App\\` adalah namespace akar dan `src/` adalah direktori tempat
kelas-kelas Anda berada. Anda dapat menambahkan lebih banyak sumber (source
roots) jika
diperlukan. Setelah selesai, jalankan `composer dump-autoload` atau cukup
`composer du` dan kelas-kelas dari namespace terkait
akan mulai dimuat secara otomatis.

Jika Anda membutuhkan autoloading khusus lingkungan pengembangan yang tidak
digunakan saat menjalankan Composer dengan flag `--no-dev`,
tambahkan ke bagian `autoload-dev` alih-alih `autoload`.

## Referensi

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Panduan Composer tentang
  autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
