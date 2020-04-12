# 014 - Documentation

Documentation is one of the most important parts of Yii.

## Package documentation

Documentation for a package could either be in `README.md` or `docs/{language}` where `{language}` is language code.
Usually `docs` is there if the package usage or configuration is not trivial or there's a need for translation.

## Definitive guide

The definitive guide, [yiisoft/docs/guide](https://github.com/yiisoft/docs/tree/master/guide/en)
aims at covering usage of packages as a whole framework. Unlike package documentation, it is not
focused on a single package but is covering certain use-cases.

## PHPDoc

PHPDoc must not be added if it does not add anything to what it describes. The following is a bad example:

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

PHPDoc, if present, should describe the purpose of the element it is added for.

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
