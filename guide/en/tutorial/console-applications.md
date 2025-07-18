# Console applications

Console applications are mainly used to create utility, background processing and maintenance tasks.

To get support for console application in your project, get `yiisoft/yii-console` via composer:


```
composer require yiisoft/yii-console
```

After it's installed, you can access the entry point as

```
./yii
```

Out of the box only `serve` command is available. It's starting PHP built-in web server to serve the application locally.

Commands are executed with `symfony/console`. To create your own console command, you need to define a command:

```php
<?php
namespace App\Command\Demo;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Yiisoft\Yii\Console\ExitCode;

#[AsCommand(
    name: 'demo:hello',
    description: 'Echoes hello',
    
)]
class HelloCommand extends Command
{   
    public function configure(): void
    {
        $this            
            ->setHelp('This command serves for demo purpose')
            ->addArgument('name', InputArgument::OPTIONAL, 'Name to greet', 'anonymous');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $name = $input->getArgument('name');
        $io->success("Hello, $name!");
        return ExitCode::OK;
    }
}
```

Now register the command in `config/params.php`:

```php
return [
    'console' => [
        'commands' => [
            'demo/hello' => App\Demo\HelloCommand::class,
        ],
    ],    
];
```

After it's done, the command could be executed as

```
./yii demo:hello Alice
```


## References

- [Symfony Console component guide](https://symfony.com/doc/current/components/console.html)
