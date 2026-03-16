# 视图注入

视图注入旨在提供一种标准化的方式，将参数传递给应用程序的公共视图层。它允许开发者管理在各个视图中可用的数据，从而确保代码的灵活性和可复用性。

使用视图注入需要引入 `yiisoft/yii-view-renderer` 包：


```sh
composer require yiisoft/yii-view-renderer
```

## 配置

在配置文件 `params.php` 中：


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

## 新建注入

首先定义一个实现 `Yiisoft\Yii\View\Renderer\CommonParametersInjectionInterface`
接口的类。该类负责提供您希望注入到视图模板和布局中的参数。

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

将新建的注入类添加到 `params.php`：

```php
'yiisoft/yii-view' => [
        'injections' => [
            ...,
            Reference::to(MyCustomParametersInjection::class),
        ],
    ],
```

## 为不同布局使用独立注入

如果您的应用程序有多个布局，可以为每个布局创建独立的参数注入类。这种方式允许您根据每个布局的具体需求定制注入的参数，从而提高应用程序的灵活性和可维护性。

为特定布局创建自定义视图注入类：

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

在 `params.php` 中，将新建的注入类添加到指定布局名称下。以下示例中布局名称为 `@layout/cart`：

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
