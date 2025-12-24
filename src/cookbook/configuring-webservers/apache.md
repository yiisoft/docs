# Configuring web servers: Apache

Use the following configuration in Apache's `httpd.conf` file or within a virtual host configuration. Note that you
should replace `path/to/app/public` with the actual path for `app/public`.

```apache
# Set document root to be "app/public"
DocumentRoot "path/to/app/public"

<Directory "path/to/app/public">
    # use mod_rewrite for pretty URL support
    RewriteEngine on
    
    # if $showScriptName is false in UrlManager, do not allow accessing URLs with script name
    RewriteRule ^index.php/ - [L,R=404]
    
    # If a directory or a file exists, use the request directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Otherwise forward the request to index.php
    RewriteRule . index.php
    
    SetEnv APP_ENV dev

    # ...other settings...
</Directory>
```

In case you have `AllowOverride All` you can add `.htaccess` file with the following configuration instead of
using `httpd.conf`:

```apache
# use mod_rewrite for pretty URL support
RewriteEngine on

# if $showScriptName is false in UrlManager, do not allow accessing URLs with script name
RewriteRule ^index.php/ - [L,R=404]

# If a directory or a file exists, use the request directly
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Otherwise forward the request to index.php
RewriteRule . index.php

SetEnv APP_ENV dev

# ...other settings...
```

In the above, note the usage of `SetEnv`. Since the Yii3 application template is using environment variables, this is a possible
place to set them. In production environment remember to set `APP_ENV` to `prod`.
