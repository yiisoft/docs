# 可信请求

在使用单个 Web 服务器为网站提供服务的正常设置中，获取用户信息（如主机和 IP 地址）将开箱即用。但是，如果您的 Yii
应用程序在反向代理后面运行，则需要添加配置来检索此信息，因为直接客户端现在是代理，用户 IP 地址由代理设置的标头传递给 Yii 应用程序。

除非您明确信任代理，否则不应盲目信任代理提供的标头。Yii 支持通过
`Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver`
配置可信代理。您应该将其添加到[中间件堆栈](../structure/middleware.md)。

以下是在一组反向代理后面运行的应用程序的请求配置，这些代理位于 `10.0.2.0/24` IP 网络中：

```php
/** @var \Yiisoft\Yii\Web\Middleware\TrustedHostsNetworkResolver $trustedHostsNetworkResolver */
$trustedHostsNetworkResolver = $trustedHostsNetworkResolver->withAddedTrustedHosts(['1.0.2.0/24']);
```

代理默认在 `X-Forwarded-For` 标头中发送 IP，协议（`http` 或 `https`）在 `X-Forwarded-Proto`
中。

如果您的代理使用不同的标头，您可以使用请求配置来调整这些，例如：

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

使用上述配置，`X-ProxyUser-Ip` 和 `Front-End-Https` 标头用于获取用户 IP 和协议。
