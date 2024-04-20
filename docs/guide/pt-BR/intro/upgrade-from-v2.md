# Atualizando da versão 2.0

> Se você ainda não usou o Yii2, você pode pular esta seção e ir diretamente para a seção "[primeiros passos](../start/installation.md)".

Embora compartilhe algumas ideias e valores comuns, o Yii 3 é conceitualmente diferente do Yii 2. Não existe um caminho para atualização fácil,
então primeiro [verifique a política de manutenção e as datas de fim de vida do Yii 2](https://www.yiiframework.com/release-cycle)
e considere iniciar novos projetos no Yii 3 enquanto mantém os existentes no Yii 2.

## Requisitos PHP

Yii3 requer PHP 8.0 ou superior. Como resultado, existem recursos de linguagem usados que não foram usados no Yii 2:

- [Declarações de tipo](https://www.php.net/manual/en/functions.arguments.php#functions.arguments.type-declaration)
- [Declarações de tipo de retorno](https://www.php.net/manual/en/functions.returning-values.php#functions.returning-values.type-declaration)
- [Visibilidade constante da classe](https://www.php.net/manual/en/language.oop5.constants.php)
- [Classes anônimas](https://www.php.net/manual/en/language.oop5.anonymous.php)
- [::class](https://www.php.net/manual/en/linguagem.oop5.basic.php#linguagem.oop5.basic.class.class)
- [Geradores](https://www.php.net/manual/en/linguagem.generators.php)
- [Funções variáveis](https://www.php.net/manual/en/functions.arguments.php#functions.variable-arg-list)

## Refatoração preliminar

É uma boa ideia refatorar seu projeto Yii 2 antes de portá-lo para o Yii 3. Isso tornaria a portabilidade mais fácil
e beneficia o projeto em questão enquanto ele ainda não foi movido para o Yii 3.

### Use DI em vez de localizador de serviço

Como o Yii 3 está forçando você a injetar dependências, é uma boa idéia se preparar e deixar de usar
localizador de serviço (`Yii::$app->`) para [container DI](https://www.yiiframework.com/doc/guide/2.0/en/concept-di-container).

Se o uso do contêiner DI for problemático por qualquer motivo, considere mover todas as chamadas de `Yii::$app->` para o controlador de
ações e widgets e passar dependências manualmente de um controlador para o que precisar deles.

Consulte [Injeção de dependência e contêiner](../concept/di-container.md) para uma explicação da ideia.

### Introduzir repositórios para obter dados

Como o Active Record não é a única maneira de trabalhar com um banco de dados no Yii 3, considere introduzir repositórios que
oculte detalhes de obtenção de dados e reúna-os em um único lugar que você poderá refazer posteriormente:

```php
class PostRepository
{
    public function getArchive()
    {
        // ...
    }
    
    public function getTop10ForFrontPage()
    {
        // ...
    }

}
```

### Separe a camada de domínio da infraestrutura

Caso você tenha um domínio rico e complicado, é uma boa ideia separá-lo da infraestrutura fornecida pelo framework
isso é tudo que a lógica de negócios precisa para classes independentes de estrutura.

### Mova mais para componentes

Os serviços do Yii 3 são conceitualmente semelhantes aos componentes do Yii 2, então é uma boa ideia mover partes reutilizáveis da sua aplicação
em componentes para os serviços.