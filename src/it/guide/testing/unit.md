# Unit tests

Unit tests check a small piece of PHP code directly. In the Yii application
template they live in `tests/Unit` and run through the `Unit` Codeception
suite.

The template includes `tests/Unit/EnvironmentTest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Environment;
use Codeception\Test\Unit;

use function PHPUnit\Framework\assertSame;

final class EnvironmentTest extends Unit
{
    protected function _before(): void
    {
        Environment::prepare();
    }

    public function testAppEnv(): void
    {
        assertSame('test', Environment::appEnv());
    }
}
```

Run unit tests:

```shell
APP_ENV=test vendor/bin/codecept run Unit
```

Run only this test:

```shell
APP_ENV=test vendor/bin/codecept run Unit EnvironmentTest
```

## Add a unit test

For example, create `src/Shared/SlugGenerator.php`:

```php
<?php

declare(strict_types=1);

namespace App\Shared;

final class SlugGenerator
{
    public function generate(string $title): string
    {
        $slug = preg_replace('~[^a-z0-9]+~', '-', strtolower($title));

        return trim((string) $slug, '-');
    }
}
```

Create `tests/Unit/SlugGeneratorTest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Shared\SlugGenerator;
use Codeception\Test\Unit;

use function PHPUnit\Framework\assertSame;

final class SlugGeneratorTest extends Unit
{
    public function testGenerateCreatesUrlFriendlySlug(): void
    {
        $generator = new SlugGenerator();

        $slug = $generator->generate('Hello, Yii3!');

        assertSame('hello-yii3', $slug);
    }
}
```

Run it:

```shell
APP_ENV=test vendor/bin/codecept run Unit SlugGeneratorTest
```

## Test services with dependencies

Pass dependencies through the constructor and use test doubles for I/O.

Create `src/Clock/ClockInterface.php`:

```php
<?php

declare(strict_types=1);

namespace App\Clock;

use DateTimeImmutable;

interface ClockInterface
{
    public function now(): DateTimeImmutable;
}
```

Create `src/Post/Post.php`:

```php
<?php

declare(strict_types=1);

namespace App\Post;

use DateTimeImmutable;

final readonly class Post
{
    public function __construct(
        public string $title,
        public DateTimeImmutable $publishedAt,
    ) {
    }
}
```

Create `src/Post/PublishPost.php`:

```php
<?php

declare(strict_types=1);

namespace App\Post;

use App\Clock\ClockInterface;

final readonly class PublishPost
{
    public function __construct(
        private ClockInterface $clock,
    ) {
    }

    public function publish(string $title): Post
    {
        return new Post($title, $this->clock->now());
    }
}
```

Create `tests/Unit/PublishPostTest.php`:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Clock\ClockInterface;
use App\Post\PublishPost;
use Codeception\Test\Unit;
use DateTimeImmutable;

use function PHPUnit\Framework\assertSame;

final class PublishPostTest extends Unit
{
    public function testPublishSetsPublicationDate(): void
    {
        $clock = new class implements ClockInterface {
            public function now(): DateTimeImmutable
            {
                return new DateTimeImmutable('2026-05-07 10:00:00');
            }
        };

        $service = new PublishPost($clock);
        $post = $service->publish('Testing Yii');

        assertSame('Testing Yii', $post->title);
        assertSame('2026-05-07 10:00:00', $post->publishedAt->format('Y-m-d H:i:s'));
    }
}
```

Run it:

```shell
APP_ENV=test vendor/bin/codecept run Unit PublishPostTest
```

Keep unit tests focused on one class or one small collaboration. Use
functional tests when the behavior depends on Yii configuration, dependency
injection, routing, or middleware.
