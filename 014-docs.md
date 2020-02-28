# 014 - Documentation

Documentation is one of the most important parts of Yii.

## Package documentation

Documentation for a package could either be in `README.md` or `docs/{language}` where `{language}` is language code.
Usually `docs` is there if the package usage or configuration is not trivial or there's a need for translation.

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
