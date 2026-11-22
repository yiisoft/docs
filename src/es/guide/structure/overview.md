# Resumen

El código de las aplicaciones Yii suele agruparse en módulos según el
contexto. Dentro de cada módulo puede haber una agrupación por tipo.

Por ejemplo, si la aplicación es una tienda en línea, los contextos podrían
ser:

- Cliente
  - Perfil
  - Lista de productos
  - Pago
- Logística
- Entrega
  - Direcciones
- Soporte técnico
  - Asistencia
  - Reclamaciones
  - Devoluciones
- Contabilidad
  - Devoluciones
  - Transacciones
  - Impuestos

Para el contexto "Cliente", que se encuentra en el espacio de nombres
`App\Customer`, la estructura sería:

```
App/
  Customer/                          <-- espacio de nombres del módulo
    Entity/
      Customer.php                   <-- entidad compartida por "Profile" y "Checkout"
    Profile/
      Widget/
        Gravatar.php
      ProfileRepository.php          <-- el repositorio suele ser propio del contexto
      ProfileController.php          <-- punto de entrada de "Customer\Profile"
    ProductList/                     <-- espacio de nombres del módulo 
      Entity/                        <-- entidades propias de "Customer\ProductList"
        Category.php
        Product.php
      ProductsListController.php     <-- punto de entrada de "Customer\ProductList"
    Checkout/                        <-- espacio de nombres del módulo
      CheckoutController.php
```

Un contexto puede incluir subcontextos. Si varios contextos comparten una
clase, esta se mueve al ancestro común de esos contextos.

Un contexto puede tener [un punto de entrada conocido como "acción" o
"controlador"](action.md). Su trabajo es tomar [una instancia de la
solicitud](../runtime/request.md), pasarla a la [capa de
dominio](../../cookbook/organizing-code/domain.md) en un formato adecuado y
crear [una respuesta](../runtime/response.md) a partir de lo que devuelve la
capa de dominio.

Además, las aplicaciones Yii también tienen lo siguiente:

* [scripts de entrada](entry-script.md): son scripts PHP a los que acceden
  directamente los usuarios finales. Se encargan de iniciar el ciclo de
  gestión de la solicitud. Normalmente, un único script de entrada gestiona
  toda la aplicación.
* [servicios](../../cookbook/organizing-code/service.md): suelen ser objetos
  sin estado registrados en el contenedor de dependencias que ofrecen
  diversos métodos de acción.
* [middlewares](middleware.md): representan código que debe invocarse antes
  y después de que los manejadores de acción gestionen realmente cada
  solicitud.
