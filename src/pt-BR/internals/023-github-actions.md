# 023 — GitHub Actions

Este documento define a convenção de nomes para os arquivos de configuração
das GitHub Actions.

## Inputs e outputs

Os nomes de inputs e de outputs devem usar o formato kebab-case.

Por exemplo:

```yaml
inputs:
  my-input:
    description: 'My input'
```

## Secrets e variáveis de ambiente

Os nomes de secrets e de variáveis de ambiente devem usar o formato
SCREAMING_SNAKE_CASE.

Por exemplo:

```yaml
secrets:
  MY_SECRET:
    description: 'My secret'
```

```yaml
env:
  MY_ENV_VAR: 1
```
