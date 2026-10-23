# Abrindo arquivos diretamente no PhpStorm

As páginas de erro do Yii podem mostrar links que abrem os arquivos do stack
trace no PhpStorm, na linha que falhou. Isso é útil no desenvolvimento
local, quando a página de erro roda no navegador e o projeto está aberto na
IDE.

## Verifique os links do Toolbox

O PhpStorm suporta URLs do Toolbox que usam o protocolo `jetbrains://`. Para obter o valor de `project` e o formato do caminho,
clique com o botão direito em um arquivo do projeto na janela Project e selecione **Copy Path/Reference** > **Toolbox URL**.
Se a URL copiada tiver `origin`, mantenha o parâmetro `origin` e o valor dele nos seus links.

No Linux, verifique se o Toolbox registrou o handler do protocolo:

```shell
xdg-mime query default x-scheme-handler/jetbrains
```

O comando deve imprimir um arquivo desktop do Toolbox ou do daemon da
JetBrains, por exemplo `jetbrainsd.desktop`.

O PhpStorm deve estar rodando com o projeto aberto quando você clicar nos
links do stack trace.

## Configure os links do stack trace

O template de aplicação do Yii configura o
`Yiisoft\ErrorHandler\Renderer\HtmlRenderer` em
`config/common/di/error-handler.php`. Ele lê um parâmetro `traceLink` e o
usa nos links de arquivos do stack trace.

Adicione o parâmetro em `config/common/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'traceLink' => 'jetbrains://phpstorm/navigate/reference?project=my-app&path={file}:{line}',
    // Outros parâmetros.
];
```

Substitua `my-app` pelo valor de `project` da URL do Toolbox. Se a URL do
Toolbox usar `origin`, mantenha `origin` no template do link e use o valor
dele.

Depois disso, abra uma página de erro em modo debug e clique em um link de
arquivo no stack trace.

## Mapeie os caminhos do Docker para os caminhos do host

Quando a aplicação roda no Docker, os stack traces geralmente contêm
caminhos do container, como `/app/src/...`.  O PhpStorm precisa do caminho
correspondente no host.

Defina `APP_HOST_PATH` em `docker/dev/override.env` com o caminho do projeto
na máquina host. Defina `APP_IDE_PROJECT` com o valor de `project` de uma
URL do Toolbox. Se a URL usar `origin`, guarde o valor de `origin` e use
`origin` no template final da URL:

```dotenv
APP_HOST_PATH=/home/user/projects/my-app
APP_IDE_PROJECT=my-app
```

O `docker/dev/override.env` é para configurações específicas de cada
desenvolvedor e não deve ser commitado. Veja [Arquivos env de
override](../guide/tutorial/docker.md#arquivos-env-de-override) para mais
detalhes.

Nos parâmetros da aplicação, exponha esses valores de ambiente como
`$params['app']['hostPath']` e `$params['app']['ideProject']`.

Com o template de aplicação padrão, `/app/src/Web/HomePage/Action.php` será
linkado como `/home/user/projects/my-app/src/Web/HomePage/Action.php`.

## Configure o `HtmlRenderer` manualmente

Se a sua aplicação não tiver a configuração `error-handler.php` do template,
configure o `HtmlRenderer` diretamente:

```php
<?php

declare(strict_types=1);

use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;

return [
    HtmlRenderer::class => [
        '__construct()' => [
            'traceLink' => 'jetbrains://phpstorm/navigate/reference?project=my-app&path={file}:{line}',
        ],
    ],
];
```

Para o Docker, use uma closure para mapear o caminho do container para o
caminho do host:

```php
<?php

declare(strict_types=1);

/** @var array $params */

use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;

$hostPath = rtrim($params['app']['hostPath'], '/') . '/';
$project = $params['app']['ideProject'];

return [
    HtmlRenderer::class => [
        '__construct()' => [
            'traceLink' => static function (string $file, ?int $line) use ($hostPath, $project): string {
                $file = preg_replace('~^/app/~', $hostPath, $file);
                $path = $line === null ? $file : $file . ':' . $line;

                return str_replace(
                    ['{project}', '{path}'],
                    [$project, $path],
                    'jetbrains://phpstorm/navigate/reference?project={project}&path={path}',
                );
            },
        ],
    ],
];
```
