# 023 — GitHub Actions

This document defines naming convention for the GitHub actions configuration
files.

## Inputs and Outputs

Input names and output names must use kebab-case format.

For example:

```yaml
inputs:
  my-input:
    description: 'My input'
```

## Secrets and Environment Variables

Secret names and environment variable names must use SCREAMING_SNAKE_CASE
format.

For example:

```yaml
secrets:
  MY_SECRET:
    description: 'My secret'
```

```yaml
env:
  MY_ENV_VAR: 1
```
