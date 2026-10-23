# Projetando pacotes para aplicações Yii

Esta página descreve como projetar um pacote Composer que acrescenta
comportamento a uma aplicação Yii por meio de configuração.  Use-a quando o
seu pacote precisar registrar serviços, rotas, eventos, comandos, assets,
migrations, traduções ou um tema.

Para instalar e atualizar pacotes em uma aplicação, veja [Usando
pacotes](package.md).

## Metadados do Composer

Todo pacote precisa ter um arquivo `composer.json` na pasta raiz. No mínimo,
defina o nome do pacote, as dependências, o autoload e os metadados de
configuração do Yii quando o pacote se integra a uma aplicação Yii.

Use um nome de pacote no formato `vendor-name/project-name`:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "description": "Blog integration for Yii applications",
    "require": {
        "php": ">=8.2",
        "yiisoft/router": "^4.0"
    },
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    }
}
```

Use restrições de dependência estáveis em releases estáveis. Evite usar
`yiisoft` como nome de vendor, porque ele é reservado para os pacotes do
Yii.

Se o seu pacote exige uma aplicação Yii, prefixar o nome do projeto com
`yii-` pode deixar isso claro no Packagist.

## Estrutura do pacote

Um pacote compatível com o Yii é um pacote Composer comum, com classes PHP,
arquivos de recursos opcionais e arquivos de configuração opcionais.
Mantenha a configuração em uma pasta previsível e deixe a API pública
explícita:

```
composer.json
config/
    params.php
    di.php
    di-providers.php
    routes.php
    events.php
    params-web.php
    params-console.php
    di-console.php
src/
    ...
assets/
    ...
migrations/
    ...
messages/
    ...
views/
    ...
```

Use apenas os arquivos de que o seu pacote precisa. Por exemplo, um pacote
com comandos de console, mas sem rotas web, não precisa de `routes.php`.

## Metadados do plugin de configuração

Aplicações Yii usam o [yiisoft/config](https://github.com/yiisoft/config)
para descobrir a configuração dos pacotes.  Declare os arquivos de
configuração do pacote na seção `extra.config-plugin` do `composer.json`:

```json
{
    "name": "vendor/blog",
    "type": "library",
    "autoload": {
        "psr-4": {
            "Vendor\\Blog\\": "src/"
        }
    },
    "extra": {
        "config-plugin": {
            "params": "config/params.php",
            "di": "config/di.php",
            "di-providers": "config/di-providers.php",
            "routes": "config/routes.php",
            "events": "config/events.php",
            "params-web": "config/params-web.php",
            "params-console": "config/params-console.php",
            "di-console": "config/di-console.php"
        }
    }
}
```

Cada chave de `config-plugin` é o nome de um grupo de configuração, e cada
valor é um caminho relativo à raiz do pacote.

Use os grupos comuns, web e de console de forma consistente:

- `params`, `di`, `di-providers`, `di-delegates`, `events` e `bootstrap`
  valem para os pontos de entrada web e de console.
- `params-web`, `di-web`, `di-providers-web`, `events-web`, `bootstrap-web`
  e `routes` valem para os pontos de entrada web.
- `params-console`, `di-console`, `di-providers-console`, `events-console` e
  `bootstrap-console` valem para os pontos de entrada de console.

Se o seu pacote define um novo grupo de configuração, documente como a
aplicação deve carregar esse grupo. Prefira os grupos padrão ao se integrar
com serviços do Yii, porque os templates de aplicação e os pacotes do Yii já
usam esses nomes.

Depois que os usuários instalam, atualizam, removem ou fazem dump dos
arquivos de autoload do Composer, o plugin de configuração reconstrói o
merge plan que o Yii lê em tempo de execução. Se os usuários editarem
manualmente a configuração do pacote raiz, peça que executem:

```sh
composer yii-config-rebuild
```

## Parâmetros

Coloque as opções padrão em `config/params.php`. Agrupe os parâmetros do
pacote sob o nome do pacote no Composer para evitar colisões:

```php
<?php

declare(strict_types=1);

return [
    'vendor/blog' => [
        'postsPerPage' => 20,
        'cacheTtl' => 3600,
    ],
];
```

Os desenvolvedores da aplicação podem sobrescrever esses valores nos
próprios `config/common/params.php`, `config/web/params.php`,
`config/console/params.php` ou nos arquivos de parâmetros específicos de
cada ambiente.

Não leia variáveis de ambiente nem estado global no código do pacote quando
um parâmetro puder expressar a escolha. Use parâmetros para configurar
serviços por meio de definições de DI ou service providers.

## Definições de DI

Use `config/di.php`, `config/di-web.php` ou `config/di-console.php` para
definições diretas do container:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;

/** @var array $params */

return [
    PostRepositoryInterface::class => [
        'class' => PostRepository::class,
        '__construct()' => [
            'cacheTtl' => $params['vendor/blog']['cacheTtl'],
        ],
    ],
];
```

Prefira definições de DI diretas quando a configuração descreve um serviço
de forma clara.

## Service providers de DI

Use um provider de DI quando o registro forma uma unidade reutilizável:
vários serviços relacionados, aliases, definições de factory ou extensões.

Registre os providers em `config/di-providers.php`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Provider\BlogProvider;

return [
    'vendor/blog/post-repository' => BlogProvider::class,
];
```

Declare o grupo no `composer.json`:

```json
"extra": {
    "config-plugin": {
        "di-providers": "config/di-providers.php"
    }
}
```

Um provider pode retornar várias definições de serviços e extensões. Coloque
a classe do provider em `src/Provider/BlogProvider.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Provider;

use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Vendor\Blog\CachedPostRepository;
use Vendor\Blog\PostRepository;
use Vendor\Blog\PostRepositoryInterface;
use Yiisoft\Di\ServiceProviderInterface;

final class BlogProvider implements ServiceProviderInterface
{
    public function getDefinitions(): array
    {
        return [
            PostRepository::class => PostRepository::class,
            PostRepositoryInterface::class => static fn (
                ContainerInterface $container
            ): CachedPostRepository => new CachedPostRepository(
                $container->get(PostRepository::class),
                $container->get(LoggerInterface::class),
            ),
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
```

## Rotas

Pacotes web podem adicionar rotas por meio de `config/routes.php`, declarado
como o grupo `routes`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Web\Post\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')->routes(
        Route::get('')
            ->action(IndexAction::class)
            ->name('vendor/blog/index'),
    ),
];
```

Os nomes das rotas devem ter o prefixo do pacote. Isso evita colisões com as
rotas da aplicação e com as rotas de outros pacotes.

Mantenha as rotas do pacote pequenas e fáceis de sobrescrever. Se uma
aplicação precisar de controle total sobre as URLs, documente as actions e
deixe a aplicação definir as próprias rotas.

## Eventos

Use `config/events.php`, `config/events-web.php` ou
`config/events-console.php` para associar handlers do pacote a eventos:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Event\PostPublished;
use Vendor\Blog\EventHandler\ClearPostListCache;

return [
    PostPublished::class => [
        ClearPostListCache::class,
    ],
];
```

Os handlers podem ser closures, callables, objetos invocáveis, nomes de
classes invocáveis ou aliases de DI suportados pela configuração do event
dispatcher. Prefira nomes de classes para os handlers do pacote, porque as
aplicações podem sobrescrever as dependências deles pelo container.

## Assets

Se o seu pacote traz CSS, JavaScript, imagens ou fontes, defina asset
bundles como classes PHP. Por exemplo, coloque esta classe em
`src/Asset/BlogAsset.php`:

```php
<?php

declare(strict_types=1);

namespace Vendor\Blog\Asset;

use Yiisoft\Assets\AssetBundle;

final class BlogAsset extends AssetBundle
{
    public ?string $basePath = '@assets';
    public ?string $baseUrl = '@assetsUrl';
    public ?string $sourcePath = __DIR__ . '/../../assets';

    public array $css = [
        'blog.css',
    ];

    public array $js = [
        'blog.js',
    ];
}
```

Os usuários podem registrar o bundle a partir de uma view, de um widget, de
uma injeção de view ou de uma action:

```php
$assetManager->register(BlogAsset::class);
```

Use `$sourcePath` para os arquivos que vêm dentro do pacote. Use `$basePath`
e `$baseUrl` como o destino público onde o asset manager os publica.

## Migrations

Pacotes que precisam de mudanças no esquema do banco de dados devem trazer
migrations e adicionar o namespace ou o caminho delas aos parâmetros do
`yiisoft/db-migration`.

Para migrations com namespace:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourceNamespaces' => [
            'Vendor\\Blog\\Migration',
        ],
    ],
];
```

Para migrations baseadas em caminho:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/db-migration' => [
        'sourcePaths' => [
            __DIR__ . '/../migrations',
        ],
    ],
];
```

Coloque isso em `config/params-console.php` e declare-o como
`params-console` no `composer.json`.

Isso apenas informa os locais das migrations do pacote. A aplicação ainda
precisa ter o `yiisoft/db-migration` instalado e uma conexão com o banco de
dados configurada antes que os comandos de migration possam rodar.

As migrations do pacote devem ficar estáveis depois do release. Não edite
uma migration que os usuários talvez já tenham aplicado. Em vez disso,
adicione uma nova migration.

## Traduções

Se o pacote tem mensagens exibidas ao usuário, dê a ele uma categoria de
tradução própria e registre uma category source em `config/di.php`:

```php
<?php

declare(strict_types=1);

use Yiisoft\Translator\CategorySource;
use Yiisoft\Translator\IntlMessageFormatter;
use Yiisoft\Translator\Message\Php\MessageSource;

return [
    'translation.vendor-blog' => [
        'definition' => static function (): CategorySource {
            $messageSource = new MessageSource(__DIR__ . '/../messages');

            return new CategorySource(
                'vendor-blog',
                $messageSource,
                new IntlMessageFormatter(),
                $messageSource,
            );
        },
        'tags' => ['translation.categorySource'],
    ],
];
```

Guarde as mensagens por locale e categoria:

```
messages/
    en-US/
        vendor-blog.php
    de/
        vendor-blog.php
```

Use a categoria explícita ao traduzir:

```php
$translator->translate('post.created', category: 'vendor-blog');
```

## Temas

Um pacote pode trazer arquivos de view e assets para um tema. Não o ative
pela configuração do pacote em vendor. Em vez disso, documente a
configuração da aplicação raiz necessária para habilitá-lo. No template de
aplicação, isso fica em `config/web/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'yiisoft/view' => [
        'theme' => [
            'pathMap' => [
                '@views' => '@vendor/vendor/blog/views',
            ],
            'basePath' => '@vendor/vendor/blog/assets',
            'baseUrl' => '@assetsUrl/vendor-blog',
        ],
    ],
];
```

Os temas substituem caminhos de views de acordo com um mapa de
caminhos. Documente quais caminhos de views da aplicação o seu tema
substitui e qual URL de assets a aplicação precisa publicar ou expor.

Não defina `yiisoft/view.theme` diretamente na configuração do pacote em
vendor. O `yiisoft/view` já define essa chave, e chaves duplicadas na mesma
camada de configuração não são permitidas.

Se o seu pacote fornece apenas arquivos de tema opcionais, não deixe o tema
ativo por padrão. Forneça os arquivos de view, o asset bundle e um trecho de
parâmetros documentado, para que a aplicação possa optar por usá-lo.

## Comandos de console

Pacotes de console podem adicionar comandos do Symfony Console por meio de
`config/params-console.php`:

```php
<?php

declare(strict_types=1);

use Vendor\Blog\Command\ReindexCommand;

return [
    'yiisoft/yii-console' => [
        'commands' => [
            'blog/reindex' => ReindexCommand::class,
        ],
    ],
];
```

Os nomes dos comandos devem ter o prefixo do pacote. Mantenha as
dependências dos comandos injetadas pelo construtor e registradas via DI.

## Sobrescritas pela aplicação

A configuração do pacote é a camada padrão. A aplicação pode sobrescrevê-la
na configuração do pacote raiz.  Projete pensando nisso:

- Use chaves de parâmetros, nomes de rotas, IDs de handlers de eventos e
  aliases de DI com o prefixo do pacote.
- Mantenha a configuração padrão pequena e documentada.
- Evite fazer trabalho irreversível durante o registro de serviços.
- Coloque integrações opcionais em arquivos de configuração ou providers
  separados quando elas exigirem pacotes Composer opcionais.
- Teste o pacote dentro de uma aplicação Yii mínima, para que o plugin de
  configuração, o container de DI, as rotas, os comandos de console, as
  migrations, as traduções e os assets sejam exercitados juntos.

Quando um usuário precisa personalizar a configuração do pacote, normalmente
não precisa copiar o arquivo de configuração do pacote. Ele pode redefinir
parcialmente as chaves necessárias na configuração da aplicação.

Depois de alterar os mapeamentos de grupos de configuração, ele deve
reconstruir o merge plan com:

```sh
composer yii-config-rebuild
```

## Publicando pacotes

Antes de criar a tag de um release, teste o pacote isoladamente e dentro de
uma aplicação Yii mínima. Inclua `README.md`, `CHANGELOG.md` e `UPGRADE.md`
quando mudanças de comportamento ou de configuração precisarem de
explicação.

Use [versionamento semântico](https://semver.org) nos releases
públicos. Depois do primeiro release, não edite migrations que os usuários
talvez já tenham aplicado; adicione novas migrations.
