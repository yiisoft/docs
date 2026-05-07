# Unit tests

Unit tests check a small piece of code directly. They should be fast, deterministic, and independent of the application
container.

## Create code to test

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
use PHPUnit\Framework\TestCase;

final class SlugGeneratorTest extends TestCase
{
    public function testGenerateCreatesUrlFriendlySlug(): void
    {
        $generator = new SlugGenerator();

        $slug = $generator->generate('Hello, Yii3!');

        self::assertSame('hello-yii3', $slug);
    }
}
```

Run it:

```shell
vendor/bin/phpunit tests/Unit/SlugGeneratorTest.php
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
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class PublishPostTest extends TestCase
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

        self::assertSame('Testing Yii', $post->title);
        self::assertSame('2026-05-07 10:00:00', $post->publishedAt->format('Y-m-d H:i:s'));
    }
}
```

Run it:

```shell
vendor/bin/phpunit tests/Unit/PublishPostTest.php
```

Unit tests should avoid real databases, HTTP calls, files, queues, and the full application bootstrap. If a behavior
needs those, write a functional test.
