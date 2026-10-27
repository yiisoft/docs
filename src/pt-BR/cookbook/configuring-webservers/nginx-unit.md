# Configurando servidores web: NGINX Unit e FreeUnit

Execute aplicações baseadas em Yii usando o [NGINX
Unit](https://unit.nginx.org/) com um módulo de linguagem PHP.  O mesmo
formato de configuração é usado pelo
[FreeUnit](https://github.com/freeunitorg/freeunit), um fork LTS do Unit
mantido pela comunidade.  Com as imagens Docker do FreeUnit, como
`ghcr.io/freeunitorg/freeunit:latest-php8.5`, coloque a configuração em
`/var/lib/unit/config.json`.

Aqui está um exemplo de configuração.

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

Você também pode [configurar](https://unit.nginx.org/configuration/#php) o
ambiente PHP ou fornecer um `php.ini` personalizado na mesma configuração.

Como os templates de aplicação do Yii3 usam variáveis de ambiente, você pode
defini-las em `applications.yii.environment`.  Em produção, lembre-se de
definir `APP_ENV` como `prod`.

Veja [logs da aplicação](general.md#logs-da-aplicacao) para a configuração
de logs.
