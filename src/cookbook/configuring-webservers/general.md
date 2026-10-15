# Configuring web servers: General

On a production server, if you don't use Docker, configure your web server to serve only the application's public files. 
Point the document root of your web server to the `app/public` folder.

> [!IMPORTANT]
> If you're running your Yii application behind a reverse proxy, you might need to configure
> [Trusted proxies and headers](../../guide/security/trusted-request.md).

## Application logs

The Yii3 application template writes application logs to standard output (`stdout`, or `php://stdout`) by default.
It doesn't create application log files. Standard error (`stderr`) requires explicit log target configuration.
Docker collects container output, but on a server without containers you must configure where that output goes
or [configure a file target](../../guide/runtime/logging.md#logging-to-files).
Web server access and error log settings don't configure Yii's log targets.

### PHP-FPM

If your web server uses PHP-FPM, enable worker output capture in the application's PHP-FPM pool configuration:

```ini
catch_workers_output = yes
```

Reload PHP-FPM after changing its configuration. Worker standard output and standard error will go to PHP-FPM's
main error log, whose destination is configured by `error_log` in `php-fpm.conf`.
Without this setting, PHP-FPM redirects both streams to `/dev/null` by default.
See the [PHP-FPM configuration reference](https://www.php.net/manual/en/install.fpm.configuration.php).

## Specific server configurations

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
