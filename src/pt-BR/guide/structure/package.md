# Usando pacotes

Código reutilizável é distribuído como [pacotes
Composer](https://getcomposer.org/doc/05-repositories.md#package).  Um
pacote pode ser uma biblioteca de infraestrutura, uma integração com o Yii,
um recurso reutilizável ou um módulo que representa um contexto da
aplicação.

Esta página explica como usar pacotes em uma aplicação. Para criar um pacote
compatível com o Yii, veja [Projetando pacotes para aplicações
Yii](designing-packages.md).

## Instalando pacotes

Por padrão, o Composer instala pacotes registrados no
[Packagist](https://packagist.org/), o principal repositório de pacotes PHP
de código aberto.

Instale um pacote com:

```sh
composer require vendor-name/package-name
```

O Composer atualiza dois arquivos:

- `composer.json` armazena o nome do pacote e a restrição de versão.
- `composer.lock` armazena as versões exatas instaladas.

Faça commit dos dois arquivos para que outros ambientes instalem as mesmas
versões das dependências.

Os pacotes instalados ficam na pasta `vendor/` da aplicação.

> [!WARNING]
> Nunca edite arquivos em `vendor/` diretamente. Em vez disso, altere a configuração da aplicação, estenda classes, decore serviços ou
> contribua com correções para o pacote.

As classes dos pacotes ficam disponíveis pelo autoload do Composer após a
instalação. Veja [Autoload](../concept/autoloading.md)  para mais detalhes.

## Atualizando pacotes

Atualize um pacote dentro da restrição de versão registrada no
`composer.json`:

```sh
composer update vendor-name/package-name
```

Altere a restrição de versão aceita com `composer require`:

```sh
composer require vendor-name/package-name:^2.0
```

Depois de atualizar um pacote compatível com o Yii, o Composer reconstrói o
merge plan de configuração do Yii. Se você alterou manualmente os
mapeamentos de grupos de configuração, reconstrua-o explicitamente:

```sh
composer yii-config-rebuild
```

## Removendo pacotes

Remova um pacote com:

```sh
composer remove vendor-name/package-name
```

Em seguida, remova o código e a configuração da aplicação que referenciavam
classes, serviços, rotas, comandos, assets, migrations ou traduções desse
pacote.

## Pacotes privados

Para código privado, configure repositórios do Composer no `composer.json`
da aplicação. As opções mais comuns são:

- `vcs` para um repositório Git.
- `path` para um pacote local durante o desenvolvimento.
- `composer` para um repositório Composer privado.

Por exemplo, para trabalhar com um pacote localizado ao lado da aplicação:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/blog"
        }
    ]
}
```

Depois, instale-o normalmente:

```sh
composer require vendor/blog
```

Leia mais na [documentação de repositórios do
Composer](https://getcomposer.org/doc/05-repositories.md).

## Configuração de pacotes

Alguns pacotes Yii fornecem configuração padrão por meio do
[yiisoft/config](https://github.com/yiisoft/config).  Após a instalação, a
configuração do pacote passa a fazer parte da camada vendor, e a aplicação
pode sobrescrevê-la na configuração do pacote raiz.

Prefira sobrescritas parciais nos arquivos de configuração da aplicação em
vez de copiar arquivos de configuração inteiros do pacote. Por exemplo,
sobrescreva apenas o parâmetro ou a definição de serviço de que você
precisa.

Para mais detalhes, veja [Configuração](../concept/configuration.md) e
[Projetando pacotes para aplicações Yii](designing-packages.md).
