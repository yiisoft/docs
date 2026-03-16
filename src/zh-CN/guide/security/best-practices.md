# 安全最佳实践

下面，我们将回顾常见的安全原则，并描述在使用 Yii 开发应用程序时如何避免威胁。这些原则中的大多数并非 Yii
独有，而是适用于一般的网站或软件开发，因此您还会找到有关这些背后一般思想的进一步阅读链接。


## 基本原则

无论开发哪种应用程序，在安全方面都有两个主要原则：

1. 过滤输入。
2. 转义输出。


### 过滤输入

过滤输入意味着您永远不应该认为输入是安全的，您应该始终检查您获得的值是否确实在允许的值之中。例如，如果您知道您按三个字段
`title`、`created_at` 和 `status` 排序，并且该字段来自用户输入，最好在接收它的地方检查您获得的值。就基本 PHP
而言，看起来如下：

```php
$sortBy = $_GET['sort'];
if (!in_array($sortBy, ['title', 'created_at', 'status'])) {
	throw new \InvalidArgumentException('Invalid sort value.');
}
```

在 Yii 中，您很可能会使用表单验证来进行类似的检查。

有关该主题的进一步阅读：

- <https://owasp.org/www-community/vulnerabilities/Improper_Data_Validation>
- <https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html>


### 转义输出

转义输出意味着，根据您使用数据的上下文，
您应该在其前面加上特殊字符以消除其特殊含义。
在 HTML 上下文中，您应该转义 `<`、`>` 和类似的特殊字符。
在 JavaScript 或 SQL 的上下文中，它将是一组不同的字符。
由于手动转义容易出错，Yii 提供了各种工具来在不同上下文中执行转义。

有关该主题的进一步阅读：

- <https://owasp.org/www-community/attacks/Command_Injection>
- <https://owasp.org/www-community/attacks/Code_Injection>
- <https://owasp.org/www-community/attacks/xss/>


## 避免 SQL 注入

SQL 注入发生在您通过连接未转义的字符串来形成查询文本时，如下所示：

```php
$username = $_GET['username'];
$sql = "SELECT * FROM user WHERE username = '$username'";
```

攻击者可以给您的应用程序提供类似 `'; DROP TABLE user; --` 的内容，而不是提供正确的用户名。结果 SQL 将如下所示：

```sql
SELECT * FROM user WHERE username = ''; DROP TABLE user; --'
```

这是一个有效的查询，它将搜索用户名为空的用户，然后删除 `user` 表，很可能导致网站损坏和数据丢失（您已经设置了定期备份，对吧？）。

确保直接使用 PDO 预处理语句，或确保您喜欢的库正在这样做。在预处理语句的情况下，不可能像上面演示的那样操纵查询。

如果您使用数据来指定列名或表名，最好的做法是只允许预定义的值集：
 
```php
function actionList($orderBy = null)
{
    if (!in_array($orderBy, ['name', 'status'])) {
        throw new \InvalidArgumentException('Only name and status are allowed to order by.');
    }
    
    // ...
}
```

有关该主题的进一步阅读：

- <https://owasp.org/www-community/attacks/SQL_Injection>


## 避免 XSS

XSS 或跨站脚本攻击发生在向浏览器输出 HTML 时输出未正确转义的情况下。例如，
如果用户可以输入他的名字，而不是 `Alexander`，他输入 `<script>alert('Hello!');</script>`，每个
输出用户名而不转义它的页面都将执行 JavaScript `alert('Hello!');`，导致警告框在
浏览器中弹出。根据网站的不同，这样的脚本可以使用您的名字发送消息，甚至
执行银行交易，而不是无害的警告。

在 Yii 中避免 XSS 非常容易。有两种情况：

1. 您想将数据输出为纯文本。
2. 您想将数据输出为 HTML。

如果您只需要纯文本，那么转义就像下面这样简单：


```php
<?= \Yiisoft\Html\Html::encode($username) ?>
```

如果它应该是 HTML，您可以从 [HtmlPurifier](http://htmlpurifier.org/)
获得一些帮助。请注意，HtmlPurifier 处理相当繁重，因此请考虑添加缓存。

有关该主题的进一步阅读：

- <https://owasp.org/www-community/attacks/xss/>


## 避免 CSRF

CSRF 是跨站请求伪造的缩写。其思想是许多应用程序假设来自用户浏览器的请求是由用户自己发出的。这个假设可能是错误的。

例如，网站 `an.example.com` 有一个 `/logout` URL，当使用简单的 GET 请求访问时，会将用户注销。只要
它是由用户自己请求的，一切都很好，但有一天坏人以某种方式在用户经常访问的论坛上发布
`<img src="http://an.example.com/logout">`。浏览器在
请求图像或请求页面之间没有任何区别，因此当用户打开带有这样一个被操纵的 `<img>` 标签的页面时，
浏览器将向该 URL 发送 GET 请求，用户将从 `an.example.com` 注销。

这就是 CSRF 攻击工作原理的基本思想。有人可能会说注销用户不是什么严重的事情。
然而，这只是一个例子。
使用这种方法可以做更多的事情。
例如，触发付款或更改数据。想象一下某个网站有一个 URL
`http://an.example.com/purse/transfer?to=anotherUser&amount=2000`。使用 GET 请求访问它，会导致
从授权用户帐户向用户 `anotherUser` 转账 $2000。
您知道浏览器总是会发送 GET 请求来加载图像，
因此您可以更改代码以仅接受该 URL 上的 POST 请求。
不幸的是，这不会拯救您，因为攻击者
可以放置一些 JavaScript 代码而不是 `<img>` 标签，这也允许向该 URL 发送 POST 请求。

因此，Yii 应用额外的机制来防止 CSRF 攻击。

为了避免 CSRF，您应该始终：

1. 遵循 HTTP 规范。GET 不应该改变应用程序状态。有关更多详细信息，请参阅
   [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html)。
2. 保持 Yii CSRF 保护启用。

Yii 将 CSRF 保护作为 `Yiisoft\Yii\Web\Middleware\Csrf` 中间件。确保它在您的应用程序中间件堆栈中。

有关该主题的进一步阅读：

- <https://owasp.org/www-community/attacks/csrf>
- <https://owasp.org/www-community/SameSite>


## 避免文件暴露

默认情况下，服务器 webroot 应该指向 `index.php` 所在的 `public` 目录。在共享托管
环境的情况下，这可能无法实现，因此您最终会将所有代码、配置和日志放在服务器 webroot 中。

如果是这样，请记住拒绝访问除 `web` 之外的所有内容。如果不可能，请考虑在其他地方托管您的应用程序。


## 避免在生产环境中使用调试信息和工具

在调试模式下，Yii 显示相当详细的错误，这对开发肯定有帮助。问题是这些详细的错误对攻击者也很方便，因为它们可能会泄露数据库结构、配置值和部分代码。

永远不要在调试器或 Gii 可供所有人访问的情况下运行生产应用程序。有人可以使用它来获取有关数据库结构、代码的信息，并简单地用 Gii
生成的内容重写代码。

除非必要，否则应避免在生产环境中使用调试工具栏。它会暴露所有可能的应用程序和配置详细信息。如果您绝对需要它，请仔细检查您是否仅限制对您的 IP 的访问。

有关该主题的进一步阅读：

- <https://owasp.org/www-project-.net/articles/Exception_Handling.md>
- <https://owasp.org/www-pdf-archive/OWASP_Top_10_2007.pdf>


## 通过 TLS 使用安全连接

Yii 提供依赖于 cookie 和/或 PHP 会话的功能。如果您的连接受到威胁，这些可能会受到攻击。如果应用程序通过 TLS 使用安全连接（通常称为
[SSL](https://en.wikipedia.org/wiki/Transport_Layer_Security)），则风险会降低。

如今，任何人都可以免费获得证书并自动更新它，这要归功于 [Let's Encrypt](https://letsencrypt.org/)。

## 安全的服务器配置

本节的目的是强调在为基于 Yii
的网站创建服务器配置时需要考虑的风险。除了这里涵盖的要点之外，可能还有其他与安全相关的配置选项需要考虑，因此不要认为本节是完整的。

### 避免 `Host` 头攻击

如果 Web 服务器配置为独立于 `Host` 头的值提供相同的站点，则此信息可能不可靠，并且[可能被发送 HTTP
请求的用户伪造](https://www.acunetix.com/vulnerabilities/web/host-header-attack)。在这种情况下，您应该修复您的
Web 服务器配置，以仅为指定的主机名提供站点。

有关服务器配置的更多信息，请参阅您的 Web 服务器的文档：

- Apache 2:
  <https://httpd.apache.org/docs/trunk/vhosts/examples.html#defaultallports>
- Nginx:
  <https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/>

### 配置 SSL 对等验证

关于如何解决 SSL 证书验证问题存在一个典型的误解，例如：

```
cURL error 60: SSL certificate problem: unable to get local issuer certificate
```

或

```
stream_socket_enable_crypto(): SSL operation failed with code 1. OpenSSL Error messages: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed
```

许多来源错误地建议禁用 SSL 对等验证。这永远不应该这样做，因为它会启用中间人类型的攻击。相反，应该正确配置 PHP：

1. 下载
   [https://curl.haxx.se/ca/cacert.pem](https://curl.haxx.se/ca/cacert.pem)。
2. 将以下内容添加到您的 php.ini：
  ```
  openssl.cafile="/path/to/cacert.pem"
  curl.cainfo="/path/to/cacert.pem".
  ```

请注意，您应该保持文件最新。

## 参考资料

- [OWASP top 10](https://owasp.org/Top10/)
- [The Basics of Web Application
  Security](https://martinfowler.com/articles/web-security-basics.html) by
  Martin Fowler
- [PHP manual: security](https://www.php.net/manual/en/security.php)
- [Information security at
  STackExchange](https://security.stackexchange.com/)

