# Aliases

Você pode usar aliases para representar caminhos de arquivos ou URLs,
evitando escrever caminhos absolutos ou URLs fixos no seu projeto. Um alias
deve começar com o caractere `@` para se diferenciar de caminhos de arquivos
e URLs normais. Um alias definido sem o `@` inicial receberá o prefixo `@`.

A aplicação Yii padrão tem alguns aliases predefinidos em
`config/params.php`. Por exemplo, o alias `@public` representa o caminho da
raiz web; `@baseUrl` representa a URL base da aplicação web em execução.

## Definindo aliases

Você pode definir um alias no `config/params.php` da aplicação:

```php
return [
    // ...
    
    'yiisoft/aliases' => [
        'aliases' => [
            // ...
        
            // um alias de um caminho de arquivo
            '@foo' => '/path/to/foo',
        
            // um alias de uma URL
            '@bar' => 'https://www.example.com',
        
            // um alias de um arquivo concreto que contém a classe \foo\Bar 
            '@foo/Bar.php' => '/definitely/not/foo/Bar.php',
        ],
    ],
];
```

> [!NOTE]
> O caminho de arquivo ou URL representado pelo alias *não* precisa necessariamente se referir a um arquivo ou recurso existente.

A partir de um alias definido, você pode derivar um novo alias acrescentando
uma barra `/` seguida de um ou mais segmentos de caminho.  Por exemplo,
`@foo` é um alias raiz, enquanto `@foo/bar/file.php` é um alias derivado.

Você pode definir um alias usando outro alias (raiz ou derivado):

```php
'@foobar' => '@foo/bar', 
```

O parâmetro `yiisoft/aliases` inicializa o serviço `Aliases` do pacote
[`yiisoft/aliases`](https://github.com/yiisoft/aliases).  Você pode definir
aliases extras em tempo de execução usando o serviço:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@uploads', '@root/uploads');
}
```

## Usando aliases na configuração

É preferível resolver os aliases no nível da configuração, para que os
serviços recebam URLs e caminhos como strings prontas para uso:

```php
<?php

declare(strict_types=1);

use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\File\FileCache;

/* @var $params array */

return [
    FileCache::class => static fn (Aliases $aliases) => new FileCache(
        $aliases->get($params['yiisoft/cache-file']['fileCache']['path'])
    ),
];
```

## Resolvendo aliases

Você pode usar o serviço `Aliases` para resolver um alias ou alias derivado
no caminho de arquivo ou URL que ele representa:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $foo = $aliases->get('@foo'); // /path/to/foo
    $bar = $aliases->get('@bar'); // https://www.example.com
    $file = $aliases->get('@foo/bar/file.php'); // /path/to/foo/bar/file.php
}
```

O caminho/URL representado por um alias derivado é determinado substituindo
a parte do alias raiz pelo caminho/URL correspondente.

> [!NOTE]
> O método `get()` não verifica se o caminho/URL resultante se refere a um arquivo ou recurso existente.


Um alias raiz também pode conter caracteres de barra `/`. O método `get()` é
inteligente o suficiente para identificar qual parte de um alias é o alias
raiz e, assim, determina corretamente o caminho de arquivo ou URL
correspondente:

```php
use \Yiisoft\Aliases\Aliases;

public function actionIndex(Aliases $aliases)
{
    $aliases->set('@foo', '/path/to/foo');
    $aliases->set('@foo/bar', '/path2/bar');

    $aliases->get('@foo/test/file.php'); // /path/to/foo/test/file.php
    $aliases->get('@foo/bar/file.php'); // /path2/bar/file.php
} 
```

Se `@foo/bar` não estiver definido como alias raiz, a última instrução
exibiria `/path/to/foo/bar/file.php`.


## Aliases predefinidos

A [aplicação Yii](https://github.com/yiisoft/app) predefine um conjunto de
aliases para referenciar caminhos de arquivos e URLs de uso comum:

- `@root` - a pasta base da aplicação em execução.
- `@assets` - pasta pública da aplicação onde ela publica os assets.
- `@assetsUrl` - URL da pasta base com os assets publicados.
- `@baseUrl` - a URL base da aplicação web em execução. O padrão é `/`.
- `@npm` - pasta de pacotes node.
- `@bower` - pasta de pacotes bower.
- `@vendor` - a pasta `vendor` do Composer.
- `@public` - pasta publicamente acessível da aplicação, que contém o
  `index.php`.
- `@runtime` - o caminho de runtime da aplicação em execução. O padrão é
  `@root/runtime`.
- `@layout` - a pasta com os layouts.
- `@resources` - pasta com views, fontes de assets e outros recursos.
- `@views` - pasta base dos templates de view da aplicação.
