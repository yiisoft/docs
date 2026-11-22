# Usar paquetes

El código reutilizable se distribuye como [paquetes de
Composer](https://getcomposer.org/doc/05-repositories.md#package). Un
paquete puede ser una biblioteca de infraestructura, una integración con
Yii, una funcionalidad reutilizable o un módulo que representa un contexto
de la aplicación.

Esta página explica cómo usar paquetes en una aplicación. Para crear un
paquete preparado para Yii, consulta [Diseñar paquetes para aplicaciones
Yii](designing-packages.md).

## Instalar paquetes

Por defecto, Composer instala los paquetes registrados en
[Packagist](https://packagist.org/), el repositorio principal de paquetes
PHP de código abierto.

Instala un paquete con:

```sh
composer require vendor-name/package-name
```

Composer actualiza dos archivos:

- `composer.json` guarda el nombre del paquete y la restricción de versión.
- `composer.lock` guarda las versiones exactas instaladas.

Incluye ambos archivos en el control de versiones para que los demás
entornos instalen las mismas versiones de las dependencias.

Los paquetes instalados se guardan en el directorio `vendor/` de la
aplicación.

> [!WARNING]
> Nunca edites directamente los archivos de `vendor/`. En su lugar, cambia la configuración de la aplicación, extiende clases, decora servicios o
> contribuye con correcciones al paquete.

Las clases de los paquetes están disponibles mediante la autocarga de
Composer tras la instalación. Consulta [Autocarga de
clases](../concept/autoloading.md) para más detalles.

## Actualizar paquetes

Actualiza un paquete dentro de la restricción de versión registrada en
`composer.json`:

```sh
composer update vendor-name/package-name
```

Cambia la restricción de versión aceptada con `composer require`:

```sh
composer require vendor-name/package-name:^2.0
```

Tras actualizar un paquete preparado para Yii, Composer vuelve a generar el
plan de fusión de la configuración de Yii. Si has cambiado manualmente las
asignaciones de los grupos de configuración, vuelve a generarlo
explícitamente:

```sh
composer yii-config-rebuild
```

## Eliminar paquetes

Elimina un paquete con:

```sh
composer remove vendor-name/package-name
```

Después, elimina el código y la configuración de la aplicación que hacían
referencia a clases, servicios, rutas, comandos, assets, migraciones o
traducciones de ese paquete.

## Paquetes privados

Para el código privado, configura repositorios de Composer en el
`composer.json` de la aplicación. Las opciones habituales son:

- `vcs` para un repositorio Git.
- `path` para un paquete local durante el desarrollo.
- `composer` para un repositorio privado de Composer.

Por ejemplo, para trabajar con un paquete situado junto a la aplicación:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/blog"
        }
    ]
}
```

Después, instálalo de la forma habitual:

```sh
composer require vendor/blog
```

Más información en la [documentación de repositorios de
Composer](https://getcomposer.org/doc/05-repositories.md).

## Configuración de paquetes

Algunos paquetes de Yii proporcionan configuración predeterminada mediante
[yiisoft/config](https://github.com/yiisoft/config). Tras la instalación, la
configuración del paquete pasa a formar parte de la capa de terceros
(vendor) y la aplicación puede sobrescribirla en la configuración del
paquete raíz.

En lugar de copiar archivos de configuración completos de un paquete, es
preferible sobrescribir solo una parte en los archivos de configuración de
la aplicación. Por ejemplo, sobrescribe únicamente el parámetro o la
definición de servicio que necesites.

Para más detalles, consulta [Configuración](../concept/configuration.md) y
[Diseñar paquetes para aplicaciones Yii](designing-packages.md).
