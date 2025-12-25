# Configuring web servers: General

On a production server, if you don't use Docker, configure your web server to serve only the application's public files. 
Point the document root of your web server to the `app/public` folder.

> [!IMPORTANT]
> If you're running your Yii application behind a reverse proxy, you might need to configure
> [Trusted proxies and headers](../../guide/security/trusted-request.md).

## Specific server configurations

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
