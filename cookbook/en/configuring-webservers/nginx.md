# Configuring web servers: Nginx

To use [Nginx](https://wiki.nginx.org/), install PHP as an [FPM SAPI](https://secure.php.net/install.fpm).
Use the following Nginx configuration, replacing `path/to/app/public` with the actual path for
`app/public` and `mysite.test` with the actual hostname to serve.

```nginx
server {
    charset utf-8;
    client_max_body_size 128M;

    listen 80; ## listen for ipv4
    #listen [::]:80 default_server ipv6only=on; ## listen for ipv6

    server_name mysite.test;
    root        /path/to/app/public;
    index       index.php;

    access_log  /path/to/basic/log/access.log;
    error_log   /path/to/basic/log/error.log;

    location / {
        # Redirect everything that isn't a real file to index.php
        try_files $uri $uri/ /index.php$is_args$args;
    }

    # uncomment to avoid processing of calls to non-existing static files by Yii
    #location ~ \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
    #    try_files $uri =404;
    #}
    #error_page 404 /404.html;

    # deny accessing php files for the /assets directory
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

When you use this configuration, also set `cgi.fix_pathinfo=0` in the `php.ini` file
to avoid many unnecessary system `stat()` calls.

Also, note that when running an HTTPS server, you need to add `fastcgi_param HTTPS on;` so that Yii
can detect if a connection is secure.

In the above, note the usage of `fastcgi_param APP_ENV`. Since the Yii3 application template is using environment variables,
this is a possible place to set them. In production environment remember to set `APP_ENV` to `prod`.
