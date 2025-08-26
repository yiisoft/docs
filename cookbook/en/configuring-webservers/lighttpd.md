# Configuring web servers: lighttpd

To use [lighttpd](https://www.lighttpd.net/) >= 1.4.24 put `index.php` to webroot and add the following to configuration:

```
url.rewrite-if-not-file = ("(.*)" => "/index.php/$0")
```
