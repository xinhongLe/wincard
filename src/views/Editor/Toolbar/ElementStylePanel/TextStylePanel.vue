<template>
    <div class="text-style-panel">
        <div class="preset-style">
            <div
                class="preset-style-item"
                v-for="item in presetStyles"
                :key="item.label"
                :style="item.style"
                @click="emitBatchRichTextCommand(item.cmd)"
            >
                {{ item.label }}
            </div>
        </div>

        <a-divider />

        <a-input-group class="row">
            <a-select
                style="flex: 3;"
                :value="richTextAttrs.fontname"
                @change="value => emitRichTextCommand('fontname', value)"
            >
                <template #suffixIcon><IconFontSize /></template>
                <a-select-opt-group label="基础字体">
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
                <!-- <a-select-opt-group label="在线字体">
                    <a-select-option
                        v-for="font in webFonts"
                        :key="font.value"
                        :value="font.value"
                    >
                        <span>{{ font.label }}</span>
                    </a-select-option>
                </a-select-opt-group> -->
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
            <a-popover placement="bottom" trigger="click">
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
                            :style="{ backgroundColor: richTextAttrs.color }"
                        ></div>
                    </a-button>
                </a-tooltip>
            </a-popover>
            <a-popover placement="bottom" trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="richTextAttrs.backcolor"
                        @update:modelValue="
                            value => emitRichTextCommand('backcolor', value)
                        "
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="文字高亮"
                >
                    <a-button class="text-color-btn" style="flex: 1;">
                        <IconBackgroundColor />
                        <div
                            class="text-color-block"
                            :style="{
                                backgroundColor: richTextAttrs.backcolor
                            }"
                        ></div>
                    </a-button>
                </a-tooltip>
            </a-popover>
            <a-popover placement="bottom" trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="fill"
                        @update:modelValue="value => updateFill(value)"
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="文本框填充"
                >
                    <a-button class="text-color-btn" style="flex: 1;">
                        <IconFill />
                        <div
                            class="text-color-block"
                            :style="{ backgroundColor: fill }"
                        ></div>
                    </a-button>
                </a-tooltip>
            </a-popover>
        </a-button-group>

        <CheckboxButtonGroup class="row">
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="加粗">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.bold"
                    @click="emitRichTextCommand('bold')"
                    ><IconTextBold
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="斜体">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.em"
                    @click="emitRichTextCommand('em')"
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
                    @click="emitRichTextCommand('underline')"
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
                    @click="emitRichTextCommand('strikethrough')"
                    ><IconStrikethrough
                /></CheckboxButton>
            </a-tooltip>
        </CheckboxButtonGroup>

        <CheckboxButtonGroup class="row">
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="上标">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.superscript"
                    @click="emitRichTextCommand('superscript')"
                    ><IconUpOne
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="下标">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.subscript"
                    @click="emitRichTextCommand('subscript')"
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
                    @click="emitRichTextCommand('code')"
                    ><IconCode
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="引用">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.blockquote"
                    @click="emitRichTextCommand('blockquote')"
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
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="居中">
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

        <CheckboxButtonGroup class="row">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="项目符号"
            >
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.bulletList"
                    @click="emitRichTextCommand('bulletList')"
                    ><IconList
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="编号">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.orderedList"
                    @click="emitRichTextCommand('orderedList')"
                    ><IconOrderedList
                /></CheckboxButton>
            </a-tooltip>
        </CheckboxButtonGroup>

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
        <div class="row">
            <div style="flex: 2;">字间距：</div>
            <a-select
                style="flex: 3;"
                :value="wordSpace"
                @change="value => updateWordSpace(value)"
            >
                <template #suffixIcon><IconFullwidth /></template>
                <a-select-option
                    v-for="item in wordSpaceOptions"
                    :key="item"
                    :value="item"
                    >{{ item }}px</a-select-option
                >
            </a-select>
        </div>

        <a-divider />
        <ElementOutline />
        <a-divider />
        <ElementShadow />
        <a-divider />
        <ElementOpacity />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTTextElement } from "@/types/slides";
import emitter, { EmitterEvents, RichTextCommand } from "@/utils/emitter";
import { BASE_FONTS, WEB_FONTS } from "@/configs/font";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import ElementOpacity from "../common/ElementOpacity.vue";
import ElementOutline from "../common/ElementOutline.vue";
import ElementShadow from "../common/ElementShadow.vue";

const presetStyles = [
    {
        label: "大标题",
        style: {
            fontSize: "26px",
            fontWeight: 700
        },
        cmd: [
            { command: "clear" },
            { command: "fontsize", value: "48px" },
            { command: "align", value: "center" },
            { command: "bold" }
        ]
    },
    {
        label: "小标题",
        style: {
            fontSize: "22px",
            fontWeight: 700
        },
        cmd: [
            { command: "clear" },
            { command: "fontsize", value: "36px" },
            { command: "align", value: "center" },
            { command: "bold" }
        ]
    },
    {
        label: "正文",
        style: {
            fontSize: "20px"
        },
        cmd: [{ command: "clear" }, { command: "fontsize", value: "20px" }]
    },
    {
        label: "正文[小]",
        style: {
            fontSize: "18px"
        },
        cmd: [{ command: "clear" }, { command: "fontsize", value: "18px" }]
    },
    {
        label: "注释 1",
        style: {
            fontSize: "16px",
            fontStyle: "italic"
        },
        cmd: [
            { command: "clear" },
            { command: "fontsize", value: "16px" },
            { command: "em" }
        ]
    },
    {
        label: "注释 2",
        style: {
            fontSize: "16px",
            textDecoration: "underline"
        },
        cmd: [
            { command: "clear" },
            { command: "fontsize", value: "16px" },
            { command: "underline" }
        ]
    }
];

const webFonts = WEB_FONTS;
const baseFonts = BASE_FONTS;

export default defineComponent({
    name: "text-style-panel",
    components: {
        ElementOpacity,
        ElementOutline,
        ElementShadow
    },
    setup() {
        const store = useStore();
        const handleElement = computed<PPTTextElement>(
            () => store.getters.handleElement
        );
        const richTextAttrs = computed(() => store.state.richTextAttrs);

        const fill = ref<string>();
        const lineHeight = ref<number>();
        const wordSpace = ref<number>();

        watch(
            handleElement,
            () => {
                if (!handleElement.value || handleElement.value.type !== "text") return;

                fill.value = handleElement.value.fill || "#000";
                lineHeight.value = handleElement.value.lineHeight || 1.5;
                wordSpace.value = handleElement.value.wordSpace || 0;
            },
            { deep: true, immediate: true }
        );

        const availableFonts = computed(() => store.state.availableFonts);
        const fontSizeOptions = Array.from({ length: 245 }, (v, k) => k + 12 + "px");
        const lineHeightOptions = Array.from({ length: 232 }, (v, k) => k + 24);
        const wordSpaceOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10];

        // 发射富文本设置命令
        const emitRichTextCommand = (command: string, value?: string) => {
            emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { command, value });
        };

        // 发射富文本设置命令（批量）
        const emitBatchRichTextCommand = (payload: RichTextCommand[]) => {
            emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, payload);
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        // 设置行高
        const updateLineHeight = (value: number) => {
            const props = { lineHeight: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置字间距
        const updateWordSpace = (value: number) => {
            const props = { wordSpace: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置文本框填充
        const updateFill = (value: string) => {
            const props = { fill: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        return {
            fill,
            lineHeight,
            wordSpace,
            richTextAttrs,
            availableFonts,
            baseFonts,
            webFonts,
            fontSizeOptions,
            lineHeightOptions,
            wordSpaceOptions,
            updateLineHeight,
            updateWordSpace,
            updateFill,
            emitRichTextCommand,
            emitBatchRichTextCommand,
            presetStyles
        };
    }
});
</script>

<style lang="scss" scoped>
.text-style-panel {
    user-select: none;
}
.row {
    width: 100%;
    display: flex !important;
    align-items: center;
    margin-bottom: 10px;
}
.preset-style {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
}
.preset-style-item {
    width: 50%;
    height: 50px;
    border: solid 1px #d6d6d6;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    transition: all $transitionDelay;

    &:hover {
        border-color: $themeColor;
        color: $themeColor;
        z-index: 1;
    }

    &:nth-child(2n) {
        margin-left: -1px;
    }
    &:nth-child(n + 3) {
        margin-top: -1px;
    }
}
.text-color-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.text-color-block {
    width: 16px;
    height: 3px;
    margin-top: 1px;
}
</style>
