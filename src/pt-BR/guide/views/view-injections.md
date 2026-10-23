# View injections

The view injections are designed to provide a standardized way to pass
parameters to the common layer of views in an application. It allows
developers to manage the data that will be available across various views,
ensuring flexibility and reusability of code.

The view injections could be used if you require `yiisoft/yii-view-renderer`
package:


```sh
composer require yiisoft/yii-view-renderer
```

## Configuration

In config `params.php`:


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

## New injections

Start by defining a class that will implement the
`Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface`. This class
will be responsible for providing the parameters you want to inject into
your view templates and layouts.

```php
class MyCustomParametersInjection implements Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface
{
    // Class properties and methods will go here

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

Add your new Injection to `params.php`:

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
        ],
    ],
```

## Using Separate Injections for Different Layouts

If your application has multiple layouts, you can create separate parameter
injections for each layout. This approach allows you to tailor the
parameters injected into each layout according to its specific needs,
enhancing the flexibility and maintainability of your application.

Create your custom ViewInjection for a specific layout:

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

Add your new injection to `params.php` under specific layout name. In the
following example, it's `@layout/cart`:

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
            DynamicReference::to(static function (ContainerInterface $container) {
                $cart = $container
                    ->get(Cart::class);

                return new LayoutSpecificInjections(
                    '@layout/cart', // layout name for injection

                    new CartViewInjection($cart)
                );
            }),
        ],
    ],
```
