# 使用密码

大多数开发人员知道密码不能以纯文本形式存储，但许多开发人员认为使用 `md5`、`sha1` 或 `sha256`
等对密码进行哈希处理仍然是安全的。曾经有一段时间，使用上述哈希算法就足够了，但现代硬件使得可以使用暴力攻击来逆向这些哈希甚至更强的哈希。

为了为用户密码提供更高的安全性，即使在最坏的情况下（当有人破坏您的应用程序时），您需要使用能够抵御暴力攻击的哈希算法。目前最好的选择是
`argon2`。Yii `yiisoft/security` 包使安全生成和验证哈希变得更容易，并确保使用最佳的哈希解决方案。

要使用它，您需要首先安装该包：

```
composer require yiisoft/security
```

当用户第一次提供密码时（例如，注册时），需要对密码进行哈希处理并存储：


```php
$hash = (new PasswordHasher())->hash($password);

// save hash to a database or another storage
saveHash($hash); 
```

当用户尝试登录时，提交的密码必须与之前哈希和存储的密码进行验证：


```php
// get hash from a database or another storage
$hash = getHash();

if ((new PasswordHasher())->validate($password, $hash)) {
    // all good, logging in user
} else {
    // wrong password
}
```
