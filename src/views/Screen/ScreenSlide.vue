<template>
    <div
        class="screen-slide"
        :style="{
            width: VIEWPORT_SIZE + 'px',
            height: VIEWPORT_SIZE * viewportRatio + 'px',
            transform: `scale(${scale})`
        }"
    >
        <component
            :is="currentPageComponent"
            :slide="slide"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent } from "vue";
import { useStore } from "@/store";
import { Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";

import ElementView from "./ElementView.vue";
import ListenView from "./ListenView.vue";
import { PAGE_TYPE } from "@/configs/page";

export default defineComponent({
    name: "screen-slide",
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

        const currentPageComponent = computed(() => {
            const pageTypeMap = {
                [PAGE_TYPE.ELEMENT]: ElementView,
                [PAGE_TYPE.LISTEN]: ListenView
            };
            return pageTypeMap[slideType.value] || null;
        });

        return {
            VIEWPORT_SIZE,
            viewportRatio,
            currentPageComponent
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
