# 加密

在本节中，我们将回顾以下安全方面：

- 生成随机数据
- 加密和解密
- 确认数据完整性

要使用这些功能，您需要安装 `yiisoft/security` 包：

```
composer install yiisoft/security
```

## 生成伪随机数据

伪随机数据在许多情况下都很有用。例如，当通过电子邮件重置密码时，您需要生成一个令牌，将其保存到数据库，并通过电子邮件发送给最终用户，这反过来将允许他们证明对该帐户的所有权。重要的是，此令牌必须是唯一的且难以猜测，否则攻击者有可能预测令牌的值并重置用户的密码。

`\Yiisoft\Security\Random` makes generating pseudorandom data simple:

```php
$key = \Yiisoft\Security\Random::string(42);
```

上面的代码将为您提供一个由 42 个字符组成的随机字符串。

如果您需要字节或整数，请直接使用 PHP 函数：

- 使用 `random_bytes()` 生成字节。请注意，输出可能不是 ASCII。
- `random_int()` 用于整数。

## 加密和解密

Yii
提供了方便的辅助函数，使用密钥加密/解密数据。数据通过加密函数传递，以便只有拥有密钥的人才能解密它。例如，您需要在数据库中存储一些信息，但您需要确保只有拥有密钥的用户才能查看它（即使有人破坏了应用程序数据库）：

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByPassword($data, $password);

// save data to a database or another storage
saveData($encryptedData);
```

解密它：

```php
// collect encrypted data from a database or another storage
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByPassword($encryptedData, $password);
```

您可以使用密钥而不是密码：

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByKey($data, $key);

// save data to a database or another storage
saveData($encryptedData);
```

解密它：

```php
// collect encrypted data from a database or another storage
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByKey($encryptedData, $key);
```

## 确认数据完整性

在某些情况下，您需要验证您的数据没有被第三方篡改，甚至以某种方式损坏。Yii 提供了一种通过 MAC 签名确认数据完整性的方法。

`$key` 应该在发送端和接收端都存在。在发送端：

```php
$signedMessage = (new \Yiisoft\Security\Mac())->sign($message, $key);

sendMessage($signedMessage);
```

在接收端：

```php
$signedMessage = receiveMessage($signedMessage);

try {
    $message = (new \Yiisoft\Security\Mac())->getMessage($signedMessage, $key);
} catch (\Yiisoft\Security\DataIsTamperedException $e) {
    // data is tampered
}
```

## 掩码令牌长度

掩码令牌有助于通过随机化每个请求上令牌的输出方式来缓解 BREACH 攻击。对令牌应用随机掩码，使字符串始终唯一。

要掩码令牌：

```php
$maskedToken = \Yiisoft\Security\TokenMask::apply($token);
```

要从掩码中获取原始值：

```php
$token = \Yiisoft\Security\TokenMask::remove($maskedToken);
```
