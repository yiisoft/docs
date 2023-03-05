# Panduan Definitif untuk Yii 3.0

Panduan ini dirilis di bawah [Ketentuan Dokumentasi Yii](http://www.yiiframework.com/doc/terms/).

Pengenalan +
------------

* [Tentang Yii](intro/what-is-yii.md) +
* [Memutakhirkan dari versi 2.0](intro/upgrade-from-v2.md) +


Mulai -
---------------

* [Apa yang perlu kamu ketahui](start/prerequisites.md) +
* [Menginstal Yii](start/installation.md) +
* [Menjalankan Aplikasi](start/workflow.md) +
* [Mengucapkan halo](start/hello.md) +
* [Bekerja Dengan Formulir](start/forms.md) +
* [Bekerja Dengan Basis Data](start/databases.md) !
* [Menghasilkan Kode dengan Gii](start/gii.md) -
* [Melihat ke depan](start/looking-ahead.md) +


Struktur Aplikasi +
---------------------

* [Application Structure Overview](structure/overview.md) +
* [Entry Scripts](structure/entry-script.md) +
* [Application](structure/application.md) +
* [Service components](structure/service.md) +
* [Actions](structure/action.md) +
* [Domain](structure/domain.md) +
* [Middleware](structure/middleware.md) +
* [Packages](structure/package.md) +

Konsep Dasar -
------------

* [Class autoloading](concept/autoloading.md) +
* [Dependency Injection Container](concept/di-container.md) +
* [Configuration](concept/configuration.md) +
* [Aliases](concept/aliases.md) +
* [Events](concept/events.md) +

Menangani Permintaan -
-----------------

* [Request Handling Overview](runtime/overview.md) -
* [Bootstrapping](runtime/bootstrapping.md) -
* [Routing and URL generation](runtime/routing.md) +
* [Request](runtime/request.md) +
* [Response](runtime/response.md) +
* [Sessions](runtime/sessions.md) +
* [Cookies](runtime/cookies.md) +
* [Flash messages](runtime/flash-messages.md) -
* [Handling Errors](runtime/handling-errors.md) !
* [Logging](runtime/logging.md) +

Tampilan -
-----

* [Views](views/view.md) -
* [Widgets](views/widget.md) -
* [Assets](views/asset.md) -
* [Bekerja dengan Skrip Klien](views/client-scripts.md) -
* [Theming](views/theming.md) -
* [Template Engines](views/template-engines.md) -


Bekerja Dengan Basis Data -
----------------------

* [Database Access Objects](db-dao.md): Menghubungkan ke basis data, permintaan dasar,transaksi, dan manipulasi skema
* [Query Builder](db-query-builder.md): Meminta basis data menggunakan lapisan abstraksi sederhana
* [Active Record](db-active-record.md): Active Record ORM, mengambil dan memanipulasi catatan, dan mendefinisikan hubungan
* [Migrations](db-migrations.md): Terapkan versi kontrol ke basis data Anda di lingkungan pengembangan tim

Mendapatkan Data dari Pengguna -
-----------------------

* [Membuat Formulir](input/forms.md) -
* [Memvalidasi Input](input/validation.md) -
* [Mengunggah File](input/file-upload.md) -
* [Mengumpulkan Input Tabular](input/tabular-input.md) -


Menampilkan Data -
---------------

* [Data Formatting](output/formatting.md) -
* [Pagination](output/pagination.md) -
* [Sorting](output/sorting.md) -
* [Data Providers](output/data-providers.md) -
* [Data Widgets](output/data-widgets.md) -

Keamanan +-
--------

* [Ikhtisar Overview](security/overview.md) +
* [Autentikasi](security/authentication.md) +
* [Otorisasi](security/authorization.md) +-
* [Bekerja dengan Kata Sandi](security/passwords.md) +
* [Kriptografi](security/cryptography.md) +
* [Praktik terbaik](security/best-practices.md) +


Caching -
-------

* [Ikhtisar Caching](caching/overview.md) -
* [Data Caching](caching/data.md) -
* [Fragment Caching](caching/fragment.md) -
* [Page Caching](caching/page.md) -
* [HTTP Caching](caching/http.md) -


RESTful Web Services -
--------------------

* [Mulai cepat](rest/quick-start.md)
* [Resources](rest/resources.md)
* [Controllers](rest/controllers.md)
* [Routing](rest/routing.md)
* [Authentication](rest/authentication.md)
* [Rate Limiting](rest/rate-limiting.md)
* [Versioning](rest/versioning.md)
* [Error Handling](rest/error-handling.md)

Alat Pengembangan -
-----------------

* Debug Toolbar and Debugger
* Membuat Kode menggunakan Gii
* Membuat Dokumentasi API


Pengujian -
-------

* [Ikhtisar Pengujian](testing/overview.md)
* [Pengaturan lingkungan pengujian](testing/environment-setup.md)
* [Unit Tests](testing/unit.md)
* [Functional Tests](testing/functional.md)
* [Acceptance Tests](testing/acceptance.md)
* [Fixtures](testing/fixtures.md)


Topik Khusus -
--------------

* [Membangun Aplikasi dari Awal](tutorial/start-from-scratch.md) -
* [Aplikasi Konsol](tutorial/console-applications.md) +
* [Docker](tutorial/docker.md) -
* [Penginternasionalan](tutorial/i18n.md) -
* [Mailing](tutorial/mailing.md) -
* [Penyesuaian Kinerja](tutorial/performance-tuning.md) +
* [Menggunakan Yii dengan event loop](tutorial/using-with-event-loop.md) +
* [Menggunakan Yii dengan RoadRunner](tutorial/using-yii-with-roadrunner.md) +
* [Menggunakan Yii dengan Swoole](using-yii-with-swoole.md) +

Widgets -
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap Widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


Helpers -
-------

* [Helpers Overview](helper-overview.md)
* [ArrayHelper](helper/array.md)
* [Html](helper-html.md)
* [Url](helper-url.md)

Lainnya
------

* [Glosarium](glossary.md)
