# Dire ciao

Questa sezione descrive come creare una nuova pagina “Hello” nella tua
applicazione. È una pagina semplice che restituirà tutto ciò che le passi o,
se non viene passato nulla, dirà semplicemente "Hello!".

Per raggiungere questo obiettivo, definirai una rotta e creerai [un gestore
di richieste](../structure/handler.md) che esegue il lavoro e forma la
risposta. Poi lo migliorerai per usare [una vista](../views/view.md) per
costruire la risposta.

Attraverso questo tutorial, imparerai tre cose:

1. Come creare un gestore di richieste per rispondere a una richiesta.
2. Come mappare l'URL al gestore di richieste.
3. Come usare [una vista](../views/view.md) per comporre il contenuto della
   risposta.

## Creare un gestore di richieste <span id="creating-handler"></span>

Per il compito "Hello", creerai una classe gestore di richieste che legge un
parametro `message` dalla richiesta e visualizza quel messaggio
all'utente. Se la richiesta non fornisce un parametro `message`, l'azione
visualizzerà il messaggio "Hello" predefinito.

Crea `src/Web/Echo/Action.php`:

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

Nel tuo esempio, il metodo `__invoke` riceve il parametro `$message` che con
l'aiuto dell'attributo `RouteArgument` ottiene il messaggio dall'URL. Il
valore predefinito è `"Hello!"`. Se la richiesta viene effettuata a
`/say/Goodbye`, l'azione assegna il valore "Goodbye" alla variabile
`$message`.

L'applicazione passa la risposta attraverso lo [stack di
middleware](../structure/middleware.md) all'emettitore che invia la risposta
all'utente finale.

## Configurazione del router

Ora, per mappare il tuo gestore di richieste all'URL, devi aggiungere una
rotta in `config/common/routes.php`:

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

Nell'esempio sopra, mappi il pattern `/say[/{message}]` a
`\App\Web\Echo\Action`. Per una richiesta, il router crea un'istanza e
chiama il metodo `__invoke()`. La parte `{message}` del pattern scrive tutto
ciò che viene specificato in questa posizione nell'attributo `message` della
richiesta. `[]` marca questa parte del pattern come facoltativa.

Dai anche un nome `echo/say` a questa rotta per poter generare URL che
puntano ad essa.

## Provarlo <span id="trying-it-out"></span>

Dopo aver creato l'azione e la vista apri `http://localhost/say/Hello+World`
nel tuo browser.

Questo URL visualizza una pagina con “The message is: Hello World".

Se ometti il parametro `message` nell'URL, la pagina visualizza “The message
is: Hello!".

## Creare un modello di vista <span id="creating-view-template"></span>

Solitamente, il compito è più complicato che stampare "hello world" e
comporta il rendering di HTML complesso. Per questo compito, è utile usare
modelli di vista. Sono script che scrivi per generare il corpo della
risposta.

Per il compito "Hello", crea un modello `src/Web/Echo/template.php` che
stampa il parametro `message` ricevuto dal metodo dell'azione:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

Nel codice sopra, il parametro `message` utilizza la codifica HTML prima di
stamparlo. Questo è necessario perché il parametro proviene da un utente
finale ed è vulnerabile ad [attacchi cross-site scripting
(XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) tramite
l'incorporamento di JavaScript malevolo nel parametro.

Naturalmente, puoi inserire più contenuto nella vista `say`. Il contenuto
può consistere di tag HTML, testo semplice e persino istruzioni
PHP. Infatti, il servizio di vista esegue la vista `say` come uno script
PHP.

Per usare la vista, devi modificare `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
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

Ora apri il tuo browser e controllalo di nuovo. Dovresti vedere il testo
simile ma con un layout applicato.

Inoltre, hai separato la parte su come funziona e la parte su come viene
presentata. Nelle applicazioni più grandi, questo aiuta molto a gestire la
complessità.

## Riepilogo <span id="summary"></span>

In questa sezione, hai toccato le parti del gestore di richieste e del
modello della tipica applicazione web. Hai creato un gestore di richieste
come parte di una classe per gestire una richiesta specifica. Hai anche
creato una vista per comporre il contenuto della risposta. In questo
semplice esempio, non è stata coinvolta alcuna fonte di dati poiché l'unico
dato utilizzato era il parametro `message`.

Hai anche imparato sul routing in Yii, che funge da ponte tra le richieste
utente e i gestori di richieste.

Nella prossima sezione, imparerai come recuperare dati e aggiungere una
nuova pagina contenente un modulo HTML.
