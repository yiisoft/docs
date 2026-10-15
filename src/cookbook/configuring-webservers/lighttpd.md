# Configuring web servers: lighttpd

To use [lighttpd](https://www.lighttpd.net/) >= 1.4.24, put `index.php` in the web root and add the following to the configuration:

```
url.rewrite-if-not-file = ("(.*)" => "/index.php/$0")
```

> [!IMPORTANT]
> Yii3 application templates write application logs to `stdout` by default and don't create log files.
> If you use PHP-FPM with lighttpd, [enable worker output capture](general.md#php-fpm).
> Otherwise, configure output capture for the PHP process or
> [use a file target](../../guide/runtime/logging.md#logging-to-files).
