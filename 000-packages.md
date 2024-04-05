#000 – Pacotes

A equipe do Yii3 dividiu o framework em vários pacotes que estão em conformidade com os seguintes acordos.

Para todos os pacotes, o nome do repositório GitHub corresponde exatamente ao nome do pacote Packagist.

Para obter uma lista completa de pacotes e seus status de construção,
consulte a [página de status em yiiframework.com](https://www.yiiframework.com/status/3.0).

## Pacotes específicos do Yii (framework e extensões)
    
- chamado `yiisoft/yii-something` ou mais especificamente: `yii-type-something`, por exemplo:
     - módulos: `yii-module-users`, `yii-module-pages`
     - temas: `yii-theme-adminlte`, `yii-theme-hyde`
     - widgets: `yii-widget-datepicker`
     - ...
- intitulado como "Yii Framework ..."
- pode ter quaisquer dependências e código específico do Yii

## Pacotes de uso geral (bibliotecas)
  
- você pode usá-los independentemente do Framework Yii
- nomeado como `yiisoft/something` sem prefixo yii
- intitulado como "Yii ..."
- não deve ter dependências de nenhum pacote específico do Yii
- deve ter o mínimo de dependências possível

## Configurações e padrões

O seguinte se aplica tanto a pacotes específicos do Yii quanto a pacotes de uso geral:

- O pacote pode ter um diretório `config` com padrões específicos do Yii.
- O pacote pode ter "config-plugin" na seção "extra" do `composer.json`.
- O pacote não deve ter dependências na seção `require` do `composer.json` que são usadas apenas no `config`.
- Você deve definir parâmetros de namespace com `vendor/package-name`:

```php
return [
     'vendor/nome-do-pacote' => [
         'param1' => 1,
         'param2' => 2,
     ],
];
```
  
## Versões

Todos os pacotes seguem versionamento [SemVer](https://semver.org/):

- `x.*.*` - alterações de API incompatíveis.
- `*.x.*` - adiciona funcionalidade (compatível com versões anteriores).
- `*.*.x` - correções de bugs (compatível com versões anteriores).

A primeira versão estável deve ser 1.0.0.

Cada número de versão do pacote não depende de nenhuma outra versão do pacote ou nome/versão da estrutura, apenas no seu próprio contrato público.
O framework como um todo tem o nome "Yii3".

Não há problema em usar pacotes com diferentes versões principais juntos, desde que sejam compatíveis.

## Suporte a versões PHP

O suporte de versões PHP suportadas por um pacote depende de
[Ciclo de vida das versões PHP](https://www.php.net/supported-versions.php).

- Versões de pacotes com suporte ativo DEVEM suportar todas as versões do PHP que possuem suporte ativo.
- Tanto os pacotes quanto os modelos de aplicação DEVEM ter versões suportadas que recebam correções de bugs e segurança.
   DEVEM corresponder às versões do PHP que recebem correções de segurança.
- Pacotes e modelos de aplicativos PODEM ter versões suportadas que funcionam com versões PHP não suportadas.
- Colocar a versão mínima do PHP em um pacote ou modelo de aplicativo é uma pequena alteração.

## compositor.json

Um operador lógico OR em intervalos de versão DEVE usar barra vertical dupla (`||`). Por exemplo: `"yiisoft/arrays": "^1.0 || ^2.0"`.