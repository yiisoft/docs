# Working with passwords

Most developers know that passwords can't be stored in plain text, but many developers believe it's still safe to hash
passwords using `md5`, `sha1` or `sha256` etc. There was a time when using the aforementioned hashing algorithms was enough,
but modern hardware makes it possible to reverse such hashes and even stronger ones using brute force attacks.

To offer increased security for user passwords, even in the worst case scenario (when one breaches your application),
you need to use a hashing algorithm that's resilient against brute force attacks.
The best current choice is `argon2`. 
Yii `yiisoft/security` package make securely generate and verify hashes easier and ensure the best possible hashing
solution used.

To use it, you need to require the package first:

```
composer require yiisoft/security
```

When a user provides a password for the first time (e.g., upon registration), the password needs to be hashed and
stored:


```php
$hash = (new PasswordHasher())->hash($password);

// save hash to a database or another storage
saveHash($hash); 
```

When a user attempts to log in, the submitted password must be verified against the previously hashed and stored password:


```php
// get hash from a database or another storage
$hash = getHash();

if ((new PasswordHasher())->validate($password, $hash)) {
    // all good, logging in user
} else {
    // wrong password
}
```
