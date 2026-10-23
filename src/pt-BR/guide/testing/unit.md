# Testes unitários

Testes unitários verificam diretamente um pequeno trecho de código PHP. No
template de aplicação Yii eles ficam em `tests/Unit` e são executados pela
suíte `Unit` do Codeception.

O template inclui `tests/Unit/EnvironmentTest.php`:

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

Execute os testes unitários:

```shell
APP_ENV=test vendor/bin/codecept run Unit
```

Execute apenas este teste:

```shell
APP_ENV=test vendor/bin/codecept run Unit EnvironmentTest
```

## Adicionar um teste unitário

Por exemplo, crie `src/Shared/SlugGenerator.php`:

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

Crie `tests/Unit/SlugGeneratorTest.php`:

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

Execute-o:

```shell
APP_ENV=test vendor/bin/codecept run Unit SlugGeneratorTest
```

## Testar serviços com dependências

Passe as dependências pelo construtor e use test doubles para I/O.

Crie `src/Clock/ClockInterface.php`:

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

Crie `src/Post/Post.php`:

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

Crie `src/Post/PublishPost.php`:

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

Crie `tests/Unit/PublishPostTest.php`:

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

Execute-o:

```shell
APP_ENV=test vendor/bin/codecept run Unit PublishPostTest
```

Mantenha os testes unitários focados em uma classe ou em uma pequena
colaboração. Use testes funcionais quando o comportamento depende da
configuração do Yii, injeção de dependência, roteamento ou middlewares.
