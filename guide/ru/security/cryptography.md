# Криптография

В этом разделе мы рассмотрим следующие аспекты безопасности:

- Генерация случайных данных
- Шифрование и расшифровка
- Проверка целостности данных

Для использования этих функций, вам нужно установить пакет `yiisoft/security`:

```
composer install yiisoft/security
```

## Генерация псевдослучайных данных

Псевдослучайные данные используются во многих ситуациях.
Например, при изменении пароля по email, вам необходимо сгенерировать токен, сохранить его в базу данных и отправить по email пользователю, чтобы он с помощью него подтвердил владение аккаунтом.
Важно чтобы этот токен был уникальным и его было трудно угадать, иначе есть вероятность, что атакующий может предсказать значение токена и сбросить пароль пользователя.

Класс `\Yiisoft\Security\Random` делает генерацию псевдослучайных данных простой:

```php
$key = \Yiisoft\Security\Random::string(42);
```

Код выше даст вам случайную строку, включающую 42 символа.

Если вам нужны байты или целые числа, напрямую используйте функции PHP:

- `random_bytes()` для байт. Обратите внимание, что вывод может быть не ASCII.
- `random_int()` для целых чисел.

## Шифрование и расшифровка

Yii предоставляет удобные вспомогательные функции для шифрования/расшифровки данных с помощью секретного кллюча.
Данные проходят через функцию шифрования таким образом, что только тот, кто знает секретный ключ, может расшифровать их.
Например, вам нужно сохранить некоторую информацию в вашей базе данных, но вы должны быть уверены, что только пользователь, который знает секретный ключ, сможет расшифровать их (даже если кто-нибудь скомпрометирует базу данных приложения)

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByPassword($data, $password);

// сохранение данных в базу данных или другое хранилище
saveData($encryptedData);
```

Расшифровка:

```php
// получение зашифрованных данных их базы данных или другого хранилища
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByPassword($encryptedData, $password);
```

Вы можете использовать ключ вместо пароля:

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByKey($data, $key);

// сохранение данных в базу данных или другое хранилище
saveData($encryptedData);
```

Расшифровка:

```php
// получение зашифрованных данных их базы данных или другого хранилища
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByKey($encryptedData, $key);
```

## Confirming data integrity

There are situations in which you need to verify that your data haven't been tampered with by a third party or even
corrupted in some way. Yii provides a way to confirm data integrity by MAC signing.

The `$key` should be present at both sending and receiving sides. On the sending side:

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

To mask a token:

```php
$maskedToken = \Yiisoft\Security\TokenMask::apply($token);
```

To get original value from the masked one:

```php
$token = \Yiisoft\Security\TokenMask::remove($maskedToken);
```
