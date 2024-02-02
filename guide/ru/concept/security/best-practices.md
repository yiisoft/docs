# Лучшие практики безопасности

Ниже мы рассмотрим общие принципы безопасности и опишем, как избежать угроз при разработке приложений с использованием Yii . Большинство из этих принципов не являются уникальными только для Yii, но применимы к разработке веб-сайтов или программного обеспечения в целом, так что вы также найдете ссылки для дальнейшего чтения об общих идеях, лежащих в их основе.

## Основные принципы

Независимо от того, какое приложение разрабатывается, существуют два основных принципа обеспечения безопасности:

1. Фильтрация ввода.
2. Экранирование вывода.


### Фильтрация ввода

Фильтрация ввода означает, что входные данные никогда не должны считаться безопасными и вы всегда должны проверять, являются ли полученные данные допустимыми. 
Например, если мы знаем, что сортировка может быть осуществлена только по трём полям `title`, `created_at` и `status`, и поле может передаваться через ввод пользователем, лучше проверить значение там, где мы его получили.
С точки зрения чистого PHP, это будет выглядеть следующим образом:

```php
$sortBy = $_GET['sort'];
if (!in_array($sortBy, ['title', 'created_at', 'status'])) {
	throw new \InvalidArgumentException('Invalid sort value.');
}
```

В Yii, вы, скорее всего, будете использовать [валидацию форм](../input/validation.md), чтобы делать такие проверки.

Дополнительная информация по теме:

- <https://owasp.org/www-community/vulnerabilities/Improper_Data_Validation>
- <https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html>


### Экранирование вывода

Экранирование вывода означает, что в зависимости от контекста, в котором вы используете данные, вам следует добавить к ними специальные символы, чтобы экранировать их значение.
В контексте HTML вы должны экранировать `<`, `>` и похожие специальные символы.
В контексте JavaScript или SQL это будет другой набор символов.
Так как ручное экранирование чревато ошибками, Yii предоставляет различные утилиты для экранирования в различных контекстах.

Дополнительная информация по теме:

- <https://owasp.org/www-community/attacks/Command_Injection>
- <https://owasp.org/www-community/attacks/Code_Injection>
- <https://owasp.org/www-community/attacks/xss/>


## Как избежать SQL-иньекций

SQL-иньекции происходят, когда текст запроса формируется склеиванием неэкранированных строк, как показано ниже:

```php
$username = $_GET['username'];
$sql = "SELECT * FROM user WHERE username = '$username'";
```

Вместо того, чтобы подставлять корректное имя пользователя, злоумышленник может передать в ваше приложение что-то вроде '; DROP TABLE user; --. В результате SQL будет следующий:

```sql
SELECT * FROM user WHERE username = ''; DROP TABLE user; --'
```

Это валидный запрос, который сначала будет искать пользователей с пустым именем, а затем удалит таблицу user. Скорее всего будет сломано приложение и будут потеряны данные (вы ведь делаете регулярное резервное копирование?).

Убедитесь, что либо вы напрямую используете подготовленные PDO запросы, либо это делает выбранная вами библиотека. 
В случае подготовленных запросов невозможно манипулированть запросом, как было продемонстрировано выше.

Если вы используете данные для указания имен столбцов или таблиц, лучше всего разрешить только предопределенный набор значений:

```php
function actionList($orderBy = null)
{
    if (!in_array($orderBy, ['name', 'status'])) {
        throw new \InvalidArgumentException('Only name and status are allowed to order by.');
    }
    
    // ...
}
```

Дополнительная информация по теме:

- <https://owasp.org/www-community/attacks/SQL_Injection>


## Avoiding XSS

XSS or cross-site scripting happens when output isn't escaped properly when outputting HTML to the browser. For example,
if user can enter his name and instead of `Alexander` he enters `<script>alert('Hello!');</script>`, every page that
outputs username without escaping it will execute JavaScript `alert('Hello!');` resulting in alert box popping up
in a browser. Depending on website instead of innocent alert, such a script could send messages using your name or even
perform bank transactions.

Avoiding XSS is quite easy in Yii. There are two cases:

1. You want to output data as plain text.
2. You want to output data as HTML.

If all you need is plain text, then escaping is as easy as following:


```php
<?= \Yiisoft\Html\Html::encode($username) ?>
```

If it should be HTML you could get some help from [HtmlPurifier](http://htmlpurifier.org/).
Note that HtmlPurifier processing is quite heavy, so consider adding caching.

Further reading on the topic:

- <https://owasp.org/www-community/attacks/xss/>


## Avoiding CSRF

CSRF is an abbreviation for cross-site request forgery. The idea is that many applications assume that requests coming
from a user browser are made by the user themselves. This assumption could be false.

For example, the website `an.example.com` has a `/logout` URL that, when accessed using a simple GET request, logs the user out. As long
as it's requested by the user themselves everything is OK, but one day bad guys are somehow posting
`<img src="http://an.example.com/logout">` on a forum the user often visits. The browser doesn't make any difference between
requesting an image or requesting a page so when the user opens a page with such a manipulated `<img>` tag,
the browser will send the GET request to that URL and the user will be logged out from `an.example.com`.

That's the basic idea of how a CSRF attack works. One can say that logging out a user isn't a serious thing.
However, this was just an example.
There are much more things one could do using this approach.
For example, triggering payments or changing data. Imagine that some website has a URL
`http://an.example.com/purse/transfer?to=anotherUser&amount=2000`. Accessing it using GET request, causes transfer of $2000
from an authorized user account to user `anotherUser`.
You know that the browser will always send GET request to load an image,
so you can change the code to accept only POST requests on that URL.
Unfortunately, this won't save you, because an attacker
can put some JavaScript code instead of `<img>` tag, which allows to send POST requests to that URL as well.

For this reason, Yii applies extra mechanisms to protect against CSRF attacks.

To avoid CSRF, you should always:

1. Follow HTTP specification. GET shouldn't change the application state.
   See [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html) for more details.
2. Keep Yii CSRF protection enabled.

Yii has CSRF protection as `Yiisoft\Yii\Web\Middleware\Csrf` middleware.
Make sure it's in your application middleware stack.

Further reading on the topic:

- <https://owasp.org/www-community/attacks/csrf>
- <https://owasp.org/www-community/SameSite>


## Avoiding file exposure

By default, server webroot is meant to be pointed to `public` directory where `index.php` is. In case of shared hosting
environments it could be impossible to achieve, so you'll end up with all the code, configs and logs in server webroot.

If so, don't forget to deny access to everything except `web`.
If it's impossible, consider hosting your application elsewhere.


## Avoiding debug info and tools in production

In debug mode, Yii shows quite verbose errors which are certainly helpful for development.
The thing is that these verbose errors are handy for attacker as well since these could reveal database structure,
configuration values and parts of your code.

Never run production applications with debugger or Gii accessible to everyone.
One could use it to get information about database structure,
code and to simply rewrite code with what's generated by Gii.

You should avoid the debug toolbar at production unless necessary.
It exposes all the application and config details possible.
If you absolutely need it, check twice you restrict access to your IP only.

Further reading on the topic:

- <https://owasp.org/www-project-.net/articles/Exception_Handling.md>
- <https://owasp.org/www-pdf-archive/OWASP_Top_10_2007.pdf>


## Using secure connection over TLS

Yii provides features that rely on cookies and/or PHP sessions. These can be vulnerable in case your connection is
compromised. The risk is reduced if the app uses secure connection via TLS (often referred to as [SSL](https://en.wikipedia.org/wiki/Transport_Layer_Security)).

Nowadays, anyone can get a certificate for free and automatically update it thanks to [Let's Encrypt](https://letsencrypt.org/).

## Secure server configuration

The purpose of this section is to highlight risks that need to be considered when creating a
server configuration for serving a Yii based website. Besides the points covered here there may
be other security related configuration options to be considered, so don't consider this section to
be complete.

### Avoiding `Host`-header attacks

If the webserver is configured to serve the same site independent of the value of the `Host` header,
this information mayn't be reliable and [may be faked by the user
sending the HTTP request](https://www.acunetix.com/vulnerabilities/web/host-header-attack).
In such situations, you should fix your webserver configuration to serve the site only for specified host names.

For more information about the server configuration, please refer to the documentation of your webserver:

- Apache 2: <https://httpd.apache.org/docs/trunk/vhosts/examples.html#defaultallports>
- Nginx: <https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/>

### Configuring SSL peer validation

There is a typical misconception about how to solve SSL certificate validation issues such as:

```
cURL error 60: SSL certificate problem: unable to get local issuer certificate
```

or

```
stream_socket_enable_crypto(): SSL operation failed with code 1. OpenSSL Error messages: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed
```

Many sources wrongly suggest disabling SSL peer verification.
That shouldn't be ever done since it enables man-in-the middle type of attacks.
Instead, PHP should be configured properly:

1. Download [https://curl.haxx.se/ca/cacert.pem](https://curl.haxx.se/ca/cacert.pem).
2. Add the following to your php.ini:
  ```
  openssl.cafile="/path/to/cacert.pem"
  curl.cainfo="/path/to/cacert.pem".
  ```

Note that you should keep the file up to date.

## References

- [OWASP top 10](https://owasp.org/Top10/)
- [The Basics of Web Application Security](https://martinfowler.com/articles/web-security-basics.html) by Martin Fowler
- [PHP manual: security](https://www.php.net/manual/en/security.php)
- [Information security at STackExchange](https://security.stackexchange.com/)

