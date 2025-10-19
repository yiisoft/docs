# Configuring web servers: lighttpd

To use [lighttpd](https://www.lighttpd.net/) >= 1.4.24, put `index.php` in the web root and add the following to the configuration:

```
url.rewrite-if-not-file = ("(.*)" => "/index.php/$0")
```
