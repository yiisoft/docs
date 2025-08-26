# Configuring web servers: IIS

When using [IIS](https://www.iis.net/), we recommend hosting the application in a virtual host (Website) where document
root points to `path/to/app/public` folder and that website is configured to run PHP. In that `public` folder you have to
place a file named `web.config` that's `path/to/app/public/web.config`. The Content of the file should be the following:

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
