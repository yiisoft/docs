# Criptografia

Nesta seção, vamos ver os seguintes aspectos de segurança:

- Geração de dados aleatórios
- Cifrar e decifrar dados
- Confirmação da integridade dos dados

Para usar esses recursos, você precisa instalar o pacote `yiisoft/security`:

```
composer install yiisoft/security
```

## Geração de dados pseudoaleatórios

Dados pseudoaleatórios são úteis em muitas situações. Por exemplo, ao
redefinir uma senha por e-mail, você precisa gerar um token, salvá-lo no
banco de dados e enviá-lo por e-mail ao usuário final, o que permite a ele
provar que é o dono daquela conta. É importante que esse token seja único e
difícil de adivinhar; caso contrário, existe a possibilidade de um atacante
prever o valor do token e redefinir a senha do usuário.

`\Yiisoft\Security\Random` torna simples gerar dados pseudoaleatórios:

```php
$key = \Yiisoft\Security\Random::string(42);
```

O código acima gera uma string aleatória com 42 caracteres.

Se você precisar de bytes ou inteiros, use as funções do PHP diretamente:

- `random_bytes()` para bytes. Note que a saída pode não ser ASCII.
- `random_int()` para inteiros.

## Cifrar e decifrar dados

O Yii fornece funções auxiliares práticas para cifrar e decifrar dados
usando uma chave secreta.  Os dados passam pela função de cifragem de modo
que apenas quem tem a chave secreta consiga decifrá-los.  Por exemplo, você
precisa armazenar alguma informação no banco de dados, mas precisa garantir
que apenas o usuário que tem a chave secreta possa vê-la (mesmo que alguém
comprometa o banco de dados da aplicação):

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByPassword($data, $password);

// salve os dados em um banco de dados ou outro armazenamento
saveData($encryptedData);
```

Para decifrar:

```php
// obtenha os dados cifrados de um banco de dados ou outro armazenamento
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByPassword($encryptedData, $password);
```

Você pode usar uma chave em vez de uma senha:

```php
$encryptedData = (new \Yiisoft\Security\Crypt())->encryptByKey($data, $key);

// salve os dados em um banco de dados ou outro armazenamento
saveData($encryptedData);
```

Para decifrar:

```php
// obtenha os dados cifrados de um banco de dados ou outro armazenamento
$encryptedData = getEncryptedData();

$data = (new \Yiisoft\Security\Crypt())->decryptByKey($encryptedData, $key);
```

## Confirmação da integridade dos dados

Há situações em que você precisa verificar se seus dados não foram
adulterados por terceiros ou até corrompidos de alguma forma. O Yii oferece
uma maneira de confirmar a integridade dos dados por meio de assinatura MAC.

A `$key` deve estar presente tanto no lado que envia quanto no que
recebe. No lado que envia:

```php
$signedMessage = (new \Yiisoft\Security\Mac())->sign($message, $key);

sendMessage($signedMessage);
```

No lado que recebe:

```php
$signedMessage = receiveMessage($signedMessage);

try {
    $message = (new \Yiisoft\Security\Mac())->getMessage($signedMessage, $key);
} catch (\Yiisoft\Security\DataIsTamperedException $e) {
    // os dados foram adulterados
}
```

## Mascaramento do comprimento do token

Mascarar um token ajuda a mitigar um ataque BREACH, tornando aleatória a
forma como o token é exibido em cada requisição.  Uma máscara aleatória é
aplicada ao token, fazendo com que a string seja sempre única.

Para mascarar um token:

```php
$maskedToken = \Yiisoft\Security\TokenMask::apply($token);
```

Para obter o valor original a partir do mascarado:

```php
$token = \Yiisoft\Security\TokenMask::remove($maskedToken);
```
