<template>
    <div class="ppt-editor">
        <editor-header class="layout-header" @onSave="onSave" @onDeleteWin="onDeleteWin"/>

        <div class="layout-content">
            <!-- <thumbnails class="layout-content-left" /> -->
            <elements-menu class="layout-fixed-content-left" />
            <div class="layout-content-center">
                <canvas-tool class="center-top" @setQuoteVideo="setQuoteVideo" />
                <component
                    class="center-body"
                    :style="{ height: `calc(100% - ${remarkHeight + 60}px)` }"
                    :is="currentPageComponent"
                ></component>
                <remark
                    class="center-bottom"
                    v-model:height="remarkHeight"
                    :style="{ height: `${remarkHeight}px` }"
                />
            </div>
            <toolbar class="layout-content-right" @selectGame="selectGame" @addCard="addCard" @selectVideo="selectVideo" @updateQuoteVideo="updateQuoteVideo" />
        </div>
    </div>
</template>

<script lang="ts">
import EditorHeader from "./EditorHeader/index.vue";
import CanvasBoard from "./Canvas/index.vue";
import CanvasTool from "./CanvasTool/index.vue";
// import Thumbnails from "./Thumbnails/index.vue";
import ElementsMenu from "./ElementsMenu/index.vue";
import Toolbar from "./Toolbar/index.vue";
import Remark from "./Remark/index.vue";
import Listen from "@/components/Listen/index.vue";
import Follow from "./Follow/index.vue";
import Teach from "./Teach/index.vue";
import Game from "./Game/index.vue";
import { computed, defineComponent, ref } from "vue";

import useGlobalHotkey from "@/hooks/useGlobalHotkey";
import usePasteEvent from "@/hooks/usePasteEvent";

import { IGame, IWin, PPTVideoElement, Slide, SaveType } from "@/types/slides";
import { useStore } from "@/store";
import { PAGE_TYPE } from "@/configs/page";

export default defineComponent({
    components: {
        EditorHeader,
        CanvasTool,
        ElementsMenu,
        // Thumbnails,
        Toolbar,
        Remark
    },
    setup(props, { emit }) {
        const store = useStore();
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);

        const remarkHeight = ref(40);

        const currentPageComponent = computed(() => {
            const pageTypeMap = {
                [PAGE_TYPE.ELEMENT]: CanvasBoard,
                [PAGE_TYPE.LISTEN]: Listen,
                [PAGE_TYPE.FOLLOW]: Follow,
                [PAGE_TYPE.TEACH]: Teach,
                [PAGE_TYPE.GAME]: Game
            };

            return pageTypeMap[currentSlide.value.type] || null;
        });

        useGlobalHotkey();
        usePasteEvent();

        const onSave = (slide: Slide, type: SaveType) => {
            emit("onSave", slide, type);
        };

        const onDeleteWin = () => {
            emit("onDeleteWin");
        };

        const addCard = (callback: (wins: IWin[]) => void) => {
            emit("addCard", callback);
        };

        const selectGame = (obj: {type: string, fun: (game: IGame) => void}) => {
            emit("selectGame", obj);
        };

        const selectVideo = () => {
            emit("selectVideo");
        };

        const setQuoteVideo = () => {
            emit("setQuoteVideo");
        };

        const updateQuoteVideo = (element: PPTVideoElement) => {
            emit("updateQuoteVideo", element);
        };

        return {
            currentPageComponent,
            remarkHeight,
            currentSlide,
            onSave,
            addCard,
            selectGame,
            onDeleteWin,
            selectVideo,
            setQuoteVideo,
            updateQuoteVideo
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
            height: 60px;
        }
    }
    .layout-content-right {
        width: 260px;
        height: 100%;
    }
    .layout-fixed-content-left {
        position: fixed;
        width: 235px;
        top: 0;
        height: 100%;
        z-index: 1000;
        overflow: hidden;
        pointer-events: none;
    }
}
</style>
