<template>
    <div>
        <div class="background" :style="{ ...backgroundStyle }"></div>
        <div>
            <ScreenElement
                v-for="(element, index) in elements"
                :key="element.id"
                :elementInfo="element"
                :elementIndex="index + 1"
                :animationIndex="animationIndex"
                @click="handleAction(element)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent, watch, ref } from "vue";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import useSlideBackgroundStyle from "@/hooks/useSlideBackgroundStyle";
import ScreenElement from "./ScreenElement.vue";

export default defineComponent({
    name: "element-view",
    components: { ScreenElement },
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        },
        animationIndex: {
            type: Number,
            default: -1
        },
        runAnimation: {
            type: Function as PropType<(action: PPTElementAction) => void>,
            required: true
        }
    },
    setup(props, { emit }) {
        const currentSlide = computed(() => props.slide);
        const background = computed(() => props.slide.background);
        const { backgroundStyle } = useSlideBackgroundStyle(background);

        const elements = computed(() => currentSlide.value.elements);

        // 处理元素点击事件
        const handleAction = (element: PPTElement) => {
            if (element.link) window.open(element.link);

            // 弹卡事件
            if (element.wins) {
                emit("openCard", element.wins);
            }

            if (!element.actions || element.actions.length === 0) return;

            element.actions.map(a => {
                props.runAnimation(a);
            });
        };

        return {
            elements,
            backgroundStyle,
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
