<template>
    <div class="ppt-editor">
        <editor-header class="layout-header" @onSave="onSave" />

        <div class="layout-content">
            <!-- <thumbnails class="layout-content-left" /> -->
            <div class="layout-content-center">
                <canvas-tool class="center-top" />
                <canvas-board
                    class="center-body"
                    :style="{ height: `calc(100% - ${remarkHeight + 40}px)` }"
                />
                <remark
                    class="center-bottom"
                    v-model:height="remarkHeight"
                    :style="{ height: `${remarkHeight}px` }"
                />
            </div>
            <toolbar class="layout-content-right" />
        </div>
    </div>
</template>

<script lang="ts">
import EditorHeader from "./EditorHeader/index.vue";
import CanvasBoard from "./Canvas/index.vue";
import CanvasTool from "./CanvasTool/index.vue";
// import Thumbnails from "./Thumbnails/index.vue";
import Toolbar from "./Toolbar/index.vue";
import Remark from "./Remark/index.vue";
import { defineComponent, ref } from "vue";

import useGlobalHotkey from "@/hooks/useGlobalHotkey";

import { Slide } from "@/types/slides";
export default defineComponent({
    components: {
        EditorHeader,
        CanvasBoard,
        CanvasTool,
        // Thumbnails,
        Toolbar,
        Remark
    },
    setup(props, { emit }) {
        const remarkHeight = ref(40);

        useGlobalHotkey();

        const onSave = (slide: Slide) => {
            emit("onSave", slide);
        };

        return {
            remarkHeight,
            onSave
        };
    }
});
</script>

<style lang="scss" scoped>
.ppt-editor {
    height: 100%;

    .layout-header {
        height: 40px;
    }

    .layout-content {
        height: calc(100% - 40px);
        display: flex;
    }

    .layout-content-left {
        width: 160px;
        height: 100%;
        flex-shrink: 0;
    }
    .layout-content-center {
        width: calc(100% - 260px);

        .center-top {
            height: 40px;
        }
    }
    .layout-content-right {
        width: 260px;
        height: 100%;
    }
}
</style>
