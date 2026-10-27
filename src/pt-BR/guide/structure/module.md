# Módulos

Um módulo é uma parte da aplicação agrupada em torno de um contexto de
negócio ou de um recurso reutilizável. No Yii, isso é uma fronteira de
design, não uma classe base obrigatória. Um módulo pode ser:

- código da aplicação no namespace `App\`;
- um [pacote Composer](package.md) instalado em `vendor/`;
- código que começa na aplicação e depois é extraído para um pacote.

Use um módulo quando um grupo de actions, serviços de domínio, repositórios,
handlers de eventos, views, assets, comandos e a configuração relacionada
mudam juntos e têm um nome que faz sentido para o negócio.

Por exemplo, um módulo de blog pode ficar na aplicação assim:

```
src/
    Blog/
        Post/
            Post.php
            PostRepositoryInterface.php
            InMemoryPostRepository.php
        Web/
            IndexAction.php
            index.php
```

A mesma estrutura pode virar um pacote Composer mais tarde, mudando o
namespace e adicionando os metadados e os arquivos de configuração do
pacote. Veja [Projetando pacotes](designing-packages.md) para os detalhes
específicos de pacotes.

## Fronteiras de módulos

Mantenha o código do módulo agrupado primeiro por contexto e depois por tipo
técnico. Isso se aproxima da abordagem de [vertical
slices](../../cookbook/organizing-code/structuring-by-use-case-with-vertical-slices.md),
mas numa fronteira maior da estrutura da aplicação. Prefira
`App\Blog\Post\PostRepositoryInterface` a um
`App\Repository\PostRepositoryInterface` global quando o repositório
pertence apenas aos posts do blog.

Trate as classes de um módulo como API pública apenas quando se espera que
outro módulo as use. Boas classes de API pública normalmente são:

- comandos ou queries que expressam um caso de uso;
- DTOs ou value objects trocados entre módulos;
- interfaces de serviços que outro módulo pode chamar;
- eventos emitidos pelo módulo.

Mantenha as classes de implementação privadas ao namespace do módulo. Outros
módulos não devem depender diretamente de
`App\Blog\Post\InMemoryPostRepository` ou de uma action de controller. Eles
devem depender de uma interface, de uma classe de caso de uso ou de um
evento.

## Interfaces entre módulos

Coloque a interface onde o contrato pertence:

- Se a interface descreve uma capacidade fornecida por um módulo, coloque-a
  nesse módulo. Por exemplo, `App\Blog\Post\PostRepositoryInterface`
  pertence ao módulo de blog porque descreve como os posts do blog são
  lidos.
- Se a interface descreve o que um módulo precisa do mundo externo,
  coloque-a no módulo consumidor. Por exemplo,
  `App\Order\Customer\CustomerVerifierInterface` pertence ao módulo de
  pedidos se os pedidos só precisam de uma verificação de cliente do tipo
  sim ou não. O módulo de clientes, um adaptador da aplicação ou um pacote
  pode fornecer a implementação.

Isso mantém as dependências explícitas. Um módulo pode depender do contrato
público de outro módulo, mas não deve acessar as classes de implementação
internas de outro módulo.

Primeiro, defina a interface no módulo:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Post;

interface PostRepositoryInterface
{
    /**
     * @return list<Post>
     */
    public function findLatest(): array;
}
```

Coloque a implementação no mesmo módulo e associe a interface a ela:

```php
<?php

declare(strict_types=1);

use App\Blog\Post\InMemoryPostRepository;
use App\Blog\Post\PostRepositoryInterface;

return [
    PostRepositoryInterface::class => InMemoryPostRepository::class,
];
```

No template de aplicação padrão, coloque esse arquivo em
`config/common/di/`, por exemplo `config/common/di/blog.php`. O template
carrega `config/common/di/*.php` no grupo de configuração compartilhado
`di`, então a associação fica disponível para os pontos de entrada web e de
console.

## Actions web

As actions pertencem ao módulo quando são o ponto de entrada web do
comportamento do módulo:

```php
<?php

declare(strict_types=1);

namespace App\Blog\Web;

use App\Blog\Post\PostRepositoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class IndexAction
{
    public function __construct(
        private PostRepositoryInterface $posts,
        private WebViewRenderer $viewRenderer,
    ) {
    }

    public function __invoke(): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/index', [
            'posts' => $this->posts->findLatest(),
        ]);
    }
}
```

Mantenha a leitura da requisição e a criação da resposta na action. Mantenha
as decisões de negócio nas classes de domínio do módulo ou em serviços de
caso de uso.

## Rotas

Em uma aplicação pequena, adicione as rotas do módulo diretamente em
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
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

    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

Use nomes de rota com o prefixo do módulo, como `blog/index`, para evitar
colisões.

Se a aplicação tem muitos módulos, você pode dar a cada módulo o seu próprio
arquivo de configuração de rotas. Altere o grupo `routes` em
`config/configuration.php`:

```php
'routes' => [
    'common/routes.php',
    'common/routes/*.php',
],
```

Depois crie `config/common/routes/blog.php`:

```php
<?php

declare(strict_types=1);

use App\Blog\Web\IndexAction;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create('/blog')
        ->routes(
            Route::get('')
                ->action(IndexAction::class)
                ->name('blog/index'),
        ),
];
```

Depois de alterar `config/configuration.php` ou de adicionar arquivos que
casam com um curinga da configuração, reconstrua o merge plan:

```sh
composer yii-config-rebuild
```

## Configuração de módulos

Os módulos da aplicação usam os mesmos grupos de configuração que os
pacotes. A diferença é onde a configuração fica:

- a configuração de um módulo da aplicação fica na aplicação raiz, em
  `config/`;
- a configuração de um módulo em pacote fica no pacote e é declarada em
  `extra.config-plugin`.

Locais comuns para a configuração de módulos da aplicação são:

```
config/
    common/
        di/
            blog.php
        routes/
            blog.php
        params.php
    console/
        params.php
    web/
        params.php
```

Coloque as definições de serviços compartilhadas em `common/di/`. Coloque as
definições exclusivas da web em `web/di/`. Coloque os parâmetros ou
registros de comandos exclusivos do console em `console/params.php`.

Quando um módulo cresce a ponto de se tornar reutilizável, mova as classes
PHP para um pacote Composer, mova os arquivos de configuração para a pasta
`config/` do pacote e declare-os no `composer.json` do pacote:

```json
{
    "extra": {
        "config-plugin": {
            "di": "config/di.php",
            "routes": "config/routes.php"
        }
    }
}
```

A aplicação pode, então, sobrescrever os padrões do pacote nos próprios
arquivos de configuração.

## Comunicação entre módulos

Escolha o menor acoplamento que atenda ao comportamento:

- Use injeção pelo construtor com uma interface para uma chamada síncrona
  direta.
- Use um evento quando quem produz não deve saber quem reage a algo que
  aconteceu.
- Use um serviço de aplicação ou uma classe de caso de uso quando a
  orquestração pertence a um lugar fora dos dois módulos.
- Use um pacote quando o módulo precisa ser reutilizado por mais de uma
  aplicação.

Evite chamadas a service locator e estado global dentro das classes do
módulo. Deixe que actions, comandos e serviços recebam as suas dependências
pelos construtores, para que as fronteiras dos módulos fiquem visíveis no
código e possam ser testadas isoladamente.
