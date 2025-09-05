# Caching

Caching adalah cara yang murah dan efektif untuk meningkatkan performa
aplikasi.
Dengan menyimpan data yang relatif statis di cache dan menyajikannya dari
cache saat diminta,
aplikasi menghemat waktu yang sebaliknya diperlukan untuk menghasilkan data
dari awal setiap kali.

Caching dapat terjadi pada berbagai level dan lokasi dalam sebuah
aplikasi. Di sisi server, pada level rendah,
cache dapat digunakan untuk menyimpan data dasar, seperti daftar artikel
terbaru yang diambil dari basis data;
dan pada level yang lebih tinggi, cache dapat digunakan untuk menyimpan
fragmen atau seluruh halaman web, seperti hasil rendering
artikel terbaru. Di sisi klien, Anda dapat menggunakan HTTP caching untuk
menyimpan konten halaman yang terakhir dikunjungi
di cache browser.

Yii mendukung semua mekanisme caching berikut:

* [Data caching](data.md)
* [Fragment caching](fragment.md)
* [Page caching](page.md)
* [HTTP caching](http.md)
