# Configurando servidores web: Nginx

Para usar o [Nginx](https:/nginx.org/), instale o PHP como [FPM
SAPI](https://secure.php.net/install.fpm).  Use a configuração do Nginx a
seguir, substituindo `path/to/app/public` pelo caminho real de `app/public`
e `mysite.test` pelo hostname real a ser servido.

```nginx
server {
    charset utf-8;
    client_max_body_size 128M;

    listen 80; ## escuta em ipv4
    #listen [::]:80 default_server ipv6only=on; ## escuta em ipv6

    server_name mysite.test;
    root        /path/to/app/public;
    index       index.php;

    access_log  /path/to/basic/log/access.log;
    error_log   /path/to/basic/log/error.log;

    location / {
        # Redireciona para index.php tudo que não for um arquivo real
        try_files $uri $uri/ /index.php$is_args$args;
    }

    # descomente para evitar que o Yii processe chamadas a arquivos estáticos inexistentes
    #location ~ \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
    #    try_files $uri =404;
    #}
    #error_page 404 /404.html;

    # bloqueia o acesso a arquivos php no diretório /assets
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

Ao usar essa configuração, defina também `cgi.fix_pathinfo=0` no arquivo
`php.ini` para evitar muitas chamadas de sistema `stat()` desnecessárias.

Além disso, ao executar um servidor HTTPS, você precisa adicionar
`fastcgi_param HTTPS on;` para que o Yii consiga detectar se a conexão é
segura.

Observe o uso de `fastcgi_param APP_ENV` acima. Como os templates de
aplicação do Yii3 usam variáveis de ambiente, este é um lugar possível para
defini-las. Em produção, lembre-se de definir `APP_ENV` como `prod`.

As diretivas `access_log` e `error_log` do Nginx acima não capturam a saída
dos workers do PHP-FPM.  Veja [logs da
aplicação](general.md#logs-da-aplicacao) para a configuração de logs.
