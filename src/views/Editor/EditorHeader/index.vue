<template>
    <div class="editor-header">
        <div class="left">
            <!-- <a-dropdown :trigger="['click']">
                <div class="a-menu-item">
                    <IconFolderClose /> <span class="text">文件</span>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="exportJSON()">导出 JSON</a-menu-item>
                        <a-menu-item @click="exportPPTX()">导出 PPTX</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown> -->
            <a-dropdown :trigger="['click']">
                <div class="a-menu-item">
                    <IconEdit /> <span class="text">编辑</span>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="undo()">撤销</a-menu-item>
                        <a-menu-item @click="redo()">重做</a-menu-item>
                        <!-- <a-menu-item @click="createSlide()">添加页面</a-menu-item>
                        <a-menu-item @click="deleteSlide()">删除页面</a-menu-item> -->
                        <a-menu-item @click="toggleGridLines()">{{
                            showGridLines ? "关闭网格线" : "打开网格线"
                        }}</a-menu-item>
                        <a-menu-item @click="resetSlides()">重置幻灯片</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
            <!-- <a-dropdown :trigger="['click']">
                <div class="a-menu-item">
                    <IconPpt /> <span class="text">演示</span>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="enterScreeningFromStart()"
                            >从头开始</a-menu-item
                        >
                        <a-menu-item @click="enterScreening()"
                            >从当前页开始</a-menu-item
                        >
                    </a-menu>
                </template>
            </a-dropdown> -->
            <a-dropdown :trigger="['click']">
                <div class="a-menu-item">
                    <IconHelpcenter /> <span class="text">帮助</span>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="hotkeyDrawerVisible = true"
                            >快捷键</a-menu-item
                        >
                    </a-menu>
                </template>
            </a-dropdown>
        </div>

        <div class="right">
            <!-- <a-tooltip :mouseLeaveDelay="0" title="幻灯片放映">
                <div class="a-menu-item" @click="enterScreening()">
                    <IconPpt size="18" fill="#666" style="margin-top: 2px;" />
                </div>
            </a-tooltip> -->
            <a-tooltip :mouseLeaveDelay="0" title="保存">
                <div class="a-menu-item" @click="save()">
                    <IconSave size="18" fill="#666" style="margin-top: 2px;" />
                </div>
            </a-tooltip>
        </div>

        <a-drawer
            width="320"
            placement="right"
            :visible="hotkeyDrawerVisible"
            @close="hotkeyDrawerVisible = false"
        >
            <HotkeyDoc />
        </a-drawer>

        <!-- <FullscreenSpin :loading="exporting" tip="正在导出..." /> -->
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import useScreening from "@/hooks/useScreening";
import useSlideHandler from "@/hooks/useSlideHandler";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useExport from "@/hooks/useExport";

import HotkeyDoc from "./HotkeyDoc.vue";

export default defineComponent({
    name: "editor-header",
    components: {
        HotkeyDoc
    },
    setup(props, { emit }) {
        const store = useStore();

        const { enterScreening, enterScreeningFromStart } = useScreening();
        const { createSlide, deleteSlide, resetSlides } = useSlideHandler();
        const { redo, undo } = useHistorySnapshot();
        const { exporting, exportJSON, exportPPTX } = useExport();
        const slides = computed(() => store.state.slides);

        const showGridLines = computed(() => store.state.showGridLines);
        const toggleGridLines = () => {
            store.commit(
                MutationTypes.SET_GRID_LINES_STATE,
                !showGridLines.value
            );
        };

        const save = () => {
            emit("onSave", slides.value[0]);
        };

        const hotkeyDrawerVisible = ref(false);

        return {
            redo,
            undo,
            showGridLines,
            hotkeyDrawerVisible,
            exporting,
            enterScreening,
            enterScreeningFromStart,
            createSlide,
            deleteSlide,
            toggleGridLines,
            resetSlides,
            exportJSON,
            exportPPTX,
            save
        };
    }
});
</script>

<style lang="scss" scoped>
.editor-header {
    background-color: #fff;
    user-select: none;
    border-bottom: 1px solid $borderColor;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
}
.left,
.right {
    display: flex;
    justify-content: center;
    align-items: center;
}
.a-menu-item {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    padding: 0 10px;
    transition: background-color $transitionDelay;
    cursor: pointer;

    .text {
        margin-left: 4px;
    }
}

.left .a-menu-item:hover {
    background-color: $lightGray;
}
</style>
