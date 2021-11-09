<template>
    <div
        class="screen-element-video"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div class="element-content">
            <VideoPlayer
                :videoElement="elementInfo"
                :width="elementInfo.width"
                :height="elementInfo.height"
                :src="elementInfo.src"
                :poster="elementInfo.poster"
                :scale="scale"
                v-if="elementInfo.showType == 0"
            />
            <IconVideoTwo v-if="elementInfo.showType == 1" class="video-btn" @click="openVideo"  />
            <a-modal
                title="视频"
                v-model:visible="visible"
                :footer="null"
                width="50%"
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
                />
            </a-modal>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, Ref, ref } from "vue";
import { PPTVideoElement } from "@/types/slides";

import VideoPlayer from "./VideoPlayer/index.vue";

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
    setup() {
        const scale: Ref<number> = inject("slideScale") || ref(1);

        const visible = ref(false);
        const openVideo = () => {
            visible.value = true;
        };

        return {
            scale,
            visible,
            openVideo
        };
    }
});
</script>

<style lang="scss" scoped>
.screen-element-video {
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
</style>
