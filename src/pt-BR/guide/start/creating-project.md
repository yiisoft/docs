# Criando um projeto

Neste guia mostramos os comandos tanto para o
[Docker](https://docs.docker.com/get-started/get-docker/) quanto para o
servidor de desenvolvimento embutido, com tudo instalado localmente.

> [!NOTE]
> Se você quiser usar outro servidor web,
> veja ["Configurando servidores web"](../../cookbook/configuring-webservers/general.md).

Recomendamos começar com um template de projeto, que é um projeto Yii mínimo
e funcional com alguns recursos básicos.  Ele serve como um bom ponto de
partida para os seus projetos.

Você pode criar um novo projeto a partir de um template usando o gerenciador
de pacotes [Composer](https://getcomposer.org):

```sh
composer create-project yiisoft/app your_project
```

Quem usa Docker pode rodar os seguintes comandos:

```sh
docker run --rm -it -v "$(pwd):/app" --user $(id -u):$(id -g) composer/composer create-project yiisoft/app your_project
sudo chown -R $(id -u):$(id -g) your_project
cd your_project
make composer update
```

Se você quiser a versão de desenvolvimento em vez da versão de release:
 
```sh
git clone https://github.com/yiisoft/app.git --depth 1 your_project && \
cd your_project && \
rm -rf .git && \
make composer update
```

Isso instala a versão estável mais recente do template de projeto do Yii em
um diretório chamado `your_project`.  Você pode escolher outro nome de
diretório se quiser.

> [!TIP]
> Se você quiser instalar a versão de desenvolvimento mais recente do Yii, pode adicionar `--stability=dev` ao comando.
> Não use a versão de desenvolvimento do Yii em produção, porque ela pode quebrar o seu código em execução.

Entre no diretório recém-criado, copie `.env.example` para `.env` e rode:

```sh
./yii serve --port=80
```

Se você usa Docker, rode:

```sh
make up
```

Abra no navegador a URL `http://localhost/`.

> [!NOTE]
> Para mudar a porta do servidor embutido, passe `--port` para `./yii serve`. No Docker, defina `DEV_PORT`
> em `docker/.env`.

![Instalação do Yii concluída com
sucesso](/images/guide/start/app-installed.png)
