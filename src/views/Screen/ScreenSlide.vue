<template>
    <div
        class="screen-slide"
        :style="{
            width: VIEWPORT_SIZE + 'px',
            height: VIEWPORT_SIZE * viewportRatio + 'px',
            transform: `scale(${scale})`
        }"
    >
        <div class="background" :style="{ ...backgroundStyle }" v-if="slideType === 0"></div>
        <div v-if="slideType === 0">
            <ScreenElement
                v-for="(element, index) in elements"
                :key="element.id"
                :elementInfo="element"
                :elementIndex="index + 1"
                :animationIndex="animationIndex"
                @click="handleAction(element)"
            />
        </div>
        <ListenView :listenWords="listenWords" v-if="slideType === 1" />
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTElement, Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import useSlideBackgroundStyle from "@/hooks/useSlideBackgroundStyle";
import useActionAnimation from "@/hooks/useActionAnimation";

import ScreenElement from "./ScreenElement.vue";
import ListenView from "./ListenView.vue";

export default defineComponent({
    name: "screen-slide",
    components: {
        ScreenElement,
        ListenView
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
        const slideType = computed(() => props.slide.type);
        const listenWords = computed(() => props.slide.listenWords);

        const background = computed(() => props.slide.background);
        const { backgroundStyle } = useSlideBackgroundStyle(background);

        const elements = computed(() => store.state.previewElements);
        store.commit(MutationTypes.UPDATE_PREVIEW_ELEMENTS, JSON.parse(JSON.stringify(props.slide.elements)));

        watch(props.slide, () => {
            store.commit(MutationTypes.UPDATE_PREVIEW_ELEMENTS, JSON.parse(JSON.stringify(props.slide.elements)));
        });

        const { runAnimation } = useActionAnimation();

        // 处理元素点击事件
        const handleAction = (element: PPTElement) => {
            if (element.link) window.open(element.link);
            if (!element.actions || element.actions.length === 0) return;

            element.actions.map(a => {
                runAnimation(a);
            });
        };

        return {
            elements,
            slideType,
            backgroundStyle,
            VIEWPORT_SIZE,
            viewportRatio,
            listenWords,
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
