# 021 — Changelog e upgrade

Para todos os pacotes lançados, mantemos um changelog detalhado e um guia de
upgrade.

## Changelog

O changelog é escrito para cada versão lançada. O nome do arquivo é
`CHANGELOG.md`. O formato é o seguinte:

```markdown
# My package Change Log

## 1.0.2 under development

- no changes in this release.

## 1.0.1 March 23, 2021

- Bug #42: Short description of the change (@author1, @author2)

## 1.0.0 February 02, 2021

- Initial release.
```

Ali, "My package" é o nome do pacote, `1.0.1` é a versão lançada, seguida da
data de release.  Para cada versão, há algumas linhas listando as mudanças.
"Bug" indica o tipo da mudança.  São usados os seguintes tipos:

- New — Novas funcionalidades.
- Chg — Mudanças gerais.
- Enh — Melhorias em funcionalidades existentes.
- Bug — Correções de bugs.

No arquivo de changelog, as linhas devem ser ordenadas como New, Chg, Enh,
Bug.

"#42" acima é o número da issue ou do pull request correspondente à
mudança. "author1" é o nickname no GitHub do autor do código. "author2" é um
autor adicional. O nickname de um autor DEVE ter o prefixo `@`.

## Upgrade

O guia de upgrade é criado quando há uma nova versão major que não é
compatível com a anterior.  Ele descreve os passos necessários para fazer o
upgrade do código da aplicação.

O nome do arquivo é `UPGRADE.md`. O formato é o seguinte:

```markdown
# Upgrading Instructions for my package

This file contains the upgrade notes. These notes highlight changes that could break your
application when you upgrade the package from one version to another.

> **Important!** The following upgrading instructions are cumulative. That is, if you want
> to upgrade from version A to version C and there is version B between A and C, you need
> to follow the instructions for both A and B.

## Upgrade from 2.x

- Public method `test()` was removed. Use `perform()` instead.

## Upgrade from 1.x

- Clean up the cache after upgrading. Old cache is not compatible with new code.
```
