# Service components

Application may get complicated, so it makes sense to extract focused parts of business logic
or infrastructure into service components. They're typically injected into other components or action handlers.
It's usually done via autowiring:

```php
public function actionIndex(CurrentRoute $route, MyService $myService): ResponseInterface
{
    $id = $route->getArgument('id');
    
    // ...
    $extraData = $myService->getExtraData($id);
    
    // ...
}
```

Yii3 doesn't technically imply any limitations on how you build services. In general, there's no need to extend from
a base class or implement a certain interface.

Services either perform a task or return data. They're created once, put into DI container and then could be used
multiple times. Because of that, it's a good idea to keep your services stateless that's both service itself and any of
its dependencies shouldn't hold state.

## Service dependencies and configuration

Services should always define all their dependencies on other services via `__construct()`. It both allows you to use
service right away after it's created and serves as an indicator of a service doing too much if there are too many
dependencies.

- After the service created, it shouldn't be re-configured in runtime.
- DI container instance usually **shouldn't** be injected as a dependency. Prefer concrete interfaces.
- In case of complicated or "heavy" initialization, try to postpone it until the service method is called.  

The same is valid for configuration values. They should be provided as a constructor argument. Related values could be
grouped together into value objects. For example, database connection usually requires DSN string, username and password.
These three could be combined into Dsn class:

```php
class Dsn
{
    private string $dsn;
    private string $username;
    private string $password;

    public function __construct(string $dsn, string $username, string $password)
    {
        if (!$this->isValidDsn($dsn)) {
            throw new \InvalidArgumentException('DSN provided is not valid.');
        }

        $this->dsn = $dsn;
        $this->username = $username;
        $this->password = $password;
    }
    
    public function dsn(): string
    {
        return $this->dsn;
    }
    
    public function username(): string
    {
        return $this->username;
    }

    public function password(): string
    {
        return $this->password;    
    }
    
    private function isValidDsn(string $dsn): bool
    {
        // check DSN validity    
    }
}
```

## Service methods

Service method usually does something. It could be a simple thing that's repeated exactly, but usually it depends on the
context. For example:

```php
class PostPersister
{
    private Storage $db;

    public function __construct(Storage $db)
    {
        $this->db = $db;
    }
    
    public function persist(Post $post)
    {
        $this->db->insertOrUpdate('post', $post);    
    }
}
```

There's a service saving posts into permanent storage such as a database. An object allowing
communication with a concrete storage is always the same, so it's injected using constructor while the post saved
could vary, so it's passed as a method argument.

## Is everything a service

Often it makes sense to choose another class type to place your code into. Check:

- Repository
- Widget
- [Middleware](middleware.md)
- Entity
