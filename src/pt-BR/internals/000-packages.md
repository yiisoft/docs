# 000 — Pacotes

O time do Yii3 dividiu o framework em vários pacotes que seguem os acordos
abaixo.

Em todos os pacotes, o nome do repositório no GitHub corresponde exatamente
ao nome do pacote no Packagist.

Para ver a lista completa de pacotes e o status de build de cada um,
consulte a [página de status em
yiiframework.com](https://www.yiiframework.com/status/3.0).

## Pacotes específicos do Yii (framework e extensões)
    
- nomeados como `yiisoft/yii-something` ou de forma mais específica:
  `yii-type-something`, por exemplo:
    - módulos: `yii-module-users`, `yii-module-pages`
    - temas: `yii-theme-adminlte`, `yii-theme-hyde`
    - widgets: `yii-widget-datepicker`
    - ...
- intitulados como "Yii Framework ..."
- podem ter quaisquer dependências e código específico do Yii

## Pacotes de uso geral (bibliotecas)
  
- você pode usá-los independentemente do Yii Framework
- nomeados como `yiisoft/something`, sem o prefixo yii
- intitulados como "Yii ..."
- não podem ter dependências de nenhum pacote específico do Yii
- devem ter o menor número possível de dependências

## Configurações e padrões

O que segue se aplica tanto aos pacotes específicos do Yii quanto aos
pacotes de uso geral:

- O pacote pode ter um diretório `config` com padrões específicos do Yii.
- O pacote pode ter "config-plugin" na seção "extra" do `composer.json`.
- O pacote não pode ter, na seção `require` do `composer.json`, dependências
  usadas apenas em `config`.
- Você deve colocar os parâmetros sob o namespace `vendor/package-name`:

```php
return [
    'vendor/package-name' => [
        'param1' => 1,
        'param2' => 2,
    ],
];
```
  
## Versões

Todos os pacotes seguem o versionamento [SemVer](https://semver.org/):

- `x.*.*` - mudanças incompatíveis na API.
- `*.x.*` - adição de funcionalidades (compatível com versões anteriores).
- `*.*.x` - correções de bugs (compatível com versões anteriores).

A primeira versão estável deve ser 1.0.0.

O número de versão de cada pacote não depende da versão de nenhum outro
pacote nem do nome/versão do framework, apenas do seu próprio contrato
público.  O framework como um todo tem o nome "Yii3".

Não há problema em usar juntos pacotes com versões major diferentes, desde
que sejam compatíveis.

## Suporte a versões do PHP

O suporte às versões do PHP em um pacote depende do [ciclo de vida das
versões do PHP](https://www.php.net/supported-versions.php).

- Versões de pacotes com suporte ativo DEVEM suportar todas as versões do
  PHP que têm suporte ativo.
- Tanto os pacotes quanto os templates de aplicação DEVEM ter versões
  suportadas que recebem correções de bugs e de segurança.  Essas versões
  DEVERIAM corresponder às versões do PHP que recebem correções de
  segurança.
- Pacotes e templates de aplicação PODEM ter versões suportadas que
  funcionam com versões do PHP sem suporte.
- Aumentar a versão mínima do PHP em um pacote ou template de aplicação é
  uma mudança minor.

## composer.json

Um operador lógico OU em intervalos de versão DEVE usar pipe duplo (`||`). Por exemplo: `"yiisoft/arrays": "^1.0 || ^2.0"`.   
