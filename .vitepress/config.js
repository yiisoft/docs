import {withMermaid} from "vitepress-plugin-mermaid";

export default withMermaid({
    title: 'Yii3 Documentation',
    themeConfig: {
        logo: '/images/logo.svg',
        i18nRouting: true,
        nav: [
            {text: 'Guide', link: '/guide'},
            {text: 'Cookbook', link: '/cookbook'},
            {text: 'Internals', link: '/internals'},
        ],
        socialLinks: [
            {icon: 'github', link: 'https://github.com/yiisoft'},
        ]
    },
})
