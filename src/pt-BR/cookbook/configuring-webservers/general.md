# Configurando servidores web: geral

Em um servidor de produção, se você não usa Docker, configure seu servidor
web para servir apenas os arquivos públicos da aplicação.  Aponte o document
root do servidor web para a pasta `app/public`.

> [!IMPORTANT]
> Se você executa sua aplicação Yii atrás de um proxy reverso, pode ser necessário configurar
> [proxies e headers confiáveis](../../guide/security/trusted-request.md).

## Logs da aplicação

Os templates de aplicação do Yii3 escrevem os logs da aplicação na saída
padrão (`stdout`, ou `php://stdout`) por padrão.  Eles não criam arquivos de
log da aplicação. A saída de erro padrão (`stderr`) exige configuração
explícita de destino de log.  O Docker coleta a saída dos containers, mas em
um servidor sem containers você precisa configurar para onde essa saída vai
ou [configurar um destino de
arquivo](../../guide/runtime/logging.md#logs-em-arquivos).  As configurações
de log de acesso e de erro do servidor web não configuram os destinos de log
do Yii.

### PHP-FPM

Se o seu servidor web usa PHP-FPM, habilite a captura da saída dos workers
na configuração do pool PHP-FPM da aplicação:

```ini
catch_workers_output = yes
```

Recarregue o PHP-FPM depois de alterar a configuração. O PHP-FPM envia a
saída padrão e a saída de erro dos workers para o seu log de erro
principal. A diretiva `error_log` em `php-fpm.conf` define o destino.  Sem
essa configuração, o PHP-FPM redireciona as duas saídas para `/dev/null` por
padrão.  Veja a [referência de configuração do
PHP-FPM](https://www.php.net/manual/en/install.fpm.configuration.php).

## Configurações específicas de servidores

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
