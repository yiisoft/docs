# 配置 Web 服务器：IIS

当你使用 [IIS](https://www.iis.net/) 时，在虚拟主机（网站）中托管应用程序，其中文档根目录指向
`path/to/app/public` 文件夹，并配置网站运行 PHP。在该 `public` 文件夹中，放置一个名为 `web.config`
的文件，路径为 `path/to/app/public/web.config`。使用以下内容：

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

此外，以下 Microsoft 官方资源列表可能对在 IIS 上配置 PHP 有所帮助：

1. [如何设置你的第一个 IIS
   网站](https://support.microsoft.com/en-us/help/323972/how-to-set-up-your-first-iis-web-site)
2. [在 IIS 上配置 PHP
   网站](https://docs.microsoft.com/en-us/iis/application-frameworks/scenario-build-a-php-website-on-iis/configure-a-php-website-on-iis)
