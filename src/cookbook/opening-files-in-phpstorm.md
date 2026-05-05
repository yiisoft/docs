# Opening files directly in PhpStorm

Yii error pages can show links that open stack trace files in PhpStorm at the failing line. This is useful in local
development when the error page runs in a browser and the project is open in the IDE.

## Register the `phpstorm://` protocol

On Linux desktops, install a protocol handler such as
[phpstorm-url-handler](https://github.com/sanduhrs/phpstorm-url-handler).

First, make sure the PhpStorm launcher is available as `phpstorm` or `pstorm` in your `PATH`.
For example:

```shell
ln -s /path/to/phpstorm/bin/phpstorm.sh /usr/local/bin/phpstorm
```

Then install the URL handler:

```shell
git clone https://github.com/sanduhrs/phpstorm-url-handler.git
cd phpstorm-url-handler
cp phpstorm-url-handler /usr/local/bin/phpstorm-url-handler
chmod +x /usr/local/bin/phpstorm-url-handler
desktop-file-install phpstorm-url-handler.desktop
update-desktop-database
```

Use `sudo` for commands that write to system directories when your user doesn't have permission.

Check the handler:

```shell
phpstorm-url-handler 'phpstorm://open?file=/path/to/project/src/Web/HomePage/Action.php&line=10'
```

## Configure error trace links

The Yii application template configures `Yiisoft\ErrorHandler\Renderer\HtmlRenderer` in
`config/common/di/error-handler.php`. It reads a `traceLink` parameter and uses it for stack trace file links.

Add the parameter to `config/common/params.php`:

```php
<?php

declare(strict_types=1);

return [
    'traceLink' => 'phpstorm://open?file={file}&line={line}',
    // Other parameters.
];
```

After that, open a debug error page and click a file link in the stack trace.

## Map Docker paths to host paths

When the application runs in Docker, stack traces usually contain container paths such as `/app/src/...`.
PhpStorm needs the matching host path.

Set `APP_HOST_PATH` in `.env` to the project path on the host machine:

```dotenv
APP_HOST_PATH=/home/user/projects/my-app
```

With the default application template, `/app/src/Web/HomePage/Action.php` will be linked as
`/home/user/projects/my-app/src/Web/HomePage/Action.php`.

## Configure `HtmlRenderer` manually

If your application doesn't have the template's `error-handler.php` configuration, configure `HtmlRenderer` directly:

```php
<?php

declare(strict_types=1);

use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;

return [
    HtmlRenderer::class => [
        '__construct()' => [
            'traceLink' => 'phpstorm://open?file={file}&line={line}',
        ],
    ],
];
```

For Docker, use a closure to map the container path to the host path:

```php
<?php

declare(strict_types=1);

use Yiisoft\ErrorHandler\Renderer\HtmlRenderer;

return [
    HtmlRenderer::class => [
        '__construct()' => [
            'traceLink' => static function (string $file, ?int $line): string {
                $file = preg_replace('~^/app/~', '/home/user/projects/my-app/', $file);

                return str_replace(
                    ['{file}', '{line}'],
                    [$file, (string) $line],
                    'phpstorm://open?file={file}&line={line}',
                );
            },
        ],
    ],
];
```
