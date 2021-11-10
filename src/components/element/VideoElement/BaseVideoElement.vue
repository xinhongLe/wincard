<template>
    <div
        class="base-element-video"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div
            class="element-content"
            :style="{ backgroundImage: `url(${elementInfo.poster})` }"
        >
            <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="">
            <img class="icon-image" v-else src="@/assets/images/video.png" alt="">
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { PPTVideoElement } from "@/types/slides";
import useOssVideo from "./VideoPlayer/useOssVideo";

export default defineComponent({
    name: "base-element-video",
    props: {
        elementInfo: {
            type: Object as PropType<PPTVideoElement>,
            required: true
        }
    },
    setup(props) {
        const videoElement = computed(() => props.elementInfo);
        const { iconUrl } = useOssVideo(videoElement);

        return {
            iconUrl
        };
    }
});
</script>

<style lang="scss" scoped>
.base-element-video {
    position: absolute;
}

.element-content {
    width: 100%;
    height: 100%;
    background-color: #000;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
}
.icon {
    font-size: 140px;
    color: #aaa;
}
.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    -webkit-user-drag: none;
}
</style>
