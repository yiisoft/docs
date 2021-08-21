# 021 - Changelog and upgrade

For all released packages we have a detailed changelog and upgrade guide.

## Changelog

Changelog is written for each version released. The file name is `CHANGELOG.md`. The format is the following:

```markdown
# My package Change Log

## 1.0.2 under development

- no changes in this release.

## 1.0.1 March 23, 2021

- Bug #42: Short description of the change (author1, author2)

## 1.0.0 February 02, 2021

- Initial release.
```

There "My package" is the name of the package, `1.0.1` is the version released followed by release date.
For each version there are number of lines listing the changes. "Bug" refers to change type. The following types are used:

- New - New features.
- Chg - General changes.
- Enh - Existing feature enhancements.
- Bug - Bug fixes.

In the changelog file lines should be ordered as New, Chg, Enh, Bug.

"#42" above is the number of issue or pull request corresponding to the change. "author1" is the GitHub nickname of the
code author. "author2" is additional author.

## Upgrade

Upgrade guide is created when there is new major version that is not compatible with the previous one. It describes
steps necessary to upgrade application code.

The format is the following:

```markdown
# Upgrading Instructions for my package

## Upgrade from 2.0.0

- Public method `test()` was removed. Use `perform()` instead.

## Upgrade from 1.0.0

- Clean up the cache after upgrading. Old cache is not compatible with new code.
```
