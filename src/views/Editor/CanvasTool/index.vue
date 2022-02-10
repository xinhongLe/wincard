<template>
    <div class="canvas-tool">
        <div class="left-handler" v-if="isBasePPT">
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="撤销">
                <IconBack
                    class="handler-item"
                    :class="{ disable: !canUndo }"
                    @click="undo()"
                />
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="重做">
                <IconNext
                    class="handler-item"
                    :class="{ disable: !canRedo }"
                    @click="redo()"
                />
            </a-tooltip>
        </div>
        <div class="left-handler" v-if="!isBasePPT"></div>
        <div class="add-element-handler" v-if="isBasePPT">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入文字"
            >
                <div
                    class="tools-icon"
                    :class="
                        creatingElement &&
                        creatingElement.type === 'text' &&
                        'active'
                    "
                    @click="drawText()"
                >
                    <img src="@/assets/images/icon_wb.png" alt="">
                    文本
                </div>
                <!-- <IconFontSize
                    class="handler-item"
                    :class="
                        creatingElement &&
                        creatingElement.type === 'text' &&
                        'active'
                    "
                    @click="drawText()"
                /> -->
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入图片"
                v-if="checkElectron"
            >
                <div
                    class="tools-icon"
                    @click="electronUpload('image')"
                >
                    <img src="@/assets/images/icon_tp.png" alt="">
                    图片
                </div>
                <!-- <IconPicture class="handler-item" @click="electronUpload('image')" /> -->
            </a-tooltip>
            <FileInput v-if="!checkElectron" @change="files => insertImageElement(files)">
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入图片"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_tp.png" alt="">
                        图片
                    </div>
                    <!-- <IconPicture class="handler-item" /> -->
                </a-tooltip>
            </FileInput>
            <a-popover
                trigger="click"
                v-model:visible="shapePoolVisible"
                placement="bottom"
            >
                <template #content>
                    <ShapePool @select="(shape) => drawShape(shape)" />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入形状"
                >
                    <div
                        class="tools-icon"
                        :class="
                            creatingElement &&
                            creatingElement.type === 'shape' &&
                            'active'
                        "
                    >
                        <img src="@/assets/images/icon_xz.png" alt="">
                        形状
                    </div>
                    <!-- <IconGraphicDesign
                        class="handler-item"
                        :class="
                            creatingElement &&
                            creatingElement.type === 'shape' &&
                            'active'
                        "
                    /> -->
                </a-tooltip>
            </a-popover>
            <a-popover
                trigger="click"
                v-model:visible="linePoolVisible"
                placement="bottom"
            >
                <template #content>
                    <LinePool @select="(line) => drawLine(line)" />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入线条"
                >
                    <div
                        class="tools-icon"
                        :class="
                            creatingElement &&
                            creatingElement.type === 'line' &&
                            'active'
                        "
                    >
                        <img src="@/assets/images/icon_xt.png" alt="">
                        线条
                    </div>
                    <!-- <IconConnection
                        class="handler-item"
                        :class="
                            creatingElement &&
                            creatingElement.type === 'line' &&
                            'active'
                        "
                    /> -->
                </a-tooltip>
            </a-popover>
            <a-popover
                trigger="click"
                v-model:visible="chartPoolVisible"
                placement="bottom"
            >
                <template #content>
                    <ChartPool
                        @select="
                            (chart) => {
                                createChartElement(chart);
                                chartPoolVisible = false;
                            }
                        "
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入图表"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_tb.png" alt="">
                        图表
                    </div>
                    <!-- <IconChartProportion class="handler-item" /> -->
                </a-tooltip>
            </a-popover>
            <a-popover
                trigger="click"
                v-model:visible="tableGeneratorVisible"
                placement="bottom"
            >
                <template #content>
                    <TableGenerator
                        @close="tableGeneratorVisible = false"
                        @insert="
                            ({ row, col }) => {
                                createTableElement(row, col);
                                tableGeneratorVisible = false;
                            }
                        "
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入表格"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_bg.png" alt="">
                        表格
                    </div>
                    <!-- <IconInsertTable class="handler-item" /> -->
                </a-tooltip>
            </a-popover>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入公式"
            >
                <div
                    class="tools-icon"
                    @click="latexEditorVisible = true"
                >
                    <img src="@/assets/images/icon_gs.png" alt="">
                    公式
                </div>
                <!-- <IconFormula
                    class="handler-item"
                    @click="latexEditorVisible = true"
                /> -->
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入音频"
                v-if="checkElectron"
            >
                <div
                    class="tools-icon"
                    @click="electronUpload('audio')"
                >
                    <img src="@/assets/images/icon_yp.png" alt="">
                    音频
                </div>
                <!-- <IconAudioFile class="handler-item" @click="electronUpload('audio')" /> -->
            </a-tooltip>
            <FileInput
                accept="audio/*"
                @change="(files) => insertAudioElement(files)"
                v-if="!checkElectron"
            >
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入音频"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_yp.png" alt="">
                        音频
                    </div>
                    <!-- <IconAudioFile class="handler-item" /> -->
                </a-tooltip>
            </FileInput>
            <a-popover
                trigger="click"
                v-model:visible="videoInputVisible"
                placement="bottom"
            >
                <template #content>
                    <VideoInput />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入视频"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_sp.png" alt="">
                        视频
                    </div>
                    <!-- <IconVideoTwo class="handler-item" /> -->
                </a-tooltip>
            </a-popover>
            <a-popover
                trigger="click"
                v-model:visible="WebIFramesVisible"
                placement="bottom"
            >
                <template #content>
                    <WebIFrame
                        @close="WebIFramesVisible = false"
                        @insert="insertWebIFrameElement"
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入网页"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_wy.png" alt="">
                        网页
                    </div>
                    <!-- <IconWeb class="handler-item" /> -->
                </a-tooltip>
            </a-popover>
            <FileInput
                accept="application/x-shockwave-flash"
                @change="(files) => insertFlashElement(files)"
            >
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="插入Flash"
                >
                    <div
                        class="tools-icon"
                    >
                        <img src="@/assets/images/icon_flash.png" alt="">
                        Flash
                    </div>
                    <!-- <IconVideoFile class="handler-item" /> -->
                </a-tooltip>
            </FileInput>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="打点批注"
            >
                <IconBookMark
                    @click="insertMarkElement()"
                    class="handler-item"
                />
            </a-tooltip>
        </div>

        <div class="right-handler">
            <IconMinus
                class="handler-item viewport-size"
                @click="scaleCanvas('-')"
            />
            <span class="text">{{ canvasScalePercentage }}</span>
            <IconPlus
                class="handler-item viewport-size"
                @click="scaleCanvas('+')"
            />
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="适配屏幕"
            >
                <IconFullScreen
                    class="handler-item viewport-size-adaptation"
                    @click="setCanvasPercentage(90)"
                />
            </a-tooltip>
        </div>

        <a-modal
            v-model:visible="latexEditorVisible"
            :footer="null"
            centered
            :width="880"
            destroyOnClose
        >
            <LaTeXEditor
                @close="latexEditorVisible = false"
                @update="
                    (data) => {
                        createLatexElement(data);
                        latexEditorVisible = false;
                    }
                "
            />
        </a-modal>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { uploadImage } from "@/utils/image";
import { uploadAudio } from "@/utils/audio";
import { uploadFlash } from "@/utils/flash";
import { ShapePoolItem } from "@/configs/shapes";
import { LinePoolItem } from "@/configs/lines";
import useScaleCanvas from "@/hooks/useScaleCanvas";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCreateElement from "@/hooks/useCreateElement";
import useElectronUpload from "@/hooks/useElectronUpload";

import ShapePool from "./ShapePool.vue";
import LinePool from "./LinePool.vue";
import ChartPool from "./ChartPool.vue";
import TableGenerator from "./TableGenerator.vue";
import VideoInput from "./VideoInput.vue";
import LaTeXEditor from "@/components/LaTeXEditor/index.vue";
import WebIFrame from "./WebIFrame.vue";
import isElectron from "is-electron";

export default defineComponent({
    name: "canvas-tool",
    components: {
        ShapePool,
        LinePool,
        ChartPool,
        TableGenerator,
        VideoInput,
        LaTeXEditor,
        WebIFrame
    },
    setup() {
        const store = useStore();
        const canvasScale = computed(() => store.state.canvasScale);
        const canUndo = computed(() => store.getters.canUndo);
        const canRedo = computed(() => store.getters.canRedo);
        const creatingElement = computed(() => store.state.creatingElement);

        const canvasScalePercentage = computed(
            () => parseInt(canvasScale.value * 100 + "") + "%"
        );

        const { scaleCanvas, setCanvasPercentage } = useScaleCanvas();
        const { redo, undo } = useHistorySnapshot();

        const {
            createImageElement,
            createChartElement,
            createTableElement,
            createLatexElement,
            createAudioElement,
            createWebIFrameElement,
            createFlashElement,
            createMarkElement
        } = useCreateElement();

        const insertImageElement = (files: File[], buffer?: ArrayBuffer) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile, buffer).then((key) => {
                createImageElement(key);
            });
        };

        const insertAudioElement = (files: File[], buffer?: ArrayBuffer) => {
            const audioFile = files[0];
            if (!audioFile) return;
            uploadAudio(audioFile, buffer).then((key) => {
                createAudioElement(key);
            });
        };

        const insertFlashElement = (files: File[], buffer?: ArrayBuffer) => {
            const flashFile = files[0];
            if (!flashFile) return;
            uploadFlash(flashFile).then((key) => {
                createFlashElement(key);
            });
        };

        const shapePoolVisible = ref(false);
        const linePoolVisible = ref(false);
        const chartPoolVisible = ref(false);
        const tableGeneratorVisible = ref(false);
        const videoInputVisible = ref(false);
        const latexEditorVisible = ref(false);
        const WebIFramesVisible = ref(false);

        // 绘制文字范围
        const drawText = () => {
            store.commit(MutationTypes.SET_CREATING_ELEMENT, {
                type: "text",
                data: null
            });
        };

        // 绘制形状范围
        const drawShape = (shape: ShapePoolItem) => {
            store.commit(MutationTypes.SET_CREATING_ELEMENT, {
                type: "shape",
                data: shape
            });
            shapePoolVisible.value = false;
        };

        // 绘制线条路径
        const drawLine = (line: LinePoolItem) => {
            store.commit(MutationTypes.SET_CREATING_ELEMENT, {
                type: "line",
                data: line
            });
            linePoolVisible.value = false;
        };

        // 插入网页
        const insertWebIFrameElement = (src: string) => {
            createWebIFrameElement(src);
            WebIFramesVisible.value = false;
        };

        // 插入批注
        const insertMarkElement = () => {
            createMarkElement();
        };

        const isBasePPT = computed(() => store.getters.isBasePPT);

        const checkElectron = ref(isElectron());
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = (type: string) => {
            uploadByElectron(type, (file: File, buffer: ArrayBuffer) => {
                if (type === "image") insertImageElement([file], buffer);
                if (type === "audio") insertAudioElement([file], buffer);
            });
        };

        return {
            scaleCanvas,
            setCanvasPercentage,
            isBasePPT,
            canvasScalePercentage,
            canUndo,
            canRedo,
            redo,
            undo,
            insertAudioElement,
            insertImageElement,
            insertWebIFrameElement,
            insertFlashElement,
            shapePoolVisible,
            linePoolVisible,
            chartPoolVisible,
            tableGeneratorVisible,
            videoInputVisible,
            latexEditorVisible,
            WebIFramesVisible,
            drawText,
            drawShape,
            drawLine,
            createChartElement,
            createTableElement,
            createLatexElement,
            creatingElement,
            insertMarkElement,
            electronUpload,
            checkElectron
        };
    }
});
</script>

<style lang="scss" scoped>
.canvas-tool {
    position: relative;
    border-bottom: 1px solid $borderColor;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 13px;
    user-select: none;
}
.left-handler {
    display: flex;
    align-items: center;
}
.add-element-handler {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    .handler-item {
        padding: 5px;
        border-radius: 4px;
        &.active {
            background: #eee;
        }
    }
}
.handler-item {
    margin: 0 10px;
    font-size: 14px;
    cursor: pointer;

    &.disable {
        opacity: 0.5;
    }
}
.right-handler {
    display: flex;
    align-items: center;

    .text {
        width: 40px;
        text-align: center;
    }

    .viewport-size {
        font-size: 13px;
    }
}

.tools-icon {
    img {
        display: block;
        width: 24px;
        margin: 0 auto 4px;
    }
    font-size: 13px;
    transform: scale(0.8);
    color: #5D5D5D;
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 3px;
    white-space: nowrap;
    &.disable {
        opacity: 0.5;
    }
    &.active {
        background: #eee;
    }
}
</style>
