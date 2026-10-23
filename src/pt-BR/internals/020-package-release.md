# 020 — Release de pacotes

## Critérios

- Nenhuma issue crítica.
- Mudanças na API pública são improváveis. Já passou algum tempo sem issues
  relatadas que possam exigir mudanças na API.
- Todas as dependências são estáveis.
- Cobertura de testes próxima de 100% e, idealmente, score MSI de 100%.
- O README está em ordem.
- Tudo tem type hints, exceto em casos especiais.
- A análise do Psalm passa pelo menos no nível 2.
- O phpdoc está em ordem.
- A API pública está em ordem.

## Política de branches de release

Use `master` para todos os releases regulares.

Crie um branch separado apenas ao lançar uma nova versão de uma versão major
anterior. Nesse caso, crie o branch a partir da tag mais recente dessa linha
de versão major anterior e aplique apenas as mudanças necessárias para o
release.

## Instruções de release

Faça o release de um pacote com a [Ferramenta de desenvolvimento do
Yii](005-development-tool.md).

1. Verifique se você consegue assinar commits localmente (veja 
[Assinando commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)).

2. Para releases regulares, faça pull das últimas mudanças do branch
   `master`:

```shell
./yii-dev git/checkout master package-name
./yii-dev git/pull package-name
```

Para releases de versões major anteriores, use o branch criado de acordo com
a política de branches de release, em vez de `master`.

3. Verifique se o pacote atende aos critérios acima.

4. Execute o comando `release/make`:

```shell
./yii-dev release/make package-name
```

5. Selecione o tipo de versão (major, minor ou patch).

6. Na pergunta "Push commits and tags, and release on GitHub?", confira o
   diff. Se o diff estiver correto, responda "yes".

7. Para releases major e minor, adicione um registro com as notas de release
   em [Yii Framework News](https://www.yiiframework.com/news).
