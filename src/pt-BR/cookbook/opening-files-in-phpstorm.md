# Opening files directly in PhpStorm

Yii error pages can show links that open stack trace files in PhpStorm at
the failing line. This is useful in local development when the error page
runs in a browser and the project is open in the IDE.

## Check Toolbox links

PhpStorm supports Toolbox URLs that use the `jetbrains://` protocol. To get the `project` value and path format,
right-click a project file in the Project tool window and select **Copy Path/Reference** > **Toolbox URL**.
If the copied URL has `origin`, keep the `origin` parameter and its value in your links.

On Linux, check that Toolbox registered the protocol handler:

```shell
xdg-mime query default x-scheme-handler/jetbrains
```

The command should print a Toolbox or JetBrains daemon desktop file, for
example `jetbrainsd.desktop`.

PhpStorm should be running with the project open when you click stack trace
links.

## Configure error trace links

The Yii application template configures
`Yiisoft\ErrorHandler\Renderer\HtmlRenderer` in
`config/common/di/error-handler.php`. It reads a `traceLink` parameter and
uses it for stack trace file links.

Add the parameter to `config/common/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'traceLink' => 'jetbrains://phpstorm/navigate/reference?project=my-app&path={file}:{line}',
    // Other parameters.
];
```

Replace `my-app` with the `project` value from the Toolbox URL. If the
Toolbox URL uses `origin`, keep `origin` in the link template and use its
value.

After that, open a debug error page and click a file link in the stack
trace.

## Map Docker paths to host paths

When the application runs in Docker, stack traces usually contain container
paths such as `/app/src/...`.  PhpStorm needs the matching host path.

Set `APP_HOST_PATH` in `docker/dev/override.env` to the project path on the
host machine. Set `APP_IDE_PROJECT` to the `project` value from a Toolbox
URL. If the URL uses `origin`, store the `origin` value instead and use
`origin` in the final URL template:

```dotenv
APP_HOST_PATH=/home/user/projects/my-app
APP_IDE_PROJECT=my-app
```

`docker/dev/override.env` is for developer-specific settings and shouldn't
be committed. See [Override env
files](../guide/tutorial/docker.md#override-env-files) for details.

In the application parameters, expose these environment values as
`$params['app']['hostPath']` and `$params['app']['ideProject']`.

With the default application template, `/app/src/Web/HomePage/Action.php`
will be linked as `/home/user/projects/my-app/src/Web/HomePage/Action.php`.

## Configure `HtmlRenderer` manually

If your application doesn't have the template's `error-handler.php`
configuration, configure `HtmlRenderer` directly:

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

For Docker, use a closure to map the container path to the host path:

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
