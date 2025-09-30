# Events

Events memungkinkan Anda menjalankan kode kustom pada titik-titik eksekusi tertentu tanpa memodifikasi kode yang sudah ada.
Anda dapat melampirkan kode kustom yang disebut "handler" ke sebuah event sehingga ketika event tersebut dipicu, handler
akan dijalankan secara otomatis.

Contohnya, ketika seorang pengguna mendaftar, Anda perlu mengirim email sambutan. Anda bisa melakukannya langsung di
`SignupService` tetapi kemudian, ketika Anda juga perlu mengubah ukuran (resize) gambar avatar pengguna, Anda harus
mengubah kode `SignupService` lagi. Dengan kata lain, `SignupService` akan terikat (coupled) pada kode pengirim email dan
kode pengubah ukuran avatar.

Untuk menghindari hal itu, alih-alih menentukan apa yang harus dilakukan setelah pendaftaran secara eksplisit, Anda dapat
mengangkat (raise) event `UserSignedUp` lalu menyelesaikan proses pendaftaran. Kode pengirim email dan kode pengubah ukuran
avatar akan melampirkan handler ke event tersebut dan, oleh karena itu, akan dijalankan. Jika sewaktu-waktu Anda perlu melakukan
tindakan tambahan saat pendaftaran, Anda bisa menambahkan handler event tanpa memodifikasi `SignupService`.

Untuk menaikkan event dan melampirkan handler ke event-event tersebut, Yii menyediakan layanan khusus bernama event dispatcher.
Layanan ini tersedia dari paket [yiisoft/event-dispatcher](https://github.com/yiisoft/event-dispatcher).

## Event Handlers <span id="event-handlers"></span>

Event handler adalah sebuah [PHP callable](https://www.php.net/manual/en/language.types.callable.php) yang dijalankan
ketika event yang dilampirkannya dipicu.

Tanda tangan (signature) dari sebuah event handler adalah:

```php
function (EventClass $event) {
    // handle it
}
```

## Melampirkan event handlers <span id="attaching-event-handlers"></span>

Anda dapat melampirkan handler ke sebuah event seperti berikut:

```php
use Yiisoft\EventDispatcher\Provider\Provider;

final readonly class WelcomeEmailSender
{
    public function __construct(Provider $provider)
    {
        $provider->attach([$this, 'handleUserSignup']);
    }

    public function handleUserSignup(UserSignedUp $event)
    {
        // handle it    
    }
}
```

Metode `attach()` menerima sebuah callback. Berdasarkan tipe argumen callback tersebut, jenis event akan ditentukan.

## Urutan event handlers

Anda dapat melampirkan satu atau lebih handler ke sebuah event. Ketika sebuah event dipicu, handler yang terlampir
akan dipanggil sesuai urutan saat mereka dilampirkan pada event. Jika sebuah event mengimplementasikan
`Psr\EventDispatcher\StoppableEventInterface`, handler event dapat menghentikan eksekusi handler-handler berikutnya
jika `isPropagationStopped()` mengembalikan `true`.

Secara umum, lebih baik tidak bergantung pada urutan eksekusi handler event.

## Menaikkan event <span id="raising-events"></span>

Event dinaikkan (dispatched) seperti berikut:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

final readonly class SignupService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher
    )
    {
    }

    public function signup(SignupForm $form)
    {
        // handle signup

        $event = new UserSignedUp($form);
        $this->eventDispatcher->dispatch($event);
    }
}
```

Pertama, Anda membuat sebuah event dengan menyertakan data yang mungkin berguna bagi handler. Lalu Anda mendispatch event itu.

Kelas event itu sendiri dapat terlihat seperti berikut:

```php
final readonly class UserSignedUp
{
    public function __construct(
        public SignupForm $form
    )
    {
    }
}
```

## Hirarki Events

Events tidak memiliki nama atau pencocokan wildcard atas tujuan tertentu. Nama kelas event dan hirarki kelas/interface
serta komposisi dapat digunakan untuk mencapai fleksibilitas yang baik:

```php
interface DocumentEvent
{
}

final readonly class BeforeDocumentProcessed implements DocumentEvent
{
}

final readonly class AfterDocumentProcessed implements DocumentEvent
{
}
```

Dengan menggunakan interface, Anda dapat mendengarkan semua event yang berkaitan dengan dokumen:

```php
$provider->attach(function (DocumentEvent $event) {
    // log events here
});
``` 

## Melepas (detaching) event handlers <span id="detaching-event-handlers"></span>

Untuk melepas handler dari sebuah event Anda dapat memanggil metode `detach()`:

```php
$provider->detach(DocmentEvent::class);
```

## Mengonfigurasi event aplikasi

Biasanya Anda menugaskan (assign) event handler melalui konfigurasi aplikasi. Lihat ["Configuration"](configuration.md) untuk detail.
