# Docker in Application Templates

Both [yiisoft/app](https://github.com/yiisoft/app) and
[yiisoft/app-api](https://github.com/yiisoft/app-api) come with a
ready-to-use Docker setup based on [FrankenPHP](https://frankenphp.dev/)
with Caddy as the built-in web server.  The setup covers local development,
testing, and production deployment through a set of environment files,
Docker Compose configurations, a multi-stage Dockerfile, and a `Makefile`
that wraps common operations.

## Docker directory overview

All Docker-related files live under the `docker/` directory:

```
docker/
├── .env                  # Compose-level variables (stack name, ports, image names)
├── Dockerfile            # Multi-stage image definition
├── compose.yml           # Base Compose file (shared anchor for all environments)
├── dev/
│   ├── .env              # Application environment variables for development
│   ├── .gitignore        # Excludes override.env from version control
│   ├── compose.yml       # Development-specific Compose overrides
│   └── override.env.example  # Optional developer-local overrides template
├── test/
│   ├── .env              # Application environment variables for testing
│   ├── .gitignore        # Excludes override.env from version control
│   └── compose.yml       # Test-specific Compose overrides
└── prod/
    ├── .env              # Application environment variables for production
    ├── .gitignore        # Excludes override.env from version control
    └── compose.yml       # Production-specific Compose overrides (Docker Swarm)
```

Each subdirectory (`dev/`, `test/`, `prod/`) corresponds to an environment
stage and contains its own `.env` file with application-level configuration
and a `compose.yml` that extends the base `docker/compose.yml`.

## Environment files

The templates use two separate environment systems that serve different
purposes and different runtimes.

### .env.example (project root)

The project root contains a `.env.example` file that serves as a template
for local development **without Docker**:

```ini
# Local environment configuration.
# Copy this file to .env and adjust as needed.
# In production, set environment variables via server or container configuration instead.
APP_ENV=dev
APP_DEBUG=true
```

Copy it to create your local configuration file:

```sh
cp .env.example .env
```

The `.env` file is loaded automatically by `src/bootstrap.php` using
[phpdotenv](https://github.com/vlucas/phpdotenv) only when `APP_ENV` is not
already present in the process environment. This means **Docker-provided
environment variables always take precedence** over the root `.env` file —
both workflows can coexist safely in the same project directory.

> [!NOTE]
> `phpdotenv` is a development dependency and is not installed in production
> (`composer install --no-dev`), so the root `.env` file has no effect on production containers.

### docker/.env

This file contains variables used by the Compose files themselves — they are
**not** passed into the running application container:

```ini
# Variables for compose.yml files. Not available in the app.

STACK_NAME=app

# Development

DEV_PORT=80

# Production

PROD_HOST=app.example.com
PROD_SSH="ssh://docker-web"

IMAGE=app
IMAGE_TAG=latest
```

| Variable     | Purpose                                                                 |
|--------------|-------------------------------------------------------------------------|
| `STACK_NAME` | Docker Compose project name and Docker Swarm stack name.                |
| `DEV_PORT`   | Host port to expose the application on in development (`make up`).      |
| `PROD_HOST`  | Hostname used by Caddy labels for automatic HTTPS in production.        |
| `PROD_SSH`   | Remote Docker host for deploying to a Swarm node via SSH.               |
| `IMAGE`      | Docker image name used during build and push.                           |
| `IMAGE_TAG`  | Docker image tag (`latest` by default; use a version string in CI/CD).  |

### docker/dev/.env

Contains application environment variables injected into the development
container at runtime:

```ini
# App dev environment.
# Note that variables are available in the app only, not in compose.yml.

APP_ENV=dev
APP_DEBUG=true
SERVER_NAME=:80
XDEBUG_MODE=develop
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

| Variable              | Purpose                                                                              |
|-----------------------|--------------------------------------------------------------------------------------|
| `APP_ENV`             | Application environment. `dev` enables developer-friendly behavior.                  |
| `APP_DEBUG`           | Enables detailed error output and debug panels.                                      |
| `SERVER_NAME`         | Caddy server address — `:80` means listen on all interfaces on port 80.              |
| `XDEBUG_MODE`         | Xdebug mode. Use `develop` for helpers and `debug` to enable step debugging.         |
| `COMPOSER_CACHE_DIR`  | Moves Composer's cache into the mounted volume so it persists between runs.          |

### docker/test/.env

Contains application environment variables for the test container:

```ini
# App test environment.
# Note that variables are available in the app only, not in compose.yml.

APP_ENV=test
APP_DEBUG=false
APP_C3=true
SERVER_NAME=:80
XDEBUG_MODE=coverage
COMPOSER_CACHE_DIR=/app/runtime/cache/composer
```

| Variable             | Purpose                                                                                       |
|----------------------|-----------------------------------------------------------------------------------------------|
| `APP_ENV`            | Sets the environment to `test` so the application loads test-specific configuration.         |
| `APP_DEBUG`          | Disabled in tests to match a realistic execution context.                                    |
| `APP_C3`             | Enables [c3](https://github.com/Codeception/c3) remote code coverage collection.            |
| `SERVER_NAME`        | Caddy server address.                                                                         |
| `XDEBUG_MODE`        | `coverage` activates Xdebug's code coverage driver required for coverage reports.            |
| `COMPOSER_CACHE_DIR` | Persistent Composer cache inside the volume.                                                  |

### docker/prod/.env

Contains application environment variables for the production container:

```ini
# App prod environment.
# Note that variables are available in the app only, not in compose.yml.

APP_ENV=prod
APP_DEBUG=false
SERVER_NAME=:80
```

The production environment intentionally uses a minimal
configuration. Secrets and host-specific overrides should be managed through
deployment tooling and never committed to version control.

### Override env files

Each environment directory contains a `.gitignore` that excludes an
`override.env` file.  This file is optional and, when present, is merged on
top of the main `.env` for that environment:

```
# docker/dev/override.env.example
APP_HOST_PATH=/projects/yiisoft/app
```

Copy the example file to create your local overrides:

```sh
cp docker/dev/override.env.example docker/dev/override.env
```

Use override files for developer-specific settings such as Xdebug IDE keys
or local bind paths that should not be shared with the team.

## Compose files

The Compose configuration is split across multiple files that Docker Compose
merges at runtime.  This approach avoids duplicating shared settings and
keeps each environment's file focused and small.

### docker/compose.yml (base)

The base file defines shared settings inherited by all environments:

```yaml
services:
  app: &appconfig
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  caddy_data:
  caddy_config:
```

The `&appconfig` YAML anchor lets environment files reference and extend
this service definition.  The `host.docker.internal` entry maps to the
Docker host so containers can reach services running on the host machine
(for example, a local database).

The two named volumes (`caddy_data` and `caddy_config`) persist Caddy's
certificate storage and configuration across container restarts.

### docker/dev/compose.yml

Extends the base file for local development:

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

Key points:

- **`target: dev`** — Selects the `dev` stage from the multi-stage
  Dockerfile.
- **`USER_ID` / `GROUP_ID`** — Passed as build arguments so the container
  user matches the host user, preventing file permission issues on Linux.
- **`env_file`** — Loads `docker/dev/.env` and, optionally, the developer's
  local `override.env`.
- **`ports`** — Exposes port 80 (or `DEV_PORT` from `docker/.env`) on the
  host.
- **`volumes`** — Mounts the entire project into `/app` so code changes are
  reflected immediately without rebuilding the image.

### docker/test/compose.yml

Identical in structure to the dev file but loads `docker/test/.env` and does
not expose ports to the host, since tests run entirely inside the container
network.

### docker/prod/compose.yml

Targets production deployments using Docker Swarm:

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

Instead of building an image, the production file references a pre-built
image (`${IMAGE}:${IMAGE_TAG}`).  The `deploy` block configures Docker Swarm
behaviour: two replicas with a rolling `start-first` update strategy and
automatic rollback on failure. The `caddy` labels are picked up by a [Caddy
Docker Proxy](https://github.com/lucaslorentz/caddy-docker-proxy) running in
the same Swarm to configure automatic HTTPS routing.

> [!NOTE]
> The `caddy_public` network must already exist on the Swarm before deploying.
> See the [Docker Swarm deployment guide](../../cookbook/deployment/docker-swarm.md) for full setup instructions.

## Multi-stage Dockerfile

The `docker/Dockerfile` uses [multi-stage
builds](https://docs.docker.com/build/building/multi-stage/) to produce lean
images for each purpose from a single file, avoiding duplication of the base
setup:

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

The Dockerfile defines four stages:

| Stage          | Purpose                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------|
| `composer`     | Copies the Composer binary from the official image to avoid installing it in other stages.       |
| `base`         | Installs FrankenPHP, common PHP extensions, and system packages shared by all environments.      |
| `dev`          | Extends `base` with Xdebug and Composer. Creates a non-root user matching the host user's UID/GID to prevent permission issues with mounted volumes. |
| `prod-builder` | Extends `base`, copies the application source, and runs `composer install --no-dev` using a build cache. Removes `composer.lock` and `composer.json` afterwards to keep the final image clean. |
| `prod`         | Copies only the built application from `prod-builder` into a clean `base` image. This produces a small final image because the Composer binary and intermediate files are not included. |

> [!TIP]
> When building the production image you select a specific stage with `--target prod`. The `prod-builder`
> stage is an intermediate step and is never pushed to a registry.

The `dev` target is selected when running `make up` or `make build`, while
`make prod-build` targets `prod`.

## make commands

The `Makefile` provides a convenient interface for all common Docker
operations. Run `make` or `make help` to list available targets with their
descriptions.

### Development

| Command       | Description                                                    |
|---------------|----------------------------------------------------------------|
| `make build`  | Build (or rebuild) the development Docker image.               |
| `make up`     | Start the development environment in detached mode.            |
| `make down`   | Stop and remove containers, networks, and orphaned services.   |
| `make stop`   | Stop running containers without removing them.                 |
| `make clear`  | Remove all development containers, networks, and volumes.      |
| `make shell`  | Open an interactive Bash shell inside the running `app` container. |

### Running tools

Commands in this group run inside the development container using `docker
compose run --rm`, so they work even when the container is not currently
running:

| Command                              | Description                                     |
|--------------------------------------|-------------------------------------------------|
| `make yii <command>`                 | Run a `./yii` console command.                  |
| `make composer <command>`            | Run Composer.                                   |
| `make rector`                        | Run [Rector](https://getrector.com/) for automated PHP refactoring and code quality improvements. |
| `make cs-fix`                        | Run [PHP CS Fixer](https://cs.symfony.com/).    |
| `make psalm`                         | Run [Psalm](https://psalm.dev/) static analysis. |
| `make composer-dependency-analyser`  | Run [Composer Dependency Analyser](https://github.com/shipmonk-rnd/composer-dependency-analyser). |

### Testing

| Command                | Description                                               |
|------------------------|-----------------------------------------------------------|
| `make test`            | Run the full test suite with Codeception.                 |
| `make test-coverage`   | Run tests and generate an HTML coverage report.           |
| `make codecept <args>` | Run any Codeception command with custom arguments.        |

### Production

| Command              | Description                                                                         |
|----------------------|-------------------------------------------------------------------------------------|
| `make prod-build`    | Build the production Docker image locally (`--target prod`).                        |
| `make prod-push`     | Push the built image to the registry defined by `IMAGE` and `IMAGE_TAG`.            |
| `make prod-deploy`   | Deploy the stack to a remote Docker Swarm node defined by `PROD_SSH`.               |

> [!TIP]
> Most commands accept additional arguments. For example, to install a specific package:
> ```sh
> make composer require yiisoft/yii-db-mysql
> ```
> To run a single test suite:
> ```sh
> make test -- Unit
> ```
