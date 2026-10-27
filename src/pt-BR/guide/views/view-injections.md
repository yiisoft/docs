# Injeções de view

As injeções de view oferecem uma forma padronizada de passar parâmetros para
a camada comum das views de uma aplicação. Com elas, você gerencia os dados
que ficarão disponíveis em várias views, o que garante flexibilidade e
reaproveitamento de código.

Você pode usar as injeções de view se a sua aplicação exige o pacote
`yiisoft/yii-view-renderer`:


```sh
composer require yiisoft/yii-view-renderer
```

## Configuração

Na configuração `params.php`:


```php
...
'yiisoft/yii-view' => [
        'injections' => [
            Reference::to(ContentViewInjection::class),
            Reference::to(CsrfViewInjection::class),
            Reference::to(LayoutViewInjection::class),
        ],
    ],
```

## Novas injeções

Comece definindo uma classe que implemente
`Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface`. Essa classe
fornece os parâmetros que você quer injetar nos templates de view e nos
layouts.

```php
class MyCustomParametersInjection implements Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface
{
    // As propriedades e os métodos da classe ficam aqui

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getCommonParameters(): array
    {
        return [
            'siteName' => 'My Awesome Site',
            'currentYear' => date('Y'),
            'user' => $this->userService->getCurrentUser(),
        ];
    }
}
```

Adicione a nova injeção ao `params.php`:

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
        ],
    ],
```

## Usando injeções separadas para layouts diferentes

Se a sua aplicação tem vários layouts, você pode criar injeções de
parâmetros separadas para cada um. Assim, os parâmetros injetados em cada
layout atendem às necessidades específicas dele, o que deixa a aplicação
mais flexível e fácil de manter.

Crie a sua ViewInjection personalizada para um layout específico:

```php
readonly final class CartViewInjection implements CommonParametersInjectionInterface
{
    public function __construct(private Cart $cart)
    {
    }

    public function getCommonParameters(): array
    {
        return [
            'cart' => $this->cart,
        ];
    }
}
```

Adicione a nova injeção ao `params.php` sob o nome de um layout
específico. No exemplo a seguir, é `@layout/cart`:

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
            DynamicReference::to(static function (ContainerInterface $container) {
                $cart = $container
                    ->get(Cart::class);

                return new LayoutSpecificInjections(
                    '@layout/cart', // nome do layout para a injeção

                    new CartViewInjection($cart)
                );
            }),
        ],
    ],
```
