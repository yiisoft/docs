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

Accedere alla directory appena creata ed eseguire:

```sh
APP_ENV=dev ./yii serve --port=80
```

For Windows Command Prompt users, run:

```cmd
set APP_ENV=dev
yii serve --port=80
```

For Windows PowerShell users, run:

```powershell
$env:APP_ENV = "dev"
.\yii serve --port=80
```

Per gli utenti Docker, eseguire:

```sh
make up
```

Aprire il browser all'URL `http://localhost/`.

> [!NOTE]
> Il server HTTP è in ascolto sulla porta 80. Se quella porta è già in uso, specificare la porta tramite `--port` o, nel caso di Docker,
> `DEV_PORT` nel file `docker/.env`.

![Installazione riuscita di Yii](/images/guide/start/app-installed.png)
