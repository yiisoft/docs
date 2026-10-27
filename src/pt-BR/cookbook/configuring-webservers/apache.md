# Configurando servidores web: Apache

Use a configuração a seguir no arquivo `httpd.conf` do Apache ou na
configuração de um virtual host. Substitua `path/to/app/public` pelo caminho
real de `app/public`.

```apache
# Define o document root como "app/public"
DocumentRoot "path/to/app/public"

<Directory "path/to/app/public">
    # usa mod_rewrite para suportar URLs amigáveis
    RewriteEngine on
    
    # Não permite acesso a URLs com o nome do script
    RewriteCond %{THE_REQUEST} index.php [NC]
    RewriteRule . - [R=404,L]
    
    # Se um diretório ou arquivo existir, usa a requisição diretamente
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Caso contrário, encaminha a requisição para index.php
    RewriteRule . index.php
    
    SetEnv APP_ENV dev

    # ...outras configurações...
</Directory>
```

Se você tiver `AllowOverride All`, pode adicionar um arquivo `.htaccess` com
a configuração a seguir em vez de usar o `httpd.conf`:

```apache
# usa mod_rewrite para suportar URLs amigáveis
RewriteEngine on

# Não permite acesso a URLs com o nome do script
RewriteCond %{THE_REQUEST} index.php [NC]
RewriteRule . - [R=404,L]

# Se um diretório ou arquivo existir, usa a requisição diretamente
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Caso contrário, encaminha a requisição para index.php
RewriteRule . index.php

SetEnv APP_ENV dev

# ...outras configurações...
```

Observe o uso de `SetEnv` acima. Como os templates de aplicação do Yii3 usam
variáveis de ambiente, este é um lugar possível para defini-las. Em
produção, lembre-se de definir `APP_ENV` como `prod`.

Veja [logs da aplicação](general.md#logs-da-aplicacao) para a configuração
de logs.
