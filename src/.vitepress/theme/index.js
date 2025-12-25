import { h, nextTick, watch, onMounted } from "vue";
import DefaultTheme from 'vitepress/theme-without-fonts'
import { useData, useRoute } from "vitepress";
import { createMermaidRenderer } from "vitepress-mermaid-renderer";
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.css';
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
    setup() {
        const route = useRoute();
        let lightbox = null;

        const initGLightbox = () => {
            if (lightbox) {
                lightbox.destroy();
            }

            nextTick(() => {
                const images = document.querySelectorAll('.vp-doc img');

                images.forEach((img) => {
                    if (!img.parentElement.classList.contains('glightbox-wrapper')) {
                        const wrapper = document.createElement('a');
                        wrapper.href = img.src;
                        wrapper.className = 'glightbox';
                        wrapper.setAttribute('data-glightbox', `title: ${img.alt || ''}`);

                        img.parentNode.insertBefore(wrapper, img);
                        wrapper.appendChild(img);
                    }
                });

                lightbox = GLightbox({
                    selector: '.glightbox',
                });
            });
        };

        onMounted(() => {
            initGLightbox();
        });

        watch(() => route.path, () => {
            initGLightbox();
        });
    }
}
