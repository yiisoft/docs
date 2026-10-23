# O que é o Yii

O Yii é um framework PHP de alto desempenho, baseado em pacotes, para
desenvolver aplicações modernas.  O nome Yii (pronuncia-se `Yee` ou `[ji:]`)
significa "simples e evolutivo" em chinês.  Você também pode pensar nele
como um acrônimo de **Yes It Is**!

## Para que o Yii é mais indicado

O Yii é um framework genérico de programação web.  Você pode usá-lo para
desenvolver todo tipo de aplicação web com PHP.  Por causa da sua
arquitetura e do suporte sofisticado a cache, ele é especialmente indicado
para aplicações de grande porte, como portais, sistemas de gerenciamento de
conteúdo, e-commerce, APIs REST etc.

## Como o Yii se compara a outros frameworks?

Se você já conhece outro framework, talvez queira saber como o Yii se
compara a ele:

- O Yii segue a [filosofia de ser prático e
  útil](../../internals/001-yii-values.md), buscando:
  - Desempenho tanto no desenvolvimento quanto na execução.
  - Padrões convenientes e personalizáveis.
  - Foco na prática.
  - Simplicidade.
  - Clareza.
  - Consistência.
  
  O Yii nunca tenta complicar o design só para seguir algum padrão de projeto.
- O Yii usa amplamente as interfaces PSR, o que permite reaproveitar o que a comunidade PHP criou e até
  substituir implementações do core quando necessário.
- O Yii é ao mesmo tempo um conjunto de bibliotecas e um framework full-stack com muitos recursos testados e prontos para uso:
  cache, logs, template engine, abstração de dados, ferramentas de desenvolvimento, geração de código e mais.
- O Yii é extensível. Você pode personalizar ou substituir qualquer parte do código do core. Também pode
  aproveitar a arquitetura sólida do Yii para usar ou desenvolver pacotes redistribuíveis.
- Alto desempenho é sempre um objetivo principal do Yii.

O Yii conta com um [time principal de desenvolvedores
sólido](https://www.yiiframework.com/team/), apoiado financeiramente pela
[fundação no OpenCollective](https://opencollective.com/yiisoft), e com uma
grande comunidade de profissionais que contribuem constantemente para o
desenvolvimento do Yii. O time do Yii acompanha de perto as tendências mais
recentes do desenvolvimento web e as boas práticas e recursos de outros
frameworks e projetos. As boas práticas e os recursos mais relevantes
encontrados em outros lugares são incorporados ao core do framework e
expostos por meio de interfaces simples e elegantes.


## Versões do Yii

Atualmente o Yii tem três versões principais disponíveis: 1.1, 2.0 e 3.0.

- A versão 1.1 é a geração antiga e está congelada, recebendo apenas
  correções de bugs.
- A versão 2.0 é a versão estável atual e está congelada, recebendo apenas
  correções de bugs.
- A versão 3.0 é a versão atual em desenvolvimento. Este guia trata
  principalmente da versão 3.


## Requisitos e pré-requisitos

O Yii3 exige PHP 8.2 ou superior, mas alguns pacotes funcionam com versões
mais antigas, como o PHP 7.4.

Usar o Yii exige conhecimento básico de programação orientada a objetos
(POO), já que o Yii é um framework totalmente orientado a objetos.  O Yii3
também usa recursos recentes do PHP, como declarações de tipo e
generators. Entender esses conceitos vai ajudar você a aprender o Yii3 mais
rápido.

