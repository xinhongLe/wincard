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
            @openCard="openCard"
            :slide="slide"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent } from "vue";
import { useStore } from "@/store";
import { IWin, Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import { PAGE_TYPE } from "@/configs/page";

import ElementView from "./ElementView.vue";
import ListenView from "./ListenView.vue";
import FollowView from "./FollowView.vue";

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
    setup(props, { emit }) {
        const store = useStore();
        const viewportRatio = computed(() => store.state.viewportRatio);
        const slideType = computed(() => props.slide.type);

        const currentPageComponent = computed(() => {
            const pageTypeMap = {
                [PAGE_TYPE.ELEMENT]: ElementView,
                [PAGE_TYPE.LISTEN]: ListenView,
                [PAGE_TYPE.FOLLOW]: FollowView
            };
            return pageTypeMap[slideType.value] || null;
        });

        const openCard = (win: IWin) => {
            emit("openCard", win);
        };

        return {
            VIEWPORT_SIZE,
            viewportRatio,
            currentPageComponent,
            openCard
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
