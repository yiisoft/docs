# 002 — Fluxo de issues

O processo de tratamento das issues recebidas é o seguinte:

![Esquema do fluxo de issues](/images/internals/002-issue-workflow.svg)

## Papéis

Temos vários papéis:

- Gerentes de processo - fazem a triagem inicial das issues e gerenciam os
  labels.
- Tomadores de decisão - participam das discussões, levando-as a uma
  resolução.
- Caçadores de bugs - verificam os bugs.
- Contribuidores - escrevem o código dos pull requests.
- Revisores de código - revisam os pull requests.

Uma mesma pessoa pode assumir um ou mais papéis no processo de resolução de
issues.

## Labels

Usamos labels nas issues para marcar várias coisas: status atual, tipo da
issue, componente afetado. Os labels de status falam por si.

## Milestones

As issues não são atribuídas a milestones, a menos que sejam críticas ou que
provavelmente exista um bom pull request para elas.
