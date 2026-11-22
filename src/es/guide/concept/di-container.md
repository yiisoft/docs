# Inyección de dependencias y contenedor

## Inyección de dependencias

Hay dos formas de reutilizar código en la programación orientada a objetos:
la herencia y la composición.

La herencia es sencilla:

```php
class Cache
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget extends Cache
{
    public function render(): string
    {
        $output = $this->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

El problema es que estas dos clases quedan acopladas o son interdependientes
sin necesidad, lo que las hace más frágiles.

Otra forma de resolverlo es la composición:

```php
interface CacheInterface
{
    public function getCachedValue($key);
}

final readonly class Cache implements CacheInterface
{
    public function getCachedValue($key)
    {
        // ..
    }
}

final readonly class CachedWidget
{
    public function __construct(
        private CacheInterface $cache
    )
    {
    }
    
    public function render(): string
    {
        $output = $this->cache->getCachedValue('cachedWidget');
        if ($output !== null) {
            return $output;
        }
        // ...        
    }
}
```

Hemos evitado una herencia innecesaria y hemos usado `CacheInterface` en
`CacheWidget` para reducir el acoplamiento. Puedes sustituir la
implementación de la caché sin cambiar `CachedWidget`, por lo que la clase
se vuelve más estable. Cuantas menos modificaciones se hacen en el código,
menos probabilidades hay de romperlo.

Aquí, `CacheInterface` es una dependencia: un contrato que nuestro objeto
necesita para funcionar. Dicho de otro modo, nuestro objeto depende del
contrato.

El proceso de introducir una instancia de un contrato en un objeto
(`CachedWidget`) se llama inyección de dependencias. Hay muchas formas de
hacerlo:

- Inyección por constructor. Es la mejor opción para las dependencias
  obligatorias.
- Inyección por método. Es la mejor opción para las dependencias opcionales.
- Inyección por propiedad. En PHP es mejor evitarla, salvo quizá en los
  objetos de transferencia de datos (DTO).

### Por qué usar propiedades privadas

En el ejemplo de composición anterior, fíjate en que la propiedad `$cache`
se declara como `private`.

Este enfoque favorece la composición, ya que garantiza que los objetos
tengan interfaces bien definidas para interactuar en lugar de permitir el
acceso directo a sus propiedades, lo que hace que el código sea más fácil de
mantener y menos propenso a ciertos tipos de errores.

Esta decisión de diseño ofrece varias ventajas:

- **Encapsulación**: las propiedades privadas con getters/setters te
  permiten controlar el acceso y hacer cambios en el futuro sin romper el
  código existente.
- **Integridad de los datos**: los setters pueden validar, normalizar o
  formatear los valores antes de guardarlos, lo que garantiza que las
  propiedades contengan datos válidos.
- **Inmutabilidad**: las propiedades privadas permiten patrones de objetos
  inmutables en los que los métodos setter `with*()` devuelven nuevas
  instancias en lugar de modificar la actual.
- **Flexibilidad**: puedes crear propiedades de solo lectura o de solo
  escritura, o añadir más adelante lógica adicional al acceso a las
  propiedades.


## Contenedor DI

Inyectar dependencias básicas es sencillo. Eliges un lugar en el que no te
preocupen las dependencias, que suele ser un manejador de acción al que
nunca vas a hacer pruebas unitarias, creas las instancias de las
dependencias necesarias y se las pasas a las clases dependientes.

Funciona bien cuando hay pocas dependencias en total y no hay dependencias
anidadas. Cuando hay muchas y cada dependencia tiene a su vez sus propias
dependencias, instanciar toda la jerarquía se convierte en un proceso
tedioso, que requiere mucho código y puede provocar errores difíciles de
depurar.

Además, muchas dependencias, como ciertos envoltorios (wrappers) de API de
terceros, son las mismas para cualquier clase que las use. Por eso tiene
sentido:

- Definir cómo instanciar esas dependencias comunes.
- Instanciarlas cuando se necesiten y solo una vez por solicitud.

Para eso sirven los contenedores de dependencias.

Un contenedor de inyección de dependencias (DI) es un objeto que sabe cómo
instanciar y configurar objetos y todos los objetos de los que estos
dependen.

Yii ofrece la funcionalidad de contenedor DI mediante los paquetes
[yiisoft/di](https://github.com/yiisoft/di) y
[yiisoft/injector](https://github.com/yiisoft/injector).

> [!NOTE]
> El contenedor solo contiene instancias compartidas. Si necesitas una factoría, usa el paquete específico
> [yiisoft/factory](https://github.com/yiisoft/factory).

> [!TIP]
> El [artículo de Martin Fowler](https://martinfowler.com/articles/injection.html) explica muy bien
> por qué es útil un contenedor DI. Aquí explicaremos principalmente cómo usar el contenedor DI que proporciona Yii.

### Configurar el contenedor

Como para crear un objeto nuevo necesitas sus dependencias, conviene
registrarlas lo antes posible. Puedes hacerlo en la configuración de la
aplicación, `config/web.php`. Para el siguiente servicio:

```php
final class MyService implements MyServiceInterface
{
    public function __construct(int $amount)
    {
    }

    public function setDiscount(int $discount): void
    {
    
    }
}
```

la configuración podría ser:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => [42],
        'setDiscount()' => [10],
    ],
];
```

Esto equivale a lo siguiente:

```php
$myService = new MyService(42);
$myService->setDiscount(10);
```

También puedes pasar los argumentos con nombre:

```php
return [
    MyServiceInterface::class => [
        'class' => MyService::class,
        '__construct()' => ['amount' => 42],
        'setDiscount()' => ['discount' => 10],
    ],
];
```

Básicamente, eso es todo. Defines un mapa de interfaces a clases e indicas
cómo configurarlas. Cuando se solicita una interfaz en un constructor o en
otro lugar, el contenedor crea una instancia de la clase y la configura
según lo indicado en la configuración:

```php
final class MyAction
{
    public function __construct(
        private readonly MyServiceInterface $myService
    ) {
    }
    
    public function __invoke() 
    {
        $this->myService->doSomething();
    }
}
```

Hay otras formas de declarar la configuración de las dependencias.

En los casos más sencillos, en los que no se necesitan valores
personalizados y todas las dependencias del constructor pueden obtenerse del
contenedor, puedes usar un nombre de clase como valor.

```php
interface EngineInterface
{
    
}

final class EngineMarkOne implements EngineInterface
{
    public function __construct(CacheInterface $cache) {
    }   
}
```

En el ejemplo anterior, si ya tenemos la caché definida en el contenedor, no
hace falta nada más que el nombre de la clase:

```php
return [
    // declara una clase para una interfaz y resuelve las dependencias automáticamente
    EngineInterface::class => EngineMarkOne::class,
];
```

Si tienes una dependencia con propiedades públicas, también puedes
configurarlas.


```php
final class NameProvider
{
    public string $name;
}
```

Así se hace para el ejemplo anterior:

```php
NameProvider::class => [
    'class' => NameProvider::class, 
    '$name' => 'Alex',
],
```

En este ejemplo, quizá notes que `NameProvider` se especifica dos veces. La
clave es lo que puedes solicitar como dependencia y el valor es cómo
crearla.

Si la configuración es complicada y requiere cierta lógica, puedes usar un
closure:

```php
MyServiceInterface::class => static function(ContainerInterface $container) {
    return new MyService($container->get('db'));
},
```

Además de `ContainerInterface`, puedes solicitar directamente cualquier
servicio registrado como parámetro del closure. El inyector los resolverá e
inyectará automáticamente:

```php
MyServiceInterface::class => static function(ConnectionInterface $db) {
    return new MyService($db);
},
```

Se puede usar una llamada a un método estático:

```php
MyServiceInterface::class => [MyFactory::class, 'create'],
```

O una instancia de un objeto:

```php
MyServiceInterface::class => new MyService(),
```

### Inyectar dependencias correctamente

Hacer referencia directamente a un contenedor dentro de una clase es una
mala idea, ya que el código deja de ser genérico, queda acoplado a la
interfaz del contenedor y, lo que es peor, las dependencias quedan
ocultas. Por eso, Yii invierte el control inyectando automáticamente objetos
desde un contenedor en algunos constructores y métodos según los tipos de
sus argumentos.

Esto se hace principalmente en el constructor y en el método que procesa la
acción de los manejadores de acción:

```php
use \Yiisoft\Cache\CacheInterface;

final readonly class MyController
{
    public function __construct(
        private CacheInterface $cache
    )
    {
        $this->cache = $cache;    
    }

    public function actionDashboard(RevenueReport $report)
    {
        $reportData = $this->cache->getOrSet('revenue_report', function() use ($report) {
            return $report->getData();               
        });

        return $this->render('dashboard', [
           'reportData' => $reportData,
        ]);
    }
}
```

Como es [yiisoft/injector](https://github.com/yiisoft/injector) quien
instancia y llama al manejador de acción, comprueba los tipos de los
argumentos del constructor y del método, obtiene del contenedor las
dependencias de esos tipos y las pasa como argumentos. Esto suele llamarse
autowiring (conexión automática). También ocurre con las subdependencias: si
no proporcionas una dependencia explícitamente, el contenedor comprueba
primero si tiene esa dependencia. Basta con declarar la dependencia que
necesitas para que se obtenga automáticamente del contenedor.


## Referencias

- [Inversion of Control Containers and the Dependency Injection pattern, de
  Martin Fowler](https://martinfowler.com/articles/injection.html)
