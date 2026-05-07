# Unit tests

Unit tests check a small piece of code directly. They are best for domain rules, pure services, value objects, data
transformers, middleware branches, validators, and error handling.

Keep unit tests focused:

- Instantiate the class under test directly.
- Pass test doubles for dependencies that perform I/O.
- Assert the returned value, changed object state, or thrown exception.
- Cover one behavior per test method.

Avoid loading the full application for code that can be tested with constructor arguments and method calls.

## Example

```php
<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class SlugGeneratorTest extends TestCase
{
    public function testGenerateCreatesUrlFriendlySlug(): void
    {
        $generator = new SlugGenerator();

        $slug = $generator->generate('Hello, Yii 3!');

        self::assertSame('hello-yii-3', $slug);
    }
}
```

If a class depends on time, randomness, network, filesystem, or a database, hide that dependency behind an interface and
pass a deterministic implementation in the test.
