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
        <div class="element-content" v-if="elementInfo.showType == 0">
            <VideoPlayer
                :videoElement="elementInfo"
                :width="elementInfo.width"
                :height="elementInfo.height"
                :src="elementInfo.src"
                :poster="elementInfo.poster"
                :scale="scale"
                :isScreening="true"
            />
        </div>
        <div class="element-content" v-if="elementInfo.showType == 1">
            <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="" @click="openVideo">
            <img class="icon-image" v-else src="@/assets/images/video.png" alt="" @click="openVideo">
            <a-modal
                title="视频"
                v-if="visible"
                v-model:visible="visible"
                :footer="null"
                width="90%"
                dialogClass="reset-video-modal"
            >
                <VideoPlayer
                    :noTransform="true"
                    :videoElement="elementInfo"
                    :width="elementInfo.width"
                    :height="elementInfo.height"
                    :src="elementInfo.src"
                    :poster="elementInfo.poster"
                    :scale="scale"
                    v-if="elementInfo.showType == 1"
                    :isScreening="true"
                />
            </a-modal>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, Ref, ref } from "vue";
import { PPTVideoElement } from "@/types/slides";

import VideoPlayer from "./VideoPlayer/index.vue";
import useOssVideo from "./VideoPlayer/useOssVideo";

export default defineComponent({
    name: "screen-element-video",
    components: {
        VideoPlayer
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTVideoElement>,
            required: true
        }
    },
    setup(props) {
        const scale: Ref<number> = inject("slideScale") || ref(1);

        const visible = ref(false);
        const openVideo = () => {
            visible.value = true;
        };

        const videoElement = computed(() => props.elementInfo);
        const { iconUrl } = useOssVideo(videoElement, true);

        return {
            scale,
            iconUrl,
            visible,
            openVideo
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
}

.video-btn {
    font-size: 40px;
    cursor: pointer;
}
.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
    -webkit-user-drag: none;
}
</style>

<style>
.reset-video-modal {
    top: 50% !important;
    transform: translateY(-50%) !important;
    animation: none !important;
}

.reset-video-modal video {
    max-height: 80vh;
}
</style>
