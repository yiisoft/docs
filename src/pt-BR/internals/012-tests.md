# 012 — Testes

Para cada pacote, adicionamos testes unitários executados com o
[PHPUnit](https://phpunit.de/).  Ao projetar os testes, leve em conta as
diretrizes a seguir.

- A classe de teste deve ser marcada como `final` por padrão.
- A anotação `@test` não deve ser usada; use o prefixo `test` nos métodos.
- O nome do método de teste deve refletir o propósito do teste.
- "should" não deve ser usado no nome do método de teste.
- Se necessário, o phpdoc do método de teste pode descrever o comportamento
  esperado.
- O teste deve seguir o AAA: primeiro prepare (arrange) as pré-condições
  necessárias, depois aja (act) e, por fim, verifique (assert) os resultados
  esperados.
- Deve haver um caso de teste por método de teste, ou seja, um único AAA.
- O teste deve usar a API pública.  Não se deve acessar propriedades ou
  métodos privados, nem fazer suposições sobre os detalhes internos da
  classe testada.
- Os testes não devem depender do composer-config-plugin nem do container de
  DI, a menos que seja necessário.
