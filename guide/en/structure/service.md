# Service components

Application may get complicated so it makes sense to extract focused parts of business logic
or infrastructure into service components. These components are typically instantiated
once and put into dependency injection container.

These components are typically accessed either from other components or from action handler.
It is typically done via autowiring:

```php
public function actionIndex(ServerRequestInterface $request, MyService $myService): ResponseInterface
{
    $id = $request->getAttribute('id');
    
    // ...
    $extraData = $myService->getExtraData($id);
    
    // ...
}
```

Note that in many cases it makes sense to choose more specific class to place your code into.
Check:

- Repository
- Widget
- [Middleware](middleware.md)
- Entity
