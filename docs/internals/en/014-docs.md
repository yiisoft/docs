# 014 - Documentation

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

The guide should follow [
oft style guide](https://learn.microsoft.com/en-us/style-guide/welcome/).

## Blocks

Blocks use the Markdown `> Type: `. There are four block types:

* `Warning`, for bad security things and other problems
* `Note`, to emphasize key concepts, things to avoid
* `Info`, general information (an aside); not as strong as a "Note"
* `Tip`, pro tips, extras, can be useful but may not be needed by everyone all the time

The sentence after the colon should begin with a capital letter.

When translating documentation, these Block indicators should not be translated.
Keeps them intact as they are and only translate the block content.
For translating the `Type` word, each guide translation should have a `blocktypes.json` file
containing the translations. The following shows an example for German:

```json
{
    "Warning:": "Achtung:",
    "Note:": "Hinweis:",
    "Info:": "Info:",
    "Tip:": "Tipp:"
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

## Readme checklist

Each package readme should be placed into `README.md` and contain the following:

- [ ] Logo.
- [ ] Short description of the package. What does it do?
- [ ] Quality badges (build, code coverage).
- [ ] Screenshot (if applicable).
- [ ] Requirements.
- [ ] Installation. Usually `composer require`.
- [ ] Getting started. One or two common usage examples demonstrated.
- [ ] Configuration.
- [ ] Contributing. Should contain a link to guidelines.
- [ ] Running tests.
- [ ] License.
