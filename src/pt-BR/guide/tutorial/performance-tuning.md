# Ajuste de desempenho

Muitos fatores afetam o desempenho da sua aplicação. Alguns são do ambiente,
outros estão ligados ao seu código, e outros ao próprio Yii. Nesta seção,
listamos a maioria desses fatores e explicamos como você pode melhorar o
desempenho da aplicação ajustando cada um deles.


## Otimizando o ambiente PHP

Um ambiente PHP bem configurado é importante. Para obter o máximo de
desempenho:

- Use a versão estável mais recente do PHP. Versões principais do PHP podem
  trazer ganhos de desempenho significativos.
- Ative o cache de bytecode com o
  [Opcache](https://secure.php.net/opcache).  O cache de bytecode evita o
  tempo gasto para analisar e incluir os scripts PHP a cada requisição.
- [Ajuste o cache do
  `realpath()`](https://github.com/samdark/realpath_cache_tuner).
- Garanta que o [XDebug](https://xdebug.org/) não esteja instalado no
  ambiente de produção.
- Experimente o [preload do PHP 7](https://wiki.php.net/rfc/preload).

## Otimizando o seu código

Além da configuração do ambiente, há otimizações no nível do código que
podem melhorar o desempenho da aplicação:

- Fique atento à [complexidade dos
  algoritmos](https://en.wikipedia.org/wiki/Time_complexity).  Preste
  atenção especial a loops `foreach` dentro de `foreach`, mas também ao uso
  de [funções PHP
  pesadas](https://stackoverflow.com/questions/2473989/list-of-big-o-for-php-functions)
  dentro de loops.
- [Acelerando o
  array_merge()](https://www.exakat.io/speeding-up-array_merge/)
- [Mova aquele foreach() para dentro do
  método](https://www.exakat.io/move-that-foreach-inside-the-method/)
- [Uso de memória de arrays, classes e classes
  anônimas](https://www.exakat.io/array-classes-and-anonymous-memory-usage/)
- Use nomes de funções totalmente qualificados, com barra invertida no
  início, para otimizar o desempenho do opcache.  Ao chamar [certas funções
  globais](https://github.com/php/php-src/blob/944b6b6bbd6f05ad905f5f4ad07445792bee4027/Zend/zend_compile.c#L4291-L4353)
  de dentro de um namespace, o PHP primeiro procura no namespace atual antes
  de recorrer ao namespace global.  Adicionar a barra invertida no início
  (por exemplo, `\count()` em vez de `count()`) diz ao PHP para usar
  diretamente a função global, evitando a busca no namespace e melhorando a
  eficiência do opcache. O melhor é aplicar essa otimização automaticamente
  com ferramentas como o
  [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer), usando a
  regra `native_function_invocation`.

As otimizações acima só trazem um ganho de desempenho significativo se o
código em questão for executado com frequência. Normalmente é o caso de
loops grandes ou de processamento em lote.

## Usando técnicas de cache

Você pode usar várias técnicas de cache para melhorar bastante o desempenho
da aplicação. Por exemplo, se a sua aplicação permite que os usuários
digitem texto em Markdown, considere guardar em cache o conteúdo Markdown já
processado, para não processar o mesmo texto repetidamente a cada
requisição. Consulte a seção de [Cache](../caching/overview.md) para
conhecer o suporte a cache oferecido pelo Yii.


## Otimizando o armazenamento de sessões

Por padrão, os dados de sessão são guardados em arquivos. A implementação trava o arquivo desde a abertura da sessão até o momento em que ela é
fechada, seja por `$session->close()` ou no fim da requisição.
Enquanto o arquivo de sessão está travado, todas as outras requisições que tentam usar a mesma sessão ficam bloqueadas, esperando a
requisição inicial liberar o arquivo de sessão. Isso serve para desenvolvimento e, provavelmente, para projetos pequenos. Mas quando se trata
de lidar com muitas requisições concorrentes, é melhor usar um armazenamento mais sofisticado, como o Redis.

Isso pode ser feito [configurando o PHP via
php.ini](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-redis-server-as-a-session-handler-for-php-on-ubuntu-14-04)
ou [implementando a
SessionHandlerInterface](https://www.sitepoint.com/saving-php-sessions-in-redis/)
e configurando o serviço de sessão assim:

```php
\Yiisoft\Session\SessionInterface::class => [
    'class' => \Yiisoft\Session\Session::class,
    '__construct()' => [[], $myCustomSessionHandler],
],
```

## Otimizando bancos de dados

Executar consultas e buscar dados no banco de dados costuma ser o principal
gargalo de desempenho de uma aplicação web. Embora técnicas de [cache de
dados](../caching/data.md) possam amenizar o impacto, elas não resolvem
totalmente o problema. Quando o banco de dados tem uma quantidade enorme de
dados e os dados em cache ficam inválidos, buscar os dados mais recentes
pode ficar caro demais sem um bom projeto de banco de dados e de consultas.

Uma técnica geral para melhorar o desempenho das consultas é criar índices
nas colunas das tabelas usadas em filtros. Por exemplo, se você precisa
buscar o registro de um usuário pelo `username`, crie um índice em
`username`. Note que, embora a indexação possa deixar as consultas SELECT
muito mais rápidas, ela deixa as consultas INSERT, UPDATE e DELETE mais
lentas.

Para consultas complexas, é recomendável criar views no banco de dados para
economizar o tempo de análise e preparação da consulta.

Por último, mas não menos importante, use `LIMIT` nas suas consultas
`SELECT`. Isso evita buscar uma quantidade excessiva de dados no banco e
esgotar a memória alocada para o PHP.


## Otimizando o autoloader do Composer

Como o autoloader do Composer é usado para incluir a maioria dos arquivos de
classes de terceiros, considere otimizá-lo executando o seguinte comando:

```
composer dumpautoload -o
```

Além disso, você pode considerar o uso de [class maps
autoritativos](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-a-authoritative-class-maps)
e do [cache
APCu](https://getcomposer.org/doc/articles/autoloader-optimization.md#optimization-level-2-b-apcu-cache).
Note que essas duas otimizações podem ou não ser adequadas ao seu caso.


## Processando dados offline

Quando uma requisição envolve operações que consomem muitos recursos, pense
em formas de executá-las em modo offline, sem fazer os usuários esperarem
que terminem.

Há dois métodos para processar dados offline: pull e push.

No método pull, sempre que uma requisição envolve alguma operação complexa,
você cria uma tarefa e a salva num armazenamento persistente, como um banco
de dados. Depois, usa um processo separado (como um cron job) para buscar as
tarefas e processá-las.  Esse método é simples de implementar, mas tem
algumas desvantagens. Por exemplo, o processo de tarefas precisa consultar
periodicamente o armazenamento de tarefas. Se a frequência for baixa demais,
as tarefas podem ser processadas com muito atraso; se for alta demais, gera
muito overhead.

No método push, você usa uma fila de mensagens (por exemplo, RabbitMQ,
ActiveMQ, Amazon SQS etc.) para gerenciar as tarefas.  Sempre que uma nova
tarefa entra na fila, ela inicia ou notifica o processo responsável, que
dispara o processamento da tarefa.

## Usando preload

A partir do PHP 7.4.0, o PHP pode ser configurado para pré-carregar scripts
no opcache quando o engine inicia.  Saiba mais na
[documentação](https://www.php.net/manual/en/opcache.preloading.php)  e na
[RFC](https://wiki.php.net/rfc/preload) correspondente.

Note que o equilíbrio ideal entre desempenho e memória pode variar conforme
a aplicação. "Pré-carregar tudo" pode ser a estratégia mais fácil, mas não
necessariamente a melhor.

Por exemplo, fizemos um benchmark simples do template de aplicação
[yiisoft/app](https://github.com/yiisoft/app): sem preload e com preload de
todo o class map do Composer.

### Benchmarks de preload

O benchmark do template de aplicação inclui a configuração das classes para
as dependências injetadas no script de bootstrap.

Nas duas variantes, foi usado o
[ApacheBench](https://httpd.apache.org/docs/2.4/programs/ab.html)  com os
seguintes parâmetros de execução:

```shell
ab -n 1000 -c 10 -t 10
```

Além disso, o modo debug estava desativado. Também foi usado um autoloader
otimizado do [Composer](https://getcomposer.org), sem as dependências de
desenvolvimento:

```shell
composer install --optimize-autoloader --no-dev
```

Com o preload ativado, foi usado todo o class map do Composer (825
arquivos):

```php
$files = require 'vendor/composer/autoload_classmap.php';

foreach (array_unique($files) as $file) {
    opcache_compile_file($file);
}
```

#### Resultados dos testes

| Benchmark          | Arquivos pré-carregados | Memória do Opcache usada | Memória usada por requisição | Tempo por requisição | Requisições por segundo |
|--------------------|-------------------------|--------------------------|------------------------------|----------------------|-------------------------|
| Sem preload        | 0                       | 12.32 mb                 | 1.71 mb                      | 27.63 ms             | 36.55 rq/s              |
| Com preload        | 825                     | 17.86 mb                 | 1.82 mb                      | 26.21 ms             | 38.42 rq/s              |

Como você pode ver, os resultados não são muito diferentes, já que este é
apenas um template de aplicação limpo, com poucas classes. Mais discussões
sobre preload, incluindo benchmarks, estão na [issue do
Composer](https://github.com/composer/composer/issues/7777).

## Profiling de desempenho

Faça o profiling do seu código para encontrar os gargalos de desempenho e
tomar as medidas adequadas.  As seguintes ferramentas de profiling podem ser
úteis:

<!-- - [Yii debug toolbar and debugger](https://github.com/yiisoft/yii2-debug/blob/master/docs/guide/README.md) -->

- [Blackfire](https://blackfire.io/)
- [XHProf](https://secure.php.net/manual/en/book.xhprof.php)
- [Profiler do XDebug](https://xdebug.org/docs/profiler)
