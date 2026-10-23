# Configurando servidores web: lighttpd

Para usar o [lighttpd](https://www.lighttpd.net/) >= 1.4.24, coloque o `index.php` na raiz web e adicione o seguinte à configuração:

```
url.rewrite-if-not-file = ("(.*)" => "/index.php/$0")
```

Veja [logs da aplicação](general.md#logs-da-aplicacao) para a configuração
de logs.
