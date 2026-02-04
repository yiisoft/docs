# 配置 Web 服务器：lighttpd

要使用 [lighttpd](https://www.lighttpd.net/) >= 1.4.24，将 `index.php` 放在 Web 根目录中，并将以下内容添加到配置中：

```
url.rewrite-if-not-file = ("(.*)" => "/index.php/$0")
```
