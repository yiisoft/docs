# Configurando servidores web: IIS

Ao usar o [IIS](https://www.iis.net/), hospede a aplicação em um virtual
host (Website) cujo document root aponte para a pasta `path/to/app/public` e
configure o site para executar PHP.  Nessa pasta `public`, coloque um
arquivo chamado `web.config` em `path/to/app/public/web.config`.  Use o
seguinte conteúdo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <directoryBrowse enabled="false" />
        <rewrite>
            <rules>
                <rule name="Hide Yii Index" stopProcessing="true">
                    <match url="." ignoreCase="false" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" 
                            ignoreCase="false" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" 
                            ignoreCase="false" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.php" appendQueryString="true" />
                </rule> 
            </rules>
      </rewrite>
    </system.webServer>
</configuration>
```

A [documentação do IIS](https://learn.microsoft.com/en-us/iis/) também pode
ser útil para configurar o PHP no IIS.

Veja [logs da aplicação](general.md#logs-da-aplicacao) para a configuração
de logs.
