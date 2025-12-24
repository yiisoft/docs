import {withMermaid} from "vitepress-plugin-mermaid";

export default withMermaid({
    title: 'Yii3 Documentation',
    themeConfig: {
        logo: '/assets/logo-icon.svg',
        socialLinks: [
            {icon: 'github', link: 'https://github.com/yiisoft'},
        ]
    },
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    {text: 'Guide', link: '/guide'},
                    {text: 'Cookbook', link: '/cookbook'},
                    {text: 'Internals', link: '/internals'},
                ]
            }
        },
        es: {
            label: 'Español',
            lang: 'es',
            link: '/es/',
            themeConfig: {
                nav: [
                    {text: 'Guía', link: '/es/guide'},
                    {text: 'Recetario', link: '/es/cookbook'},
                    {text: 'Internos', link: '/es/internals'},
                ]
            }
        },
        id: {
            label: 'Bahasa Indonesia',
            lang: 'id',
            link: '/id/',
            themeConfig: {
                nav: [
                    {text: 'Panduan', link: '/id/guide'},
                    {text: 'Cookbook', link: '/id/cookbook'},
                    {text: 'Internal', link: '/id/internals'},
                ]
            }
        },
        ru: {
            label: 'Русский',
            lang: 'ru',
            link: '/ru/',
            themeConfig: {
                nav: [
                    {text: 'Руководство', link: '/ru/guide'},
                    {text: 'Рецепты', link: '/ru/cookbook'},
                    {text: 'Внутренности', link: '/ru/internals'},
                ]
            }
        }
    }
})
