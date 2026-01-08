# 014 — Documentation

Documentation is one of the most important parts of Yii.

## Package documentation

Documentation for a package could either be in `README.md` or `docs/{language}/{type}` where `{language}` is
a language code and `{type}` could be "guide," "cookbook" or something else.
Usually `docs` is there if the package usage or configuration isn't trivial or there's a need for translation.

Some indicators that it's time to create `docs`:

1. There is a need for translation.
2. Many topics exist. Each of these is big by itself.

If the total length of readme is less than about 200 lines, it's fine to keep documentation in the readme.

## Definitive guide

The definitive guide, [yiisoft/docs/guide](https://github.com/yiisoft/docs/tree/master/guide/en)
aims at covering usage of packages as a whole framework. Unlike package documentation, it isn't
focused on a single package but is covering certain use-cases.

The guide should follow [Micosoft style guide](https://learn.microsoft.com/en-us/style-guide/welcome/).

### Translation

The definitive guide uses [po4a](https://github.com/mquinson/po4a) in GitHub Action for translations.  

Translation algorithm:

- Install an application for working with `.po` translation files. For example, [Poedit](https://poedit.net/), [Lokalize](https://apps.kde.org/ru/lokalize/),
  [Gtranslator](https://wiki.gnome.org/Apps/Gtranslator) or another.
- Find file what you want to translate in `_translations/guide/{lang}`. Note that if the source file
  is in a subfolder, the subfolder name is appended to the file name and separated by an underscore, for example,
  for translating `guide/en/concept/aliases.md` file find `_translations/guide/{lang}/concept_aliases.md.po` file.
- Open the file with the `.po` extension in `Poedit` from the folder with the desired localization,
  for example `_translations/guide/ru/intro_what-is-yii.md.po`. If there is no localization yet,
  create an issue.
- Translate necessary strings and push the changes
- Open a pull request to the main repository

> [!CAUTION]
> Do not change the translation in files in `/guide/{lang}` manually.

If you have changed English and want to update translations:

- Open a pull request to the main repository
- Pull updated branch after successful completion of workflow `Update docs translation` in GitHub Action
- Update translation in `.po` files by `Poedit`
- Push changes

## Blocks

Blocks are in the [GitHub Alerts format](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts):

```
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

When translating documentation, these Block indicators should not be translated.
Keeps them intact as they are and only translate the block content.
For translating the label for the block, each guide translation should have a `blocktypes.json` file
containing the translations. The following shows an example for German:

```json
{
    "Note": "Hinweis",
    "Tip": "Tipp",
    "Important": "Wichtig",
    "Warning": "Achtung",
    "Caution": "Vorsicht"
}
```

## PHPDoc

PHPDoc mustn't be added if it doesn't add anything to what it describes. The following is a bad example:

```php
use Psr\Log\LoggerInterface;

/**
 * MyService class
 */
final class MyService extends MyServiceBase
{
    /**
     * @var LoggerInterface logger 
     */
    private LoggerInterface $logger;

    /**
     * MyService constructor.
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @inheritDoc
     */
    public function doit(): bool
    {
        return parent::doit();    
    }
}
```

PHPDoc, if present, should describe the purpose of the element it's added for.

The `@see` tags must explicitly refer to class methods, properties, and constants. This is necessary
for the correct display of links in IDEs, as well as for the correct display of links in API documentation.

Example of incorrect code:

```php
/**
 * @see SOME_CONST
 * @see $prop
 * @see doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

Example of a valid code:

```php
/**
 * @see Example::SOME_CONST
 * @see Example::$prop
 * @see Example::doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

## Readme checklist

Each package readme should be placed into `README.md` and contain the following:

- [ ] Logo.
- [ ] Short description of the package. What does it do?
- [ ] Quality badges (build, code coverage).
- [ ] Screenshot (if applicable).
- [ ] Requirements.
- [ ] Installation. Usually `composer require`.
- [ ] Getting started. One or two common usage examples are demonstrated.
- [ ] Configuration.
- [ ] Contributing. It should contain a link to guidelines.
- [ ] Running tests.
- [ ] License.
