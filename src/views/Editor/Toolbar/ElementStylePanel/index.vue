<template>
    <div class="element-style-panel">
        <div v-if="!currentPanelComponent">请先选中要编辑的元素</div>
        <a-form
            v-if="currentPanelComponent"
            :model="formState"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 17 }"
        >
            <a-form-item label="元素名称" style="margin-bottom: 10px;">
                <a-input
                    style="width: 100%;"
                    v-model:value="formState.name"
                    @change="updateName"
                />
            </a-form-item>
            <a-divider />
            <a-form-item label="编辑状态" style="margin-bottom: 10px;">
                <a-switch
                    style="float: right;"
                    :checked="editChecked"
                    @change="onEditChange"
                />
            </a-form-item>
        </a-form>
        <a-divider />
        <component
            v-if="handleElement"
            :is="currentPanelComponent"
            @updateQuoteVideo="updateQuoteVideo"
        ></component>
        <div v-if="!currentPanelComponent">
            <a-input-group compact class="row">
                <a-select
                    style="flex: 3;"
                    :value="richTextAttrs.fontname"
                    @change="value => emitRichTextCommand('fontname', value)"
                >
                    <template #suffixIcon><IconFontSize /></template>
                    <a-select-opt-group label="系统字体">
                        <a-select-option
                            v-for="font in baseFonts"
                            :key="font.value"
                            :value="font.value"
                        >
                            <span :style="{ fontFamily: font.value }">{{
                                font.label
                            }}</span>
                        </a-select-option>
                    </a-select-opt-group>
                </a-select>
                <a-select
                    show-search
                    style="flex: 2;"
                    :value="richTextAttrs.fontsize"
                    @change="value => emitRichTextCommand('fontsize', value)"
                >
                    <template #suffixIcon><IconAddText /></template>
                    <a-select-option
                        v-for="fontsize in fontSizeOptions"
                        :key="fontsize"
                        :value="fontsize"
                    >
                        {{ fontsize }}
                    </a-select-option>
                </a-select>
            </a-input-group>

            <a-button-group class="row">
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="richTextAttrs.color"
                            @update:modelValue="
                                value => emitRichTextCommand('color', value)
                            "
                        />
                    </template>
                    <a-tooltip
                        :mouseLeaveDelay="0"
                        :mouseEnterDelay="0.5"
                        title="文字颜色"
                    >
                        <a-button class="text-color-btn" style="flex: 1;">
                            <IconText />
                            <div
                                class="text-color-block"
                                :style="{
                                    backgroundColor: richTextAttrs.color
                                }"
                            ></div>
                        </a-button>
                    </a-tooltip>
                </a-popover>
            </a-button-group>

            <CheckboxButtonGroup class="row">
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="加粗"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.bold"
                        @click="
                            emitRichTextCommand('bold', !richTextAttrs.bold)
                        "
                        ><IconTextBold
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="斜体"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.em"
                        @click="emitRichTextCommand('em', !richTextAttrs.em)"
                        ><IconTextItalic
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="下划线"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.underline"
                        @click="
                            emitRichTextCommand(
                                'underline',
                                !richTextAttrs.underline
                            )
                        "
                        ><IconTextUnderline
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="删除线"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.strikethrough"
                        @click="
                            emitRichTextCommand(
                                'strikethrough',
                                !richTextAttrs.strikethrough
                            )
                        "
                        ><IconStrikethrough
                    /></CheckboxButton>
                </a-tooltip>
            </CheckboxButtonGroup>

            <CheckboxButtonGroup class="row">
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="上标"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.superscript"
                        @click="
                            emitRichTextCommand(
                                'superscript',
                                !richTextAttrs.superscript
                            )
                        "
                        ><IconUpOne
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="下标"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.subscript"
                        @click="
                            emitRichTextCommand(
                                'subscript',
                                !richTextAttrs.subscript
                            )
                        "
                        ><IconDownOne
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="行内代码"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.code"
                        @click="
                            emitRichTextCommand('code', !richTextAttrs.code)
                        "
                        ><IconCode
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="引用"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        :checked="richTextAttrs.blockquote"
                        @click="
                            emitRichTextCommand(
                                'blockquote',
                                !richTextAttrs.blockquote
                            )
                        "
                        ><IconQuote
                    /></CheckboxButton>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="清除格式"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        @click="emitRichTextCommand('clear')"
                        ><IconFormat
                    /></CheckboxButton>
                </a-tooltip>
            </CheckboxButtonGroup>

            <a-divider />

            <a-radio-group
                class="row"
                button-style="solid"
                :value="richTextAttrs.align"
                @change="e => emitRichTextCommand('align', e.target.value)"
            >
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="左对齐"
                >
                    <a-radio-button value="left" style="flex: 1;"
                        ><IconAlignTextLeft
                    /></a-radio-button>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="居中"
                >
                    <a-radio-button value="center" style="flex: 1;"
                        ><IconAlignTextCenter
                    /></a-radio-button>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="右对齐"
                >
                    <a-radio-button value="right" style="flex: 1;"
                        ><IconAlignTextRight
                    /></a-radio-button>
                </a-tooltip>
            </a-radio-group>

            <a-divider />
            <div class="row">
                <div style="flex: 2;">行间距：</div>
                <a-select
                    show-search
                    style="flex: 3;"
                    :value="lineHeight"
                    @change="value => updateLineHeight(value)"
                >
                    <template #suffixIcon><IconRowHeight /></template>
                    <a-select-option
                        v-for="item in lineHeightOptions"
                        :key="item"
                        :value="item"
                        >{{ item }}px</a-select-option
                    >
                </a-select>
            </div>

            <a-divider />
            <ElementOutline batch />
        </div>
    </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import {
    computed,
    ComputedRef,
    defineComponent,
    reactive,
    ref,
    watch
} from "vue";
import { MutationTypes, useStore } from "@/store";
import { ElementTypes, PPTElement, PPTVideoElement } from "@/types/slides";

import TextStylePanel from "./TextStylePanel.vue";
import ImageStylePanel from "./ImageStylePanel.vue";
import ShapeStylePanel from "./ShapeStylePanel.vue";
import LineStylePanel from "./LineStylePanel.vue";
import ChartStylePanel from "./ChartStylePanel/index.vue";
import TableStylePanel from "./TableStylePanel.vue";
import LatexStylePanel from "./LatexStylePanel.vue";
import VideoStylePanel from "./VideoStylePanel.vue";
import AudioStylePanel from "./AudioStylePanel.vue";
import IFrameStylePanel from "./IFrameStylePanel.vue";
import FlashStylePanel from "./FlashStylePanel.vue";
import MarkStylePanel from "./MarkStylePanel.vue";
import ElementOutline from "../common/ElementOutline.vue";
import { logInput, LOG_EVENT } from "@/utils/log";
import { defaultRichTextAttrs } from "@/utils/prosemirror/utils";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { BASE_FONTS, WEB_FONTS } from "@/configs/font";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

const webFonts = WEB_FONTS;
const baseFonts = BASE_FONTS;

export default defineComponent({
    name: "element-style-panel",
    components: { ElementOutline },
    setup(props, { emit }) {
        const store = useStore();
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );

        const currentPanelComponent: ComputedRef | null = computed(() => {
            if (!handleElement.value) return null;

            const panelMap = {
                [ElementTypes.TEXT]: TextStylePanel,
                [ElementTypes.IMAGE]: ImageStylePanel,
                [ElementTypes.SHAPE]: ShapeStylePanel,
                [ElementTypes.LINE]: LineStylePanel,
                [ElementTypes.CHART]: ChartStylePanel,
                [ElementTypes.TABLE]: TableStylePanel,
                [ElementTypes.LATEX]: LatexStylePanel,
                [ElementTypes.AUDIO]: AudioStylePanel,
                [ElementTypes.VIDEO]: VideoStylePanel,
                [ElementTypes.IFRAME]: IFrameStylePanel,
                [ElementTypes.FLASH]: FlashStylePanel,
                [ElementTypes.MARK]: MarkStylePanel
            };
            return panelMap[handleElement.value.type] || null;
        });

        const formState = reactive({
            name: handleElement.value ? handleElement.value.name : ""
        });

        watch(handleElement, () => {
            formState.name = handleElement.value
                ? handleElement.value.name
                : "";
        });

        const updateName = debounce(() => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    name: formState.name
                }
            });
            logInput(
                `更改元素名 ${handleElement.value.name} 为 ${formState.name}`,
                LOG_EVENT.UPDATE_ELEMENT
            );
        }, 300);

        const editChecked = computed(() => {
            return handleElement.value.id === store.state.editElementID;
        });

        const onEditChange = (checked: boolean) => {
            if (checked) {
                store.commit(
                    MutationTypes.EDIT_ELEMENT_ID,
                    handleElement.value.id
                );
            } else {
                store.commit(MutationTypes.EDIT_ELEMENT_ID, "");
            }
        };

        const updateQuoteVideo = (element: PPTVideoElement) => {
            emit("updateQuoteVideo", element);
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const richTextAttrs = ref(defaultRichTextAttrs);

        const emitRichTextCommand = (command: string, value?: string) => {
            richTextAttrs.value[command] = value;
            emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { command, value });
        };

        const fontSizeOptions = Array.from({ length: 245 }, (v, k) => k + 12 + "px");
        const lineHeightOptions = Array.from({ length: 232 }, (v, k) => k + 24);
        const lineHeight = ref(1.2);

        // 设置行高
        const updateLineHeight = (value: number) => {
            const props = { lineHeight: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: store.state.activeElementIdList,
                props
            });
            addHistorySnapshot();
        };

        return {
            formState,
            handleElement,
            updateName,
            currentPanelComponent,
            editChecked,
            onEditChange,
            updateQuoteVideo,
            emitRichTextCommand,
            richTextAttrs,
            webFonts,
            baseFonts,
            fontSizeOptions,
            lineHeightOptions,
            updateLineHeight,
            lineHeight
        };
    }
});
</script>

<style scoped>
.row {
    width: 100%;
    display: flex !important;
    align-items: center;
    margin-bottom: 10px;
}
</style>
