# Working with Passwords

Most developers know that passwords cannot be stored in plain text, but many developers believe it's still safe to hash
passwords using `md5`, `sha1` or `sha256` etc. There was a time when using the aforementioned hashing algorithms was sufficient,
but modern hardware makes it possible to reverse such hashes and even stronger ones very quickly using brute force attacks.

In order to provide increased security for user passwords, even in the worst case scenario (your application is breached),
you need to use a hashing algorithm that is resilient against brute force attacks. The best current choice is `argon2`.
Yii `yiisoft/security` package make securely generate and verify hashes easier and ensure the best possible hashing
solution used.

In order to use it you need to require the package first:

```
composer require yiisoft/secrurity
```

When a user provides a password for the first time (e.g., upon registration), the password needs to be hashed and
stored:


```php
$hash = (new PasswordHasher())->hash($password);

// save hash to database or another storage
saveHash($hash); 
```

When a user attempts to log in, the submitted password must be verified against the previously hashed and stored password:


```php
// obtain hash from database or another storage
$hash = getHash();

if ((new PasswordHasher())->validate($password, $hash)) {
    // all good, logging user in
} else {
    // wrong password
}
```
