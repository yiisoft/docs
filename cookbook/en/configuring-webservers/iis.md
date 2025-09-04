# Configuring web servers: IIS

When you use [IIS](https://www.iis.net/), host the application in a virtual host (Website) where the document
root points to the `path/to/app/public` folder and configure the website to run PHP.
In that `public` folder, place a file named `web.config` at `path/to/app/public/web.config`.
Use the following content:

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

Also, the following list of Microsoft's official resources could be useful to configure PHP on IIS:

1. [How to set up your first IIS website](https://support.microsoft.com/en-us/help/323972/how-to-set-up-your-first-iis-web-site)
2. [Configure a PHP Website on IIS](https://docs.microsoft.com/en-us/iis/application-frameworks/scenario-build-a-php-website-on-iis/configure-a-php-website-on-iis)
