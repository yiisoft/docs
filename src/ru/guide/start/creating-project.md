# Создание проекта

В этом руководстве мы приведём команды как для
[Docker](https://docs.docker.com/get-started/get-docker/), так и для
встроенного dev‑сервера, если всё необходимое установлено локально.

> [!NOTE]
> Если вы хотите использовать другой веб‑сервер,
> см. ["Настройка веб‑серверов"](../../cookbook/configuring-webservers/general.md).

Рекомендуем начать с шаблона проекта: это минимальный рабочий проект Yii с
базовой функциональностью. Он может стать хорошей отправной точкой для ваших
проектов.

Создать новый проект из шаблона можно с помощью
[Composer](https://getcomposer.org):

```sh
composer create-project yiisoft/app your_project
```

Пользователи Docker могут выполнить следующие команды:

```sh
docker run --rm -it -v "$(pwd):/app" --user $(id -u):$(id -g) composer/composer create-project yiisoft/app your_project
sudo chown -R $(id -u):$(id -g) your_project
cd your_project
make composer update
```

Если вам нужна dev-версия вместо релизной:
 
```sh
git clone https://github.com/yiisoft/app.git --depth 1 your_project && \
cd your_project && \
rm -rf .git && \
make composer update
```

Команда установит последнюю стабильную версию шаблона проекта Yii в
директорию `your_project`. При желании можете выбрать другое имя директории.

> [!TIP]
> Если хотите установить самую свежую dev-версию Yii, добавьте к команде `--stability=dev`.
> Не используйте dev-версию Yii в продакшене: она может сломать работающее приложение.

Перейдите в созданную директорию и выполните:

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

Если вы используете Docker, выполните:

```sh
make up
```

Откройте в браузере адрес `http://localhost/`.

> [!NOTE]
> HTTP-сервер слушает порт 80. Если он уже занят, укажите порт через `--port` или, в случае Docker,
> через `DEV_PORT` в файле `docker/.env`.

![Yii успешно установлен](/images/guide/start/app-installed.png)
