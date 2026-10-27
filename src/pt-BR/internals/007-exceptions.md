# 007 — Exceções

- Lance exceções em vez de retornar um código de erro.
- O nome da classe de exceção deve ter o sufixo `Exception`.
- Use mensagens de erro gramaticalmente corretas, incluindo a pontuação
  final, ou seja, a maioria das exceções deve terminar com ponto.
- `\InvalidArgumentException` deve ser usada diretamente. Não deve haver
  exceções herdadas dela.
- `\InvalidArgumentException` nunca deve ser capturada.

## Referências

- [Discussão e enquete na comunidade
  internacional](https://forum.yiiframework.com/t/naming-exceptions/126613/6)
- [Discussão e enquete na comunidade
  russa](https://yiiframework.ru/forum/viewtopic.php?f=39&t=51290)
