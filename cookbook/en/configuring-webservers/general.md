# Configuring web servers: General

On a production server, in case you're not using Docker, you should configure your Web server to serve
the application's public files only. Such a configuration requires pointing the document root of your Web server
to the `app/public` folder.

> Info: If you're running your Yii application behind a reverse proxy, you might need to configure
> [Trusted proxies and headers](../../../guide/en/security/trusted-request.md).

## Specific server configurations

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
