# 配置 Web 服务器：通用

在生产服务器上，如果你不使用 Docker，请配置你的 Web 服务器仅提供应用程序的公共文件。将 Web 服务器的文档根目录指向
`app/public` 文件夹。

> [!IMPORTANT]
> 如果你在反向代理后面运行 Yii 应用程序，可能需要配置
> [受信任的代理和标头](../../guide/security/trusted-request.md)。

## 特定服务器配置

- [Nginx](nginx.md)
- [Apache](apache.md)
- [Lighttpd](lighttpd.md)
- [Nginx Unit](nginx-unit.md)
- [IIS](iis.md)
