# Dizendo olá

Esta seção descreve como criar uma nova página "Hello" na sua aplicação.  É
uma página simples que devolve o que você passar para ela ou, se nada for
passado, apenas diz "Hello!".

Para isso, você vai definir uma rota e criar [um
handler](../structure/handler.md) que faz o trabalho e monta a resposta.
Depois, vai melhorá-lo para usar uma [view](../views/view.md) na construção
da resposta.

Neste tutorial, você vai aprender três coisas:

1. Como criar um handler para responder a uma requisição.
2. Como mapear uma URL para o handler.
3. Como usar uma [view](../views/view.md) para compor o conteúdo da
   resposta.

## Criando um handler

Para a tarefa "Hello", você vai criar uma classe handler que lê o parâmetro
`message` da requisição e mostra essa mensagem de volta para o usuário. Se a
requisição não trouxer o parâmetro `message`, a action mostra a mensagem
padrão "Hello".

Crie `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Html\Html;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Action
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

No exemplo, o método `__invoke` recebe o parâmetro `$message`, que, com a
ajuda do atributo `RouteArgument`, pega a mensagem da URL. O valor padrão é
`"Hello!"`. Se a requisição for feita para `/say/Goodbye`, a action atribui
o valor "Goodbye" à variável `$message`.

A aplicação passa a resposta pela [pilha de
middlewares](../structure/middleware.md) até o emitter, que envia a resposta
ao usuário final.

## Configurando o router

Agora, para mapear o handler para uma URL, você precisa adicionar uma rota
em `config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::get('/say[/{message}]')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

Acima, você mapeia o padrão `/say[/{message}]` para `\App\Web\Echo\Action`.
A cada requisição, o router cria uma instância e chama o método
`__invoke()`.  A parte `{message}` do padrão grava o que for informado nessa
posição no argumento de rota `message`.  `[]` marca essa parte do padrão
como opcional.

Você também dá o nome `echo/say` a essa rota para poder gerar URLs que
apontem para ela.

## Testando

Depois de criar a action e a view, abra `http://localhost/say/Hello+World`
no navegador.

Essa URL mostra uma página com "The message is: Hello World".

Se você omitir o parâmetro `message` na URL, a página mostra "The message
is: Hello!".

## Criando um template de view

Normalmente, a tarefa é mais complicada do que imprimir "hello world" e
envolve renderizar algum HTML complexo. Para isso, é prático usar templates
de view. Eles são scripts que você escreve para gerar o corpo de uma
resposta.

Para a tarefa "Hello", crie um template `src/Web/Echo/template.php` que
imprime o parâmetro `message` recebido do método da action:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

No código acima, o parâmetro `message` passa por codificação HTML antes de
ser impresso. Isso é necessário porque o parâmetro vem do usuário final e
está sujeito a [ataques de cross-site scripting
(XSS)](https://pt.wikipedia.org/wiki/Cross-site_scripting) com JavaScript
malicioso embutido no parâmetro.

Naturalmente, você pode colocar mais conteúdo na view `say`. O conteúdo pode
ter tags HTML, texto puro e até instruções PHP. Na verdade, o serviço de
view executa a view `say` como um script PHP.

Para usar a view, você precisa alterar `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\WebViewRenderer;

final readonly class Action
{
    public function __construct(
        private WebViewRenderer $viewRenderer,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template', [
            'message' => $message,
        ]);
    }
}
```

Agora abra o navegador e confira de novo. Você deve ver um texto parecido,
mas com um layout aplicado.

Além disso, você separou a parte de como funciona da parte de como é
apresentado. Em aplicações maiores, isso ajuda muito a lidar com a
complexidade.

## Resumo

Nesta seção, você passou pelas partes de handler e de template de uma
aplicação web típica.  Você criou um handler como parte de uma classe para
tratar uma requisição específica. Também criou uma view para compor o
conteúdo da resposta. Neste exemplo simples, nenhuma fonte de dados foi
usada, já que o único dado era o parâmetro `message`.

Você também aprendeu sobre o roteamento no Yii, que funciona como a ponte
entre as requisições do usuário e os handlers.

Na próxima seção, você vai aprender a buscar dados e adicionar uma nova
página com um formulário HTML.
