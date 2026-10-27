# Configurando o Xdebug

O Xdebug permite que a IDE pare o código PHP em breakpoints enquanto a
aplicação processa uma requisição web, um comando de console ou um teste.  A
IDE escuta conexões de depuração. O PHP inicia a requisição e o Xdebug se
conecta de volta à IDE.

O Yii funciona com a configuração comum do Xdebug. Configure o Xdebug no
runtime PHP que executa o código e garanta que a IDE consiga mapear os
caminhos do runtime para os arquivos do projeto.

## Verificando o Xdebug

Use o Xdebug 3. A porta de depuração padrão é `9003`.

Sem Docker, instale o Xdebug no executável PHP que roda a aplicação e depois
verifique:

```shell
php --version
php --ri xdebug
```

No `php.ini` ou em um arquivo ini específico do Xdebug, habilite a depuração
passo a passo:

```ini
xdebug.mode=develop,debug
xdebug.start_with_request=trigger
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
```

`trigger` inicia uma sessão de depuração apenas quando uma extensão do
navegador, um parâmetro de query string, um cookie ou a variável de ambiente
`XDEBUG_SESSION` pedir.

Com Docker, o template de aplicação do Yii instala o Xdebug na imagem de
desenvolvimento. Habilite a depuração passo a passo em
`docker/dev/override.env`:

```dotenv
XDEBUG_MODE=develop,debug
XDEBUG_CONFIG="client_host=host.docker.internal idekey=phpstorm"
```

Mantenha o `SERVER_NAME=:80` padrão de `docker/dev/.env`, a menos que a
aplicação precise de outro endereço no Caddy.  Defina a porta do navegador
com `DEV_PORT` em `docker/.env`:

```dotenv
DEV_PORT=80
```

No Linux, o Docker precisa resolver `host.docker.internal` para o gateway do
host. O template de aplicação atual do Yii já traz isso em
`docker/compose.yml`:

```yaml
services:
  app:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Reconstrua a imagem de desenvolvimento se o Xdebug foi adicionado depois que
a imagem já tinha sido construída:

```shell
make build
```

## PhpStorm

Em **Settings** > **PHP** > **Debug**, verifique se o Xdebug escuta na porta `9003`. Comece a escutar com
**Run** > **Start Listening for PHP Debug Connections**.

Para depurar pelo navegador, instale uma extensão de navegador a partir de **Settings** > **PHP** > **Debug**. Nas opções da extensão,
use `phpstorm` como IDE key.

Quando o PHP roda no Docker, configure um servidor em **Settings** > **PHP** > **Servers**:

- Nome: `localhost`.
- Host: `localhost`.
- Porta: `80`, ou a porta do host configurada em `DEV_PORT`.
- Depurador: `Xdebug`.
- Mapeamento de caminhos: mapeie a raiz do projeto no host para `/app` no
  container.

Use a raiz do projeto no mapeamento. Mapear só `public/` deixa sem
mapeamento os arquivos em `src/`, `config/` e `vendor/`. O caminho no
container precisa ser igual ao caminho usado pelo PHP. No template padrão, o
projeto é montado em `/app`.

Com PHP local, o PhpStorm normalmente usa os mesmos caminhos do sistema de
arquivos que o PHP, então mapeamentos de caminhos costumam ser
desnecessários.

## VS Code

Instale a extensão [PHP
Debug](https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug).

Para PHP rodando no mesmo sistema de arquivos que o VS Code, crie
`.vscode/launch.json`:

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

Para Docker, adicione mapeamentos de caminhos:

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

Inicie essa configuração antes de executar a requisição web, o comando ou o
teste.

## Zed

Instale ou habilite a extensão PHP no Zed. Ela fornece o adaptador de
depuração `Xdebug`.

Crie `.zed/debug.json`:

```json
[
  {
    "label": "PHP: Listen to Xdebug",
    "adapter": "Xdebug",
    "request": "launch",
    "port": 9003
  }
]
```

Para Docker, adicione mapeamentos de caminhos:

```json
[
  {
    "label": "PHP: Listen to Xdebug",
    "adapter": "Xdebug",
    "request": "launch",
    "port": 9003,
    "pathMappings": {
      "/app": "$ZED_WORKTREE_ROOT"
    }
  }
]
```

Inicie a configuração com **debugger: start** antes de executar a requisição
web, o comando ou o teste. O Zed também consegue carregar configurações de
depuração de `.vscode/launch.json` quando `.zed/debug.json` não existe.

## Depurando uma requisição web

Sem Docker:

1. Comece a escutar na IDE.
2. Coloque um breakpoint em uma action ou middleware.
3. Inicie o servidor embutido com um trigger do Xdebug:

   ```shell
   ./yii serve --xdebug
   ```

4. Abra ou recarregue a página no navegador.

A opção `--xdebug` passa `XDEBUG_MODE=debug XDEBUG_TRIGGER=yes` para o
servidor embutido do PHP. Se você usa outro servidor web, habilite a
depuração com a extensão do navegador e recarregue a página.

Com Docker:

1. Adicione as variáveis do Xdebug para Docker em `docker/dev/override.env`.
2. Inicie ou reinicie os containers de desenvolvimento:

   ```shell
   make up
   ```

3. Comece a escutar na IDE.
4. Coloque um breakpoint em uma action ou middleware.
5. Habilite a depuração na extensão do navegador e recarregue a página.

Se a IDE aceita a conexão e o breakpoint continua inativo, verifique
primeiro os mapeamentos de caminhos.

## Depurando um comando de console

Sem Docker, inicie o comando com um trigger do Xdebug:

```shell
XDEBUG_MODE=debug XDEBUG_SESSION=phpstorm ./yii hello
```

Com Docker, passe o trigger para o container:

```shell
docker compose -f docker/compose.yml -f docker/dev/compose.yml run --rm \
  -e XDEBUG_MODE=debug \
  -e XDEBUG_SESSION=phpstorm \
  -e PHP_IDE_CONFIG=serverName=localhost \
  app ./yii hello
```

Use o nome do comando e os argumentos de que você precisa no lugar de
`hello`.

## Depurando testes

Sem Docker, inicie o executor de testes com um trigger do Xdebug:

```shell
XDEBUG_MODE=debug XDEBUG_SESSION=phpstorm vendor/bin/codecept run
```

Com Docker, configure `docker/test/override.env`:

```dotenv
XDEBUG_MODE=debug,coverage
XDEBUG_CONFIG="client_host=host.docker.internal idekey=phpstorm"
```

Depois, rode o container de testes com um trigger:

```shell
docker compose -f docker/compose.yml -f docker/test/compose.yml run --rm \
  -e XDEBUG_SESSION=phpstorm \
  -e PHP_IDE_CONFIG=serverName=localhost \
  app ./vendor/bin/codecept run
```

Use `make test` para execuções normais dos testes. Use o comando `docker
compose` explícito quando precisar passar variáveis de ambiente só de
depuração para uma execução.

## Solução de problemas

- A IDE precisa estar escutando antes de o PHP iniciar a requisição.
- O Xdebug se conecta do PHP para a IDE. Libere conexões de entrada na porta
  `9003` no firewall do host.
- No Docker, o `client_host` precisa ser acessível a partir do container. O
  template do Yii usa `host.docker.internal`.
- Para CLI e testes, defina `XDEBUG_SESSION=phpstorm` ou outro trigger
  aceito pela sua configuração do Xdebug.
- Para mapeamentos de caminhos no Docker, mapeie a raiz do projeto no host
  para `/app`.
- Para inspecionar as tentativas de conexão, adicione temporariamente
  `log=/app/runtime/xdebug.log` ao `XDEBUG_CONFIG`.

## Veja também

- [Depuração passo a passo do Xdebug](https://xdebug.org/docs/step_debug)
- [Documentação do Xdebug no
  PhpStorm](https://www.jetbrains.com/help/phpstorm/configuring-xdebug.html)
- [Servidores e mapeamentos de caminhos no
  PhpStorm](https://www.jetbrains.com/help/phpstorm/servers.html)
- [VS Code PHP Debug](https://github.com/xdebug/vscode-php-debug)
- [Documentação de PHP no Zed](https://zed.dev/docs/languages/php#debugging)
- [Docker nos templates de aplicação](../guide/tutorial/docker.md)
