# Docker nos templates de aplicação

Tanto o [yiisoft/app](https://github.com/yiisoft/app) quanto o
[yiisoft/app-api](https://github.com/yiisoft/app-api) vêm com uma
configuração Docker pronta para uso, baseada em
[FrankenPHP](https://frankenphp.dev/) com Caddy como servidor web embutido.
A configuração cobre desenvolvimento local, testes e deploy em produção por
meio de um conjunto de arquivos de ambiente, configurações do Docker
Compose, um Dockerfile multi-stage e um `Makefile` que encapsula as
operações mais comuns.

## Visão geral do diretório docker

Todos os arquivos relacionados ao Docker ficam no diretório `docker/`:

```
docker/
├── .env                  # Variáveis do Compose (nome da stack, portas, nomes de imagens)
├── Dockerfile            # Definição de imagem multi-stage
├── compose.yml           # Arquivo Compose base (âncora compartilhada por todos os ambientes)
├── dev/
│   ├── .env              # Variáveis de ambiente da aplicação para desenvolvimento
│   ├── .gitignore        # Exclui override.env do controle de versão
│   ├── compose.yml       # Overrides do Compose específicos de desenvolvimento
│   └── override.env.example  # Template opcional de overrides locais do desenvolvedor
├── test/
│   ├── .env              # Variáveis de ambiente da aplicação para testes
│   ├── .gitignore        # Exclui override.env do controle de versão
│   └── compose.yml       # Overrides do Compose específicos de testes
└── prod/
    ├── .env              # Variáveis de ambiente da aplicação para produção
    ├── .gitignore        # Exclui override.env do controle de versão
    └── compose.yml       # Overrides do Compose específicos de produção (Docker Swarm)
```

Cada subdiretório (`dev/`, `test/`, `prod/`) corresponde a um estágio de
ambiente e contém seu próprio arquivo `.env` com a configuração da aplicação
e um `compose.yml` que estende o `docker/compose.yml` base.

## Arquivos de ambiente

Os templates usam dois sistemas de ambiente separados, com propósitos e
runtimes diferentes.

### .env.example (raiz do projeto)

A raiz do projeto contém um arquivo `.env.example` que serve de template
para desenvolvimento local **sem Docker**:

```ini
# Configuração do ambiente local.
# Copie este arquivo para .env e ajuste conforme necessário.
# Em produção, defina as variáveis de ambiente pela configuração do servidor ou do container.
APP_ENV=dev
APP_DEBUG=true
```

Copie-o para criar seu arquivo de configuração local:

```sh
cp .env.example .env
```

O arquivo `.env` é carregado automaticamente por `src/bootstrap.php` usando
o [phpdotenv](https://github.com/vlucas/phpdotenv) somente quando `APP_ENV`
ainda não está presente no ambiente do processo. Isso significa que **as
variáveis de ambiente fornecidas pelo Docker sempre têm precedência** sobre
o arquivo `.env` da raiz — os dois fluxos de trabalho podem coexistir com
segurança no mesmo diretório do projeto.

> [!NOTE]
> `phpdotenv` é uma dependência de desenvolvimento e não é instalado em produção
> (`composer install --no-dev`), então o arquivo `.env` da raiz não tem efeito nos containers de produção.

### docker/.env

Este arquivo contém variáveis usadas pelos próprios arquivos Compose — elas
**não** são repassadas ao container da aplicação em execução:

```ini
# Variáveis para os arquivos compose.yml. Não disponíveis na aplicação.

STACK_NAME=app

# Desenvolvimento

DEV_PORT=80

# Produção

PROD_HOST=app.example.com
PROD_SSH="ssh://docker-web"

IMAGE=app
IMAGE_TAG=latest
```

| Variável     | Finalidade                                                              |
|--------------|-------------------------------------------------------------------------|
| `STACK_NAME` | Nome do projeto Docker Compose e nome da stack do Docker Swarm.         |
| `DEV_PORT`   | Porta do host onde a aplicação é exposta em desenvolvimento (`make up`). |
| `PROD_HOST`  | Hostname usado pelos labels do Caddy para HTTPS automático em produção. |
| `PROD_SSH`   | Host Docker remoto para deploy em um nó Swarm via SSH.                  |
| `IMAGE`      | Nome da imagem Docker usada no build e no push.                         |
| `IMAGE_TAG`  | Tag da imagem Docker (`latest` por padrão; use uma versão no CI/CD).    |

### docker/dev/.env

Contém as variáveis de ambiente da aplicação injetadas no container de
desenvolvimento em tempo de execução:

```ini
# Ambiente dev da aplicação.
# Note que as variáveis ficam disponíveis apenas na aplicação, não no compose.yml.

APP_ENV=dev
APP_DEBUG=true
SERVER_NAME=:80
XDEBUG_MODE=develop
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

| Variável              | Finalidade                                                                           |
|-----------------------|--------------------------------------------------------------------------------------|
| `APP_ENV`             | Ambiente da aplicação. `dev` ativa um comportamento amigável para o desenvolvedor.   |
| `APP_DEBUG`           | Ativa saída de erros detalhada e painéis de debug.                                   |
| `SERVER_NAME`         | Endereço do servidor Caddy — `:80` significa escutar em todas as interfaces na porta 80. |
| `XDEBUG_MODE`         | Modo do Xdebug. Use `develop` para helpers e `debug` para ativar a depuração passo a passo. |
| `COMPOSER_CACHE_DIR`  | Move o cache do Composer para o volume montado, para que persista entre execuções.   |

### docker/test/.env

Contém as variáveis de ambiente da aplicação para o container de testes:

```ini
# Ambiente test da aplicação.
# Note que as variáveis ficam disponíveis apenas na aplicação, não no compose.yml.

APP_ENV=test
APP_DEBUG=false
APP_C3=true
SERVER_NAME=:80
XDEBUG_MODE=coverage
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

| Variável             | Finalidade                                                                                    |
|----------------------|-----------------------------------------------------------------------------------------------|
| `APP_ENV`            | Define o ambiente como `test` para que a aplicação carregue a configuração específica de testes. |
| `APP_DEBUG`          | Desativado nos testes para corresponder a um contexto de execução realista.                   |
| `APP_C3`             | Ativa a coleta remota de cobertura de código com [c3](https://github.com/Codeception/c3).     |
| `SERVER_NAME`        | Endereço do servidor Caddy.                                                                   |
| `XDEBUG_MODE`        | `coverage` ativa o driver de cobertura de código do Xdebug, necessário para os relatórios de cobertura. |
| `COMPOSER_CACHE_DIR` | Cache persistente do Composer dentro do volume.                                               |

### docker/prod/.env

Contém as variáveis de ambiente da aplicação para o container de produção:

```ini
# Ambiente prod da aplicação.
# Note que as variáveis ficam disponíveis apenas na aplicação, não no compose.yml.

APP_ENV=prod
APP_DEBUG=false
SERVER_NAME=:80
```

O ambiente de produção usa intencionalmente uma configuração
mínima. Segredos e overrides específicos de host devem ser gerenciados pelas
ferramentas de deploy e nunca commitados no controle de versão.

### Arquivos env de override

Cada diretório de ambiente contém um `.gitignore` que exclui um arquivo
`override.env`.  Esse arquivo é opcional e, quando presente, é mesclado por
cima do `.env` principal daquele ambiente:

```
# docker/dev/override.env.example
APP_HOST_PATH=/projects/yiisoft/app
```

Copie o arquivo de exemplo para criar seus overrides locais:

```sh
cp docker/dev/override.env.example docker/dev/override.env
```

Use arquivos de override para configurações específicas do desenvolvedor,
como chaves de IDE do Xdebug ou caminhos locais de bind, que não devem ser
compartilhados com o time.

## Arquivos Compose

A configuração do Compose é dividida em vários arquivos que o Docker Compose
mescla em tempo de execução.  Essa abordagem evita duplicar configurações
compartilhadas e mantém o arquivo de cada ambiente pequeno e focado.

### docker/compose.yml (base)

O arquivo base define configurações compartilhadas herdadas por todos os
ambientes:

```yaml
services:
  app: &appconfig
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  caddy_data:
  caddy_config:
```

A âncora YAML `&appconfig` permite que os arquivos de ambiente referenciem e
estendam essa definição de serviço.  A entrada `host.docker.internal` aponta
para o host Docker, para que os containers alcancem serviços rodando na
máquina host (por exemplo, um banco de dados local).

Os dois volumes nomeados (`caddy_data` e `caddy_config`) persistem o
armazenamento de certificados e a configuração do Caddy entre
reinicializações do container.

### docker/dev/compose.yml

Estende o arquivo base para desenvolvimento local:

```yaml
services:
  app:
    build:
      dockerfile: docker/Dockerfile
      context: ..
      target: dev
      args:
        USER_ID: ${UID}
        GROUP_ID: ${GID}
    env_file:
      - path: ./dev/.env
      - path: ./dev/override.env
        required: false
    ports:
      - "${DEV_PORT:-80}:80"
    volumes:
      - ../:/app
      - ../runtime:/app/runtime
      - caddy_data:/data
      - caddy_config:/config
    tty: true
```

Pontos principais:

- **`target: dev`** — Seleciona o estágio `dev` do Dockerfile multi-stage.
- **`USER_ID` / `GROUP_ID`** — Passados como argumentos de build para que o
  usuário do container corresponda ao usuário do host, evitando problemas de
  permissão de arquivos no Linux.
- **`env_file`** — Carrega `docker/dev/.env` e, opcionalmente, o
  `override.env` local do desenvolvedor.
- **`ports`** — Expõe a porta 80 (ou `DEV_PORT` de `docker/.env`) no host.
- **`volumes`** — Monta o projeto inteiro em `/app` para que mudanças no
  código sejam refletidas imediatamente, sem rebuild da imagem.

### docker/test/compose.yml

Tem a mesma estrutura do arquivo dev, mas carrega `docker/test/.env` e não
expõe portas para o host, já que os testes rodam inteiramente dentro da rede
de containers.

### docker/prod/compose.yml

Voltado a deploys em produção usando Docker Swarm:

```yaml
services:
  app:
    image: ${IMAGE}:${IMAGE_TAG}
    networks:
      - caddy_public
    volumes:
      - runtime:/app/runtime
      - caddy_data:/data
      - caddy_config:/config
    env_file:
      - path: ./prod/.env
      - path: ./prod/override.env
        required: false
    deploy:
      replicas: 2
      update_config:
        delay: 10s
        parallelism: 1
        order: start-first
        failure_action: rollback
        monitor: 10s
      rollback_config:
        parallelism: 0
        order: stop-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      labels:
        caddy: ${PROD_HOST:-app.example.com}
        caddy.reverse_proxy: "{{upstreams 80}}"

volumes:
  runtime:

networks:
  caddy_public:
    external: true
```

Em vez de fazer build de uma imagem, o arquivo de produção referencia uma
imagem pré-construída (`${IMAGE}:${IMAGE_TAG}`).  O bloco `deploy` configura
o comportamento do Docker Swarm: duas réplicas com estratégia de atualização
gradual `start-first` e rollback automático em caso de falha. Os labels
`caddy` são lidos por um [Caddy Docker
Proxy](https://github.com/lucaslorentz/caddy-docker-proxy) rodando no mesmo
Swarm para configurar o roteamento HTTPS automático.

> [!NOTE]
> A rede `caddy_public` precisa existir no Swarm antes do deploy.
> Veja o [guia de deploy com Docker Swarm](../../cookbook/deployment/docker-swarm.md) para instruções completas de configuração.

## Dockerfile multi-stage

O `docker/Dockerfile` usa [builds
multi-stage](https://docs.docker.com/build/building/multi-stage/) para
produzir imagens enxutas para cada finalidade a partir de um único arquivo,
evitando duplicar a configuração base:

```dockerfile
FROM composer/composer:2-bin AS composer

FROM dunglas/frankenphp:1-php8.2-bookworm AS base

RUN apt update && apt -y install \
    unzip

RUN install-php-extensions \
    opcache mbstring intl dom ctype curl phar openssl xml xmlwriter simplexml pdo

ENV LC_ALL=C.UTF-8

#
# Development
#

FROM base AS dev
ARG USER_ID=10001
ARG GROUP_ID=10001
ARG USER_NAME=appuser
ARG GROUP_NAME=appuser

RUN install-php-extensions xdebug

COPY --from=composer /composer /usr/bin/composer

RUN \
    groupadd --gid ${GROUP_ID} ${GROUP_NAME}; \
    useradd --gid ${GROUP_ID} --uid ${USER_ID} ${GROUP_NAME}; \
    setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/frankenphp; \
    chown -R ${USER_NAME}:${GROUP_NAME} /data/caddy && \
    chown -R ${USER_NAME}:${GROUP_NAME} /config/caddy
USER ${USER_NAME}

#
# Production
#

FROM base AS prod-builder
COPY --from=composer /composer /usr/bin/composer
COPY .. /app
RUN --mount=type=cache,target=/tmp/cache \
    composer install --no-dev --no-progress --no-interaction --classmap-authoritative && \
    rm composer.lock composer.json

FROM base AS prod
ENV APP_ENV=prod
COPY --from=prod-builder --chown=www-data:www-data /app /app
USER www-data
```

O Dockerfile define quatro estágios:

| Estágio        | Finalidade                                                                                       |
|----------------|--------------------------------------------------------------------------------------------------|
| `composer`     | Copia o binário do Composer da imagem oficial para evitar instalá-lo nos outros estágios.        |
| `base`         | Instala o FrankenPHP, extensões PHP comuns e pacotes de sistema compartilhados por todos os ambientes. |
| `dev`          | Estende `base` com Xdebug e Composer. Cria um usuário não root com o mesmo UID/GID do usuário do host para evitar problemas de permissão com volumes montados. |
| `prod-builder` | Estende `base`, copia o código-fonte da aplicação e executa `composer install --no-dev` usando um cache de build. Remove `composer.lock` e `composer.json` em seguida para manter a imagem final limpa. |
| `prod`         | Copia apenas a aplicação construída de `prod-builder` para uma imagem `base` limpa. Isso gera uma imagem final pequena, porque o binário do Composer e os arquivos intermediários não são incluídos. |

> [!TIP]
> Ao construir a imagem de produção, você seleciona um estágio específico com `--target prod`. O estágio `prod-builder`
> é um passo intermediário e nunca é enviado para um registry.

O alvo `dev` é selecionado ao executar `make up` ou `make build`, enquanto
`make prod-build` usa o alvo `prod`.

## Comandos make

O `Makefile` oferece uma interface prática para todas as operações Docker
comuns. Execute `make` ou `make help` para listar os alvos disponíveis com
suas descrições.

### Desenvolvimento

| Comando       | Descrição                                                      |
|---------------|----------------------------------------------------------------|
| `make build`  | Faz o build (ou rebuild) da imagem Docker de desenvolvimento.  |
| `make up`     | Inicia o ambiente de desenvolvimento em modo detached.         |
| `make down`   | Para e remove containers, redes e serviços órfãos.             |
| `make stop`   | Para os containers em execução sem removê-los.                 |
| `make clear`  | Remove todos os containers, redes e volumes de desenvolvimento. |
| `make shell`  | Abre um shell Bash interativo dentro do container `app` em execução. |

### Executando ferramentas

Os comandos deste grupo rodam dentro do container de desenvolvimento usando
`docker compose run --rm`, então funcionam mesmo quando o container não está
em execução:

| Comando                              | Descrição                                       |
|--------------------------------------|-------------------------------------------------|
| `make yii <command>`                 | Executa um comando de console `./yii`.          |
| `make composer <command>`            | Executa o Composer.                             |
| `make rector`                        | Executa o [Rector](https://getrector.com/) para refatoração automatizada de PHP e melhorias de qualidade de código. |
| `make cs-fix`                        | Executa o [PHP CS Fixer](https://cs.symfony.com/). |
| `make psalm`                         | Executa a análise estática do [Psalm](https://psalm.dev/). |
| `make composer-dependency-analyser`  | Executa o [Composer Dependency Analyser](https://github.com/shipmonk-rnd/composer-dependency-analyser). |

### Testes

| Comando                | Descrição                                                 |
|------------------------|-----------------------------------------------------------|
| `make test`            | Executa a suíte de testes completa com Codeception.       |
| `make test-coverage`   | Executa os testes e gera um relatório de cobertura em HTML. |
| `make codecept <args>` | Executa qualquer comando do Codeception com argumentos personalizados. |

### Produção

| Comando              | Descrição                                                                           |
|----------------------|-------------------------------------------------------------------------------------|
| `make prod-build`    | Faz o build local da imagem Docker de produção (`--target prod`).                   |
| `make prod-push`     | Envia a imagem construída para o registry definido por `IMAGE` e `IMAGE_TAG`.       |
| `make prod-deploy`   | Faz o deploy da stack em um nó Docker Swarm remoto definido por `PROD_SSH`.         |

> [!TIP]
> A maioria dos comandos aceita argumentos adicionais. Por exemplo, para instalar um pacote específico:
> ```sh
> make composer require yiisoft/yii-db-mysql
> ```
> Para executar uma única suíte de testes:
> ```sh
> make test -- Unit
> ```
