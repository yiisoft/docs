# 021 — Changelog and upgrade

For all released packages, we've a detailed changelog and upgrade guide.

## Changelog

Changelog is written for each version released. The file name is `CHANGELOG.md`. The format is the following:

```markdown
# My package Change Log

## 1.0.2 under development

- no changes in this release.

## 1.0.1 March 23, 2021

- Bug #42: Short description of the change (@author1, @author2)

## 1.0.0 February 02, 2021

- Initial release.
```

There "My package" is the name of the package, `1.0.1` is the version released followed by release date.
For each version, there are a number of lines listing the changes.
"Bug" refers to a change type.
The following types are used:

- New — New features.
- Chg — General changes.
- Enh — Existing feature enhancements.
- Bug — Bug fixes.

In the changelog file lines should be ordered as New, Chg, Enh, Bug.

"#42" above is the number of issue or pull requests corresponding to the change. "author1" is the GitHub nickname of the
code author. "author2" is an additional author. An author's nickname MUST be prefixed with `@`.

## Upgrade

Upgrade guide is created when there is a new major version that isn't compatible with the previous one.
It describes steps necessary to upgrade application code.

The file name is `UPGRADE.md`. The format is the following:

```markdown
# Upgrading Instructions for my package

This file contains the upgrade notes. These notes highlight changes that could break your
application when you upgrade the package from one version to another.

> **Important!** The following upgrading instructions are cumulative. That is, if you want
> to upgrade from version A to version C and there is version B between A and C, you need
> to follow the instructions for both A and B.

## Upgrade from 2.x

- Public method `test()` was removed. Use `perform()` instead.

## Upgrade from 1.x

- Clean up the cache after upgrading. Old cache is not compatible with new code.
```
