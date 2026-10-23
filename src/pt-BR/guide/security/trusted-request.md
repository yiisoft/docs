# Requisição confiável

Obter informações do usuário, como host e endereço IP, funciona de imediato
em uma configuração normal, em que um único servidor web atende o
site. Porém, se sua aplicação Yii roda atrás de um proxy reverso, você
precisa adicionar configuração para obter essas informações, já que o
cliente direto passa a ser o proxy e o endereço IP do usuário é repassado
para a aplicação Yii por um header definido pelo proxy.

Você não deve confiar cegamente nos headers fornecidos por proxies, a menos
que confie explicitamente no proxy.  O Yii permite configurar proxies
confiáveis via `Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver`.
Você deve adicioná-lo à [pilha de middlewares](../structure/middleware.md).

A seguir está uma configuração de requisição para uma aplicação que roda
atrás de um conjunto de proxies reversos localizados na rede IP
`10.0.2.0/24`:

```php
/** @var \Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver $trustedHostsNetworkResolver */
$trustedHostsNetworkResolver = $trustedHostsNetworkResolver->withAddedTrustedHosts(['1.0.2.0/24']);
```

Por padrão, o proxy envia o IP no header `X-Forwarded-For` e o protocolo
(`http` ou `https`) em `X-Forwarded-Proto`.

Caso seus proxies usem headers diferentes, você pode ajustá-los na
configuração da requisição, por exemplo:

```php
/** @var \Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver $trustedHostsNetworkResolver */
$trustedHostsNetworkResolver = $trustedHostsNetworkResolver
    ->withAddedTrustedHosts(
        ['1.0.2.0/24'],
        ['X-ProxyUser-Ip'],
        ['Front-End-Https'],
        [],
        [],
        ['X-Proxy-User-Ip']
    );
```

Com a configuração acima, os headers `X-ProxyUser-Ip` e `Front-End-Https`
são usados para obter o IP e o protocolo do usuário.
