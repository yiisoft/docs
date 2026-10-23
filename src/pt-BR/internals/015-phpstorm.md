# 015 — Metadados e atributos do PhpStorm

## Metadados do PhpStorm

Os [metadados do
PhpStorm](https://www.jetbrains.com/help/phpstorm/ide-advanced-metadata.html)
ajudam a IDE a entender melhor o código nos casos em que os tipos comuns e
as tags PHPDoc não ajudam.

Usamos o seguinte conjunto de convenções de estilo para os metadados.

### Localização dos metadados

- Os metadados devem ficar no diretório `/.phpstorm.meta.php`.
- A configuração deve ser dividida em arquivos. Cada arquivo deve ter o nome
  da classe que configura.

> [!NOTE]
> O PhpStorm ainda não suporta subdiretórios.

### Constantes 

Todos os dicionários de constantes devem ser nomeados como `{Class
FQN}::{Group name}`. O nome do grupo deve ser curto e escrito em letras
maiúsculas.  Use sublinhado como separador de palavras, por exemplo
`\Yiisoft\Http\Status::STATUSES`. Por exemplo:

```php
expectedReturnValues(
  \Psr\Http\Message\RequestInterface::getMethod(),
  argumentsSet('\Yiisoft\Http\Method::METHODS'),
);

registerArgumentsSet(
  '\Yiisoft\Http\Method::METHODS',
  \Yiisoft\Http\Method::GET,
  \Yiisoft\Http\Method::POST,
  \Yiisoft\Http\Method::PUT,
  \Yiisoft\Http\Method::DELETE,
  \Yiisoft\Http\Method::PATCH,
  \Yiisoft\Http\Method::HEAD,
  \Yiisoft\Http\Method::OPTIONS,
);
```

## Atributos do PhpStorm

Os [atributos do PhpStorm](https://github.com/JetBrains/phpstorm-attributes)
PODEM ser usados no código, mas o pacote `jetbrains/phpstorm-attributes`
DEVE ser adicionado como dependência de desenvolvimento:

```shell
composer require --dev jetbrains/phpstorm-attributes
```

### Usando com o ComposerRequireChecker

Quando o
[ComposerRequireChecker](https://github.com/maglnet/ComposerRequireChecker)
também é usado no mesmo pacote, adicione os nomes das classes dos atributos
envolvidos à whitelist na configuração. Por exemplo:

```json
{
    "symbol-whitelist": [
        "JetBrains\\PhpStorm\\ExpectedValues",
        "JetBrains\\PhpStorm\\Pure"
    ]
}
```
