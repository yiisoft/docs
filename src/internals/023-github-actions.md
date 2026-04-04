# 023 — GitHub Actions

This document defines naming convention for the GitHub actions configuration files.

## Inputs, Outputs, and Secrets

Input names, output names, and input secret names must use kebab-case format.

For example:

```yaml
inputs:
  my-input:
    description: 'My input'
secrets:
  my-secret:
    description: 'My secret'
```

## Environment Variables

Environment variables must use SCREAMING_SNAKE_CASE format.

For example:

```yaml
env:
  MY_ENV_VAR: 1
```
