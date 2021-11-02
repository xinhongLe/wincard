<template>
    <div
        class="screen-slide"
        :style="{
            width: VIEWPORT_SIZE + 'px',
            height: VIEWPORT_SIZE * viewportRatio + 'px',
            transform: `scale(${scale})`
        }"
    >
        <div class="background" :style="{ ...backgroundStyle }"></div>
        <ScreenElement
            v-for="(element, index) in elements"
            :key="element.id"
            :elementInfo="element"
            :elementIndex="index + 1"
            :animationIndex="animationIndex"
            @click="handleAction(element)"
        />
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import useSlideBackgroundStyle from "@/hooks/useSlideBackgroundStyle";

import ScreenElement from "./ScreenElement.vue";

export default defineComponent({
    name: "screen-slide",
    components: {
        ScreenElement
    },
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        },
        scale: {
            type: Number,
            required: true
        },
        animationIndex: {
            type: Number,
            default: -1
        }
    },
    setup(props) {
        const store = useStore();
        const viewportRatio = computed(() => store.state.viewportRatio);

        const background = computed(() => props.slide.background);
        const { backgroundStyle } = useSlideBackgroundStyle(background);

        const elements = ref<PPTElement[]>(JSON.parse(JSON.stringify(props.slide.elements)));

        // 处理元素点击事件
        const handleAction = (element: PPTElement) => {
            if (element.link) window.open(element.link);
            if (!element.actions || element.actions.length === 0) return;

            element.actions.map(a => {
                runAnimation(a);
            });
        };

        // 执行元素的动画
        const runAnimation = (action: PPTElementAction) => {
            const prefix = "animate__";
            const element = elements.value.find(el => { return el.id === action.target; });
            if (!element) return;
            const display = typeof element?.display === "undefined" || element.display;
            const animationType = action.type === "show" ? "show" : (action.type === "toggle" ? (display ? "hide" : "show") : "hide");
            const animation = animationType === "show" ? action.inAni : action.outAni;

            const elRef = document.querySelector(
                `#screen-element-${action.target} [class^=base-element-]`
            );

            if (elRef) {
                // 如果是执行显示动画，需要先将display设置为true
                if (animationType === "show") {
                    element.display = true;
                }

                const animationName = `${prefix}${animation}`;
                document.documentElement.style.setProperty(
                    "--animate-delay",
                    `${action.duration || 0}ms`
                );
                elRef.classList.add(`${prefix}animated`, animationName);

                const handleAnimationEnd = () => {
                    document.documentElement.style.removeProperty(
                        "--animate-delay"
                    );

                    element.display = animationType === "show";

                    elRef.classList.remove(`${prefix}animated`, animationName);
                };
                elRef.addEventListener("animationend", handleAnimationEnd, {
                    once: true
                });
            }
        };

        return {
            elements,
            backgroundStyle,
            VIEWPORT_SIZE,
            viewportRatio,
            handleAction
        };
    }
});
</script>

<style lang="scss" scoped>
.screen-slide {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
}
.background {
    width: 100%;
    height: 100%;
    background-position: center;
    position: absolute;
}
</style>
