# Logs

O Yii usa as [interfaces PSR-3](https://www.php-fig.org/psr/psr-3/) para
logs, então você pode configurar qualquer biblioteca de log compatível com a
PSR-3 para fazer o trabalho.

O Yii oferece o seu próprio logger, que é bem personalizável e extensível.
Com ele, você pode registrar vários tipos de mensagens, filtrá-las e
reuni-las em destinos diferentes, como arquivos ou e-mails.

Usar o sistema de logs do Yii envolve os seguintes passos:
 
* Registrar [mensagens de log](#mensagens-de-log) em vários pontos do
  código;
* Configurar [destinos de log](#destinos-de-log) na configuração da
  aplicação para filtrar e exportar as mensagens;
* Examinar as mensagens filtradas exportadas pelos diferentes destinos (por
  exemplo, o debugger do Yii).

Esta seção foca nos dois primeiros passos.

## Destino padrão dos logs

Os templates de aplicação do Yii3
([web](https://github.com/yiisoft/app/blob/master/config/common/di/logger.php)
e
[API](https://github.com/yiisoft/app-api/blob/master/config/common/di/logger.php))
configuram o `Yiisoft\Log\StreamTarget`, que por padrão escreve na saída
padrão (`stdout`, ou `php://stdout`).  Eles não criam arquivos de log da
aplicação, como `runtime/logs/app.log`.  O `StreamTarget` também suporta a
saída de erro padrão (`stderr`, ou `php://stderr`), mas você precisa
configurá-la explicitamente.

Isso funciona bem com o Docker, que [coleta a saída dos containers](https://docs.docker.com/engine/logging/).
Use `docker logs <container>` para lê-la quando o driver de log do container suportar esse comando.

Sem containers, o destino depende de como você inicia o PHP e captura a
saída dele.  Por exemplo, o PHP-FPM descarta a saída dos workers por padrão,
a menos que você ative `catch_workers_output`.  Veja a [configuração de logs
do servidor
web](../../cookbook/configuring-webservers/general.md#logs-da-aplicacao).
Para o Yii escrever arquivos de log da aplicação diretamente, configure um
[destino em arquivo](#logs-em-arquivos).

## Mensagens de log

Para registrar mensagens de log, você precisa de uma instância de um logger
PSR-3.  Uma classe que escreve mensagens de log deve recebê-lo como
dependência:

```php
class MyService
{
    private $logger;
    
    public function __construct(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;    
    }
}
```

Registrar uma mensagem de log é tão simples quanto chamar um dos métodos a
seguir, que correspondem aos níveis de log:

- `emergency` - O sistema está inutilizável.
- `alert` - É preciso agir imediatamente.  Exemplo: site inteiro fora do ar,
  banco de dados indisponível etc.  Isso deve disparar os alertas por SMS e
  acordar você.
- `critical` - Condições críticas. Exemplo: componente da aplicação
  indisponível, exceção inesperada.
- `error` - Erros em tempo de execução que não exigem ação imediata, mas
  normalmente devem ser registrados e monitorados.
- `warning` - Ocorrências excepcionais que não são erros. Exemplo: uso de
  APIs obsoletas, uso inadequado de uma API, coisas indesejáveis que não
  estão necessariamente erradas.
- `notice` - Eventos normais, mas significativos.
- `info` - Eventos interessantes. Exemplo: login de usuário, logs de SQL.
- `debug` - Informações detalhadas de debug.

Cada método tem dois argumentos.  O primeiro é a mensagem.  O segundo é um
array de contexto, que normalmente tem dados estruturados que não cabem bem
na mensagem, mas trazem informações importantes.  Se você passar uma exceção
no contexto, use a chave "exception".  Outra chave especial é "category". As
categorias ajudam a organizar e filtrar melhor as mensagens de log.

```php
use \Psr\Log\LoggerInterface;

final readonly class MyService
{
    public function __construct(
        private LoggerInterface $logger
    )
    {    
    }

    public function serve(): void
    {
        $this->logger->info('MyService is serving', ['context' => __METHOD__]);    
    }
}
```

Ao escolher a categoria de uma mensagem, você pode adotar um esquema de
nomes hierárquico, o que facilita para os [destinos de
log](#destinos-de-log) filtrarem as mensagens pela categoria. Um esquema
simples e eficaz é usar a constante mágica do PHP `__METHOD__` como nome da
categoria. Essa também é a abordagem usada no código do core do Yii.

A constante `__METHOD__` resulta no nome do método (prefixado com o nome
completo da classe) onde ela aparece.  Por exemplo, ela é igual à string
`'App\\Service\\MyService::serve'` se a linha de código acima for chamada
dentro desse método.

> [!IMPORTANT]
> Os métodos de log descritos acima são, na verdade, atalhos para [[\Psr\Log\LoggerInterface::log()]].

O pacote PSR-3 tem a classe `\Psr\Log\NullLogger`, que oferece o mesmo
conjunto de métodos, mas não registra nada. Isso significa que você não
precisa verificar se o logger está configurado com `if ($logger !== null)` e
pode assumir que o logger sempre existe.


## Destinos de log

Um destino de log é uma instância de uma classe que estende
[[\Yiisoft\Log\Target]]. Ele filtra as mensagens de log pelo nível de
severidade e pela categoria e depois as exporta para algum meio. Por
exemplo, um [[\Yiisoft\Log\Target\File\FileTarget|destino em arquivo]]
exporta as mensagens filtradas para um arquivo, enquanto um
[[Yiisoft\Log\Target\Email\EmailTarget|destino por e-mail]] exporta as
mensagens para os endereços de e-mail definidos.

Você pode registrar vários destinos de log em uma aplicação configurando-os
no construtor de `\Yiisoft\Log\Logger`:

```php
use \Psr\Log\LogLevel;

$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);

$emailTarget = new \Yiisoft\Log\Target\Email\EmailTarget($mailer, ['to' => 'log@example.com']);
$emailTarget->setLevels([LogLevel::EMERGENCY, LogLevel::ALERT, LogLevel::CRITICAL]);
$emailTarget->setCategories(['Yiisoft\Cache\*']); 

$logger = new \Yiisoft\Log\Logger([
    $fileTarget,
    $emailTarget
]);
```

No código acima, dois destinos de log são registrados:

* o primeiro seleciona as mensagens de erro e de warning e as grava no
  arquivo `/path/to/app.log`;
* o segundo seleciona as mensagens de emergency, alert e critical das categorias cujos nomes começam com
`Yiisoft\Cache\` e as envia por e-mail para `admin@example.com` e `developer@example.com`.

O Yii vem com os seguintes destinos de log embutidos. Consulte a
documentação da API dessas classes para saber como configurá-los e usá-los.

* [[\Yiisoft\Log\PsrTarget]]: repassa as mensagens de log para outro logger
  compatível com a PSR-3.
* [[\Yiisoft\Log\StreamTarget]]: escreve as mensagens de log em um stream de
  saída definido.
* [[\Yiisoft\Log\Target\Db\DbTarget]]: salva as mensagens de log no banco de
  dados.
* [[\Yiisoft\Log\Target\Email\EmailTarget]]: envia as mensagens de log para
  endereços de e-mail definidos.
* [[\Yiisoft\Log\Target\File\FileTarget]]: salva as mensagens de log em
  arquivos.
* [[\Yiisoft\Log\Target\Syslog\SyslogTarget]]: salva as mensagens de log no
  syslog chamando a função PHP `syslog()`.

### Logs em arquivos

Para gravar os logs da aplicação em um arquivo, instale o pacote do destino
em arquivo:

```shell
composer require yiisoft/log-target-file
```

No `config/common/di/logger.php` da sua aplicação, troque a referência ao
`StreamTarget` por `FileTarget`:

```php
use Psr\Log\LoggerInterface;
use Yiisoft\Definitions\ReferencesArray;
use Yiisoft\Log\Logger;
use Yiisoft\Log\Target\File\FileTarget;

return [
    LoggerInterface::class => [
        'class' => Logger::class,
        '__construct()' => [
            'targets' => ReferencesArray::from([
                FileTarget::class,
            ]),
        ],
    ],
];
```

A configuração padrão do pacote grava em `@runtime/logs/app.log` e ativa a
rotação de logs.  Para mudar o caminho, defina
`$params['yiisoft/log-target-file']['fileTarget']['file']` em
`config/common/params.php`.  Garanta que o processo do PHP consiga escrever
no diretório de logs e mantenha esse diretório fora do document root do
servidor web.

A configuração padrão do pacote de destino em arquivo também descarta as
mensagens `alert`, `critical` e `notice`.  O `StreamTarget` dos templates
aceita os oito níveis de log. Para manter esse comportamento, adicione a
seguinte entrada ao array retornado por `config/common/params.php`:

```php
use Psr\Log\LogLevel;

return [
    // Other application parameters...
    'yiisoft/log-target-file' => [
        'fileTarget' => [
            'levels' => [
                LogLevel::EMERGENCY,
                LogLevel::ALERT,
                LogLevel::CRITICAL,
                LogLevel::ERROR,
                LogLevel::WARNING,
                LogLevel::NOTICE,
                LogLevel::INFO,
                LogLevel::DEBUG,
            ],
        ],
    ],
];
```

A seguir, descrevemos os recursos comuns a todos os destinos de log.

### Filtragem de mensagens

Para cada destino de log, você pode configurar os níveis e as categorias,
definindo quais níveis de severidade e quais categorias de mensagens o
destino deve processar.

O método `setLevels()` do destino recebe um array com uma ou mais constantes
de `\Psr\Log\LogLevel`.

Por padrão, o destino processa mensagens de *qualquer* nível de severidade.

O método `setCategories()` do destino recebe um array com nomes ou padrões
de categorias de mensagens.  O destino só processa as mensagens cuja
categoria esteja no array ou case com um dos padrões dele.  Um padrão de
categoria é um prefixo de nome de categoria com um asterisco `*` no
final. Um nome de categoria casa com o padrão se começar com o mesmo
prefixo. Por exemplo, `Yiisoft\Cache\Cache::set` e
`Yiisoft\Cache\Cache::get` casam com o padrão `Yiisoft\Cache\*`.

Por padrão, o destino processa mensagens de *qualquer* categoria.

Além de permitir categorias com o método `setCategories()`, você também pode
negar certas categorias com o método `setExcept()`.  Se a categoria de uma
mensagem estiver nessa lista ou casar com um dos padrões dela, o destino NÃO
vai processá-la.
 
A configuração a seguir define que o destino só deve processar mensagens de
erro e de warning das categorias cujos nomes casem com `Yiisoft\Cache\*` ou
`App\Exceptions\HttpException:*`, mas não com
`App\Exceptions\HttpException:404`.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setLevels([LogLevel::ERROR, LogLevel::WARNING]);
$fileTarget->setCategories(['Yiisoft\Cache\*', 'App\Exceptions\HttpException:*']);
$fileTarget->setExcept(['App\Exceptions\HttpException:404']);
```

### Formatação de mensagens

Os destinos de log exportam as mensagens filtradas em um certo formato.  Por
exemplo, se você instalar um destino de log da classe
[[\Yiisoft\Log\Target\File\FileTarget]], pode encontrar no arquivo de log
uma mensagem parecida com esta:

```
2020-12-05 09:27:52.223800 [info][application] Some message

Message context:

time: 1607160472.2238
memory: 4398536
category: 'application'
```

Por padrão, as mensagens de log têm o seguinte formato:

```
Timestamp Prefix[Level][Category] Message Context
```

Você pode personalizar esse formato chamando o método
[[\Yiisoft\Log\Target::setFormat()|setFormat()]], que recebe um callable PHP
que retorna a mensagem formatada.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');

$fileTarget->setFormat(static function (\Yiisoft\Log\Message $message) {
    $category = strtoupper($message->context('category'));
    return "({$category}) [{$message->level()}] {$message->message()}";
});

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->info('Text message', ['category' => 'app']);

// Result:
// (APP) [info] Text message
```

Além disso, se o formato padrão da mensagem servir para você, mas for
preciso mudar o formato do timestamp ou adicionar dados à mensagem, você
pode chamar os métodos
[[\Yiisoft\Log\Target::setTimestampFormat()|setTimestampFormat()]] e
[[\Yiisoft\Log\Target::setPrefix()|setPrefix()]]. Por exemplo, o código a
seguir muda o formato do timestamp e configura um destino de log para
prefixar cada mensagem com o ID do usuário atual (o endereço IP e o ID da
sessão foram removidos por questões de privacidade).

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$userId = '123e4567-e89b-12d3-a456-426655440000';

// Default: 'Y-m-d H: i: s.u'
$fileTarget->setTimestampFormat('D d F Y');
// Default: ''
$fileTarget->setPrefix(static fn () => "[{$userId}]");

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->info('Text', ['category' => 'user']);

// Result:
// Fri 04 December 2020 [123e4567-e89b-12d3-a456-426655440000][info][user] Text
// Message context: ...
// Common context: ...
```

O callable PHP passado para os métodos
[[\Yiisoft\Log\Target::setFormat()|setFormat()]] e
[[\Yiisoft\Log\Target::setPrefix()|setPrefix()]] tem a seguinte assinatura:

```php
function (\Yiisoft\Log\Message $message, array $commonContext): string;
```

Além dos prefixos, os destinos de log também acrescentam algumas informações de contexto comuns a cada mensagem de log.
Você pode ajustar esse comportamento chamando o método [[\Yiisoft\Log\Target::setCommonContext()|setCommonContext()]]
do destino, passando um array de dados no formato `key => value` com o que você quer incluir.
Por exemplo, a configuração de destino a seguir define que apenas o
valor da variável `$_SERVER` será acrescentado às mensagens de log.

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setCommonContext(['server' => $_SERVER]);
```


### Nível de trace das mensagens

Durante o desenvolvimento, muitas vezes é útil ver de onde vem cada mensagem
de log.  Você pode fazer isso chamando o método
[[\Yiisoft\Log\Logger::setTraceLevel()|setTraceLevel()]] assim:

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setTraceLevel(3);
```

Essa configuração define o nível de trace como 3, então cada mensagem de log
recebe no máximo três níveis da pilha de chamadas do ponto em que a mensagem
foi registrada. Você também pode definir uma lista de caminhos a excluir do
trace chamando o método
[[\Yiisoft\Log\Logger::setExcludedTracePaths()|setExcludedTracePaths()]].

```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setExcludedTracePaths(['/path/to/file', '/path/to/folder']);
```

> [!IMPORTANT]
> Obter informações da pilha de chamadas não é trivial. Por isso, use esse recurso apenas durante o desenvolvimento
ou ao depurar uma aplicação.


### Envio (flush) e exportação de mensagens

Como dito acima, as mensagens de log ficam em um array no
[[\Yiisoft\Log\Logger|objeto logger]]. Para limitar o consumo de memória
desse array, o logger envia as mensagens registradas para os [destinos de
log](#destinos-de-log) sempre que o array acumula um certo número de
mensagens. Você pode personalizar esse número chamando o método
[[\Yiisoft\Log\Logger::setFlushInterval()]]:


```php
$logger = new \Yiisoft\Log\Logger($targets);
$logger->setFlushInterval(100); // default is 1000
```

> [!IMPORTANT]
> O envio das mensagens também acontece quando a aplicação termina,
o que garante que os destinos de log recebam as mensagens completas.

Quando o [[\Yiisoft\Log\Logger|objeto logger]] envia as mensagens para os [destinos de log](#destinos-de-log),
elas não são exportadas imediatamente. A exportação só acontece quando um destino de log
 acumula um certo número de mensagens filtradas. Você pode personalizar esse número chamando o método
[[\Yiisoft\Log\Target::setExportInterval()|setExportInterval()]] de cada
[destino de log](#destinos-de-log), assim:

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(100); // default is 1000
```

Por causa dessas configurações de envio e exportação, por padrão, quando
você chama qualquer método de log, NÃO vai ver a mensagem imediatamente nos
destinos de log. Isso pode ser um problema em aplicações de console de longa
duração. Para que cada mensagem apareça imediatamente nos destinos de log,
defina tanto o intervalo de envio quanto o de exportação como 1, como
mostrado abaixo:

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$fileTarget->setExportInterval(1);

$logger = new \Yiisoft\Log\Logger([$fileTarget]);
$logger->setFlushInterval(1);
```

> [!NOTE]
> Enviar e exportar mensagens com frequência piora o desempenho da sua aplicação.


### Ativando e desativando destinos de log

Você pode ativar ou desativar um destino de log chamando os métodos
[[\Yiisoft\Log\Target::enable()|enable()] ] e
[[\Yiisoft\Log\Target::disable()|disable()]].  Você pode fazer isso na
configuração do destino de log ou com a seguinte instrução PHP no seu
código:

```php
$fileTarget = new \Yiisoft\Log\Target\File\FileTarget('/path/to/app.log');
$logger = new \Yiisoft\Log\Logger([$fileTarget, /*Other targets*/]);

foreach ($logger->getTargets() as $target) {
    if ($target instanceof \Yiisoft\Log\Target\File\FileTarget) {
        $target->disable();
    }
}
```

Para verificar se o destino de log está ativado, chame o método
`isEnabled()`.  Você também pode passar um callable para
[[\Yiisoft\Log\Target::setEnabled()|setEnabled()]] para definir uma condição
dinâmica que diz se o destino de log deve estar ativado ou não.


### Criando novos destinos

Criar uma nova classe de destino de log é simples. Basicamente, você precisa
implementar o método abstrato [[\Yii\Log\Target::export()]], que envia todas
as mensagens de log acumuladas para um meio definido.

Os seguintes métodos protegidos também ficam disponíveis para os destinos
filhos:

- `getMessages` - Retorna uma lista de mensagens de log (instâncias de
  [[\Yii\Log\Message]]).
- `getFormattedMessages` - Retorna uma lista de mensagens de log formatadas
  como strings.
- `formatMessages` - Retorna todas as mensagens de log formatadas como uma
  string.
- `getCommonContext` - Retorna um array com os dados de contexto comuns no
  formato `key => value`.

Para mais detalhes, consulte qualquer uma das classes de destino de log
incluídas no pacote.

> [!TIP]
> Em vez de criar os seus próprios loggers, você pode experimentar qualquer logger compatível com a PSR-3, como
o [Monolog](https://github.com/Seldaek/monolog), usando [[\Yii\Log\PsrTarget]].

```php
/**
 * @var \Psr\Log\LoggerInterface $psrLogger
 */

$psrTarget = new \Yiisoft\Log\PsrTarget($psrLogger);
$logger = new \Yiisoft\Log\Logger([$psrTarget]);

$logger->info('Text message');
```
