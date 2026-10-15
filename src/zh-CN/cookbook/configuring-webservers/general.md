# 配置 Web 服务器：通用

在生产服务器上，如果你不使用 Docker，请配置你的 Web 服务器仅提供应用程序的公共文件。将 Web 服务器的文档根目录指向
`app/public` 文件夹。

> [!IMPORTANT]
> 如果你在反向代理后面运行 Yii 应用程序，可能需要配置
> [受信任的代理和标头](../../guide/security/trusted-request.md)。

## Application logs

Yii3 application templates write application logs to standard output
(`stdout`, or `php://stdout`) by default.  They don't create application log
files. Standard error (`stderr`) requires explicit log target
configuration.  Docker collects container output, but on a server without
containers you must configure where that output goes or [configure a file
target](../../guide/runtime/logging.md#logging-to-files).  Web server access
and error log settings don't configure Yii's log targets.

### PHP-FPM

If your web server uses PHP-FPM, enable worker output capture in the
application's PHP-FPM pool configuration:

```ini
catch_workers_output = yes
```

Reload PHP-FPM after changing its configuration. PHP-FPM sends worker
standard output and standard error to its main error log. The `error_log`
directive in `php-fpm.conf` sets the destination.  Without this setting,
PHP-FPM redirects both streams to `/dev/null` by default.  See the [PHP-FPM
configuration
reference](https://www.php.net/manual/en/install.fpm.configuration.php).

## 特定服务器配置

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
