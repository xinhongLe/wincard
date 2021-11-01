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
            class="element-content"
            v-contextmenu="contextmenus"
            @mousedown="($event) => handleSelectElement($event, false)"
        >
            <VideoPlayer
                :videoElement="elementInfo"
                :width="elementInfo.width"
                :height="elementInfo.height"
                :src="elementInfo.src"
                :poster="elementInfo.poster"
                :scale="scale"
                v-if="elementInfo.showType == 0"
            />
            <IconVideoTwo v-if="elementInfo.showType == 1" class="video-btn" @click="openVideo" />
            <div
                :class="['handler-border', item]"
                v-for="item in ['t', 'b', 'l', 'r']"
                :key="item"
                @mousedown="($event) => handleSelectElement($event)"
            ></div>

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
import { computed, defineComponent, PropType, ref } from "vue";
import { useStore } from "@/store";
import { PPTTableElement } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";

import VideoPlayer from "./VideoPlayer/index.vue";

export default defineComponent({
    name: "editable-element-video",
    components: {
        VideoPlayer
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTTableElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTTableElement,
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

        const handleSelectElement = (e: MouseEvent, canMove = true) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo, canMove);
        };

        const openVideo = () => {
            visible.value = true;
        };

        return {
            scale,
            handleSelectElement,
            visible,
            openVideo
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
</style>
