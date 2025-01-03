# View injections

The view injections is designed to provide a standardized way to pass parameters to the common layer
of views in an application. Implementing this interface allows developers to manage the data that will be available
across various views, ensuring flexibility and reusability of code.

## Configuration

In config `params.php`

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

Start by defining a class that will implement the `Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface`. This
class will be responsible for providing the parameters you want to inject into your view templates and layouts.

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

Add to config your new Injection in to `params.php`

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
        ],
    ],
```

## Using Separate Injections for Different Layouts

If your application has multiple layouts, you can create separate parameter injections for each layout. This approach
allows you to tailor the parameters injected into each layout according to its specific needs, enhancing the flexibility
and maintainability of your application.

Create your custom ViewInjection for specific layout

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

Add to config your new injection in to `params.php` with name specific layout, in this example part for layout `@layout/cart`

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
            DynamicReference::to(static function (ContainerInterface $container) {
                $cart = $container
                    ->get(Cart::class);

                return new LayoutSpecificInjections(
                    '@layout/cart', // layout name for inject
                    new CartViewInjection($cart)
                );
            }),
        ],
    ],
```
