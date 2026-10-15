# 配置 Web 服务器：Nginx

To use [Nginx](https:/nginx.org/), install PHP as an [FPM
SAPI](https://secure.php.net/install.fpm).  Use the following Nginx
configuration, replacing `path/to/app/public` with the actual path for
`app/public` and `mysite.test` with the actual hostname to serve.

```nginx
server {
    charset utf-8;
    client_max_body_size 128M;

    listen 80; ## 监听 ipv4
    #listen [::]:80 default_server ipv6only=on; ## 监听 ipv6

    server_name mysite.test;
    root        /path/to/app/public;
    index       index.php;

    access_log  /path/to/basic/log/access.log;
    error_log   /path/to/basic/log/error.log;

    location / {
        # 将所有不是真实文件的请求重定向到 index.php
        try_files $uri $uri/ /index.php$is_args$args;
    }

    # 取消注释以避免 Yii 处理对不存在的静态文件的调用
    #location ~ \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
    #    try_files $uri =404;
    #}
    #error_page 404 /404.html;

    # 拒绝访问 /assets 目录中的 php 文件
    location ~ ^/assets/.*\.php$ {
        deny all;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass 127.0.0.1:9000;
        #fastcgi_pass unix:/var/run/php8-fpm.sock;
        try_files $uri =404;
        fastcgi_param APP_ENV "dev";
    }

    location ~* /\. {
        deny all;
    }
}
```

使用此配置时，还要在 `php.ini` 文件中设置 `cgi.fix_pathinfo=0`，以避免许多不必要的系统 `stat()` 调用。

另外，请注意，当运行 HTTPS 服务器时，需要添加 `fastcgi_param HTTPS on;`，以便 Yii 可以检测连接是否安全。

In the above, note the usage of `fastcgi_param APP_ENV`. Since Yii3
application templates use environment variables, this is a possible place to
set them. In production environment remember to set `APP_ENV` to `prod`.

The Nginx `access_log` and `error_log` directives above don't capture
PHP-FPM worker output.  See [application logs](general.md#application-logs)
for logging configuration.
