<template>
    <div class="shape-style-panel">
        <div class="row">
            <a-popover
                trigger="click"
                v-model:visible="shapePoolVisible"
                placement="bottom"
            >
                <template #content>
                    <ShapePool @select="(shape) => updateShape(shape)" />
                </template>
                <a-button style="flex: 1;">更换形状</a-button>
            </a-popover>
        </div>
        <a-divider />

        <div class="row">
            <a-select
                style="flex: 10;"
                :value="fillType"
                @change="value => updateFillType(value)"
            >
                <a-select-option value="fill">纯色填充</a-select-option>
                <a-select-option value="gradient">渐变填充</a-select-option>
            </a-select>
            <div style="flex: 1;"></div>
            <a-popover trigger="click" v-if="fillType === 'fill'">
                <template #content>
                    <ColorPicker
                        :modelValue="fill"
                        @update:modelValue="value => updateFill(value)"
                    />
                </template>
                <ColorButton :color="fill" style="flex: 10;" />
            </a-popover>
            <a-select
                style="flex: 10;"
                :value="gradient.type"
                @change="value => updateGradient({ type: value })"
                v-else
            >
                <a-select-option value="linear">线性渐变</a-select-option>
                <a-select-option value="radial">径向渐变</a-select-option>
            </a-select>
        </div>

        <template v-if="fillType === 'gradient'">
            <div class="row">
                <div style="flex: 2;">起点颜色：</div>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="gradient.color[0]"
                            @update:modelValue="
                                value =>
                                    updateGradient({
                                        color: [value, gradient.color[1]]
                                    })
                            "
                        />
                    </template>
                    <ColorButton :color="gradient.color[0]" style="flex: 3;" />
                </a-popover>
            </div>
            <div class="row">
                <div style="flex: 2;">终点颜色：</div>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="gradient.color[1]"
                            @update:modelValue="
                                value =>
                                    updateGradient({
                                        color: [gradient.color[0], value]
                                    })
                            "
                        />
                    </template>
                    <ColorButton :color="gradient.color[1]" style="flex: 3;" />
                </a-popover>
            </div>
            <div class="row" v-if="gradient.type === 'linear'">
                <div style="flex: 2;">渐变角度：</div>
                <a-slider
                    :min="0"
                    :max="360"
                    :step="15"
                    :value="gradient.rotate"
                    style="flex: 3;"
                    @change="value => updateGradient({ rotate: value })"
                />
            </div>
        </template>

        <ElementFlip />
        <a-divider />
        <div class="row" v-if="hasRadius">
            <div style="flex: 3;">圆角：</div>
            <a-input-number
                :step="5"
                :min="0"
                :max="radiusMax"
                :value="radius"
                @change="value => updateRadius(value)"
                style="flex: 4;"
            />
        </div>
        <a-divider v-if="hasRadius" />

        <div class="row" v-if="isChartShap">
            <div style="flex: 3;">箭头方向：</div>
            <a-select
                style="flex: 4;"
                :value="chartArrowPosition"
                @change="value => updateChartArrowPosition(value)"
            >
                <a-select-option value="top">向上</a-select-option>
                <a-select-option value="bottom">向下</a-select-option>
                <a-select-option value="left">向左</a-select-option>
                <a-select-option value="right">向右</a-select-option>
            </a-select>
        </div>
        <div class="row" v-if="isChartShap">
            <div style="flex: 3;">箭头位置：</div>
            <a-input-number
                :step="5"
                :value="chartArrowOffset"
                @change="value => updateChartArrowOffset(value)"
                style="flex: 4;"
            />
        </div>
        <a-divider v-if="isChartShap" />

        <template v-if="showTextTools">
            <a-input-group class="row">
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
                        @click="emitRichTextCommand('bold')"
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
                    title="清除格式"
                >
                    <CheckboxButton
                        style="flex: 1;"
                        @click="emitRichTextCommand('clear')"
                        ><IconFormat
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

            <a-radio-group
                class="row"
                button-style="solid"
                :value="textAlign"
                @change="e => updateTextAlign(e.target.value)"
            >
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="顶对齐"
                >
                    <a-radio-button value="top" style="flex: 1;"
                        ><IconAlignTextTopOne
                    /></a-radio-button>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="居中"
                >
                    <a-radio-button value="middle" style="flex: 1;"
                        ><IconAlignTextMiddleOne
                    /></a-radio-button>
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="底对齐"
                >
                    <a-radio-button value="bottom" style="flex: 1;"
                        ><IconAlignTextBottomOne
                    /></a-radio-button>
                </a-tooltip>
            </a-radio-group>

            <a-divider />
        </template>

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
import { PPTShapeElement, ShapeGradient, ShapeText } from "@/types/slides";
import { BASE_FONTS, WEB_FONTS } from "@/configs/font";
import emitter, { EmitterEvents } from "@/utils/emitter";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import ElementOpacity from "../common/ElementOpacity.vue";
import ElementOutline from "../common/ElementOutline.vue";
import ElementShadow from "../common/ElementShadow.vue";
import ElementFlip from "../common/ElementFlip.vue";
import ColorButton from "../common/ColorButton.vue";
import ShapePool from "../../CanvasTool/ShapePool.vue";
import { ShapePoolItem } from "@/configs/shapes";

const webFonts = WEB_FONTS;
const baseFonts = BASE_FONTS;

export default defineComponent({
    name: "shape-style-panel",
    components: {
        ElementOpacity,
        ElementOutline,
        ElementShadow,
        ElementFlip,
        ColorButton,
        ShapePool
    },
    setup() {
        const store = useStore();
        const handleElement = computed<PPTShapeElement>(
            () => store.getters.handleElement
        );
        const editingShapeElementId = computed(
            () => store.state.editingShapeElementId
        );

        const showTextTools = computed(() => {
            return editingShapeElementId.value === handleElement.value.id;
        });

        const fill = ref<string>();
        const gradient = ref<ShapeGradient>();
        const fillType = ref("fill");
        const textAlign = ref("middle");
        const radius = ref(0);
        const chartArrowPosition = ref("bottom");
        const chartArrowOffset = ref(0);

        watch(
            handleElement,
            () => {
                if (!handleElement.value || handleElement.value.type !== "shape") return;
                fill.value = handleElement.value.fill || "#000";

                gradient.value = handleElement.value.gradient || {
                    type: "linear",
                    rotate: 0,
                    color: [fill.value, "#fff"]
                };

                fillType.value = handleElement.value.gradient
                    ? "gradient"
                    : "fill";

                textAlign.value = handleElement.value?.text?.align || "middle";

                radius.value = handleElement.value.radius || 0;

                chartArrowPosition.value = handleElement.value.chartPosition || "bottom";

                chartArrowOffset.value = handleElement.value.chartOffset || (chartArrowPosition.value === "top" || chartArrowPosition.value === "bottom" ? (Math.ceil(handleElement.value.width / 4)) : (Math.ceil(handleElement.value.height / 4)));
            },
            { deep: true, immediate: true }
        );

        const { addHistorySnapshot } = useHistorySnapshot();

        // 设置填充类型：渐变、纯色
        const updateFillType = (type: "gradient" | "fill") => {
            if (type === "fill") {
                store.commit(MutationTypes.REMOVE_ELEMENT_PROPS, {
                    id: handleElement.value.id,
                    propName: "gradient"
                });
            } else {
                const props = { gradient: gradient.value };
                store.commit(MutationTypes.UPDATE_ELEMENT, {
                    id: handleElement.value.id,
                    props
                });
            }
            addHistorySnapshot();
        };

        // 设置渐变填充
        const updateGradient = (gradientProps: Partial<ShapeGradient>) => {
            const props = { gradient: { ...gradient.value, ...gradientProps } };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置填充色
        const updateFill = (value: string) => {
            const props = { fill: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        const updateTextAlign = (align: "top" | "middle" | "bottom") => {
            const defaultText: ShapeText = {
                content: "",
                defaultFontName: "微软雅黑",
                defaultColor: "#000",
                defaultFontSize: "14px",
                align: "middle"
            };
            const _text = handleElement.value.text || defaultText;
            const props = { text: { ..._text, align } };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        const richTextAttrs = computed(() => store.state.richTextAttrs);
        const availableFonts = computed(() => store.state.availableFonts);
        const fontSizeOptions = Array.from({ length: 245 }, (v, k) => k + 12 + "px");

        const emitRichTextCommand = (command: string, value?: string) => {
            emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { command, value });
        };

        // 设置圆角
        const updateRadius = (value: number) => {
            // radius.value = value;
            const props = { radius: value };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        const hasRadius = computed(() => {
            return handleElement.value.path === "M 20 0 L 180 0 Q 200 0 200 20 L 200 180 Q 200 200 180 200 L 20 200 Q 0 200 0 180 L 0 20 Q 0 0 20 0 Z" || handleElement.value.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z";
        });

        const isChartShap = computed(() => {
            return handleElement.value.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z";
        });

        const updateChartArrowPosition = (position: string) => {
            const props = { chartPosition: position };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        const updateChartArrowOffset = (offset: number) => {
            const props = { chartOffset: offset };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        const radiusMax = computed(() => {
            return Math.floor(Math.min(handleElement.value.height, handleElement.value.width) / 2);
        });

        // 更换形状
        const shapePoolVisible = ref(false);
        const updateShape = (shape: ShapePoolItem) => {
            console.log(shape, handleElement.value);
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: shape
            });
            addHistorySnapshot();
        };

        return {
            radius,
            fill,
            gradient,
            fillType,
            textAlign,
            richTextAttrs,
            availableFonts,
            fontSizeOptions,
            webFonts,
            baseFonts,
            showTextTools,
            emitRichTextCommand,
            updateFillType,
            updateFill,
            updateGradient,
            updateTextAlign,
            updateRadius,
            hasRadius,
            radiusMax,
            isChartShap,
            chartArrowOffset,
            chartArrowPosition,
            updateChartArrowPosition,
            updateChartArrowOffset,
            shapePoolVisible,
            updateShape
        };
    }
});
</script>

<style lang="scss" scoped>
.shape-style-panel {
    user-select: none;
}
.row {
    width: 100%;
    display: flex !important;
    align-items: center;
    margin-bottom: 10px;
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
