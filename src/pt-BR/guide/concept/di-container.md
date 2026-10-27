# Injeção de dependência e container

## Injeção de dependência

Há duas formas de reaproveitar código em OOP: herança e composição.

A herança é simples:

```php
class Cache
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget extends Cache
{
    public function render(): string
    {
        $output = $this->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

O problema aqui é que essas duas classes ficam acopladas ou interdependentes
sem necessidade, o que as torna mais frágeis.

Outra forma de resolver isso é a composição:

```php
interface CacheInterface
{
    public function getCachedValue($key);
}

final readonly class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget
{
    public function __construct(
        private CacheInterface $cache
    )
    {
    }
    
    public function render(): string
    {
        $output = $this->cache->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

Evitamos a herança desnecessária e usamos `CacheInterface` no `CacheWidget`
para reduzir o acoplamento.  Você pode trocar a implementação do cache sem
alterar o `CachedWidget`, então ele fica mais estável. Quanto menos edições
forem feitas no código, menor a chance de quebrá-lo.

Aqui, `CacheInterface` é uma dependência: um contrato de que o nosso objeto
precisa para funcionar. Em outras palavras, o nosso objeto depende do
contrato.

O processo de colocar uma instância de um contrato dentro de um objeto
(`CachedWidget`) se chama injeção de dependência.  Há várias formas de fazer
isso:

- Injeção pelo construtor. A melhor para dependências obrigatórias.
- Injeção por método. A melhor para dependências opcionais.
- Injeção por propriedade. É melhor evitar em PHP, exceto talvez em data
  transfer objects.

### Por que usar propriedades privadas

No exemplo de composição acima, repare que a propriedade `$cache` é
declarada como `private`.

Essa abordagem favorece a composição ao garantir que os objetos tenham
interfaces bem definidas para interação, em vez de acesso direto às
propriedades, o que deixa o código mais fácil de manter e menos sujeito a
certos tipos de erro.

Essa escolha de design traz vários benefícios:

- **Encapsulamento**: propriedades privadas com getters/setters permitem
  controlar o acesso e fazer mudanças futuras sem quebrar o código
  existente.
- **Integridade dos dados**: setters podem validar, normalizar ou formatar
  valores antes de armazená-los, garantindo que as propriedades contenham
  dados válidos.
- **Imutabilidade**: propriedades privadas permitem padrões de objetos
  imutáveis, em que os métodos `with*()` retornam novas instâncias em vez de
  modificar a atual.
- **Flexibilidade**: você pode criar propriedades somente leitura ou somente
  escrita, ou acrescentar lógica ao acesso às propriedades mais tarde.


## Container de DI

Injetar dependências básicas é simples. Você escolhe um lugar onde não se
importa com as dependências, que normalmente é um handler de action, que
você nunca vai testar com testes unitários, cria as instâncias das
dependências necessárias e as passa para as classes dependentes.

Isso funciona bem quando há poucas dependências no total e quando não há
dependências aninhadas. Quando há muitas e cada dependência tem as suas
próprias dependências, instanciar a hierarquia inteira se torna um processo
tedioso, que exige muito código e pode levar a erros difíceis de depurar.

Além disso, muitas dependências, como certos wrappers de APIs de terceiros,
são as mesmas para qualquer classe que as use.  Então faz sentido:

- Definir como instanciar essas dependências comuns.
- Instanciá-las quando necessário e apenas uma vez por requisição.

É para isso que servem os containers de dependências.

Um container de injeção de dependência (DI) é um objeto que sabe como
instanciar e configurar objetos e todos os objetos dos quais eles dependem.

O Yii fornece o container de DI por meio dos pacotes
[yiisoft/di](https://github.com/yiisoft/di) e
[yiisoft/injector](https://github.com/yiisoft/injector).

> [!NOTE]
> O container contém apenas instâncias compartilhadas. Se você precisar de uma factory, use o pacote dedicado
> [yiisoft/factory](https://github.com/yiisoft/factory).

> [!TIP]
> O [artigo de Martin Fowler](https://martinfowler.com/articles/injection.html) explica bem
> por que um container de DI é útil. Aqui vamos explicar principalmente o uso do container de DI fornecido pelo Yii.

### Configurando o container

Como para criar um novo objeto você precisa das dependências dele,
registre-as o quanto antes.  Você pode fazer isso na configuração da
aplicação, `config/web.php`. Para o seguinte serviço:

```php
final class MyService implements MyServiceInterface
{
    public function __construct(int $amount)
    {
    }

    public function setDiscount(int $discount): void
    {
    
    }
}
```

a configuração poderia ser:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

Isso equivale ao seguinte:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

Você também pode passar argumentos com nomes:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => ['amount' => 42],
        'setDiscount()' => ['discount' => 10],
    ],
];
```

Basicamente é isso. Você define um mapa de interfaces para classes e define
como configurá-las. Quando uma interface é solicitada no construtor ou em
outro lugar, o container cria uma instância da classe e a configura conforme
a configuração:

```php
final class MyAction
{
    public function __construct(
        private readonly MyServiceInterface $myService
    ) {
    }
    
    public function __invoke() 
    {
        $this->myService->doSomething();
    }
}
```

Há outras formas de declarar a configuração de dependências.

Nos casos mais simples, em que não são necessários valores personalizados e
todas as dependências do construtor podem ser obtidas do container, você
pode usar um nome de classe como valor.

```php
interface EngineInterface
{
    
}

final class EngineMarkOne implements EngineInterface
{
    public function __construct(CacheInterface $cache) {
    }   
}
```

No exemplo acima, se já houver um cache definido no container, não é preciso
nada além do nome da classe:

```php
return [
    // declara uma classe para uma interface, resolvendo as dependências automaticamente
    EngineInterface::class => EngineMarkOne::class,
];
```

Se você tiver uma dependência com propriedades públicas, também pode
configurá-la.


```php
final class NameProvider
{
    public string $name;
}
```

Veja como fazer isso no exemplo acima:

```php
NameProvider::class => [
    'class' => NameProvider::class, 
    '$name' => 'Alex',
],
```

Neste exemplo, você pode notar que `NameProvider` aparece duas vezes. A
chave é o que você pode solicitar como dependência, e o valor é como
criá-la.

Se a configuração for complicada e exigir alguma lógica, você pode usar uma
closure:

```php
MyServiceInterface::class => static function(ContainerInterface $container) {
    return new MyService($container->get('db'));
},
```

Além do `ContainerInterface`, você pode solicitar qualquer serviço
registrado diretamente como parâmetro da closure.  O injector vai
resolvê-los e injetá-los automaticamente:

```php
MyServiceInterface::class => static function(ConnectionInterface $db) {
    return new MyService($db);
},
```

É possível usar a chamada de um método estático:

```php
MyServiceInterface::class => [MyFactory::class, 'create'],
```

Ou uma instância de um objeto:

```php
MyServiceInterface::class => new MyService(),
```

### Injetando dependências corretamente

Referenciar o container diretamente em uma classe é uma má ideia, porque o
código deixa de ser genérico, fica acoplado à interface do container e, pior
ainda, as dependências ficam escondidas.  Por isso, o Yii inverte o
controle, injetando automaticamente objetos do container em alguns
construtores e métodos com base nos tipos dos argumentos.

Isso é feito principalmente no construtor e no método de tratamento dos
handlers de action:

```php
use \Yiisoft\Cache\CacheInterface;

final readonly class MyController
{
    public function __construct(
        private CacheInterface $cache
    )
    {
        $this->cache = $cache;    
    }

    public function actionDashboard(RevenueReport $report)
    {
        $reportData = $this->cache->getOrSet('revenue_report', function() use ($report) {
            return $report->getData();               
        });

        return $this->render('dashboard', [
           'reportData' => $reportData,
        ]);
    }
}
```

Como é o [yiisoft/injector](https://github.com/yiisoft/injector) que
instancia e chama o handler de action, ele verifica os tipos dos argumentos
do construtor e do método, obtém do container as dependências desses tipos e
as passa como argumentos. Isso normalmente se chama autowiring. Acontece
também com as subdependências: se você não fornecer uma dependência
explicitamente, o container vai verificar primeiro se tem essa dependência.
Basta declarar a dependência de que você precisa, e ela será obtida do
container automaticamente.


## Referências

- [Inversion of Control Containers and the Dependency Injection pattern, de
  Martin Fowler](https://martinfowler.com/articles/injection.html)
