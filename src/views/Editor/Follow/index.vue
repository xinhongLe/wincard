<template>
    <ScaleCanvas>
        <video
            class="me-video"
            ref="videoRef"
            :src="videoUrl"
        ></video>
    </ScaleCanvas>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "@/store";
import ScaleCanvas from "../Scale.vue";

import useOssVideo from "./useOssVideo";
import { Follow } from "@/types/slides";

interface IViewportStyles {
    width: number;
    height: number;
    left: number;
    top: number;
}

export default defineComponent({
    name: "editor-canvas",
    components: { ScaleCanvas },
    props: {
        viewportStyles: {
            type: Object as PropType<IViewportStyles>
        }
    },
    setup() {
        const store = useStore();

        const follow = computed<Follow>(() => store.getters.currentSlide.follow);

        const { videoUrl } = useOssVideo(follow);

        return {
            videoUrl
        };
    }
});
</script>

<style lang="scss" scoped>
.me-video {
    display: block;
    width: 100%;
    max-height: 100%;
    margin: 0 auto;
}
</style>
