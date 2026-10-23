# 009 — Decisões de design

Neste documento, listamos decisões de design importantes tomadas durante o
desenvolvimento do Yii3.

## Remover propriedades mágicas

As propriedades mágicas do Yii 2 eram uma ideia interessante: permitiam ao
desenvolvedor começar com uma propriedade pública e depois migrar de forma
transparente para getter/setter chamados via métodos mágicos, sem mudar o
código.

O principal motivo da remoção no Yii 3 é que isso levava ao uso de
propriedades públicas em todo lugar, resultando em falta de encapsulamento e
código frágil.

## Remover o service locator

O service locator, tanto no Yii 1 quanto no Yii 2, era conveniente, mas
também muito abusado.  Embora o Yii 2 tivesse um container de injeção de
dependência, o service locator costumava ser preferido, o que causava
dependência do próprio service locator, alto acoplamento e código difícil de
testar.

O Yii 3 usa apenas injeção de dependência, o que reduz bastante o
acoplamento e torna o código muito mais testável.

## Extrair pacotes de uso geral

O Yii 1 e o Yii 2 eram comunidades totalmente fechadas. Todo o código que
tínhamos não era útil fora do Yii, e a maior parte do código "externo" não
era útil no Yii sem wrappers. Comunidades de fora do Yii comentaram muitas
vezes que várias partes do Yii são bem projetadas e únicas, e que as usariam
se estivessem disponíveis como pacotes independentes.

Como parte do Yii 3, pacotes como cache, RBAC, view etc. foram extraídos
para pacotes independentes de framework. Os benefícios são:

- Mais uso e mais contribuições
- O time do Yii pode delegar a manutenção
- Releases independentes passam a ser possíveis

## Adotar PSRs

O time adotou algumas PSRs no Yii 2, como a PSR-4 e a PSR-2.  As interfaces,
em geral, não foram adotadas, embora o Yii faça parte do PHP-FIG.
Principalmente porque, quando o Yii 2 foi lançado, elas ainda estavam em
elaboração ou não tinham adoção suficiente.

O Yii3 se beneficia das PSRs, já que hoje existem muitas bibliotecas prontas
para uso que você instala via Composer: backends de cache, middlewares,
loggers, containers de DI etc.

Ao implementar PSRs nos pacotes de uso geral, permitimos que eles sejam
usados em mais projetos, aumentando o nível de contribuição.

## Melhorar o container de DI

O problema do container do Yii 2 era que ele foi feito sob medida para os
componentes do Yii 2.  A API não foi bem projetada para uso com classes PHP
em geral.

No Yii3, garantimos que o container possa ser usado para configurar qualquer
classe PHP de forma conveniente.

Isso deve resultar na ausência de pacotes wrapper específicos do Yii e em
mais uso direto de pacotes do Composer.

## Adotar strict types

Os strict types foram introduzidos porque:

- O PHP 7 agora é o padrão do mercado
- Embora não resolvam nenhum problema significativo do Yii 2, ajudam a
  evitar muitos problemas do dia a dia de desenvolvimento

## Adotar SemVer

O Yii 2 tem sua própria política de versões. Problemas:

- Não era um padrão
- O Composer se baseia em SemVer
- É difícil manter um framework construído sobre pacotes se a política de
  versionamento não for rígida

## Impedir que validadores alterem dados

No Yii 1 e no Yii 2, validadores como "date" alteravam os dados.  Era
confuso que um processo de validação, que a princípio não deveria alterar os
dados que valida, fizesse isso.

[Veja a discussão
relacionada](https://forum.yiiframework.com/t/saving-or-killing-non-validation-in-validators/126086).
