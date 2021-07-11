# Configuración

Las aplicaciones de Yii 3 son configuradas con un contenedor de Injección de Dependencias (Dependency Injection container). Hay múltiples formas de hacer eso.
Primero nos enfocaremos en los conceptos usados en el proyecto plantilla, y luego daremos formas adicionales para configurar el framework.

## Composer Config Plugin

En el proyecto plantilla se utiliza [hiqdev/composer-config-plugin](https://github.com/hiqdev/composer-config-plugin).
Lo que hace el plugin es recolectar todas las configuraciones definidas en la sección `config-plugin` de todas las dependencias en `composer.json`,
y luego las une en una sola.

## Contenedor de Injección de Dependencias