# Cryptography

In this section we'll review the following security aspects:

- Generating random data
- Encryption and Decryption
- Confirming Data Integrity

In order to use features above you need to install `yiisoft/security` package:

```
composer install yiisoft/security
```

## Generating Pseudorandom Data

Pseudorandom data is useful in many situations. For example when resetting a password via email you need to generate a
token, save it to the database, and send it via email to end user which in turn will allow them to prove ownership of
that account. It is very important that this token be unique and hard to guess, else there is a possibility that attacker
can predict the token's value and reset the user's password.

`\Yiisoft\Security\Random` makes generating pseudorandom data simple:

```php
$key = \Yiisoft\Security\Random::string(42);
```

Code above would give you a random string consisting of 42 characters.

If you need bytes or integers, use PHP functions directly:

- `random_bytes()` for bytes. Note that output may not be ASCII.
- `random_int()` for integers.

## Encryption and Decryption

Yii provides convenient helper functions that allow you to encrypt/decrypt data using a secret key. The data is passed
through the encryption function so that only the person which has the secret key will be able to decrypt it.
For example, we need to store some information in our database, but we need to make sure only the user who has
the secret key can view it (even if the application database compromised):

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByPassword($data, $password);

// save data to database or another storage
saveData($encryptedData);
```

Decrypting it:

```php
// obtain encrypted data from database or another storage
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByPassword($encryptedData, $password);
```

Key could be used instead of password:

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByKey($data, $key);

// save data to database or another storage
saveData($encryptedData);
```

Decrypting it:

```php
// obtain encrypted data from database or another storage
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByKey($encryptedData, $key);
```

## Confirming Data Integrity

There are situations in which you need to verify that your data hasn't been tampered with by a third party or even
corrupted in some way. Yii provides a way to confirm data integrity by MAC signing.

The `$key` should be present at both sending and receiving sides. At the sending side:

```php
$signedMessage = (new \Yiisoft\Security\Mac())->sign($message, $key);

sendMessage($signedMessage);
```

At the receiving side:

```php
$signedMessage = receiveMessage($signedMessage);

try {
    $message = (new \Yiisoft\Security\Mac())->getMessage($signedMessage, $key);
} catch (\Yiisoft\Security\DataIsTamperedException $e) {
    // data is tampered
}
```

## Masking token length

Masking a token helps to mitigate BREACH attack by randomizing how token outputted on each request.
A random mask applied to the token making the string always unique.

In order to mask a token:

```php
$maskedToken = \Yiisoft\Security\TokenMask::apply($token);
```

In order to get original value from the masked one:

```php
$token = \Yiisoft\Security\TokenMask::remove($maskedToken);
```
