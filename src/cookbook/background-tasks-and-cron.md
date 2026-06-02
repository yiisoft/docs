# Running background tasks and cron jobs

Use console commands for scheduled maintenance work: sending digests, expiring old records, syncing data, or dispatching
queued jobs. The [Console applications](../guide/tutorial/console-applications.md) guide shows how to create a command;
this recipe focuses on running such commands reliably from cron or systemd.

## Create an idempotent command

The command should be safe to run again after a failure. Store progress in your database, use unique keys where possible,
and avoid assuming that the previous run finished.

The following command uses a lock file to prevent overlapping runs and returns meaningful exit codes:

```php
<?php

declare(strict_types=1);

namespace App\Console;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Throwable;
use Yiisoft\Yii\Console\ExitCode;

#[AsCommand(
    name: 'app:send-digests',
    description: 'Sends due email digests.',
)]
final class SendDigestsCommand extends Command
{
    public function __construct(
        private readonly DigestSender $digestSender,
        private readonly LoggerInterface $logger,
        private readonly string $lockFile = 'runtime/send-digests.lock',
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $lock = fopen($this->lockFile, 'c');

        if ($lock === false) {
            $io->error("Cannot open lock file \"{$this->lockFile}\".");
            return ExitCode::CANTCREAT;
        }

        $locked = false;

        try {
            if (!flock($lock, LOCK_EX | LOCK_NB)) {
                $io->warning('Another send-digests run is still active.');
                return ExitCode::OK;
            }

            $locked = true;
            $count = $this->digestSender->sendDueDigests();

            $this->logger->info('Sent due digests.', ['count' => $count]);
            $io->success(sprintf('Sent %d digest messages.', $count));

            return ExitCode::OK;
        } catch (Throwable $e) {
            $this->logger->error('Sending due digests failed.', ['exception' => $e]);
            $io->error($e->getMessage());

            return ExitCode::TEMPFAIL;
        } finally {
            if ($locked) {
                flock($lock, LOCK_UN);
            }

            fclose($lock);
        }
    }
}
```

The domain service keeps application logic outside the command:

```php
<?php

declare(strict_types=1);

namespace App\Console;

interface DigestSender
{
    public function sendDueDigests(): int;
}
```

Register the command in `config/console/commands.php`:

```php
use App\Console;

return [
    // ...
    'app:send-digests' => Console\SendDigestsCommand::class,
];
```

Bind `DigestSender` to your concrete service in DI. If you need a different lock path in production, configure the
`lockFile` constructor argument in a DI file or an environment-specific config file.

## Run from cron

Use absolute paths, set the application environment explicitly, and redirect output to a log destination:

```txt
* * * * * cd /var/www/example.com/current && APP_ENV=prod php ./yii app:send-digests --no-interaction >> runtime/logs/cron.log 2>&1
```

For Docker Compose deployments, run the command in the application service:

```txt
* * * * * cd /var/www/example.com/current && docker compose exec -T php php ./yii app:send-digests --no-interaction >> runtime/logs/cron.log 2>&1
```

Cron starts commands with a minimal environment. Do not rely on your interactive shell profile. Put required environment
variables into the crontab, a wrapper script, systemd unit, container environment, or Yii environment files.

## Run from systemd timers

For Linux servers using systemd, create a service unit:

```ini
[Unit]
Description=Send due Yii digests

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/var/www/example.com/current
Environment=APP_ENV=prod
ExecStart=/usr/bin/php ./yii app:send-digests --no-interaction
```

Create the timer:

```ini
[Unit]
Description=Run Yii digest sender every minute

[Timer]
OnCalendar=*:0/1
Persistent=true

[Install]
WantedBy=timers.target
```

Systemd records stdout, stderr, and the exit code in the journal:

```shell
systemctl status yii-send-digests.service
journalctl -u yii-send-digests.service
```

## Locking strategy

Use one locking mechanism per command. A lock inside the command is portable and works the same from cron, systemd,
Docker, and manual runs. An external lock is also fine when you want operations staff to control it without changing PHP
code:

```txt
* * * * * cd /var/www/example.com/current && flock -n runtime/send-digests.lock php ./yii app:send-digests --no-interaction
```

For multi-server deployments, a local file lock only protects one server. Use a database row, advisory database lock,
Redis lock, or a queue worker with a single consumer when the same job may run on multiple instances.

## Failure behavior

Return `0` when there was nothing to do or another copy is already running. Return a non-zero code when work failed and
an operator or scheduler should notice.

Let the command throw or return a non-zero exit code for infrastructure problems such as unavailable database, queue, or
mail transport. Log enough context to diagnose the failed item, but avoid logging secrets and full personal data.

For long-running commands, configure logging so records are flushed promptly. The logging guide explains
[flush and export intervals](../guide/runtime/logging.md#flushing-and-exporting-messages).
