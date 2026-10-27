# Configuração

Há muitas formas de configurar a sua aplicação. Aqui o foco são os conceitos
usados no [template de projeto padrão](https://github.com/yiisoft/app).

As configurações do Yii3 fazem parte da aplicação. Você pode mudar muitos
aspectos do funcionamento da aplicação editando a configuração na pasta
`config/`.

## Plugin de configuração

O template de aplicação usa o
[yiisoft/config](https://github.com/yiisoft/config) como plugin do Composer
para montar as configurações.

Os pacotes fornecem configurações padrão por meio de [grupos de
configuração](https://github.com/yiisoft/config#config-groups)  definidos na
chave `config-plugin` da seção `extra` do `composer.json`:

```json
"extra": {
    "config-plugin-options": {
        "source-directory": "config",
    },
    "config-plugin": {
        "params": "params.php",
        "web": "web.php"
    }
}
```

Depois que o Composer atualiza os arquivos de autoload, como durante
`dump-autoload`, `install`, `require`, `update` ou `remove`, o plugin
procura configurações nos pacotes instalados e grava um merge plan em
`config/.merge-plan.php`.  O merge plan declara a ordem em que as
configurações encontradas são mescladas na configuração final, que é passada
ao [container de DI](di-container.md).

Em tempo de execução, `Yiisoft\Config\Config` carrega os grupos de
configuração definidos de acordo com esse merge plan.  As configurações são
lidas em três camadas:

1. Configurações dos pacotes em vendor, com os valores padrão.
2. Configurações do pacote raiz, da pasta `config/` da aplicação.
3. Configurações da aplicação específicas de cada ambiente.

> [!WARNING]
> Chaves de configuração com o mesmo nome não são permitidas dentro de uma mesma camada.

O template de aplicação guarda as configurações em um arquivo PHP em vez de
JSON inline:

```json
"extra": {
    "config-plugin-file": "config/configuration.php"
}
```

Esse arquivo retorna as mesmas chaves que você poderia definir no
`composer.json`: `config-plugin`, `config-plugin-options` e
`config-plugin-environments`.

```php
use App\Environment;

return [
    'config-plugin-options' => [
        'source-directory' => 'config',
    ],
    'config-plugin' => [
        'params' => 'common/params.php',
        'params-web' => [
            '$params',
            'web/params.php',
        ],
        'params-console' => [
            '$params',
            'console/params.php',
        ],
        'bootstrap' => 'common/bootstrap.php',
        'bootstrap-web' => '$bootstrap',
        'bootstrap-console' => '$bootstrap',
        'di' => 'common/di/*.php',
        'di-web' => [
            '$di',
            'web/di/*.php',
        ],
        'di-console' => '$di',
        'di-delegates' => [],
        'di-delegates-console' => '$di-delegates',
        'di-delegates-web' => '$di-delegates',
        'di-providers' => [],
        'di-providers-web' => '$di-providers',
        'di-providers-console' => '$di-providers',
        'events' => [],
        'events-web' => '$events',
        'events-console' => '$events',
        'routes' => 'common/routes.php',
    ],
    'config-plugin-environments' => [
        Environment::DEV => [
            'params' => [
                'environments/dev/params.php',
            ],
        ],
        Environment::TEST => [
            'params' => [
                'environments/test/params.php',
            ],
        ],
        Environment::PROD => [
            'params' => [
                'environments/prod/params.php',
            ],
        ],
    ],
];
```

Os nomes dos grupos de configuração são as chaves do mapeamento. Os valores
são caminhos de arquivos relativos à opção `source-directory`, cujo padrão é
a pasta que contém o `composer.json`.

- Um valor string carrega um arquivo.
- Um array carrega e mescla vários arquivos na ordem indicada.
- `?` marca um arquivo opcional.
- `*` marca um caminho com curinga.
- `$group` referencia outro grupo de configuração a ser mesclado.

O grupo `params` é especial: por padrão, os valores dele ficam disponíveis
como `$params` nos outros arquivos de configuração.

Leia mais na [documentação do
yiisoft/config](https://github.com/yiisoft/config/blob/master/README.md).

## Arquivos de configuração

Agora que você sabe como o plugin monta as configurações, veja a estrutura
da pasta `config/` usada pelo template de aplicação padrão:

```
common/
    bootstrap.php
    params.php
    routes.php
    di/
        *.php
console/
    params.php
environments/
    dev/
        params.php
    prod/
        params.php
    test/
        params.php
web/
    params.php
    di/
        *.php
.merge-plan.php
configuration.php
```

Essa estrutura segue os grupos definidos em `config/configuration.php`:

- `params`, `params-web` e `params-console` carregam arquivos de parâmetros
  de `common/`, `web/` e `console/`.
- `di` e `di-web` carregam definições do container de `common/di/` e
  `web/di/`.
- `routes` e `bootstrap` carregam `common/routes.php` e
  `common/bootstrap.php`.
- `config-plugin-environments` acrescenta arquivos de parâmetros específicos
  de cada ambiente de `environments/dev/`, `environments/test/` e
  `environments/prod/`.

Em tempo de execução, `.merge-plan.php` guarda o merge plan montado a partir
de `configuration.php`.

### Configuração do container

A aplicação é formada por serviços registrados em um [container de
dependências](di-container.md). No template padrão, as definições diretas do
container ficam em `config/common/di/*.php` e `config/web/di/*.php`.

As definições de `common/di/` são compartilhadas pelos pontos de entrada web
e de console. O grupo `di-web` acrescenta definições específicas da web, de
`web/di/`. Atualmente, o grupo `di-console` reaproveita as definições
compartilhadas de `di`, sem arquivos extras.

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;

/** @var array $params */

return [
    ApplicationParams::class => [
        '__construct()' => [
            'name' => $params['application']['name'],
            'charset' => $params['application']['charset'],
            'locale' => $params['application']['locale'],
        ],
    ],
];
```

O plugin de configuração passa a variável especial `$params` para todos os
arquivos de configuração. A definição a usa para configurar os serviços.

O guia ["Injeção de dependência e container"](di-container.md) descreve em
detalhes o formato da configuração e a ideia de injeção de dependência.

Por conveniência, existe uma convenção de nomes para chaves string
personalizadas:

1. Prefixe com o nome do pacote, como em
   `yiisoft/cache-file/custom-definition`.
2. Se a configuração for da própria aplicação, omita o prefixo do pacote,
   como em `custom-definition`.

### Service providers

Como alternativa a registrar dependências diretamente, você pode usar
service providers. Um service provider é uma classe que retorna um conjunto
reutilizável de definições e extensões do container.

O template padrão expõe três grupos de configuração para service providers:
`di-providers`, `di-providers-web` e `di-providers-console`. No template,
eles são inicializados como arrays vazios em `config/configuration.php`, e
depois você pode preenchê-los inline ou fazê-los carregar valores de
arquivos.

Prefira a configuração direta do container para serviços da aplicação com
definição simples: um nome de classe, a implementação de uma interface,
argumentos do construtor vindos de `$params` ou uma closure que cria um
único serviço.

Use um service provider quando o próprio registro for uma unidade
reutilizável:

- Um pacote registra vários serviços, aliases ou extensões relacionados.
- O registro de um serviço também precisa de definições de apoio.
- O mesmo registro deve ser reutilizado em várias aplicações.
- O registro depende de classes opcionais ou de decisões específicas do
  ambiente.

Use uma classe factory quando a lógica de construção pertence a um único
serviço. Uma factory retorna um objeto. Um service provider retorna
definições para vários serviços relacionados.

```php
/* @var array $params */

// ...
use App\Provider\CacheProvider;
use App\Provider\MiddlewareProvider;
// ...

return [
    // ...
    'yiisoft/yii-web/middleware' => MiddlewareProvider::class,
    'yiisoft/cache/cache' => new CacheProvider($params['yiisoft/cache-file']['file-cache']['path']),
    // ...
];
```

Nesta configuração, as chaves são os nomes dos providers. Por convenção,
eles seguem o formato `vendor/package-name/provider-name`. Os valores são
nomes de classes de provider ou instâncias de provider. Essas classes podem
ser criadas no próprio projeto ou fornecidas por um pacote.

Se você precisar configurar algumas opções de um serviço, da mesma forma que
na configuração direta do container, pegue os valores de `$params` e
passe-os aos providers.

O provider deve implementar `Yiisoft\Di\ServiceProviderInterface`. Abaixo
está um provider para um serviço de cache:

```php
use Psr\Container\ContainerInterface;
use Psr\SimpleCache\CacheInterface;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Cache\Cache;
use Yiisoft\Cache\CacheInterface as YiiCacheInterface;
use Yiisoft\Cache\File\FileCache;
use Yiisoft\Di\ServiceProviderInterface;

final readonly class CacheProvider implements ServiceProviderInterface
{
    public function __construct(
        private string $cachePath = '@runtime/cache'
    )
    {
    }

    public function getDefinitions(): array
    {
        return [
            CacheInterface::class => function (ContainerInterface $container) {
                $aliases = $container->get(Aliases::class);

                return new FileCache($aliases->get($this->cachePath));
            },
            YiiCacheInterface::class => Cache::class,
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

### Rotas

Você pode configurar como a aplicação web responde a determinadas URLs em
`config/common/routes.php`:

```php
use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
        ),
];
``` 

Leia mais sobre isso em ["Rotas"](../runtime/routing.md).

### Eventos

Muitos serviços emitem eventos aos quais você pode se associar.  O template
padrão define três grupos de configuração de eventos em
`config/configuration.php`: `events`, `events-web` e `events-console`. Eles
vêm vazios por padrão, mas você pode preenchê-los inline ou apontá-los para
arquivos de configuração de eventos.

A configuração é um array em que as chaves são os nomes dos eventos e os
valores são arrays de handlers:

```php
return [
    EventName::class => [
        // Uma closure comum, que será chamada pelo Dispatcher "como está".
        static fn (EventName $event) => someStuff($event),
        
        // Uma closure comum com uma dependência extra. Todos os parâmetros depois do primeiro (o próprio evento)
        // serão resolvidos pelo seu container de DI por meio do `yiisoft/injector`.
        static fn (EventName $event, DependencyClass $dependency) => someStuff($event),
        
        // Um exemplo com um callable comum. Se o método `staticMethodName` tiver dependências,
        // elas serão resolvidas da mesma forma que no exemplo anterior.
        [SomeClass::class, 'staticMethodName'],
        
        // Métodos não estáticos também são permitidos. Nesse caso, `SomeClass` será instanciada pelo seu container de DI.
        [SomeClass::class, 'methodName'],
        
        // Um objeto de uma classe que implementa o método `__invoke`
        new InvokableClass(),
        
        // Nesse caso, a `InvokableClass` com o método `__invoke` será instanciada pelo seu container de DI
        InvokableClass::class,
        
        // Qualquer definição de classe invocável pode estar aqui, desde que `$container->has('the definition')` seja true.
        'di-alias'
    ],
];
```

Leia mais sobre isso em ["Eventos"](events.md).


### Parâmetros

Os parâmetros base ficam em `config/common/params.php`. Depois, eles são
estendidos por `config/web/params.php`, `config/console/params.php` e pelos
arquivos específicos de cada ambiente em `config/environments/`.

> [!TIP]
> Não use parâmetros, constantes ou variáveis de ambiente diretamente na sua aplicação; em vez disso, configure
> os serviços.

O `common/params.php` da aplicação padrão é assim:

```php
<?php

declare(strict_types=1);

use App\Shared\ApplicationParams;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Assets\AssetManager;
use Yiisoft\Definitions\Reference;
use Yiisoft\Router\CurrentRoute;
use Yiisoft\Router\UrlGeneratorInterface;
use Yiisoft\Yii\View\Renderer\CsrfViewInjection;

return [
    'application' => require __DIR__ . '/application.php',

    'yiisoft/aliases' => [
        'aliases' => require __DIR__ . '/aliases.php',
    ],

    'yiisoft/view' => [
        'basePath' => null,
        'parameters' => [
            'assetManager' => Reference::to(AssetManager::class),
            'applicationParams' => Reference::to(ApplicationParams::class),
            'aliases' => Reference::to(Aliases::class),
            'urlGenerator' => Reference::to(UrlGeneratorInterface::class),
            'currentRoute' => Reference::to(CurrentRoute::class),
        ],
    ],

    'yiisoft/yii-view-renderer' => [
        'viewPath' => null,
        'layout' => '@src/Web/Shared/Layout/Main/layout.php',
        'injections' => [
            Reference::to(CsrfViewInjection::class),
        ],
    ],
];
```

Por conveniência, existe uma convenção de nomes para os parâmetros:

1. Agrupe os parâmetros pelo nome do pacote, como em `yiisoft/cache-file`.
2. Se os parâmetros forem da própria aplicação, como em `application`, omita
   o prefixo do pacote.
3. Se houver muitos serviços no pacote, como `file-target` e `file-rotator`
   no pacote `yiisoft/log-target-file`, agrupe os parâmetros pelo nome do
   serviço.
4. Use `enabled` como nome de parâmetro para poder desabilitar ou habilitar
   um serviço, como em `yiisoft/yii-debug`.

### Configurações de pacotes

O plugin de configuração não copia automaticamente as configurações dos
pacotes em vendor. Ele as carrega diretamente de `vendor/` como camada
vendor e as combina com as camadas do pacote raiz e específicas de cada
ambiente.

Se você quiser personalizar um arquivo de configuração de um pacote na sua
aplicação, use o comando do Composer `yii-config-copy` para copiá-lo para a
sua pasta `config/`, normalmente em `config/packages/`. Depois de copiado, o
arquivo passa a fazer parte da camada do pacote raiz e pode sobrescrever os
padrões de vendor.

O merge plan guardado em `.merge-plan.php` define como os grupos de
configuração são montados. Se você adicionar novos arquivos ou pastas de
configuração e atualizar a configuração do pacote raiz, reconstrua o merge
plan com `composer yii-config-rebuild`.
