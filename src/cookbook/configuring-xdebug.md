# Configuring Xdebug

Xdebug lets an IDE stop PHP code on breakpoints while the application handles a web request, console command, or test.
The IDE listens for debug connections. PHP starts the request and Xdebug connects back to the IDE.

Yii works with the regular Xdebug setup. Configure Xdebug for the PHP runtime that executes the code and make sure the
IDE can map runtime paths to project files.

## Check Xdebug

Use Xdebug 3. The default debug port is `9003`.

Without Docker, install Xdebug for the PHP executable that runs the application, then check it:

```shell
php --version
php --ri xdebug
```

In `php.ini` or an Xdebug-specific ini file, enable step debugging:

```ini
xdebug.mode=develop,debug
xdebug.start_with_request=trigger
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
```

`trigger` starts a debug session only when a browser extension, query parameter, cookie, or `XDEBUG_SESSION`
environment variable asks for it.

With Docker, the Yii application template installs Xdebug in the development image. Enable step debugging in
`docker/dev/override.env`:

```dotenv
XDEBUG_MODE=develop,debug
XDEBUG_CONFIG="client_host=host.docker.internal idekey=phpstorm"
```

Keep the default `SERVER_NAME=:80` from `docker/dev/.env` unless the application needs a different Caddy address.
Set the browser port with `DEV_PORT` in `docker/.env`. Older templates can use a separate `SERVER_PORT` variable;
check the project's Docker files before setting it:

```dotenv
SERVER_PORT=80
```

On Linux, Docker must resolve `host.docker.internal` to the host gateway. The current Yii application template already
has this in `docker/compose.yml`:

```yaml
services:
  app:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Rebuild the development image if Xdebug was added after the image had already been built:

```shell
make build
```

## PhpStorm

In **Settings** > **PHP** > **Debug**, check that Xdebug listens on port `9003`. Start listening with
**Run** > **Start Listening for PHP Debug Connections**.

For browser debugging, install a browser extension from **Settings** > **PHP** > **Debug**. In the extension options,
use `phpstorm` as the IDE key.

When PHP runs in Docker, configure a server in **Settings** > **PHP** > **Servers**:

- Name: `localhost`.
- Host: `localhost`.
- Port: `80`, or the host port configured by `DEV_PORT`.
- Debugger: `Xdebug`.
- Path mapping: map the project root on the host to `/app` in the container.

Use the project root for the mapping. Mapping only `public/` leaves files under `src/`, `config/`, and `vendor/`
unmapped. The path in the container must match the path used by PHP. In the default template, the project is mounted
into `/app`.

For local PHP, PhpStorm usually uses the same filesystem paths as PHP, so path mappings are usually unnecessary.

## VS Code

Install the [PHP Debug](https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug) extension.

For PHP that runs on the same filesystem as VS Code, create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003
    }
  ]
}
```

For Docker, add path mappings:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/app": "${workspaceFolder}"
      }
    }
  ]
}
```

Start this configuration before running the web request, command, or test.

## Debug a web request

Without Docker:

1. Start listening in the IDE.
2. Put a breakpoint in an action or middleware.
3. Start the application:

   ```shell
   ./yii serve
   ```

4. Enable debugging in the browser extension and reload the page.

With Docker:

1. Add the Docker Xdebug variables to `docker/dev/override.env`.
2. Start or restart the development containers:

   ```shell
   make up
   ```

3. Start listening in the IDE.
4. Put a breakpoint in an action or middleware.
5. Enable debugging in the browser extension and reload the page.

If the IDE accepts a connection and the breakpoint stays inactive, check path mappings first.

## Debug a console command

Without Docker, start the command with an Xdebug trigger:

```shell
XDEBUG_MODE=debug XDEBUG_SESSION=1 ./yii hello
```

With Docker, pass the trigger to the container:

```shell
docker compose -f docker/compose.yml -f docker/dev/compose.yml run --rm \
  -e XDEBUG_MODE=debug \
  -e XDEBUG_SESSION=1 \
  -e PHP_IDE_CONFIG=serverName=localhost \
  app ./yii hello
```

Use the command name and arguments you need instead of `hello`.

## Debug tests

Without Docker, start the test runner with an Xdebug trigger:

```shell
XDEBUG_MODE=debug XDEBUG_SESSION=1 vendor/bin/codecept run
```

With Docker, configure `docker/test/override.env`:

```dotenv
XDEBUG_MODE=debug,coverage
XDEBUG_CONFIG="client_host=host.docker.internal idekey=phpstorm"
```

Then run the test container with a trigger:

```shell
docker compose -f docker/compose.yml -f docker/test/compose.yml run --rm \
  -e XDEBUG_SESSION=1 \
  -e PHP_IDE_CONFIG=serverName=localhost \
  app ./vendor/bin/codecept run
```

Use `make test` for regular test runs. Use the explicit `docker compose` command when you need to pass debug-only
environment variables to one run.

## Troubleshooting

- The IDE must listen before PHP starts the request.
- Xdebug connects from PHP to the IDE. Allow incoming connections to port `9003` in the host firewall.
- In Docker, `client_host` must be reachable from the container. The Yii template uses `host.docker.internal`.
- For CLI and tests, set `XDEBUG_SESSION=1` or another trigger accepted by your Xdebug configuration.
- For Docker path mappings, map the host project root to `/app`.
- To inspect connection attempts, temporarily add `log=/app/runtime/xdebug.log` to `XDEBUG_CONFIG`.

## See also

- [Xdebug step debugging](https://xdebug.org/docs/step_debug)
- [PhpStorm Xdebug documentation](https://www.jetbrains.com/help/phpstorm/configuring-xdebug.html)
- [PhpStorm servers and path mappings](https://www.jetbrains.com/help/phpstorm/servers.html)
- [VS Code PHP Debug](https://github.com/xdebug/vscode-php-debug)
- [Docker in application templates](../guide/tutorial/docker.md)
