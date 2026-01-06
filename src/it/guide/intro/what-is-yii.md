# Cos'è Yii

Yii è un framework PHP ad alte prestazioni basato su pacchetti per lo
sviluppo di applicazioni moderne.  Il nome Yii (pronunciato “Yee” o “[ji:]”)
significa “semplice ed evolutivo” in cinese.  Si può anche considerare come
l'acronimo di **Yes It Is**!

## Per cosa è più indicato usare Yii

Yii è un framework generico per la programmazione web.  È possibile
utilizzarlo per sviluppare tutti i tipi di applicazioni web utilizzando
PHP.  Grazie alla sua architettura e al sofisticato supporto della cache, è
particolarmente adatto allo sviluppo di applicazioni su larga scala come
portali, sistemi di gestione dei contenuti, e-commerce, API REST, ecc.

## Come si posiziona Yii rispetto ad altri framework?

Se hai già familiarità con un altro framework, potresti trovare interessante
sapere come si posiziona Yii rispetto ad esso:

- Yii adotta la [filosofia dell'essere pratico e
  utile](../../internals/001-yii-values.md) ottenendo:
  - Prestazioni sia nello sviluppo che nell'esecuzione.
  - Comode impostazioni predefinite personalizzabili.
  - Orientamento alla pratica.
  - Semplicità.
  - Esplicitezza.
  - Coerenza.
  
  Yii non cercherà mai di sovradimensionare le cose principalmente per seguire alcuni modelli di progettazione.
- Yii utilizza ampiamente le interfacce PSR con la possibilità di riutilizzare ciò che la comunità PHP ha creato e persino di
  sostituire le implementazioni di base, se necessario.
- Yii è sia un insieme di librerie che un framework full-stack che fornisce molte funzionalità collaudate e pronte all'uso:
  caching, logging, motore di template, astrazione dei dati, strumenti di sviluppo, generazione di codice e altro ancora.
- Yii è estensibile. È possibile personalizzare o sostituire ogni parte del codice del core. È inoltre possibile
  sfruttare la solida architettura di Yii per utilizzare o sviluppare pacchetti ridistribuibili.
- Le prestazioni elevate sono sempre un obiettivo primario di Yii.

Yii è supportato da un [forte team di sviluppatori
principali](https://www.yiiframework.com/team/) sostenuto finanziariamente
dalla [fondazione OpenCollective](https://opencollective.com/yiisoft),
nonché da una vasta comunità di professionisti che contribuiscono
costantemente allo sviluppo di Yii. Il team di sviluppatori Yii segue da
vicino le ultime tendenze nello sviluppo web e le migliori pratiche e
funzionalità presenti in altri framework e progetti. Le migliori pratiche e
funzionalità più rilevanti trovate altrove vengono incorporate nel framework
principale ed esposte tramite interfacce semplici ed eleganti.


## Versioni di Yii

Yii ha attualmente tre versioni principali disponibili: 1.1, 2.0 e 3.0.

- La versione 1.1 è quella di vecchia generazione ed è ora in modalità
  bugfix con congelamento delle funzionalità.
- La versione 2.0 è una versione stabile attuale in modalità bugfix con
  congelamento delle funzionalità.
- La versione 3.0 è quella attualmente in fase di sviluppo. Questa guida
  riguarda principalmente la versione 3.


## Requisiti e prerequisiti

Yii3 richiede PHP 8.2 o versioni successive, ma alcuni pacchetti funzionano
con versioni precedenti di PHP, come PHP 7.4.

L'utilizzo di Yii richiede conoscenze di base della programmazione orientata
agli oggetti (OOP), poiché Yii è un framework basato esclusivamente su OOP.
Yii3 utilizza anche le ultime funzionalità PHP, come le dichiarazioni di
tipo e i generatori. Comprendere questi concetti ti aiuterà ad apprendere
Yii3 più rapidamente.

