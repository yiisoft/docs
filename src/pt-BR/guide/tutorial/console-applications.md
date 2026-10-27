# Aplicações de console

Aplicações de console são usadas principalmente para criar utilitários,
processamento em segundo plano e tarefas de manutenção.

## Primeiros passos

Se você usa [yiisoft/app](https://github.com/yiisoft/app) ou
[yiisoft/app-api](https://github.com/yiisoft/app-api), o suporte a console
já vem incluído.  Você pode acessar o ponto de entrada assim:

```
./yii
```

Se você quer uma aplicação somente de console, use o template de projeto
[yiisoft/app-console](https://github.com/yiisoft/app-console):

```sh
composer create-project yiisoft/app-console your-project
```

Para adicionar suporte a console a um projeto existente do zero, consulte a
[documentação do pacote
yiisoft/yii-console](https://github.com/yiisoft/yii-console).

De início, apenas o comando `serve` está disponível. Ele inicia o servidor
web embutido do PHP para servir a aplicação localmente.

Os comandos são executados com `symfony/console`. Para criar seu próprio
comando de console, você precisa definir um comando:

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

Agora registre o comando em `config/params.php`:

```php
return [
    'yiisoft/yii-console' => [
        'commands' => [
            'demo:hello' => App\Demo\HelloCommand::class,
        ],
    ],    
];
```

Feito isso, o comando pode ser executado assim

```
./yii demo:hello Alice
```


## Referências

- [Guia do componente Symfony
  Console](https://symfony.com/doc/current/components/console.html)
