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
            <div class="a-menu-item delete" @click="deleteWindow" v-if="isShowDeleteBtn">
                <IconDelete /> <span class="text">删除</span>
            </div>
            <a-dropdown :trigger="['click']" v-if="isBasePPT">
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
            <a-dropdown :trigger="['click']" v-if="isBasePPT">
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
        <div class="window-name-warp" v-if="isShowName">
            <span contenteditable="true" class="name" ref="nameEditRef" @keypress="keypress" @input="onInput">{{windowName}}</span>
            <div @click="edit" class="edit-icon">
                <IconEdit fill="#1890ff" :size="16" />
            </div>
        </div>
        <div class="right">
            <div class="a-menu-item" @click="openLessonDesign()">
                <IconWord /> <span class="text">教案设计</span>
            </div>
            <div class="a-menu-item" @click="enterScreening()">
                <IconPpt fill="#666"/> <span class="text">预览</span>
            </div>
            <a-dropdown>
                <div class="a-menu-item" @click="save(SaveType.Save)">
                    <IconSave fill="#666" /> <span class="text">保存</span>
                    <IconDown v-if="isShowSaveAs"/>
                </div>
                <template #overlay v-if="isShowSaveAs">
                    <a-menu>
                        <a-menu-item @click.stop="save(SaveType.SaveAs)">另存为</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>

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
import { computed, defineComponent, inject, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import useScreening from "@/hooks/useScreening";
import useSlideHandler from "@/hooks/useSlideHandler";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useExport from "@/hooks/useExport";

import HotkeyDoc from "./HotkeyDoc.vue";
import { SaveType } from "@/types/slides";

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
        const isShowSaveAs = inject("isShowSaveAs");
        const isShowName = inject("isShowName");
        const isShowDeleteBtn = inject("isShowDeleteBtn");
        const { windowName, updateName } = inject("windowName") as any;

        const showGridLines = computed(() => store.state.showGridLines);

        const toggleGridLines = () => {
            store.commit(
                MutationTypes.SET_GRID_LINES_STATE,
                !showGridLines.value
            );
        };

        const isBasePPT = computed(() => store.getters.isBasePPT);

        const save = (type: SaveType) => {
            emit("onSave", slides.value[0], type);
        };

        const deleteWindow = () => {
            emit("onDeleteWin");
        };

        const hotkeyDrawerVisible = ref(false);

        const nameEditRef = ref<HTMLSpanElement>();

        const edit = () => {
            if (nameEditRef.value) {
                nameEditRef.value.focus();
                // 设置光标在最后
                const range = document.createRange();
                range.selectNodeContents(nameEditRef.value);
                range.collapse(false);
                const sel = window.getSelection();
                if (sel?.anchorOffset !== 0) {
                    return;
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        };

        const keypress = (e: KeyboardEvent) => {
            if (e.code === "Enter") {
                e.preventDefault();
            }
        };

        const onInput = (e: Event) => {
            const target = e.target as HTMLSpanElement;
            const text = target.textContent && target.textContent.substring(0, 20);
            target.textContent = text;
            updateName(text);
        };

        const openLessonDesign = () => {
            emit("openLessonDesign");
        };

        return {
            redo,
            undo,
            isBasePPT,
            showGridLines,
            hotkeyDrawerVisible,
            exporting,
            enterScreening,
            enterScreeningFromStart,
            createSlide,
            deleteSlide,
            toggleGridLines,
            SaveType,
            edit,
            isShowName,
            resetSlides,
            exportJSON,
            exportPPTX,
            nameEditRef,
            windowName,
            isShowSaveAs,
            isShowDeleteBtn,
            keypress,
            onInput,
            deleteWindow,
            save,
            openLessonDesign
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
.window-name-warp,
.right,
.edit-icon {
    display: flex;
    justify-content: center;
    align-items: center;
}
.window-name-warp {
    .name {
        font-size: 16px;
        font-weight: 600;
        color: #212121;
        margin-right: 10px;
        border: none;
        outline: none;
        text-align: right;
        min-width: 5px;
    }
    .edit-icon {
        cursor: pointer;
    }
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
    &.delete {
        color: #ff6b6b;
    }

    .text {
        margin-left: 4px;
    }
}

.a-menu-item:hover {
    background-color: $lightGray;
}
</style>
