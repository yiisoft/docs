# Autocarga de clases

Dado que Yii utiliza [Composer](https://getcomposer.org) para administrar
paquetes, las clases de esos paquetes se cargan automáticamente sin
necesidad de incluirlas con `require` una a una. Cuando los paquetes son
instalados, un [autocargador compatible con
PSR-4](https://www.php-fig.org/psr/psr-4/) es generado. Para usarlo, se debe
invocar el autocargador `/vendor/autoload.php` con `require_once` en el
script de entrada `index.php`.

El autocargador no se utiliza solamente para los paquetes que se instalan,
también se utiliza para tu aplicación que también es un paquete. Para cargar
clases desde cierto espacio de nombres (namespaces), lo siguiente debe ser
añadido a `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Donde `App\\` es el espacio de nombres raíz (namespace), y `src/` es la
carpeta donde se ubican las clases. Se pueden añadir distintos namespaces y
carpetas si es necesario. Una vez listo, ejecuta `composer dump-autoload` o
simplemente `composer du`, y las clases de los espacios de nombres
correspondientes se cargarán automáticamente.

Si necesitas una autocarga específica del entorno de desarrollo que no se
use al ejecutar Composer con la opción `--no-dev`, añádela a la sección
`autoload-dev` en lugar de a `autoload`.

## Referencias

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Guía de Composer sobre
  autocarga](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
