# 010 — Estilo de código

A formatação de código usada nos pacotes do Yii 3 é baseada no [PER Coding
Style 3.0](https://www.php-fig.org/per/coding-style/)  com regras extras
adicionadas por cima.

## Nomes

- Use apenas inglês.
- Use a notação camelCase, inclusive em abreviações (por exemplo,
  `enableIdn`).
- Use o nome mais curto possível, mas que seja explicativo.
- Nunca corte ou abrevie um nome.
- Adicione o sufixo `Collection` a classes, interfaces, traits e variáveis
  que sejam uma
  [coleção](https://en.wikipedia.org/wiki/Collection_(abstract_data_type)).
- Adicione o sufixo `Middleware` às classes de middleware.

## Tipos

- Declare [tipos de argumento e de
  retorno](https://www.php.net/manual/en/migration70.new-features.php)
  sempre que possível.
- [Use tipos nas
  propriedades](https://wiki.php.net/rfc/typed_properties_v2).
- Use tipagem estrita. Evite tipos mixed e union sempre que possível, exceto
  tipos compatíveis como `string|Stringable`.

## Comentários

Evite comentários inline, a menos que o código não possa ser entendido sem
eles.  Um bom exemplo é um contorno para um bug em determinada versão do
PHP.

O comentário de método é necessário, exceto quando não acrescenta nada ao
que o nome e a assinatura do método já dizem.

O comentário de classe deve descrever o propósito da classe.

Veja [PHPDoc](014-docs.md#phpdoc).

## Formatação

### Tamanho da linha

O tamanho máximo da linha é de 120 caracteres.

Quando uma chamada de função ou método excede o limite, separe os argumentos
em linhas distintas:

```php
$this->assertSame(
    ['' => ['Value must be no less than 5.']],
    $result->getErrorMessagesIndexedByPath(),
);
```

### Sem alinhamento

Atribuições de valores a propriedades, variáveis e constantes não devem ser
alinhadas.  O mesmo vale para as tags phpdoc. O motivo é que instruções
alinhadas costumam gerar diffs maiores e até conflitos.

```php
final class X
{
    const A = 'test';
    const BBB = 'test';
    
    private int $property = 42;
    private int $test = 123;
    
    /**
     * @param int $number Just a number.
     * @param array $options Well... options!
     */
    public function doIt(int $number, array $options): void
    {
        $test = 123;
        $anotherTest = 123;
    }
}
```

### Chamadas encadeadas

Chamadas encadeadas devem ser formatadas para melhor legibilidade.  Se for
uma cadeia longa que não cabe no limite de 120 caracteres por linha, cada
chamada deve ficar em uma nova linha:

```php
$object
    ->withName('test')
    ->withValue(87)
    ->withStatus(Status::NEW)
    ->withAuthor($author)
    ->withDeadline($deadline);
```

Se for uma cadeia curta, não há problema em deixá-la em uma única linha:

```php
$object = $object->withName('test');
```

## Strings

- Quando não houver variáveis envolvidas, use `'Hello!'`
- Para inserir variáveis na string, prefira `"Hello, $username!"`

## Classes e interfaces

### Final por padrão

As classes devem ser `final` por padrão.

### Private por padrão

Constantes, propriedades e métodos devem ser private por padrão.

### Composição em vez de herança

Prefira [composição a herança](../guide/concept/di-container.md).

### Ordem de propriedades, constantes e métodos

A ordem deve ser a seguinte:

- Constantes
- Propriedades
- Métodos

Dentro de cada categoria, os itens devem ser ordenados por visibilidade:

- public
- protected
- private

### Classes abstratas

Classes abstratas *não devem* ter o prefixo ou sufixo `Abstract`.

#### Métodos imutáveis

A convenção para métodos imutáveis é a seguinte:

```php
public function withName(string $name): self
{
    $new = clone $this;
    $new->name = $name;
    return $new; 
}
```

1. O nome do objeto clonado é `$new`.
2. O tipo de retorno é `self`.

#### Métodos de verificação booleana

Métodos que servem para verificar se algo é verdadeiro devem ser nomeados
assim:

```php
public function isDeleted(): bool;
public function hasName(): bool;
public function canDoIt(): bool;
```

#### Flags em métodos 

É melhor evitar flags booleanas em métodos. Elas são um sinal de que o
método pode estar fazendo coisas demais e de que deveria haver dois métodos
em vez de um.

```php
public function login(bool $refreshPage = true): void;
```

É melhor que sejam dois métodos:

```php
public function login(): void;
public function refreshPage(): void;
```

## Variáveis

Adicione o prefixo sublinhado (`_`) em variáveis não usadas. Por exemplo:

```php
foreach ($items as $key => $_value) {
    echo $key;
}
```

## Imports

Prefira importar classes e funções a usar nomes totalmente qualificados:

```php
use Yiisoft\Arrays\ArrayHelper;
use Yiisoft\Validator\DataSetInterface;
use Yiisoft\Validator\HasValidationErrorMessage;
use Yiisoft\Validator\Result;

use function is_iterable;
```

## Convenções adicionais

- [Namespaces](004-namespaces.md)
- [Exceções](007-exceptions.md)
- [Interfaces](008-interfaces.md)
