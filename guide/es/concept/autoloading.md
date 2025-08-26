# Autocarga de Clases (Autoloading)

Dado que Yii utiliza [Composer](https://getcomposer.org) para administar paquetes, las clases de esos paquetes son automaticamente
cargados sin la necesidad de ser incluidos utilizando `require` para cada uno de ellos. Cuando los paquetes son instalados,
un [autocargador compatible con PSR-0](https://www.php-fig.org/psr/psr-4/) es generado. Para usarlo,
se debe invocar el autocargador `/vendor/autoload.php` con `require_once` en el script de entrada `index.php`.

El autocargador no se utiliza solamente para los paquetes que se instalan, tambien se utiliza para su aplicación que también es un paquete.
Para cargar clases desde cierto espacio de nombres (namespaces), lo siguiente debe ser añadido a `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Donde `App\\` es el espacio de nombre raiz (namespace), y `src/` es la carpeta donde se ubican las clases. Se pueden añadir distintos namespaces y carpetas si es necesario.
Una vez listo, ejecuta `composer dump-autoload` y las clases de los espacios de nombres serán cargados automaticamente.


## Referencias

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Guía de Composer sobre autocarga](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
