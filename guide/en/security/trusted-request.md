# Trusted request

Getting user information, like a host and IP address, will work out of the box in a normal setup where a single webserver
is used to serve the website. If your Yii application, however, runs behind a reverse proxy, you need to add
configuration to retrieve this information as the direct client is now the proxy, and the user IP address is passed to
the Yii application by a header set by the proxy.

You shouldn't blindly trust headers provided by proxies unless you explicitly trust the proxy.
Yii supports configuring trusted proxies via the `Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver`.
You should add it to [middleware stack](../structure/middleware.md).

The following is a request config for an application that runs behind an array of reverse proxies,
which are located in the `10.0.2.0/24` IP network:

```php
/** @var \Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver $trustedHostsNetworkResolver */
$trustedHostsNetworkResolver = $trustedHostsNetworkResolver->withAddedTrustedHosts(['1.0.2.0/24']);
```

The proxy sends the IP in the `X-Forwarded-For` header by default, and the protocol (`http` or `https`) is in
`X-Forwarded-Proto`.

In case your proxies are using different headers, you can use the request configuration to adjust these, e.g.:

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

With the above configuration, `X-ProxyUser-Ip` and `Front-End-Https` headers are used to get user IP and protocol.
