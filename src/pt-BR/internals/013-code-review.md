# 013 — Code review

Code reviews são essenciais para o sucesso do projeto e tão importantes
quanto contribuir com código.

As revisões são feitas por meio de pull requests no GitHub. Quando o pull
request está pronto para revisão, recebe o label "status: code review".

[A lista completa de pull requests que precisam de
revisão](https://github.com/search?q=org%3Ayiisoft+label%3A"status%3Acode+review"&state=open&type=Issues)
está disponível no GitHub.

## Diretrizes

- Faça checkout do branch do pull request, abra o projeto na IDE e tenha uma
  visão geral.
- O pull request faz sentido como um todo?
- Rode os testes e/ou a aplicação usando o código do pull request. Está tudo
  certo?
- Leia todas as linhas de código do pull request.
- Daria para fazer de forma mais simples?
- Há problemas de segurança?
- Há problemas de desempenho?
- Ao deixar comentários, seja educado.
- Evite comentários sobre formatação de código.

## Itens obrigatórios

- [ ] Testes que falham sem o código e passam com ele.
- [ ] Type hints.
- [ ] `declare(strict_types=1)`.
- [ ] Documentação: phpdoc, yiisoft/docs.
- [ ] Entrada no changelog (se o pacote for estável).
