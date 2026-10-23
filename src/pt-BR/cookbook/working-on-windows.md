# Trabalhando no Windows

Aplicações Yii geralmente rodam no Linux em produção. No Windows, escolha um
fluxo de trabalho local que fique próximo desse ambiente e mantenha o
desempenho do sistema de arquivos previsível.

## Configuração recomendada: WSL

Use o [Windows Subsystem for
Linux](https://learn.microsoft.com/windows/wsl/) com uma distribuição Linux
como o Ubuntu.  Instale PHP, Composer, Git e Make dentro do WSL e depois
clone o projeto no sistema de arquivos do Linux:

```shell
cd ~
git clone https://github.com/yiisoft/app.git my-app
cd my-app
composer install
```

Mantenha o projeto no sistema de arquivos do WSL, por exemplo
`/home/user/projects/my-app`. Evite trabalhar a partir de um caminho montado
do Windows, como `/mnt/c/Users/user/projects/my-app`; ele é muito mais lento
para o Composer, os testes e as ferramentas que leem muitos arquivos
pequenos.

Você pode abrir o projeto em editores do Windows por meio da integração com
o WSL. No PhpStorm, abra o projeto a partir do sistema de arquivos do
WSL. No VS Code, use a extensão WSL e abra a pasta de dentro da sessão do
WSL.

## Docker com WSL

O Docker Desktop com o backend WSL também é uma boa configuração no
Windows. Mantenha o projeto no sistema de arquivos do WSL e rode os comandos
do Docker a partir do WSL:

```shell
make build
make up
make yii
make test
```

Isso mantém os bind mounts rápidos e dá aos containers caminhos Linux que
batem com as ferramentas usadas pelos templates de aplicação do Yii.

Se você precisar de links para a IDE nos stack traces de debug, defina
`APP_HOST_PATH` com o caminho do projeto que a sua IDE consegue abrir.

## Git Bash

O [Git for Windows](https://git-scm.com/downloads/win) instala o Git Bash e
ferramentas Unix comuns. Ele pode bastar quando você quer rodar a aplicação
diretamente no Windows, sem WSL nem Docker.

Use esta opção quando o seu projeto não depende de extensões ou scripts de
shell exclusivos do Linux. Teste os mesmos comandos que você espera que os
contribuidores usem:

```shell
composer install
composer test
```

Se o projeto usa `make`, o Git for Windows inclui um ambiente Bash, mas a
disponibilidade do `make` depende da sua instalação local. Instale-o
separadamente quando necessário.

## PowerShell e CMD

O PowerShell e o CMD conseguem rodar PHP e Composer, mas diferem do ambiente
comum de servidores Linux em aspas, variáveis de ambiente, caminhos e
utilitários de shell. Use-os apenas para comandos simples.

Para o desenvolvimento regular com Yii no Windows, prefira o WSL ou o Docker
com WSL.

## Escolhendo um fluxo de trabalho

Use o WSL quando quiser o ambiente local mais parecido com um servidor Linux
e não precisar de containers para cada serviço.

Use o Docker com WSL quando quiser a aplicação, o banco de dados e outros
serviços descritos em arquivos do Compose.

Use o Git Bash para projetos pequenos ou verificações rápidas que rodam
diretamente no Windows.

Use o PowerShell ou o CMD quando se sabe que o comando é independente de
plataforma.
