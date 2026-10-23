# 014 — Documentação

A documentação é uma das partes mais importantes do Yii.

## Documentação de pacotes

A documentação de um pacote pode ficar no `README.md` ou em
`docs/{language}/{type}`, onde `{language}` é um código de idioma e `{type}`
pode ser "guide", "cookbook" ou outra coisa.  Normalmente, `docs` existe
quando o uso ou a configuração do pacote não é trivial ou quando há
necessidade de tradução.

Alguns indícios de que é hora de criar `docs`:

1. Há necessidade de tradução.
2. Existem muitos tópicos, e cada um deles é grande por si só.

Se o tamanho total do readme for menor que cerca de 200 linhas, não há
problema em manter a documentação no readme.

## Guia definitivo

O guia definitivo,
[yiisoft/docs/guide](https://github.com/yiisoft/docs/tree/master/src/guide)
tem como objetivo cobrir o uso dos pacotes como um framework
completo. Diferente da documentação dos pacotes, ele não se concentra em um
único pacote, e sim em determinados casos de uso.

O guia deve seguir o [guia de estilo da
Microsoft](https://learn.microsoft.com/en-us/style-guide/welcome/).

### Tradução

O guia definitivo usa o [po4a](https://github.com/mquinson/po4a) em uma GitHub Action para as traduções.  

Algoritmo de tradução:

- Instale uma aplicação para trabalhar com arquivos de tradução `.po`. Por
  exemplo, [Poedit](https://poedit.net/),
  [Lokalize](https://apps.kde.org/ru/lokalize/),
  [Gtranslator](https://wiki.gnome.org/Apps/Gtranslator) ou outra.
- Encontre o arquivo que você quer traduzir em
  `_translations/guide/{lang}`. Observe que, se o arquivo original estiver
  em uma subpasta, o nome da subpasta é adicionado ao nome do arquivo,
  separado por um sublinhado. Por exemplo, para traduzir o arquivo
  `guide/en/concept/aliases.md`, procure o arquivo
  `_translations/guide/{lang}/concept_aliases.md.po`.
- Abra o arquivo com extensão `.po` no `Poedit` a partir da pasta com a
  localização desejada, por exemplo
  `_translations/guide/ru/intro_what-is-yii.md.po`. Se ainda não existir a
  localização, crie uma issue.
- Traduza as strings necessárias e faça push das alterações
- Abra um pull request para o repositório principal

> [!CAUTION]
> Não altere manualmente a tradução nos arquivos em `/guide/{lang}`.

Se você alterou o texto em inglês e quer atualizar as traduções:

- Abra um pull request para o repositório principal
- Faça pull do branch atualizado depois que o workflow `Update docs
  translation` da GitHub Action terminar com sucesso
- Atualize a tradução nos arquivos `.po` com o `Poedit`
- Faça push das alterações

## Blocos

Os blocos usam o [formato GitHub
Alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts):

```
> [!NOTE]
> Informação útil que os usuários devem saber, mesmo lendo o conteúdo por alto.

> [!TIP]
> Conselho útil para fazer as coisas melhor ou com mais facilidade.

> [!IMPORTANT]
> Informação essencial que os usuários precisam saber para alcançar o objetivo.

> [!WARNING]
> Informação urgente que exige atenção imediata do usuário para evitar problemas.

> [!CAUTION]
> Alerta sobre riscos ou consequências negativas de certas ações.
```

Ao traduzir a documentação, esses indicadores de bloco não devem ser
traduzidos.  Mantenha-os intactos e traduza apenas o conteúdo do bloco.
Para traduzir o rótulo do bloco, cada tradução do guia deve ter um arquivo
`blocktypes.json` com as traduções. Veja a seguir um exemplo para o alemão:

```json
{
    "Note": "Hinweis",
    "Tip": "Tipp",
    "Important": "Wichtig",
    "Warning": "Achtung",
    "Caution": "Vorsicht"
}
```

## PHPDoc

Não se deve adicionar PHPDoc se ele não acrescentar nada ao que
descreve. Este é um mau exemplo:

```php
use Psr\Log\LoggerInterface;

/**
 * MyService class
 */
final class MyService extends MyServiceBase
{
    /**
     * @var LoggerInterface logger 
     */
    private LoggerInterface $logger;

    /**
     * MyService constructor.
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @inheritDoc
     */
    public function doit(): bool
    {
        return parent::doit();    
    }
}
```

O PHPDoc, quando presente, deve descrever o propósito do elemento ao qual
foi adicionado.

Omita valores padrão no PHPDoc quando o PHP já os mostra no valor padrão de
um parâmetro, no valor padrão de uma propriedade promovida ou no
inicializador de uma propriedade. A declaração é a fonte da verdade, e
repetir o valor no texto pode ficar desatualizado após mudanças no código.

Exemplo de código incorreto:

```php
/**
 * @param bool $skipOnEmpty Whether to skip validation when the value is empty. Defaults to true.
 */
public function __construct(
    private bool $skipOnEmpty = true,
) {
}
```

Exemplo de código válido:

```php
/**
 * @param bool $skipOnEmpty Whether to skip validation when the value is empty.
 */
public function __construct(
    private bool $skipOnEmpty = true,
) {
}
```

As tags `@see` devem referenciar explicitamente métodos, propriedades e
constantes da classe. Isso é necessário para que os links sejam exibidos
corretamente nas IDEs e na documentação da API.

Exemplo de código incorreto:

```php
/**
 * @see SOME_CONST
 * @see $prop
 * @see doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

Exemplo de código válido:

```php
/**
 * @see Example::SOME_CONST
 * @see Example::$prop
 * @see Example::doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

## Checklist do readme

O readme de cada pacote deve ficar em `README.md` e conter o seguinte:

- [ ] Logo.
- [ ] Descrição curta do pacote. O que ele faz?
- [ ] Badges de qualidade (build, cobertura de código).
- [ ] Captura de tela (se aplicável).
- [ ] Requisitos.
- [ ] Instalação. Normalmente `composer require`.
- [ ] Primeiros passos. Um ou dois exemplos de uso comuns.
- [ ] Configuração.
- [ ] Contribuindo. Deve conter um link para as diretrizes.
- [ ] Executando os testes.
- [ ] Licença.
