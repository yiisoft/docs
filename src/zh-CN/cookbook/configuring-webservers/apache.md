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

在上面的配置中，请注意 `SetEnv` 的用法。由于 Yii3 应用程序模板使用环境变量，这是设置它们的一个可行位置。在生产环境中，请记得将
`APP_ENV` 设置为 `prod`。
