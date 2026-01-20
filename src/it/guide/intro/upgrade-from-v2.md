# Aggiornamento dalla versione 2.0

> Se non hai mai utilizzato Yii 2.0, puoi saltare questa sezione e passare direttamente alla sezione “[Per iniziare](../start/prerequisites.md)”.
>

Pur condividendo alcune idee e valori comuni, Yii3 è concettualmente diverso
da Yii 2.0. Non esiste un percorso di aggiornamento semplice, quindi è
opportuno innanzitutto [verificare la politica di manutenzione e le date di
fine vita di Yii 2.0](https://www.yiiframework.com/release-cycle)  e
valutare la possibilità di avviare nuovi progetti su Yii3 mantenendo quelli
esistenti su Yii 2.0.

## Requisiti PHP

Yii3 richiede PHP 8.2 o versioni successive. Di conseguenza, vengono
utilizzate funzionalità del linguaggio che non erano presenti in Yii 2.0:

- [Dichiarazioni dei
  tipi](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Dichiarazioni del tipo di
  ritorno](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Visibilità delle costanti di
  classe](https://www.php.net/manual/en/language.oop5.constants.php)
- [Argomenti
  denominati](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)
- [Classi
  anonime](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.class)
- [Generatori](https://www.php.net/manual/en/language.generators.php)
- [Funzioni
  variadiche](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)
- [Proprietà in sola
  lettura](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.readonly-properties)
- [Classi in sola
  lettura](https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class.readonly)
- [Promozione delle proprietà del
  costruttore](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion)
- [Attributi](https://www.php.net/manual/en/language.attributes.php)

## Rifattorizzazione preliminare

È una buona idea rifattorizzare il tuo progetto Yii 2.0 prima di trasferirlo
su Yii3. Ciò renderebbe più facile il trasferimento e apporterebbe benefici
al progetto in questione mentre non è ancora stato trasferito su Yii3.

### Utilizza l’iniezione delle dipendenze (DI) invece del localizzatore di servizi (Service Locator)

Poiché Yii3 ti obbliga a iniettare le dipendenze, è una buona idea prepararsi e passare dall'uso del
localizzatore di servizi (`Yii::$app->`) al [contenitore DI](https://www.yiiframework.com/doc/guide/2.0/en/concept-di-container).

Se l'utilizzo del contenitore DI è problematico per qualsiasi motivo, valuta la possibilità di spostare tutte le chiamate a `Yii::$app->` alle azioni del controller
e ai widget e di passare manualmente le dipendenze da un controller a ciò che ne ha bisogno.

Per una spiegazione dell'idea, consultare [Iniezione di dipendenze e
contenitore](../concept/di-container.md).

### Introdurre repository per ottenere dati

Poiché Active Record non è l'unico modo per lavorare con un database in
Yii3, prendete in considerazione l'introduzione di repository che nascondano
i dettagli relativi all'ottenimento dei dati e li raccolgano in un unico
posto. Potrete rifarlo in un secondo momento:

```php
final readonly class PostRepository
{
    public function getArchive()
    {
        // ...
    }
    
    public function getTop10ForFrontPage()
    {
        // ...
    }

}
```

### Separare il livello di dominio dall'infrastruttura

Nel caso in cui si disponga di un dominio ricco e complesso, è consigliabile
separarlo dall'infrastruttura fornita da un framework, in modo che tutta la
logica di business risieda in classi indipendenti dal framework.

### Suddividi di più in componenti

I servizi Yii3 sono concettualmente simili ai componenti di Yii 2.0, quindi
è consigliabile spostare le parti riutilizzabili dell'applicazione nei
componenti.

## Cose da imparare

### Docker

I modelli d’applicazione predefiniti utilizzano
[Docker](https://www.docker.com/get-started/) per eseguire l'applicazione. È
consigliabile imparare a utilizzarlo e impiegarlo nei propri progetti poiché
offre numerosi vantaggi:

1. Esattamente lo stesso ambiente della produzione.
2. Non è necessario installare nulla tranne Docker stesso.
3. L'ambiente è per applicazione, non per server.

### Variabili d'ambiente

I modelli dell'applicazione Yii3 utilizzano [variabili
d’ambiente](https://en.wikipedia.org/wiki/Environment_variable) per
configurare parti dell'applicazione. Il concetto è [molto utile per le
applicazioni Dockerizzate](https://12factor.net/) , ma potrebbe risultare
estraneo agli utenti di Yii 1.1 e Yii 2.0.

### Azioni

A differenza di Yii 2.0, Yii3 non richiede l’uso di controller. Utilizza
invece le [azioni](../structure/action.md), che sono un qualsiasi oggetto
richiamabile. È possibile organizzarle in controller simili a Yii 2, ma non
è necessario.

### Struttura applicativa

La struttura dell'applicazione Yii3 suggerita è diversa da quella di Yii
2.0. È descritta in [struttura applicativa](../structure/overview.md).

Nonostante ciò, Yii3 è flessibile, quindi è ancora possibile utilizzare una
struttura simile a Yii 2.0 con Yii3.
