# Configuring web servers: NGINX Unit and FreeUnit

Run Yii-based apps using [NGINX Unit](https://unit.nginx.org/) with a PHP
language module.  The same configuration format is used by
[FreeUnit](https://github.com/freeunitorg/freeunit), a community LTS fork of
Unit.  With FreeUnit Docker images, such as
`ghcr.io/freeunitorg/freeunit:latest-php8.5`, put the configuration in
`/var/lib/unit/config.json`.

Here is a sample configuration.

```json
{
    "listeners": {
        "*:80": {
            "pass": "routes"
        }
    },

    "routes": [
        {
            "match": {
                "uri": [
                    "!/assets/*",
                    "*.php",
                    "*.php/*"
                ]
            },

            "action": {
                "pass": "applications/yii/direct"
            }
        },
        {
            "action": {
                "share": "/path/to/app/public$uri",
                "fallback": {
                    "pass": "applications/yii/index"
                }
            }
        }
    ],

    "applications": {
        "yii": {
            "type": "php",
            "targets": {
                "direct": {
                    "root": "/path/to/app/public/"
                },

                "index": {
                    "root": "/path/to/app/public/",
                    "script": "index.php"
                }
            }
        }
    }
}
```

你还可以在同一配置中 [设置](https://unit.nginx.org/configuration/#php) PHP 环境或提供自定义的
`php.ini`。

Since the Yii3 application template uses environment variables, you can set
them in `applications.yii.environment`.  In a production environment,
remember to set `APP_ENV` to `prod`.
