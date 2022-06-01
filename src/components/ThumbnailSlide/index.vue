<template>
    <div
        class="thumbnail-slide"
        :style="{
            width: size + 'px',
            height: size * viewportRatio + 'px'
        }"
    >
        <div
            class="elements"
            :style="{
                width: VIEWPORT_SIZE + 'px',
                height: VIEWPORT_SIZE * viewportRatio + 'px',
                transform: `scale(${scale})`
            }"
        >
            <div v-if="slide.type === 'element'">
                <div class="background" :style="backgroundStyle"></div>
                <thumbnail-element
                    v-for="(element, index) in slide.elements"
                    :key="element.id"
                    :elementInfo="element"
                    :elementIndex="index + 1"
                />
            </div>
            <ListenView :slide="slide" v-if="slide.type === 'listen'" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent } from "vue";
import { useStore } from "@/store";
import { Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import useSlideBackgroundStyle from "@/hooks/useSlideBackgroundStyle";

import ThumbnailElement from "./ThumbnailElement.vue";
import ListenView from "../Listen/BaseListen.vue";

export default defineComponent({
    name: "thumbnail-slide",
    components: {
        ThumbnailElement,
        ListenView
    },
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const viewportRatio = computed(() => store.state.viewportRatio);

        const background = computed(() => props.slide.background);
        const { backgroundStyle } = useSlideBackgroundStyle(background);

        const scale = computed(() => props.size / VIEWPORT_SIZE);

        return {
            scale,
            backgroundStyle,
            VIEWPORT_SIZE,
            viewportRatio
        };
    }
});
</script>

<style lang="scss" scoped>
.thumbnail-slide {
    background-color: #fff;
    overflow: hidden;
}
.elements {
    transform-origin: 0 0;
}
.background {
    width: 100%;
    height: 100%;
    background-position: center;
    position: absolute;
}
</style>
