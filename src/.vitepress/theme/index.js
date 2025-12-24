import { h, nextTick, watch } from "vue";
import DefaultTheme from 'vitepress/theme-without-fonts'
import { useData } from "vitepress";
import { createMermaidRenderer } from "vitepress-mermaid-renderer";
import './style.css'

export default {
    extends: DefaultTheme,
    Layout() {
        const { isDark } = useData();

        const initMermaid = () => {
            createMermaidRenderer({
                theme: isDark.value ? "dark" : "forest",
            });
        };
        nextTick(() => {
            initMermaid();
        });
        watch(
            () => isDark.value,
            () => {
                initMermaid();
            }
        );
        return h(DefaultTheme.Layout);
    },
}
