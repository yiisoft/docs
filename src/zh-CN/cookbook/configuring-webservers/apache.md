# 配置 Web 服务器：Apache

在 Apache 的 `httpd.conf` 文件或虚拟主机配置中使用以下配置。注意，你应该将 `path/to/app/public` 替换为
`app/public` 的实际路径。

```apache
# Set document root to be "app/public"
DocumentRoot "path/to/app/public"

<Directory "path/to/app/public">
    # use mod_rewrite for pretty URL support
    RewriteEngine on
    
    # Do not allow access to URLs with a script name
    RewriteCond %{THE_REQUEST} index.php [NC]
    RewriteRule . - [R=404,L]
    
    # If a directory or a file exists, use the request directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Otherwise forward the request to index.php
    RewriteRule . index.php
    
    SetEnv APP_ENV dev

    # ...other settings...
</Directory>
```

如果你设置了 `AllowOverride All`，可以添加包含以下配置的 `.htaccess` 文件，而不是使用 `httpd.conf`：

```apache
# use mod_rewrite for pretty URL support
RewriteEngine on

# Do not allow access to URLs with a script name
RewriteCond %{THE_REQUEST} index.php [NC]
RewriteRule . - [R=404,L]

# If a directory or a file exists, use the request directly
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Otherwise forward the request to index.php
RewriteRule . index.php

SetEnv APP_ENV dev

# ...other settings...
```

In the above, note the usage of `SetEnv`. Since Yii3 application templates
use environment variables, this is a possible place to set them. In
production environment remember to set `APP_ENV` to `prod`.

See [application logs](general.md#application-logs) for logging
configuration.
