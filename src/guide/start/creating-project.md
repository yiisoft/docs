# Creating a project

In this guide we'll provide commands for both [Docker](https://docs.docker.com/get-started/get-docker/) and
the built-in dev server with everything installed locally.

> [!NOTE]
> If you want to use another web server,
> see ["Configuring web servers"](../../cookbook/configuring-webservers/general.md).

We recommend starting with a project template that's a minimal working Yii project implementing some basic features.
It can serve as a good starting point for your projects.

You can create a new project from a template using the [Composer](https://getcomposer.org) package manager:

```sh
composer create-project yiisoft/app your_project
```

Docker users can run the following commands: 
 
```sh
docker run --rm -it -v "$(pwd):/app" composer/composer create-project yiisoft/app your_project
sudo chown -R $(id -u):$(id -g) your_project
make composer update
```

This installs the latest stable version of the Yii project template in a directory named `your_project`.
You can choose a different directory name if you want.

> [!TIP]
> If you want to install the latest development version of Yii, you may add `--stability=dev` to the command.
> Don't use the development version of Yii for production because it may break your running code.

Go into the newly created directory and run:

```sh
APP_ENV=dev ./yii serve --port=80
```

For Docker users, run:

```sh
make up
```

Open your browser to the URL `http://localhost/`.

> [!NOTE]
> The HTTP server listens on port 80. If that port is already in use, specify the port via `--port` or, in case of Docker,
> `DEV_PORT` in the `docker/.env` file.

![Successful Installation of Yii](/images/guide/start/app-installed.png)
