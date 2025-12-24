# 020 — Package release

## Criteria

- No critical issues.
- Public API changes aren't likely. Some time passed w/o issues reported that may require API changes.
- All dependencies are stable.
- Close to 100% test coverage with, ideally, a 100% MSI score.
- README is alright.
- Everything is type-hinted unless special cases.
- Psalm analysis passes on at least level 2.
- phpdoc is alright.
- Public API is alright.

## Release instruction

Release a package via [Yii Development Tool](005-development-tool.md). 

1. Check that you can sign commits locally (see 
[Signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)).

2. Pull last changes from the `master` branch:

```shell
./yii-dev git/checkout master package-name
./yii-dev git/pull package-name
```

3. Check the package for compliance with the criteria above.

4. Run `release/make` command:

```shell
./yii-dev release/make package-name
```

5. Select the version type (major, minor or path).

6. On the question "Push commits and tags, and release on GitHub?" check a diff. If the diff is alright, answer "yes."

7. For major and minor releases, add a record with release notes on [Yii Framework News](https://www.yiiframework.com/news).
