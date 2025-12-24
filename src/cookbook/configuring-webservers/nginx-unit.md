# Configuring web servers: NGINX Unit

Run Yii-based apps using [NGINX Unit](https://unit.nginx.org/) with a PHP language module.
Here is a sample configuration.

```json
{
    "listeners": {
        "*:80": {
            "pass": "routes/yii"
        }
    },

    "routes": {
        "yii": [
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
                    "share": "/path/to/app/public/",
                    "fallback": {
                        "pass": "applications/yii/index"
                    }
                }
            }
        ]
    },

    "applications": {
        "yii": {
            "type": "php",
            "user": "www-data",
            "environment": {
                "APP_ENV": "dev"
            },
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

You can also [set up](https://unit.nginx.org/configuration/#php) your PHP environment or supply a custom `php.ini`
in the same configuration.

In the above, note the usage of `environment`. Since the Yii3 application template is using environment variables,
this is a possible place to set them. In production environment remember to set `APP_ENV` to `prod`.
