# Cache de dados

O cache de dados consiste em guardar algumas variáveis PHP no cache e
recuperá-las dele mais tarde.  Ele também é a base para recursos de cache
mais avançados, como o cache de páginas.

Para usar o cache, instale o pacote
[yiisoft/cache](https://github.com/yiisoft/cache):

```shell
composer require yiisoft/cache
```

O código a seguir é um padrão típico de uso do cache de dados, em que
`$cache` se refere a uma instância de `Cache` do pacote:

```php
public function getTopProducts(\Yiisoft\Cache\CacheInterface $cache): array
{
    $key = ['top-products', $count = 10];
    
    // Tenta recuperar $data do cache.
    $data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
        // $data não está no cache, então calcula do zero.
        return getTopProductsFromDatabase($count);
    }, 3600);
    
    return $data;
}
```

Quando o cache tem dados associados à `$key`, ele retorna o valor em cache.
Caso contrário, executa a função anônima passada para calcular o valor a ser
guardado no cache e retornado.

Se a função anônima precisar de dados do escopo externo, você pode passá-los
com a instrução `use`.

## Drivers de cache

O serviço de cache usa drivers de cache compatíveis com a
[PSR-16](https://www.php-fig.org/psr/psr-16/), que representam vários tipos
de armazenamento, como memória, arquivos e bancos de dados.

O Yii fornece os seguintes drivers:

- `NullCache` — um substituto de cache que não faz cache de verdade. O
  objetivo desse driver é simplificar o código que precisa verificar se há
  cache disponível. Por exemplo, durante o desenvolvimento ou se o servidor
  não tiver suporte real a cache, você pode configurar o serviço de cache
  para usar esse driver.  Quando você habilitar o suporte real a cache, pode
  trocar para o driver correspondente.  Nos dois casos, você pode usar o
  mesmo código, sem verificações extras.
- `ArrayCache` — faz cache apenas durante a requisição atual, guardando os
  valores em um array.
- [APCu](https://github.com/yiisoft/cache-apcu) - usa a extensão
  [APC](https://www.php.net/manual/en/book.apcu.php) do PHP.  Você pode
  considerar esta a opção mais rápida ao lidar com cache em uma aplicação
  centralizada e robusta (por exemplo, um servidor, sem load balancers
  dedicados etc.).
- [Banco de dados](https://github.com/yiisoft/cache-db) — usa uma tabela do
  banco de dados para guardar os dados em cache.
- [Arquivo](https://github.com/yiisoft/cache-file) — usa arquivos comuns
  para guardar os dados em cache. É especialmente adequado para guardar
  grandes blocos de dados, como o conteúdo de páginas.
- [Memcached](https://github.com/yiisoft/cache-memcached) — usa a extensão
  [memcached](https://secure.php.net/manual/en/book.memcached.php)  do
  PHP. Você pode considerar esta a opção mais rápida ao lidar com cache em
  uma aplicação distribuída
  (por exemplo, com vários servidores, load balancers etc.)
- [Wincache](https://github.com/yiisoft/cache-wincache) — usa a extensão [WinCache](https://iis.net/downloads/microsoft/wincache-extension)
  ([veja também](https://secure.php.net/manual/en/book.wincache.php)) do PHP.

[Você encontra mais drivers no
packagist.org](https://packagist.org/providers/psr/simple-cache-implementation).

> [!TIP]
> Você pode usar armazenamentos de cache diferentes na mesma aplicação. Uma estratégia comum é:
> - Usar armazenamento de cache em memória para dados pequenos, mas usados constantemente (por exemplo, estatísticas)
> - Usar armazenamento de cache em arquivo ou em banco de dados para dados grandes e usados com menos frequência (por exemplo, conteúdo de páginas)

Os drivers de cache normalmente são configurados em um [container de injeção
de dependência](../concept/di-container.md), para que possam ser
configurados e acessados globalmente.

Como todos os drivers de cache suportam o mesmo conjunto de APIs, você pode
trocar o driver de cache subjacente por outro. Basta reconfigurar a
aplicação, sem modificar o código que usa o cache.

### Chaves de cache

Uma chave identifica de forma única cada item de dados guardado no cache. Ao
guardar um item, você precisa especificar uma chave para ele. Depois, ao
recuperar o item, você deve informar a chave correspondente.

Você pode usar uma string ou um valor arbitrário como chave de cache. Quando
a chave não é uma string, ela é serializada automaticamente em uma string.

Uma estratégia comum para definir uma chave de cache é incluir todos os
fatores determinantes em um array.

Quando aplicações diferentes usam o mesmo armazenamento de cache, você deve
especificar um prefixo de chave de cache único para cada aplicação, para
evitar conflitos de chaves.  Você pode fazer isso usando o decorator
`\Yiisoft\Cache\PrefixedCache`:

```php
$arrayCacheWithPrefix = new \Yiisoft\Cache\PrefixedCache(new \Yiisoft\Cache\ArrayCache(), 'myapp_');
$cache = new \Yiisoft\Cache\Cache($arrayCacheWithPrefix);
```

### Expiração do cache

Um item de dados guardado no cache fica lá para sempre, a menos que seja
removido por alguma política de cache. Por exemplo, o espaço do cache fica
cheio e o armazenamento remove os dados mais antigos.  Para mudar esse
comportamento, você pode definir um parâmetro TTL ao chamar um método que
guarda um item:

```php
$ttl = 3600;
$data = $cache->getOrSet($key, function (\Psr\SimpleCache\CacheInterface $cache) use ($count) {
return getTopProductsFromDatabase($count);
}, $ttl);
```

O parâmetro `$ttl` indica por quantos segundos o item pode continuar válido
no cache. Ao recuperar o item, se o tempo de expiração já tiver passado, o
método executa a função e grava o valor resultante no cache.

Você pode definir o TTL padrão do cache:

```php
$cache = new \Yiisoft\Cache\Cache($arrayCache, 60 * 60); // 1 hora
```

Além disso, você pode invalidar uma chave de cache explicitamente:

```php
$cache->remove($key);
```

### Dependências de invalidação

Além da configuração de expiração, mudanças nas chamadas **dependências de
invalidação** também podem invalidar um item em cache.  Por exemplo,
`\Yiisoft\Cache\Dependency\FileDependency` representa a dependência da data
de modificação de um arquivo.  Quando essa dependência muda, significa que
algo modificou o arquivo correspondente.  Como resultado, qualquer conteúdo
desatualizado do arquivo encontrado no cache deve ser invalidado.

As dependências de cache são objetos de classes descendentes de
`\Yiisoft\Cache\Dependency\Dependency`. Ao guardar um item no cache, você
pode passar junto um objeto de dependência de cache associado. Por exemplo,

```php
/**
 * @var callable $callable
 * @var \Yiisoft\Cache\CacheInterface $cache
 */

use Yiisoft\Cache\Dependency\TagDependency;

// Grava vários valores no cache, marcando ambos com uma tag.
$cache->getOrSet('item_42_price', $callable, null, new TagDependency('item_42'));
$cache->getOrSet('item_42_total', $callable, 3600, new TagDependency('item_42'));

// Dispara a invalidação pela tag.
TagDependency::invalidate($cache, 'item_42');
```

Veja um resumo das dependências de cache disponíveis:

- `\Yiisoft\Cache\Dependency\ValueDependency`: invalida o cache quando o
  valor especificado muda.
- `\Yiisoft\Cache\Dependency\CallbackDependency`: invalida o cache quando o
  resultado do callback PHP especificado é diferente.
- `\Yiisoft\Cache\Dependency\FileDependency`: invalida o cache quando a data
  da última modificação do arquivo é diferente.
- `\Yiisoft\Cache\Dependency\TagDependency`: associa um item em cache a uma
  ou várias tags. Você pode invalidar os itens em cache com as tags
  especificadas chamando `TagDependency::invalidate()`.

Você pode combinar várias dependências usando
`\Yiisoft\Cache\Dependency\AnyDependency` ou
`\Yiisoft\Cache\Dependency\AllDependencies`.

Para implementar a sua própria dependência, estenda
`\Yiisoft\Cache\Dependency\Dependency`.

### Prevenção do efeito manada

O [efeito manada (cache
stampede)](https://en.wikipedia.org/wiki/Cache_stampede) é um tipo de falha
em cascata que pode ocorrer quando sistemas de computação massivamente
paralelos com mecanismos de cache ficam sob carga alta.  Esse comportamento
às vezes também é chamado de dog-piling.

O `\Yiisoft\Cache\Cache` usa um algoritmo embutido de "expiração antecipada
probabilística" ("Probably early expiration") que evita o efeito manada.
Esse algoritmo simula aleatoriamente um cache miss para um usuário enquanto
os outros continuam recebendo o valor em cache.  Você pode controlar o
comportamento dele com o quinto parâmetro opcional de `getOrSet()`, um valor
float chamado `$beta`.  Por padrão, beta é `1.0`, o que costuma ser
suficiente.  Quanto maior o valor, mais cedo o cache será recriado.

```php
/**
 * @var mixed $key
 * @var callable $callable
 * @var \DateInterval $ttl
 * @var \Yiisoft\Cache\CacheInterface $cache
 * @var \Yiisoft\Cache\Dependency\Dependency $dependency
 */

$beta = 2.0;
$cache->getOrSet($key, $callable, $ttl, $dependency, $beta);
```
