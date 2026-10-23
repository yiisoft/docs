# Trabalhando com senhas

A maioria dos desenvolvedores sabe que senhas não podem ser armazenadas em
texto puro, mas muitos ainda acreditam que é seguro gerar o hash de senhas
com `md5`, `sha1`, `sha256` etc. Houve um tempo em que esses algoritmos de
hash bastavam, mas o hardware moderno permite reverter esses hashes, e até
outros mais fortes, com ataques de força bruta.

Para oferecer mais segurança às senhas dos usuários, mesmo no pior cenário
(quando alguém invade sua aplicação), você precisa usar um algoritmo de hash
resistente a ataques de força bruta.  A melhor escolha atual é o `argon2`.
O pacote `yiisoft/security` do Yii facilita gerar e verificar hashes com
segurança e garante que a melhor solução de hash possível seja usada.

Para usá-lo, primeiro instale o pacote:

```
composer require yiisoft/security
```

Quando um usuário fornece uma senha pela primeira vez (por exemplo, no
cadastro), é preciso gerar o hash da senha e armazená-lo:


```php
$hash = (new PasswordHasher())->hash($password);

// salve o hash em um banco de dados ou outro armazenamento
saveHash($hash); 
```

Quando um usuário tenta fazer login, a senha enviada deve ser verificada
contra o hash armazenado anteriormente:


```php
// obtenha o hash de um banco de dados ou outro armazenamento
$hash = getHash();

if ((new PasswordHasher())->validate($password, $hash)) {
    // tudo certo, fazendo login do usuário
} else {
    // senha incorreta
}
```
