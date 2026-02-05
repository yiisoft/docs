import taskLists from 'markdown-it-task-lists'

let currentYear = new Date().getFullYear();

export default {
    base: '/docs/',
    title: 'Yii3 Documentation',
    description: 'Official documentation for Yii3 — a fast, secure, and flexible PHP framework for modern application development.',
    ignoreDeadLinks: true,
    head: [['link', {rel: 'icon', href: '/docs/favicon.svg', type: 'image/svg+xml'}]],
    vite: {
        build: {
            chunkSizeWarningLimit: 1000
        }
    },
    themeConfig: {
        logo: '/images/yii_logo.svg',
        lastUpdated: true,
        search: {
            provider: 'local'
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/yiisoft'},
            {icon: 'x', link: 'https://twitter.com/yiiframework'},
            {icon: 'telegram', link: 'https://t.me/yii3en'}
        ]
    },
    markdown: {
        config: (md) => {
            md.use(taskLists)
        }
    },
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                editLink: {
                    pattern: 'https://github.com/yiisoft/docs/edit/master/src/:path'
                },
                nav: [
                    {text: 'Guide', link: '/guide/'},
                    {text: 'Cookbook', link: '/cookbook/'},
                    {text: 'Internals', link: '/internals/'},
                    {text: 'Site', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/guide/': [
                        {
                            text: 'Introduction',
                            items: [
                                {text: 'About Yii', link: '/guide/intro/what-is-yii'},
                                {text: 'Upgrading from Version 2', link: '/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: 'Getting Started',
                            items: [
                                {text: 'Prerequisites', link: '/guide/start/prerequisites'},
                                {text: 'Creating a Project', link: '/guide/start/creating-project'},
                                {text: 'Saying Hello', link: '/guide/start/hello'},
                                {text: 'Working with Forms', link: '/guide/start/forms'},
                                {text: 'Working with Databases', link: '/guide/start/databases'},
                                {text: 'Generating Code with Gii', link: '/guide/start/gii'},
                                {text: 'Looking Ahead', link: '/guide/start/looking-ahead'},
                                {text: 'Application Workflow', link: '/guide/start/workflow'}
                            ]
                        },
                        {
                            text: 'Key Concepts',
                            items: [
                                {text: 'Aliases', link: '/guide/concept/aliases'},
                                {text: 'Autoloading', link: '/guide/concept/autoloading'},
                                {text: 'Configuration', link: '/guide/concept/configuration'},
                                {text: 'DI Container', link: '/guide/concept/di-container'},
                                {text: 'Events', link: '/guide/concept/events'},
                                {text: 'Immutability', link: '/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: 'Application Structure',
                            items: [
                                {text: 'Overview', link: '/guide/structure/overview'},
                                {text: 'Entry Script', link: '/guide/structure/entry-script'},
                                {text: 'Application', link: '/guide/structure/application'},
                                {text: 'Action', link: '/guide/structure/action'},
                                {text: 'Middleware', link: '/guide/structure/middleware'},
                                {text: 'Domain', link: '/guide/structure/domain'},
                                {text: 'Service', link: '/guide/structure/service'},
                                {text: 'Package', link: '/guide/structure/package'}
                            ]
                        },
                        {
                            text: 'Handling Requests',
                            items: [
                                {text: 'Routing', link: '/guide/runtime/routing'},
                                {text: 'Request', link: '/guide/runtime/request'},
                                {text: 'Response', link: '/guide/runtime/response'},
                                {text: 'Sessions', link: '/guide/runtime/sessions'},
                                {text: 'Cookies', link: '/guide/runtime/cookies'},
                                {text: 'Handling Errors', link: '/guide/runtime/handling-errors'},
                                {text: 'Logging', link: '/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: 'Security',
                            items: [
                                {text: 'Overview', link: '/guide/security/overview'},
                                {text: 'Authentication', link: '/guide/security/authentication'},
                                {text: 'Authorization', link: '/guide/security/authorization'},
                                {text: 'Working with Passwords', link: '/guide/security/passwords'},
                                {text: 'Cryptography', link: '/guide/security/cryptography'},
                                {text: 'Trusted Request', link: '/guide/security/trusted-request'},
                                {text: 'Best Practices', link: '/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: 'Caching',
                            items: [
                                {text: 'Overview', link: '/guide/caching/overview'},
                                {text: 'Data Caching', link: '/guide/caching/data'}
                            ]
                        },
                        {
                            text: 'Working with Databases',
                            items: [
                                {text: 'Database Migrations', link: '/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: 'Views',
                            items: [
                                {text: 'Views', link: '/guide/views/view'},
                                {text: 'Assets', link: '/guide/views/asset'},
                                {text: 'Scripts, Styles and Meta Tags', link: '/guide/views/script-style-meta'},
                                {text: 'Template Engines', link: '/guide/views/template-engines'},
                                {text: 'View Injections', link: '/guide/views/view-injections'},
                                {text: 'Widgets', link: '/guide/views/widget'}
                            ]
                        },
                        {
                            text: 'Tutorial',
                            items: [
                                {text: 'Console Applications', link: '/guide/tutorial/console-applications'},
                                {text: 'Mailing', link: '/guide/tutorial/mailing'},
                                {text: 'Performance Tuning', link: '/guide/tutorial/performance-tuning'},
                                {text: 'Using with Event Loop', link: '/guide/tutorial/using-with-event-loop'},
                                {text: 'Using Yii with RoadRunner', link: '/guide/tutorial/using-yii-with-roadrunner'},
                                {text: 'Using Yii with Swoole', link: '/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: 'Glossary',
                            link: '/guide/glossary'
                        }
                    ],
                    '/cookbook/': [
                        {
                            text: 'Cookbook',
                            items: [
                                {text: 'Preface', link: '/cookbook/preface'},
                                {text: 'Yii2 Basic to Yii3', link: '/cookbook/yii2-basic-to-yii3'},
                                {text: 'Making HTTP Requests', link: '/cookbook/making-http-requests'},
                                {text: 'Disabling CSRF Protection', link: '/cookbook/disabling-csrf-protection'},
                                {text: 'Sentry Integration', link: '/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: 'Configuring Web Servers',
                            collapsed: false,
                            items: [
                                {text: 'General', link: '/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: 'Organizing Code',
                            items: [
                                {text: 'Vertical Slices', link: '/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'}
                            ]
                        },
                        {
                            text: 'Deployment',
                            items: [
                                {text: 'Docker Swarm', link: '/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/internals/': [
                        {
                            text: 'Internals',
                            items: [
                                {text: 'Packages', link: '/internals/000-packages'},
                                {text: 'Yii Values', link: '/internals/001-yii-values'},
                                {text: 'Issue Workflow', link: '/internals/002-issue-workflow'},
                                {text: 'Roadmap', link: '/internals/003-roadmap'},
                                {text: 'Namespaces', link: '/internals/004-namespaces'},
                                {text: 'Development Tool', link: '/internals/005-development-tool'},
                                {text: 'Git Commit Messages', link: '/internals/006-git-commit-messages'},
                                {text: 'Exceptions', link: '/internals/007-exceptions'},
                                {text: 'Interfaces', link: '/internals/008-interfaces'},
                                {text: 'Design Decisions', link: '/internals/009-design-decisions'},
                                {text: 'Code Style', link: '/internals/010-code-style'},
                                {text: 'Error Correction', link: '/internals/011-error-correction'},
                                {text: 'Tests', link: '/internals/012-tests'},
                                {text: 'Code Review', link: '/internals/013-code-review'},
                                {text: 'Documentation', link: '/internals/014-docs'},
                                {text: 'PHPStorm', link: '/internals/015-phpstorm'},
                                {text: 'Security Workflow', link: '/internals/016-security-workflow'},
                                {text: 'Tags', link: '/internals/017-tags'},
                                {text: 'Widgets', link: '/internals/018-widgets'},
                                {text: 'View Code Style', link: '/internals/019-view-code-style'},
                                {text: 'Package Release', link: '/internals/020-package-release'},
                                {text: 'Changelog & Upgrade', link: '/internals/021-changelog-upgrade'},
                                {text: 'Config Groups', link: '/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: 'Released under the <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">BSD-3-Clause License</a>.',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                }
            }
        },
        es: {
            label: 'Español',
            lang: 'es',
            link: '/es/',
            themeConfig: {
                nav: [
                    {text: 'Guía', link: '/es/guide/'},
                    {text: 'Recetario', link: '/es/cookbook/'},
                    {text: 'Internos', link: '/es/internals/'},
                    {text: 'Sitio', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/es/guide/': [
                        {
                            text: 'Introducción',
                            items: [
                                {text: 'Acerca de Yii', link: '/es/guide/intro/what-is-yii'},
                                {text: 'Actualización desde la versión 2', link: '/es/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: 'Primeros pasos',
                            items: [
                                {text: 'Prerrequisitos', link: '/es/guide/start/prerequisites'},
                                {text: 'Creando un proyecto', link: '/es/guide/start/creating-project'},
                                {text: 'Diciendo Hola', link: '/es/guide/start/hello'},
                                {text: 'Trabajando con formularios', link: '/es/guide/start/forms'},
                                {text: 'Trabajando con bases de datos', link: '/es/guide/start/databases'},
                                {text: 'Generando código con Gii', link: '/es/guide/start/gii'},
                                {text: 'Mirando hacia adelante', link: '/es/guide/start/looking-ahead'},
                                {text: 'Flujo de trabajo de la aplicación', link: '/es/guide/start/workflow'}
                            ]
                        },
                        {
                            text: 'Conceptos clave',
                            items: [
                                {text: 'Alias', link: '/es/guide/concept/aliases'},
                                {text: 'Autocarga', link: '/es/guide/concept/autoloading'},
                                {text: 'Configuración', link: '/es/guide/concept/configuration'},
                                {text: 'Contenedor DI', link: '/es/guide/concept/di-container'},
                                {text: 'Eventos', link: '/es/guide/concept/events'},
                                {text: 'Inmutabilidad', link: '/es/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: 'Estructura de la aplicación',
                            items: [
                                {text: 'Resumen', link: '/es/guide/structure/overview'},
                                {text: 'Script de entrada', link: '/es/guide/structure/entry-script'},
                                {text: 'Aplicación', link: '/es/guide/structure/application'},
                                {text: 'Acción', link: '/es/guide/structure/action'},
                                {text: 'Middleware', link: '/es/guide/structure/middleware'},
                                {text: 'Dominio', link: '/es/guide/structure/domain'},
                                {text: 'Servicio', link: '/es/guide/structure/service'},
                                {text: 'Paquete', link: '/es/guide/structure/package'}
                            ]
                        },
                        {
                            text: 'Manejo de solicitudes',
                            items: [
                                {text: 'Enrutamiento', link: '/es/guide/runtime/routing'},
                                {text: 'Solicitud', link: '/es/guide/runtime/request'},
                                {text: 'Respuesta', link: '/es/guide/runtime/response'},
                                {text: 'Sesiones', link: '/es/guide/runtime/sessions'},
                                {text: 'Cookies', link: '/es/guide/runtime/cookies'},
                                {text: 'Manejo de errores', link: '/es/guide/runtime/handling-errors'},
                                {text: 'Registro', link: '/es/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: 'Seguridad',
                            items: [
                                {text: 'Resumen', link: '/es/guide/security/overview'},
                                {text: 'Autenticación', link: '/es/guide/security/authentication'},
                                {text: 'Autorización', link: '/es/guide/security/authorization'},
                                {text: 'Trabajando con contraseñas', link: '/es/guide/security/passwords'},
                                {text: 'Criptografía', link: '/es/guide/security/cryptography'},
                                {text: 'Solicitud confiable', link: '/es/guide/security/trusted-request'},
                                {text: 'Mejores prácticas', link: '/es/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: 'Caché',
                            items: [
                                {text: 'Resumen', link: '/es/guide/caching/overview'},
                                {text: 'Caché de datos', link: '/es/guide/caching/data'}
                            ]
                        },
                        {
                            text: 'Trabajando con bases de datos',
                            items: [
                                {text: 'Migraciones de base de datos', link: '/es/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: 'Vistas',
                            items: [
                                {text: 'Vistas', link: '/es/guide/views/view'},
                                {text: 'Assets', link: '/es/guide/views/asset'},
                                {text: 'Scripts, estilos y meta tags', link: '/es/guide/views/script-style-meta'},
                                {text: 'Motores de plantillas', link: '/es/guide/views/template-engines'},
                                {text: 'Inyecciones de vista', link: '/es/guide/views/view-injections'},
                                {text: 'Widgets', link: '/es/guide/views/widget'}
                            ]
                        },
                        {
                            text: 'Tutorial',
                            items: [
                                {text: 'Aplicaciones de consola', link: '/es/guide/tutorial/console-applications'},
                                {text: 'Envío de correo', link: '/es/guide/tutorial/mailing'},
                                {text: 'Optimización del rendimiento', link: '/es/guide/tutorial/performance-tuning'},
                                {text: 'Usando con bucle de eventos', link: '/es/guide/tutorial/using-with-event-loop'},
                                {text: 'Usando Yii con RoadRunner', link: '/es/guide/tutorial/using-yii-with-roadrunner'},
                                {text: 'Usando Yii con Swoole', link: '/es/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: 'Glosario',
                            link: '/es/guide/glossary'
                        }
                    ],
                    '/es/cookbook/': [
                        {
                            text: 'Recetario',
                            items: [
                                {text: 'Prefacio', link: '/es/cookbook/preface'},
                                {text: 'Haciendo solicitudes HTTP', link: '/es/cookbook/making-http-requests'},
                                {text: 'Deshabilitando la protección CSRF', link: '/es/cookbook/disabling-csrf-protection'},
                                {text: 'Integración con Sentry', link: '/es/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: 'Configurando servidores web',
                            collapsed: false,
                            items: [
                                {text: 'General', link: '/es/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/es/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/es/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/es/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/es/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/es/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: 'Organizando código',
                            items: [
                                {text: 'Rebanadas verticales', link: '/es/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'}
                            ]
                        },
                        {
                            text: 'Despliegue',
                            items: [
                                {text: 'Docker Swarm', link: '/es/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/es/internals/': [
                        {
                            text: 'Internos',
                            items: [
                                {text: 'Paquetes', link: '/es/internals/000-packages'},
                                {text: 'Valores de Yii', link: '/es/internals/001-yii-values'},
                                {text: 'Flujo de trabajo de issues', link: '/es/internals/002-issue-workflow'},
                                {text: 'Hoja de ruta', link: '/es/internals/003-roadmap'},
                                {text: 'Espacios de nombres', link: '/es/internals/004-namespaces'},
                                {text: 'Herramienta de desarrollo', link: '/es/internals/005-development-tool'},
                                {text: 'Mensajes de commit de Git', link: '/es/internals/006-git-commit-messages'},
                                {text: 'Excepciones', link: '/es/internals/007-exceptions'},
                                {text: 'Interfaces', link: '/es/internals/008-interfaces'},
                                {text: 'Decisiones de diseño', link: '/es/internals/009-design-decisions'},
                                {text: 'Estilo de código', link: '/es/internals/010-code-style'},
                                {text: 'Corrección de errores', link: '/es/internals/011-error-correction'},
                                {text: 'Pruebas', link: '/es/internals/012-tests'},
                                {text: 'Revisión de código', link: '/es/internals/013-code-review'},
                                {text: 'Documentación', link: '/es/internals/014-docs'},
                                {text: 'PHPStorm', link: '/es/internals/015-phpstorm'},
                                {text: 'Flujo de trabajo de seguridad', link: '/es/internals/016-security-workflow'},
                                {text: 'Etiquetas', link: '/es/internals/017-tags'},
                                {text: 'Widgets', link: '/es/internals/018-widgets'},
                                {text: 'Estilo de código de vista', link: '/es/internals/019-view-code-style'},
                                {text: 'Lanzamiento de paquete', link: '/es/internals/020-package-release'},
                                {text: 'Registro de cambios y actualización', link: '/es/internals/021-changelog-upgrade'},
                                {text: 'Grupos de configuración', link: '/es/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: 'Publicado bajo la <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">Licencia BSD-3-Clause</a>.',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                }
            }
        },
        id: {
            label: 'Bahasa Indonesia',
            lang: 'id',
            link: '/id/',
            themeConfig: {
                nav: [
                    {text: 'Panduan', link: '/id/guide/'},
                    {text: 'Cookbook', link: '/id/cookbook/'},
                    {text: 'Internal', link: '/id/internals/'},
                    {text: 'Situs', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/id/guide/': [
                        {
                            text: 'Pengantar',
                            items: [
                                {text: 'Tentang Yii', link: '/id/guide/intro/what-is-yii'},
                                {text: 'Upgrade dari Versi 2', link: '/id/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: 'Memulai',
                            items: [
                                {text: 'Prasyarat', link: '/id/guide/start/prerequisites'},
                                {text: 'Membuat Proyek', link: '/id/guide/start/creating-project'},
                                {text: 'Menyapa', link: '/id/guide/start/hello'},
                                {text: 'Bekerja dengan Form', link: '/id/guide/start/forms'},
                                {text: 'Bekerja dengan Database', link: '/id/guide/start/databases'},
                                {text: 'Menghasilkan Kode dengan Gii', link: '/id/guide/start/gii'},
                                {text: 'Melihat ke Depan', link: '/id/guide/start/looking-ahead'},
                                {text: 'Alur Kerja Aplikasi', link: '/id/guide/start/workflow'}
                            ]
                        },
                        {
                            text: 'Konsep Kunci',
                            items: [
                                {text: 'Alias', link: '/id/guide/concept/aliases'},
                                {text: 'Autoloading', link: '/id/guide/concept/autoloading'},
                                {text: 'Konfigurasi', link: '/id/guide/concept/configuration'},
                                {text: 'DI Container', link: '/id/guide/concept/di-container'},
                                {text: 'Events', link: '/id/guide/concept/events'},
                                {text: 'Immutability', link: '/id/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: 'Struktur Aplikasi',
                            items: [
                                {text: 'Ringkasan', link: '/id/guide/structure/overview'},
                                {text: 'Entry Script', link: '/id/guide/structure/entry-script'},
                                {text: 'Application', link: '/id/guide/structure/application'},
                                {text: 'Action', link: '/id/guide/structure/action'},
                                {text: 'Middleware', link: '/id/guide/structure/middleware'},
                                {text: 'Domain', link: '/id/guide/structure/domain'},
                                {text: 'Service', link: '/id/guide/structure/service'},
                                {text: 'Package', link: '/id/guide/structure/package'}
                            ]
                        },
                        {
                            text: 'Menangani Request',
                            items: [
                                {text: 'Routing', link: '/id/guide/runtime/routing'},
                                {text: 'Request', link: '/id/guide/runtime/request'},
                                {text: 'Response', link: '/id/guide/runtime/response'},
                                {text: 'Sessions', link: '/id/guide/runtime/sessions'},
                                {text: 'Cookies', link: '/id/guide/runtime/cookies'},
                                {text: 'Menangani Error', link: '/id/guide/runtime/handling-errors'},
                                {text: 'Logging', link: '/id/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: 'Keamanan',
                            items: [
                                {text: 'Ringkasan', link: '/id/guide/security/overview'},
                                {text: 'Authentication', link: '/id/guide/security/authentication'},
                                {text: 'Authorization', link: '/id/guide/security/authorization'},
                                {text: 'Bekerja dengan Password', link: '/id/guide/security/passwords'},
                                {text: 'Kriptografi', link: '/id/guide/security/cryptography'},
                                {text: 'Trusted Request', link: '/id/guide/security/trusted-request'},
                                {text: 'Praktik Terbaik', link: '/id/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: 'Caching',
                            items: [
                                {text: 'Ringkasan', link: '/id/guide/caching/overview'},
                                {text: 'Data Caching', link: '/id/guide/caching/data'}
                            ]
                        },
                        {
                            text: 'Bekerja dengan Database',
                            items: [
                                {text: 'Database Migrations', link: '/id/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: 'Views',
                            items: [
                                {text: 'Views', link: '/id/guide/views/view'},
                                {text: 'Assets', link: '/id/guide/views/asset'},
                                {text: 'Scripts, styles dan meta tags', link: '/id/guide/views/script-style-meta'},
                                {text: 'Template engines', link: '/id/guide/views/template-engines'},
                                {text: 'View Injections', link: '/id/guide/views/view-injections'},
                                {text: 'Widgets', link: '/id/guide/views/widget'}
                            ]
                        },
                        {
                            text: 'Tutorial',
                            items: [
                                {text: 'Aplikasi Console', link: '/id/guide/tutorial/console-applications'},
                                {text: 'Mailing', link: '/id/guide/tutorial/mailing'},
                                {text: 'Performance Tuning', link: '/id/guide/tutorial/performance-tuning'},
                                {text: 'Menggunakan dengan Event Loop', link: '/id/guide/tutorial/using-with-event-loop'},
                                {text: 'Menggunakan Yii dengan RoadRunner', link: '/id/guide/tutorial/using-yii-with-roadrunner'},
                                {text: 'Menggunakan Yii dengan Swoole', link: '/id/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: 'Glossary',
                            link: '/id/guide/glossary'
                        }
                    ],
                    '/id/cookbook/': [
                        {
                            text: 'Cookbook',
                            items: [
                                {text: 'Prakata', link: '/id/cookbook/preface'},
                                {text: 'Membuat HTTP Request', link: '/id/cookbook/making-http-requests'},
                                {text: 'Menonaktifkan Proteksi CSRF', link: '/id/cookbook/disabling-csrf-protection'},
                                {text: 'Integrasi Sentry', link: '/id/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: 'Konfigurasi Web Server',
                            collapsed: false,
                            items: [
                                {text: 'Umum', link: '/id/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/id/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/id/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/id/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/id/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/id/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: 'Mengorganisir Kode',
                            items: [
                                {text: 'Vertical Slices', link: '/id/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'}
                            ]
                        },
                        {
                            text: 'Deployment',
                            items: [
                                {text: 'Docker Swarm', link: '/id/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/id/internals/': [
                        {
                            text: 'Internal',
                            items: [
                                {text: 'Packages', link: '/id/internals/000-packages'},
                                {text: 'Nilai Yii', link: '/id/internals/001-yii-values'},
                                {text: 'Alur Kerja Issue', link: '/id/internals/002-issue-workflow'},
                                {text: 'Roadmap', link: '/id/internals/003-roadmap'},
                                {text: 'Namespaces', link: '/id/internals/004-namespaces'},
                                {text: 'Development Tool', link: '/id/internals/005-development-tool'},
                                {text: 'Pesan Commit Git', link: '/id/internals/006-git-commit-messages'},
                                {text: 'Exceptions', link: '/id/internals/007-exceptions'},
                                {text: 'Interfaces', link: '/id/internals/008-interfaces'},
                                {text: 'Keputusan Desain', link: '/id/internals/009-design-decisions'},
                                {text: 'Code Style', link: '/id/internals/010-code-style'},
                                {text: 'Koreksi Error', link: '/id/internals/011-error-correction'},
                                {text: 'Tests', link: '/id/internals/012-tests'},
                                {text: 'Code Review', link: '/id/internals/013-code-review'},
                                {text: 'Dokumentasi', link: '/id/internals/014-docs'},
                                {text: 'PHPStorm', link: '/id/internals/015-phpstorm'},
                                {text: 'Alur Kerja Keamanan', link: '/id/internals/016-security-workflow'},
                                {text: 'Tags', link: '/id/internals/017-tags'},
                                {text: 'Widgets', link: '/id/internals/018-widgets'},
                                {text: 'View Code Style', link: '/id/internals/019-view-code-style'},
                                {text: 'Package Release', link: '/id/internals/020-package-release'},
                                {text: 'Changelog & Upgrade', link: '/id/internals/021-changelog-upgrade'},
                                {text: 'Config Groups', link: '/id/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: 'Dirilis di bawah <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">Lisensi BSD-3-Clause</a>.',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                }
            }
        },
        it: {
            title: 'Documentazione Yii3',
            label: 'Italiano',
            lang: 'it',
            themeConfig: {
                nav: [
                    {text: 'Guida', link: '/it/guide/'},
                    {text: 'Ricettario', link: '/it/cookbook/'},
                    {text: 'Interni', link: '/it/internals/'},
                    {text: 'Sito', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/it/guide/': [
                        {
                            text: 'Introduzione',
                            items: [
                                {text: 'Informazioni su Yii', link: '/it/guide/intro/what-is-yii'},
                                {text: 'Aggiornamento dalla versione 2', link: '/it/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: 'Per iniziare',
                            items: [
                                {text: 'Requisiti', link: '/it/guide/start/prerequisites'},
                                {text: 'Creazione di un progetto', link: '/it/guide/start/creating-project'},
                                {text: 'Dire ciao', link: '/it/guide/start/hello'},
                                {text: 'Lavorare con i moduli', link: '/it/guide/start/forms'},
                                {text: 'Lavorare con i database', link: '/it/guide/start/databases'},
                                {text: 'Generazione di codice con Gii', link: '/it/guide/start/gii'},
                                {text: 'Prossimi passi', link: '/it/guide/start/looking-ahead'},
                                {text: 'Flusso applicativo', link: '/it/guide/start/workflow'}
                            ]
                        },
                        {
                            text: 'Concetti chiave',
                            items: [
                                {text: 'Alias', link: '/it/guide/concept/aliases'},
                                {text: 'Autoloading', link: '/it/guide/concept/autoloading'},
                                {text: 'Configurazione', link: '/it/guide/concept/configuration'},
                                {text: 'Contenitore DI', link: '/it/guide/concept/di-container'},
                                {text: 'Eventi', link: '/it/guide/concept/events'},
                                {text: 'Immutabilità', link: '/it/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: 'Struttura applicativa',
                            items: [
                                {text: 'Panoramica', link: '/it/guide/structure/overview'},
                                {text: 'Script di ingresso', link: '/it/guide/structure/entry-script'},
                                {text: 'Applicazione', link: '/it/guide/structure/application'},
                                {text: 'Gestori di richieste', link: '/it/guide/structure/handler'},
                                {text: 'Azioni', link: '/it/guide/structure/action'},
                                {text: 'Middleware', link: '/it/guide/structure/middleware'},
                                {text: 'Dominio', link: '/it/guide/structure/domain'},
                                {text: 'Servizio', link: '/it/guide/structure/service'},
                                {text: 'Pacchetto', link: '/it/guide/structure/package'}
                            ]
                        },
                        {
                            text: 'Gestione delle richieste',
                            items: [
                                {text: 'Routing', link: '/it/guide/runtime/routing'},
                                {text: 'Richieste', link: '/it/guide/runtime/request'},
                                {text: 'Risposte', link: '/it/guide/runtime/response'},
                                {text: 'Sessioni', link: '/it/guide/runtime/sessions'},
                                {text: 'Cookie', link: '/it/guide/runtime/cookies'},
                                {text: 'Gestione degli errori', link: '/it/guide/runtime/handling-errors'},
                                {text: 'Logging', link: '/it/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: 'Sicurezza',
                            items: [
                                {text: 'Panoramica', link: '/it/guide/security/overview'},
                                {text: 'Autenticazione', link: '/it/guide/security/authentication'},
                                {text: 'Autorizzazioni', link: '/it/guide/security/authorization'},
                                {text: 'Lavorare con le password', link: '/it/guide/security/passwords'},
                                {text: 'Crittografia', link: '/it/guide/security/cryptography'},
                                {text: 'Richieste attendibili', link: '/it/guide/security/trusted-request'},
                                {text: 'Migliori prassi', link: '/it/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: 'Caching',
                            items: [
                                {text: 'Panoramica', link: '/it/guide/caching/overview'},
                                {text: 'Caching dei dati', link: '/it/guide/caching/data'}
                            ]
                        },
                        {
                            text: 'Lavorare con i database',
                            items: [
                                {text: 'Migrazioni del database', link: '/it/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: 'Viste',
                            items: [
                                {text: 'Viste', link: '/it/guide/views/view'},
                                {text: 'Risorse', link: '/it/guide/views/asset'},
                                {text: 'Script, stili e meta tag', link: '/it/guide/views/script-style-meta'},
                                {text: 'Motori di template', link: '/it/guide/views/template-engines'},
                                {text: 'Iniezione di parametri nella vista', link: '/it/guide/views/view-injections'},
                                {text: 'Widget', link: '/it/guide/views/widget'}
                            ]
                        },
                        {
                            text: 'Tutorial',
                            items: [
                                {text: 'Applicazioni console', link: '/it/guide/tutorial/console-applications'},
                                {text: 'Mailing', link: '/it/guide/tutorial/mailing'},
                                {text: 'Motori di template', link: '/it/guide/tutorial/performance-tuning'},
                                {text: 'Usare Yii con event loop', link: '/it/guide/tutorial/using-with-event-loop'},
                                {
                                    text: 'Usare Yii con RoadRunner',
                                    link: '/it/guide/tutorial/using-yii-with-roadrunner'
                                },
                                {text: 'Usare Yii con Swoole', link: '/it/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: 'Glossario',
                            link: '/it/guide/glossary'
                        }
                    ],
                    '/it/cookbook/': [
                        {
                            text: 'Ricettario',
                            items: [
                                {text: 'Prefazione', link: '/it/cookbook/preface'},
                                {text: 'Effettuare richieste HTTP', link: '/it/cookbook/making-http-requests'},
                                {
                                    text: 'Disattivazione della protezione CSRF',
                                    link: '/it/cookbook/disabling-csrf-protection'
                                },
                                {text: 'Integrazione Sentry', link: '/it/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: 'Configurazione dei server Web',
                            collapsed: false,
                            items: [
                                {text: 'Generale', link: '/it/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/it/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/it/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/it/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/it/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/it/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: 'Organizzare il codice',
                            items: [
                                {
                                    text: 'Sezioni verticali',
                                    link: '/it/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'
                                }
                            ]
                        },
                        {
                            text: 'Distribuzione',
                            items: [
                                {text: 'Docker Swarm', link: '/it/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/it/internals/': [
                        {
                            text: 'Internals',
                            items: [
                                {text: 'Pacchetti', link: '/it/internals/000-packages'},
                                {text: 'I valori di Yii', link: '/it/internals/001-yii-values'},
                                {text: 'Flusso di lavoro dei problemi', link: '/it/internals/002-issue-workflow'},
                                {text: 'Roadmap', link: '/it/internals/003-roadmap'},
                                {text: 'Namespace', link: '/it/internals/004-namespaces'},
                                {text: 'Strumenti di sviluppo', link: '/it/internals/005-development-tool'},
                                {text: 'Messaggi di commit Git', link: '/it/internals/006-git-commit-messages'},
                                {text: 'Eccezioni', link: '/it/internals/007-exceptions'},
                                {text: 'Interfacce', link: '/it/internals/008-interfaces'},
                                {text: 'Decisioni di progettazione', link: '/it/internals/009-design-decisions'},
                                {text: 'Stile del codice', link: '/it/internals/010-code-style'},
                                {text: 'Correzione degli errori', link: '/it/internals/011-error-correction'},
                                {text: 'Test', link: '/it/internals/012-tests'},
                                {text: 'Revisione del codice', link: '/it/internals/013-code-review'},
                                {text: 'Documentazione', link: '/it/internals/014-docs'},
                                {text: 'PHPStorm', link: '/it/internals/015-phpstorm'},
                                {
                                    text: 'Flusso di lavoro della sicurezza',
                                    link: '/it/internals/016-security-workflow'
                                },
                                {text: 'Tag', link: '/it/internals/017-tags'},
                                {text: 'Widget', link: '/it/internals/018-widgets'},
                                {text: 'Stile del codice nelle viste', link: '/it/internals/019-view-code-style'},
                                {text: 'Rilascio dei pacchetti', link: '/it/internals/020-package-release'},
                                {
                                    text: 'Registro delle modifiche e aggiornamenti',
                                    link: '/it/internals/021-changelog-upgrade'
                                },
                                {text: 'Gruppi di configurazione', link: '/it/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: 'Rilasciato sotto licenza <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">BSD-3-Clause</a>.',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                },
                docFooter: {
                    prev: 'Pagina precedente',
                    next: 'Pagina successiva',
                },
                outline: {
                    label: 'In questa pagina'
                },
            }
        },
        ru: {
            label: 'Русский',
            lang: 'ru',
            link: '/ru/',
            themeConfig: {
                nav: [
                    {text: 'Руководство', link: '/ru/guide/'},
                    {text: 'Рецепты', link: '/ru/cookbook/'},
                    {text: 'Внутренности', link: '/ru/internals/'},
                    {text: 'Сайт', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/ru/guide/': [
                        {
                            text: 'Введение',
                            items: [
                                {text: 'О Yii', link: '/ru/guide/intro/what-is-yii'},
                                {text: 'Обновление с версии 2', link: '/ru/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: 'Начало работы',
                            items: [
                                {text: 'Требования', link: '/ru/guide/start/prerequisites'},
                                {text: 'Создание проекта', link: '/ru/guide/start/creating-project'},
                                {text: 'Говорим «Привет»', link: '/ru/guide/start/hello'},
                                {text: 'Работа с формами', link: '/ru/guide/start/forms'},
                                {text: 'Работа с базами данных', link: '/ru/guide/start/databases'},
                                {text: 'Генерация кода с Gii', link: '/ru/guide/start/gii'},
                                {text: 'Что дальше', link: '/ru/guide/start/looking-ahead'},
                                {text: 'Рабочий процесс приложения', link: '/ru/guide/start/workflow'}
                            ]
                        },
                        {
                            text: 'Ключевые концепции',
                            items: [
                                {text: 'Псевдонимы', link: '/ru/guide/concept/aliases'},
                                {text: 'Автозагрузка', link: '/ru/guide/concept/autoloading'},
                                {text: 'Конфигурация', link: '/ru/guide/concept/configuration'},
                                {text: 'DI-контейнер', link: '/ru/guide/concept/di-container'},
                                {text: 'События', link: '/ru/guide/concept/events'},
                                {text: 'Неизменяемость', link: '/ru/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: 'Структура приложения',
                            items: [
                                {text: 'Обзор', link: '/ru/guide/structure/overview'},
                                {text: 'Входной скрипт', link: '/ru/guide/structure/entry-script'},
                                {text: 'Приложение', link: '/ru/guide/structure/application'},
                                {text: 'Действие', link: '/ru/guide/structure/action'},
                                {text: 'Middleware', link: '/ru/guide/structure/middleware'},
                                {text: 'Домен', link: '/ru/guide/structure/domain'},
                                {text: 'Сервис', link: '/ru/guide/structure/service'},
                                {text: 'Пакет', link: '/ru/guide/structure/package'}
                            ]
                        },
                        {
                            text: 'Обработка запросов',
                            items: [
                                {text: 'Маршрутизация', link: '/ru/guide/runtime/routing'},
                                {text: 'Запрос', link: '/ru/guide/runtime/request'},
                                {text: 'Ответ', link: '/ru/guide/runtime/response'},
                                {text: 'Сессии', link: '/ru/guide/runtime/sessions'},
                                {text: 'Куки', link: '/ru/guide/runtime/cookies'},
                                {text: 'Обработка ошибок', link: '/ru/guide/runtime/handling-errors'},
                                {text: 'Логирование', link: '/ru/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: 'Безопасность',
                            items: [
                                {text: 'Обзор', link: '/ru/guide/security/overview'},
                                {text: 'Аутентификация', link: '/ru/guide/security/authentication'},
                                {text: 'Авторизация', link: '/ru/guide/security/authorization'},
                                {text: 'Работа с паролями', link: '/ru/guide/security/passwords'},
                                {text: 'Криптография', link: '/ru/guide/security/cryptography'},
                                {text: 'Доверенный запрос', link: '/ru/guide/security/trusted-request'},
                                {text: 'Лучшие практики', link: '/ru/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: 'Кэширование',
                            items: [
                                {text: 'Обзор', link: '/ru/guide/caching/overview'},
                                {text: 'Кэширование данных', link: '/ru/guide/caching/data'}
                            ]
                        },
                        {
                            text: 'Работа с базами данных',
                            items: [
                                {text: 'Миграции баз данных', link: '/ru/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: 'Представления',
                            items: [
                                {text: 'Представления', link: '/ru/guide/views/view'},
                                {text: 'Ресурсы', link: '/ru/guide/views/asset'},
                                {text: 'Скрипты, стили и мета-теги', link: '/ru/guide/views/script-style-meta'},
                                {text: 'Шаблонизаторы', link: '/ru/guide/views/template-engines'},
                                {text: 'Инъекции представлений', link: '/ru/guide/views/view-injections'},
                                {text: 'Виджеты', link: '/ru/guide/views/widget'}
                            ]
                        },
                        {
                            text: 'Руководства',
                            items: [
                                {text: 'Консольные приложения', link: '/ru/guide/tutorial/console-applications'},
                                {text: 'Отправка почты', link: '/ru/guide/tutorial/mailing'},
                                {text: 'Настройка производительности', link: '/ru/guide/tutorial/performance-tuning'},
                                {text: 'Использование с циклом событий', link: '/ru/guide/tutorial/using-with-event-loop'},
                                {text: 'Использование Yii с RoadRunner', link: '/ru/guide/tutorial/using-yii-with-roadrunner'},
                                {text: 'Использование Yii с Swoole', link: '/ru/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: 'Глоссарий',
                            link: '/ru/guide/glossary'
                        }
                    ],
                    '/ru/cookbook/': [
                        {
                            text: 'Рецепты',
                            items: [
                                {text: 'Предисловие', link: '/ru/cookbook/preface'},
                                {text: 'Выполнение HTTP-запросов', link: '/ru/cookbook/making-http-requests'},
                                {text: 'Отключение CSRF-защиты', link: '/ru/cookbook/disabling-csrf-protection'},
                                {text: 'Интеграция с Sentry', link: '/ru/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: 'Настройка веб-серверов',
                            collapsed: false,
                            items: [
                                {text: 'Общие настройки', link: '/ru/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/ru/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/ru/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/ru/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/ru/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/ru/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: 'Организация кода',
                            items: [
                                {text: 'Вертикальные срезы', link: '/ru/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'}
                            ]
                        },
                        {
                            text: 'Развёртывание',
                            items: [
                                {text: 'Docker Swarm', link: '/ru/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/ru/internals/': [
                        {
                            text: 'Внутренности',
                            items: [
                                {text: 'Пакеты', link: '/ru/internals/000-packages'},
                                {text: 'Ценности Yii', link: '/ru/internals/001-yii-values'},
                                {text: 'Рабочий процесс с задачами', link: '/ru/internals/002-issue-workflow'},
                                {text: 'План развития', link: '/ru/internals/003-roadmap'},
                                {text: 'Пространства имён', link: '/ru/internals/004-namespaces'},
                                {text: 'Инструмент разработки', link: '/ru/internals/005-development-tool'},
                                {text: 'Сообщения коммитов Git', link: '/ru/internals/006-git-commit-messages'},
                                {text: 'Исключения', link: '/ru/internals/007-exceptions'},
                                {text: 'Интерфейсы', link: '/ru/internals/008-interfaces'},
                                {text: 'Дизайн-решения', link: '/ru/internals/009-design-decisions'},
                                {text: 'Стиль кода', link: '/ru/internals/010-code-style'},
                                {text: 'Исправление ошибок', link: '/ru/internals/011-error-correction'},
                                {text: 'Тесты', link: '/ru/internals/012-tests'},
                                {text: 'Ревью кода', link: '/ru/internals/013-code-review'},
                                {text: 'Документация', link: '/ru/internals/014-docs'},
                                {text: 'PHPStorm', link: '/ru/internals/015-phpstorm'},
                                {text: 'Рабочий процесс безопасности', link: '/ru/internals/016-security-workflow'},
                                {text: 'Теги', link: '/ru/internals/017-tags'},
                                {text: 'Виджеты', link: '/ru/internals/018-widgets'},
                                {text: 'Стиль кода представлений', link: '/ru/internals/019-view-code-style'},
                                {text: 'Релиз пакета', link: '/ru/internals/020-package-release'},
                                {text: 'Журнал изменений и обновление', link: '/ru/internals/021-changelog-upgrade'},
                                {text: 'Группы конфигурации', link: '/ru/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: 'Выпущено под <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">лицензией BSD-3-Clause</a>.',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                },
                socialLinks: [
                    {icon: 'github', link: 'https://github.com/yiisoft'},
                    {icon: 'x', link: 'https://twitter.com/yiiframework'},
                    {icon: 'telegram', link: 'https://t.me/yii3ru'}
                ],
            }
        },
        'zh-CN': {
            title: 'Yii3 文档',
            label: '简体中文',
            lang: 'zh-CN',
            link: '/zh-CN/',
            themeConfig: {
                nav: [
                    {text: '权威指南', link: '/zh-CN/guide/'},
                    {text: '实用手册', link: '/zh-CN/cookbook/'},
                    {text: '内部文档', link: '/zh-CN/internals/'},
                    {text: '官网', link: 'https://www.yiiframework.com'}
                ],
                sidebar: {
                    '/zh-CN/guide/': [
                        {
                            text: '介绍',
                            items: [
                                {text: '关于 Yii', link: '/zh-CN/guide/intro/what-is-yii'},
                                {text: '从版本 2 升级', link: '/zh-CN/guide/intro/upgrade-from-v2'}
                            ]
                        },
                        {
                            text: '入门',
                            items: [
                                {text: '前置要求', link: '/zh-CN/guide/start/prerequisites'},
                                {text: '创建项目', link: '/zh-CN/guide/start/creating-project'},
                                {text: '说声 Hello', link: '/zh-CN/guide/start/hello'},
                                {text: '使用表单', link: '/zh-CN/guide/start/forms'},
                                {text: '使用数据库', link: '/zh-CN/guide/start/databases'},
                                {text: '使用 Gii 生成代码', link: '/zh-CN/guide/start/gii'},
                                {text: '展望未来', link: '/zh-CN/guide/start/looking-ahead'},
                                {text: '应用程序工作流', link: '/zh-CN/guide/start/workflow'}
                            ]
                        },
                        {
                            text: '核心概念',
                            items: [
                                {text: '别名', link: '/zh-CN/guide/concept/aliases'},
                                {text: '自动加载', link: '/zh-CN/guide/concept/autoloading'},
                                {text: '配置', link: '/zh-CN/guide/concept/configuration'},
                                {text: 'DI 容器', link: '/zh-CN/guide/concept/di-container'},
                                {text: '事件', link: '/zh-CN/guide/concept/events'},
                                {text: '不可变性', link: '/zh-CN/guide/concept/immutability'}
                            ]
                        },
                        {
                            text: '应用程序结构',
                            items: [
                                {text: '概述', link: '/zh-CN/guide/structure/overview'},
                                {text: '入口脚本', link: '/zh-CN/guide/structure/entry-script'},
                                {text: '应用程序', link: '/zh-CN/guide/structure/application'},
                                {text: '处理器', link: '/zh-CN/guide/structure/handler'},
                                {text: '操作', link: '/zh-CN/guide/structure/action'},
                                {text: '中间件', link: '/zh-CN/guide/structure/middleware'},
                                {text: '领域', link: '/zh-CN/guide/structure/domain'},
                                {text: '服务', link: '/zh-CN/guide/structure/service'},
                                {text: '包', link: '/zh-CN/guide/structure/package'}
                            ]
                        },
                        {
                            text: '处理请求',
                            items: [
                                {text: '路由', link: '/zh-CN/guide/runtime/routing'},
                                {text: '请求', link: '/zh-CN/guide/runtime/request'},
                                {text: '响应', link: '/zh-CN/guide/runtime/response'},
                                {text: '会话', link: '/zh-CN/guide/runtime/sessions'},
                                {text: 'Cookies', link: '/zh-CN/guide/runtime/cookies'},
                                {text: '错误处理', link: '/zh-CN/guide/runtime/handling-errors'},
                                {text: '日志', link: '/zh-CN/guide/runtime/logging'}
                            ]
                        },
                        {
                            text: '安全',
                            items: [
                                {text: '概述', link: '/zh-CN/guide/security/overview'},
                                {text: '认证', link: '/zh-CN/guide/security/authentication'},
                                {text: '授权', link: '/zh-CN/guide/security/authorization'},
                                {text: '使用密码', link: '/zh-CN/guide/security/passwords'},
                                {text: '加密', link: '/zh-CN/guide/security/cryptography'},
                                {text: '可信请求', link: '/zh-CN/guide/security/trusted-request'},
                                {text: '最佳实践', link: '/zh-CN/guide/security/best-practices'}
                            ]
                        },
                        {
                            text: '缓存',
                            items: [
                                {text: '概述', link: '/zh-CN/guide/caching/overview'},
                                {text: '数据缓存', link: '/zh-CN/guide/caching/data'}
                            ]
                        },
                        {
                            text: '使用数据库',
                            items: [
                                {text: '数据库迁移', link: '/zh-CN/guide/databases/db-migrations'}
                            ]
                        },
                        {
                            text: '视图',
                            items: [
                                {text: '视图', link: '/zh-CN/guide/views/view'},
                                {text: '资源', link: '/zh-CN/guide/views/asset'},
                                {text: '脚本、样式和元标签', link: '/zh-CN/guide/views/script-style-meta'},
                                {text: '模板引擎', link: '/zh-CN/guide/views/template-engines'},
                                {text: '视图注入', link: '/zh-CN/guide/views/view-injections'},
                                {text: '小部件', link: '/zh-CN/guide/views/widget'}
                            ]
                        },
                        {
                            text: '教程',
                            items: [
                                {text: '控制台应用', link: '/zh-CN/guide/tutorial/console-applications'},
                                {text: '邮件发送', link: '/zh-CN/guide/tutorial/mailing'},
                                {text: '性能调优', link: '/zh-CN/guide/tutorial/performance-tuning'},
                                {text: '使用事件循环', link: '/zh-CN/guide/tutorial/using-with-event-loop'},
                                {text: '使用 Yii 与 RoadRunner', link: '/zh-CN/guide/tutorial/using-yii-with-roadrunner'},
                                {text: '使用 Yii 与 Swoole', link: '/zh-CN/guide/tutorial/using-yii-with-swoole'}
                            ]
                        },
                        {
                            text: '术语表',
                            link: '/zh-CN/guide/glossary'
                        }
                    ],
                    '/zh-CN/cookbook/': [
                        {
                            text: '实用手册',
                            items: [
                                {text: '前言', link: '/zh-CN/cookbook/preface'},
                                {text: '发起 HTTP 请求', link: '/zh-CN/cookbook/making-http-requests'},
                                {text: '禁用 CSRF 保护', link: '/zh-CN/cookbook/disabling-csrf-protection'},
                                {text: 'Sentry 集成', link: '/zh-CN/cookbook/sentry-integration'}
                            ]
                        },
                        {
                            text: '配置 Web 服务器',
                            collapsed: false,
                            items: [
                                {text: '通用配置', link: '/zh-CN/cookbook/configuring-webservers/general'},
                                {text: 'Apache', link: '/zh-CN/cookbook/configuring-webservers/apache'},
                                {text: 'Nginx', link: '/zh-CN/cookbook/configuring-webservers/nginx'},
                                {text: 'Nginx Unit', link: '/zh-CN/cookbook/configuring-webservers/nginx-unit'},
                                {text: 'IIS', link: '/zh-CN/cookbook/configuring-webservers/iis'},
                                {text: 'Lighttpd', link: '/zh-CN/cookbook/configuring-webservers/lighttpd'}
                            ]
                        },
                        {
                            text: '组织代码',
                            items: [
                                {text: '垂直切片', link: '/zh-CN/cookbook/organizing-code/structuring-by-use-case-with-vertical-slices'}
                            ]
                        },
                        {
                            text: '部署',
                            items: [
                                {text: 'Docker Swarm', link: '/zh-CN/cookbook/deployment/docker-swarm'}
                            ]
                        }
                    ],
                    '/zh-CN/internals/': [
                        {
                            text: '内部文档',
                            items: [
                                {text: '包', link: '/zh-CN/internals/000-packages'},
                                {text: 'Yii 价值观', link: '/zh-CN/internals/001-yii-values'},
                                {text: '问题工作流', link: '/zh-CN/internals/002-issue-workflow'},
                                {text: '路线图', link: '/zh-CN/internals/003-roadmap'},
                                {text: '命名空间', link: '/zh-CN/internals/004-namespaces'},
                                {text: '开发工具', link: '/zh-CN/internals/005-development-tool'},
                                {text: 'Git 提交消息', link: '/zh-CN/internals/006-git-commit-messages'},
                                {text: '异常', link: '/zh-CN/internals/007-exceptions'},
                                {text: '接口', link: '/zh-CN/internals/008-interfaces'},
                                {text: '设计决策', link: '/zh-CN/internals/009-design-decisions'},
                                {text: '代码风格', link: '/zh-CN/internals/010-code-style'},
                                {text: '错误修正', link: '/zh-CN/internals/011-error-correction'},
                                {text: '测试', link: '/zh-CN/internals/012-tests'},
                                {text: '代码审查', link: '/zh-CN/internals/013-code-review'},
                                {text: '文档', link: '/zh-CN/internals/014-docs'},
                                {text: 'PHPStorm', link: '/zh-CN/internals/015-phpstorm'},
                                {text: '安全工作流', link: '/zh-CN/internals/016-security-workflow'},
                                {text: '标签', link: '/zh-CN/internals/017-tags'},
                                {text: '小部件', link: '/zh-CN/internals/018-widgets'},
                                {text: '视图代码风格', link: '/zh-CN/internals/019-view-code-style'},
                                {text: '包发布', link: '/zh-CN/internals/020-package-release'},
                                {text: '变更日志和升级', link: '/zh-CN/internals/021-changelog-upgrade'},
                                {text: '配置组', link: '/zh-CN/internals/022-config-groups'}
                            ]
                        }
                    ]
                },
                footer: {
                    message: '基于 <a href="https://github.com/yiisoft/docs/blob/master/LICENSE.md">BSD-3-Clause 许可证</a> 发布。',
                    copyright: `Copyright © 2008-${currentYear} <a href="https://www.yiiframework.com/">Yii</a>`
                },
                docFooter: {
                    prev: '上一页',
                    next: '下一页',
                },
                outline: {
                    label: '本页内容'
                },
                lastUpdated: {
                    text: '最后更新于'
                },
                search: {
                    options: {
                        translations: {
                            button: {
                                buttonText: '搜索',
                                buttonAriaLabel: '搜索'
                            },
                            modal: {
                                noResultsText: '无法找到相关结果',
                                resetButtonTitle: '清除查询条件',
                                footer: {
                                    selectText: '选择',
                                    navigateText: '切换',
                                    closeText: '关闭'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
