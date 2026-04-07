# Creazione di un progetto

In questa guida forniremo comandi sia per
[Docker](https://docs.docker.com/get-started/get-docker/) che per il server
di sviluppo integrato con tutto installato localmente.

> [!NOTE]
> Se si desidera utilizzare un altro server web,
> consultare ["Configurazione dei server Web"](../../cookbook/configuring-webservers/general.md).

Si consiglia di iniziare con un template di progetto che sia un progetto Yii
minimale funzionante che implementa alcune funzionalità di base. Può fungere
da buon punto di partenza per i propri progetti.

È possibile creare un nuovo progetto da un template utilizzando il gestore
di pacchetti [Composer](https://getcomposer.org):

```sh
composer create-project yiisoft/app your_project
```

Gli utenti Docker possono eseguire i seguenti comandi:

```sh
docker run --rm -it -v "$(pwd):/app" --user $(id -u):$(id -g) composer/composer create-project yiisoft/app your_project
sudo chown -R $(id -u):$(id -g) your_project
cd your_project
make composer update
```

Se vuoi la versione di sviluppo invece di quella di rilascio:
 
```sh
git clone https://github.com/yiisoft/app.git --depth 1 your_project && \
cd your_project && \
rm -rf .git && \
make composer update
```

Questo installa l'ultima versione stabile del template di progetto Yii in
una directory denominata `your_project`. È possibile scegliere un nome di
directory diverso se lo si desidera.

> [!TIP]
> Se si desidera installare l'ultima versione di sviluppo di Yii, è possibile aggiungere `--stability=dev` al comando.
> Non utilizzare la versione di sviluppo di Yii in produzione perché potrebbe compromettere il codice in esecuzione.

Go into the newly created directory, copy `.env.example` to `.env`, and run:

```sh
./yii serve --port=80
```

Per gli utenti Docker, eseguire:

```sh
make up
```

Aprire il browser all'URL `http://localhost/`.

> [!NOTE]
> To change the port for the built-in server, pass `--port` to `./yii serve`. For Docker, set `DEV_PORT`
> in `docker/.env`.

![Installazione riuscita di Yii](/images/guide/start/app-installed.png)
