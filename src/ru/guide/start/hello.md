# Говорим «Привет»

В этом разделе описывается, как создать в приложении новую страницу
«Hello». Это простая страница: она выводит то, что вы ей передадите, а если
ничего не передано — просто говорит «Hello!».

Чтобы этого добиться, вы определите маршрут и создадите
[обработчик](../structure/handler.md), который выполнит задачу и сформирует
ответ. Затем вы улучшите решение, используя [представление
(view)](../views/view.md) для построения ответа.

В этом руководстве вы узнаете три вещи:

1. Как создать обработчик, который отвечает на запрос.
2. Как связать URL с обработчиком.
3. Как использовать [представление (view)](../views/view.md), чтобы
   формировать содержимое ответа.

## Создание обработчика <span id="creating-handler"></span>

В рамках задания «Hello» вы создадите класс-обработчик, который читает
параметр `message` из запроса и выводит это сообщение пользователю. Если
параметр `message` не передан, будет показано сообщение по умолчанию —
«Hello».

Создайте файл `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Yiisoft\Html\Html;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Action
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('The message is: ' . Html::encode($message));
        return $response;
    }
}
```

В этом примере метод `__invoke` принимает параметр `$message`, который с
помощью атрибута `RouteArgument` получает значение из URL. По умолчанию
используется `"Hello!"`. Если запрос сделан к `/say/Goodbye`, обработчик
присвоит переменной `$message` значение «Goodbye».

Приложение пропускает ответ через [стек
middleware](../structure/middleware.md), после чего emitter отправляет его
конечному пользователю.

## Настройка роутера

Теперь, чтобы связать ваш обработчик с URL, добавьте маршрут в
`config/common/routes.php`:

```php
<?php

declare(strict_types=1);

use App\Web;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;

return [
    Group::create()
        ->routes(
            Route::get('/')
                ->action(Web\HomePage\Action::class)
                ->name('home'),
            Route::get('/say[/{message}]')
                ->action(Web\Echo\Action::class)
                ->name('echo/say'),
        ),
];
```

В примере выше вы связываете шаблон `/say[/{message}]` с
`\App\Web\Echo\Action`. При обработке запроса роутер создаёт экземпляр и
вызывает метод `__invoke()`. Часть `{message}` сохраняет всё, что указано в
этом месте, в атрибут запроса `message`. Квадратные скобки `[]` помечают эту
часть шаблона как необязательную.

Также вы задаёте этому маршруту имя `echo/say`, чтобы затем можно было
генерировать URL, ведущие на него.

## Пробуем в деле <span id="trying-it-out"></span>

После того как вы создадите обработчик и представление, откройте в браузере
`http://localhost/say/Hello+World`.

По этому адресу откроется страница с текстом “The message is: Hello World”.

Если не указывать параметр `message` в URL, страница покажет “The message
is: Hello!”.

## Создание шаблона представления <span id="creating-view-template"></span>

Обычно задача сложнее, чем просто вывести «hello world» требует рендеринга
более сложного HTML. В таких случаях удобно использовать шаблоны
представления: это скрипты, которые вы пишете, чтобы сформировать тело
ответа.

Для задания «Hello» создайте шаблон `src/Web/Echo/template.php`, который
выводит параметр `message`, полученный из метода обработчика:

```php
<?php
use Yiisoft\Html\Html;
/* @var string $message */
?>

<p>The message is: <?= Html::encode($message) ?></p>
```

В примере выше параметр `message` перед выводом проходит
HTML-экранирование. Это нужно, потому что значение приходит от пользователя,
и без экранирования его можно использовать для [XSS-атак (cross-site
scripting)](https://en.wikipedia.org/wiki/Cross-site_scripting), внедрив в
параметр вредоносный JavaScript.

Разумеется, в представление `say` можно добавить больше содержимого. Оно
может состоять из HTML-тегов, обычного текста и даже PHP-кода. Фактически,
сервис представлений выполняет `say` как PHP-скрипт.

Чтобы использовать представление, измените `src/Web/Echo/Action.php`:

```php
<?php

declare(strict_types=1);

namespace App\Web\Echo;

use Psr\Http\Message\ResponseInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;
use Yiisoft\Yii\View\Renderer\ViewRenderer;

final readonly class Action
{
    public function __construct(
        private ViewRenderer $viewRenderer,
    ) {}

    public function __invoke(
        #[RouteArgument('message')]
        string $message = 'Hello!'
    ): ResponseInterface
    {
        return $this->viewRenderer->render(__DIR__ . '/template', [
            'message' => $message,
        ]);
    }
}
```

Теперь снова откройте страницу в браузере. Вы увидите похожий текст, но уже
с применённым шаблоном.

Кроме того, вы разделили логику (как это работает) и представление (как это
выглядит). В больших приложениях это очень помогает справляться со
сложностью.

## Краткое содержание <span id="summary"></span>

В этом разделе вы познакомились с обработчиками и шаблонами — типичными
частями веб‑приложения. Вы создали обработчик (класс), который отвечает за
конкретный запрос, и представление, которое формирует содержимое ответа. В
этом простом примере источник данных не нужен: используются только значения
параметра `message`.

Вы также познакомились с маршрутизацией в Yii — она служит мостом между
пользовательскими запросами и обработчиками.

В следующем разделе вы узнаете, как получать данные и добавить новую
страницу с HTML-формой.
