<template>
    <div
        class="editable-element-video"
        :class="{ lock: elementInfo.lock }"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div
            class="rotate-wrapper"
            :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
            v-if="elementInfo.showType == 1"
        >
            <div
                class="element-content"
                v-contextmenu="contextmenus"
                @mousedown="($event) => handleSelectElement($event)"
            >
                <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="">
                <img class="icon-image" v-else src="@/assets/images/video.png" alt="">
            </div>
        </div>
        <div
            class="element-content"
            v-contextmenu="contextmenus"
            @mousedown="($event) => handleSelectElement($event, false)"
            v-if="elementInfo.showType == 0"
        >
            <VideoPlayer
                ref="videoRef"
                :videoElement="elementInfo"
                :width="elementInfo.width"
                :height="elementInfo.height"
                :src="elementInfo.src"
                :poster="elementInfo.poster"
                :scale="scale"
            />

            <div
                :class="['handler-border', item]"
                v-for="item in ['t', 'b', 'l', 'r']"
                :key="item"
                @mousedown="($event) => handleSelectElement($event)"
            ></div>
        </div>
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
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { useStore } from "@/store";
import { PPTVideoElement } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";

import VideoPlayer from "./VideoPlayer/index.vue";
import useOssVideo from "./VideoPlayer/useOssVideo";
import { isFullscreen } from "@/utils/fullscreen";

export default defineComponent({
    name: "editable-element-video",
    components: {
        VideoPlayer
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTVideoElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTVideoElement,
                    canMove?: boolean
                ) => void
            >,
            required: true
        },
        contextmenus: {
            type: Function as PropType<() => ContextmenuItem[]>
        }
    },
    setup(props) {
        const store = useStore();
        const scale = computed(() => store.state.canvasScale);
        const visible = ref(false);
        const videoRef = ref();

        const handleSelectElement = (e: MouseEvent, canMove = true) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo, canMove);
        };

        const openVideo = () => {
            visible.value = true;
        };

        const videoElement = computed(() => props.elementInfo);
        const { iconUrl } = useOssVideo(videoElement);

        // 预览全屏停止播放
        window.addEventListener("resize", () => {
            if (isFullscreen() && videoRef.value) videoRef.value.pause();
        });

        return {
            scale,
            iconUrl,
            handleSelectElement,
            visible,
            openVideo,
            videoRef
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-video {
    position: absolute;

    &.lock .handler-border {
        cursor: default;
    }
}
.rotate-wrapper {
    width: 100%;
    height: 100%;
}
.element-content {
    width: 100%;
    height: 100%;
    position: relative;
}
.handler-border {
    position: absolute;
    cursor: move;

    &.t {
        width: 100%;
        height: 20px;
        top: 0;
        left: 0;
    }
    &.b {
        width: 100%;
        height: 5px;
        bottom: 0;
        left: 0;
    }
    &.l {
        width: 10px;
        height: 100%;
        left: 0;
        top: 0;
    }
    &.r {
        width: 10px;
        height: 100%;
        right: 0;
        top: 0;
    }
}
.video-btn {
    font-size: 40px;
}
.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    -webkit-user-drag: none;
    cursor: move;
}
</style>
