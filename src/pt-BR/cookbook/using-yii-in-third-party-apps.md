# Usando o Yii em aplicações de terceiros

Às vezes um projeto já tem um ponto de entrada controlado por outro
framework, CMS ou aplicação legada, mas você ainda quer reaproveitar
serviços do Yii: configuração, definições de DI, serviços de domínio, logs,
mailers, conexões com banco de dados ou código de aplicação voltado ao
console.

O Yii3 não tem um singleton global de aplicação. Inicialize o container do
Yii explicitamente e passe os serviços de que você precisa ao código de
terceiros.

## Inicialize o container do Yii

Crie um pequeno adaptador na aplicação hospedeira, por exemplo
`bootstrap-yii-services.php`:

```php
<?php

declare(strict_types=1);

use App\Environment;
use Psr\Container\ContainerInterface;
use Yiisoft\Config\Config;
use Yiisoft\Config\ConfigInterface;
use Yiisoft\Config\ConfigPaths;
use Yiisoft\Config\Modifier\RecursiveMerge;
use Yiisoft\Config\Modifier\ReverseMerge;
use Yiisoft\Di\Container;
use Yiisoft\Di\ContainerConfig;

function yiiContainer(string $yiiRoot): ContainerInterface
{
    require_once $yiiRoot . '/src/bootstrap.php';

    $paramsGroup = 'params-console';
    $eventsGroups = ['events-console', 'events'];

    $config = new Config(
        paths: new ConfigPaths($yiiRoot, 'config', 'vendor'),
        environment: Environment::appEnv(),
        modifiers: [
            ReverseMerge::groups(...$eventsGroups),
            RecursiveMerge::groups($paramsGroup, 'params', ...$eventsGroups),
        ],
        paramsGroup: $paramsGroup,
    );

    $containerConfig = ContainerConfig::create()
        ->withValidate(Environment::appDebug())
        ->withDefinitions(array_merge(
            $config->get('di-console'),
            [ConfigInterface::class => $config],
        ))
        ->withProviders($config->get('di-providers-console'))
        ->withDelegates($config->get('di-delegates-console'));

    if ($config->has('di-tags-console')) {
        $containerConfig = $containerConfig->withTags($config->get('di-tags-console'));
    }

    $container = new Container($containerConfig);

    foreach ($config->get('bootstrap-console') as $callback) {
        if (!is_callable($callback)) {
            throw new RuntimeException(sprintf(
                'Bootstrap callback must be callable, "%s" given.',
                get_debug_type($callback),
            ));
        }

        $callback($container);
    }

    return $container;
}
```

O adaptador monta apenas a configuração e o container de DI do Yii e depois
executa os callbacks de bootstrap configurados. Ele não cria nem executa um
runner de aplicação do Yii, então a aplicação de terceiros continua dona do
ponto de entrada e do ciclo de vida do processo.

Use os grupos de configuração de console quando precisar de serviços comuns
e serviços seguros para o console. Use os grupos web apenas quando precisar
intencionalmente de definições específicas da web do grupo `di-web`, como as
factories HTTP da PSR-17 ou dependências de middlewares web.

## Obtenha serviços do Yii a partir da aplicação hospedeira

Use o adaptador a partir da aplicação de terceiros:

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;

require_once __DIR__ . '/path/to/yii-app/vendor/autoload.php';
require_once __DIR__ . '/bootstrap-yii-services.php';

$container = yiiContainer(__DIR__ . '/path/to/yii-app');

/** @var ApplicationParams $params */
$params = $container->get(ApplicationParams::class);

echo $params->name;
```

Em integrações reais, prefira obter os serviços da sua própria aplicação em
vez da infraestrutura do framework. Por exemplo, exponha `InvoiceSender`,
`ReportBuilder` ou `CatalogImporter` a partir do Yii e chame esse serviço na
aplicação hospedeira.

## Mantenha os limites explícitos

Evite misturar ciclos de vida de requisição. Deixe a aplicação hospedeira
continuar dona da requisição e da resposta HTTP. Deixe o Yii fornecer
serviços que não pressupõem que o Yii está tratando a requisição atual.

Bons candidatos para reaproveitamento:

- serviços de domínio;
- repositórios e conexões com banco de dados;
- mailers e serviços de notificação;
- loggers;
- validadores;
- produtores de fila;
- serviços de aplicação no estilo de comandos.

Evite trazer actions, pilhas de middlewares, sessões, middleware de CSRF ou
renderização de views do Yii, a menos que a aplicação hospedeira delegue
explicitamente essa responsabilidade inteira ao Yii.

## Grupos de configuração

O template de aplicação padrão separa a configuração por grupo:

- `di` é compartilhado pelos pontos de entrada web e de console;
- `di-console` é específico do console e inclui `di` no template;
- `di-web` é específico da web e inclui `di`;
- `params-console` e `params-web` estendem o `params` comum.

Escolha o menor grupo que contém os serviços de que você precisa. Se a
aplicação hospedeira só precisa de serviços de domínio, mantenha essas
definições em `config/common/di/*.php` para que tanto o Yii quanto a
aplicação de terceiros possam usá-las sem dependências exclusivas da web.

Depois de alterar `config/configuration.php`, reconstrua o merge plan:

```shell
composer yii-config-rebuild
```

## Tratamento de erros e logs

A aplicação hospedeira deve continuar responsável pelo tratamento de erros
de nível mais alto. Capture as exceções na fronteira da integração quando a
aplicação hospedeira precisar convertê-las na sua própria resposta ou
formato de erro.

Os serviços do Yii ainda podem usar `Psr\Log\LoggerInterface`. Configure o
logger do Yii para gravar no mesmo destino da aplicação hospedeira ou
conecte as duas aplicações ao mesmo logger PSR-3.

## Processos hospedeiros de longa duração

Se a aplicação de terceiros for um worker, um daemon ou um servidor com
event loop, evite estado mutável compartilhado nos serviços. Os serviços do
Yii obtidos do container são compartilhados por padrão, então projete-os
como serviços sem estado ou crie um container novo para cada job isolado
quando dependências com estado forem inevitáveis.
