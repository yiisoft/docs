# 023 — GitHub Actions

This document defines naming convention for the GitHub actions configuration files.

## Variables and Parameters

Variable names, input names, output names, and input secret names must use kebab-case.

Example:
```yaml
inputs:
  my-input:
    description: 'My input'
secrets:
  my-secret:
    description: 'My secret'
```
