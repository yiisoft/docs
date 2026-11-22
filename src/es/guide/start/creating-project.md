# Crear un proyecto

En esta guía daremos los comandos tanto para
[Docker](https://docs.docker.com/get-started/get-docker/) como para el
servidor de desarrollo integrado, con todo instalado en local.

> [!NOTE]
> Si quieres usar otro servidor web,
> consulta ["Configurar servidores web"](../../cookbook/configuring-webservers/general.md).

Te recomendamos empezar con una plantilla de proyecto, que es un proyecto
Yii mínimo y funcional que implementa algunas funcionalidades básicas. Puede
ser un buen punto de partida para tus proyectos.

Puedes crear un proyecto nuevo a partir de una plantilla con el gestor de
paquetes [Composer](https://getcomposer.org):

```sh
composer create-project yiisoft/app your_project
```

Si usas Docker, puedes ejecutar los siguientes comandos:

```sh
docker run --rm -it -v "$(pwd):/app" --user $(id -u):$(id -g) composer/composer create-project yiisoft/app your_project
sudo chown -R $(id -u):$(id -g) your_project
cd your_project
make composer update
```

Si quieres la versión de desarrollo en lugar de una versión publicada:
 
```sh
git clone https://github.com/yiisoft/app.git --depth 1 your_project && \
cd your_project && \
rm -rf .git && \
make composer update
```

Esto instala la última versión estable de la plantilla de proyecto de Yii en
un directorio llamado `your_project`. Si quieres, puedes elegir otro nombre
de directorio.

> [!TIP]
> Si quieres instalar la última versión de desarrollo de Yii, puedes añadir `--stability=dev` al comando.
> No uses la versión de desarrollo de Yii en producción, porque podría romper tu código en ejecución.

Entra en el directorio recién creado, copia `.env.example` a `.env` y
ejecuta:

```sh
./yii serve --port=80
```

Si usas Docker, ejecuta:

```sh
make up
```

Abre en tu navegador la URL `http://localhost/`.

> [!NOTE]
> Para cambiar el puerto del servidor integrado, pasa `--port` a `./yii serve`. En Docker, establece `DEV_PORT`
> en `docker/.env`.

![Instalación correcta de Yii](/images/guide/start/app-installed.png)
