# Working on Windows

Yii applications usually run on Linux in production. On Windows, choose a local workflow that stays close to that
environment and keeps filesystem performance predictable.

## Recommended setup: WSL

Use [Windows Subsystem for Linux](https://learn.microsoft.com/windows/wsl/) with a Linux distribution such as Ubuntu.
Install PHP, Composer, Git, and Make inside WSL, then clone the project into the Linux filesystem:

```shell
cd ~
git clone https://github.com/yiisoft/app.git my-app
cd my-app
composer install
```

Keep the project under the WSL filesystem, for example `/home/user/projects/my-app`. Avoid working from a mounted
Windows path such as `/mnt/c/Users/user/projects/my-app`; it is much slower for Composer, tests, and tools that read
many small files.

You can open the project from Windows editors through the WSL integration. In PhpStorm, open the project from the WSL
filesystem. In VS Code, use the WSL extension and open the folder from inside the WSL session.

## Docker with WSL

Docker Desktop with the WSL backend is also a good Windows setup. Keep the project in the WSL filesystem and run Docker
commands from WSL:

```shell
make build
make up
make yii
make test
```

This keeps bind mounts fast and gives containers Linux paths that match the tooling used by the Yii application
templates.

If you need IDE links from debug stack traces, set `APP_HOST_PATH` to the project path that your IDE can open.

## Git Bash

[Git for Windows](https://git-scm.com/downloads/win) installs Git Bash and common Unix tools. It can be enough when you
want to run the application directly on Windows without WSL or Docker.

Use this option when your project does not depend on Linux-only extensions or shell scripts. Check the same commands
you expect contributors to use:

```shell
composer install
composer test
```

If the project uses `make`, Git for Windows includes a Bash environment, but `make` availability depends on your local
installation. Install it separately when needed.

## PowerShell and CMD

PowerShell and CMD can run PHP and Composer, but they differ from the common Linux server environment in quoting,
environment variables, paths, and shell utilities. Use them for simple commands only.

For regular Yii development on Windows, prefer WSL or Docker with WSL.

## Choosing a workflow

Use WSL when you want the closest local match to a Linux server and do not need containers for every service.

Use Docker with WSL when you want the application, database, and other services described by Compose files.

Use Git Bash for small projects or quick checks that run directly on Windows.

Use PowerShell or CMD when the command is known to be platform-neutral.
