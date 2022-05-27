<template>
    <div class="table-style-panel">
        <a-input-group compact class="row">
            <a-select
                style="flex: 3;"
                :value="editable ? cellRichTextAttrs.fontname : richTextAttrs.fontname"
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
                            :style="{ backgroundColor: richTextAttrs.color }"
                        ></div>
                    </a-button>
                </a-tooltip>
            </a-popover>
            <a-popover trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="textAttrs.backcolor"
                        @update:modelValue="
                            value => updateTextAttrs({ backcolor: value })
                        "
                    />
                </template>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="单元格填充"
                >
                    <a-button class="text-color-btn" style="flex: 1;">
                        <IconFill />
                        <div
                            class="text-color-block"
                            :style="{ backgroundColor: textAttrs.backcolor }"
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
                    @click="emitRichTextCommand('bold', !richTextAttrs.bold)"
                    ><IconTextBold
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="斜体">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="editable ? cellRichTextAttrs.em : richTextAttrs.em"
                    @click="emitRichTextCommand('em', editable ? !cellRichTextAttrs.em : !richTextAttrs.em)"
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
                    @click="emitRichTextCommand('underline', !richTextAttrs.underline)"
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
                    @click="emitRichTextCommand('strikethrough', !richTextAttrs.strikethrough)"
                    ><IconStrikethrough
                /></CheckboxButton>
            </a-tooltip>
        </CheckboxButtonGroup>

        <CheckboxButtonGroup class="row">
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="上标">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.superscript"
                    @click="emitRichTextCommand('superscript', !richTextAttrs.superscript)"
                    ><IconUpOne
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="下标">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.subscript"
                    @click="emitRichTextCommand('subscript', !richTextAttrs.subscript)"
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
                    @click="emitRichTextCommand('code', !richTextAttrs.code)"
                    ><IconCode
                /></CheckboxButton>
            </a-tooltip>
            <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="引用">
                <CheckboxButton
                    style="flex: 1;"
                    :checked="richTextAttrs.blockquote"
                    @click="emitRichTextCommand('blockquote', !richTextAttrs.blockquote)"
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

        <a-divider />

        <div class="row">
            <div style="flex: 2;">行间距：</div>
            <a-select
                show-search
                style="flex: 3;"
                :value="textAttrs.lineHeight"
                @change="value => updateTextAttrs({ lineHeight: value })"
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
                :value="textAttrs.wordSpace"
                @change="value => updateTextAttrs({ wordSpace: value })"
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

        <ElementOutline :fixed="true" />

        <a-divider />

        <div class="row">
            <div style="flex: 2;">行数：</div>
            <a-input-number
                :min="1"
                :max="20"
                v-model:value="rowCount"
                @pressEnter="e => setTableRow(e)"
                @blur="e => setTableRow(e)"
                style="flex: 3;"
            />
        </div>
        <div class="row">
            <div style="flex: 2;">列数：</div>
            <a-input-number
                :min="1"
                :max="20"
                v-model:value="colCount"
                @pressEnter="e => setTableCol(e)"
                @blur="e => setTableCol(e)"
                style="flex: 3;"
            />
        </div>

        <a-divider />

        <div class="row">
            <div style="flex: 2;">行高：</div>
            <a-input-number
                :disabled="selectedCells.length === 0"
                :min="25"
                v-model:value="rowHeight"
                @pressEnter="e => setRowHeight(e)"
                @blur="e => setRowHeight(e)"
                style="flex: 3;"
            />
        </div>
        <div class="row">
            <div style="flex: 2;">列宽：</div>
            <a-input-number
                :disabled="selectedCells.length === 0"
                :min="50"
                v-model:value="colWidth"
                @pressEnter="e => setColWidth(e)"
                @blur="e => setColWidth(e)"
                style="flex: 3;"
            />
        </div>

        <a-divider />

        <div class="row theme-switch">
            <div style="flex: 2;">启用主题表格：</div>
            <div class="switch-wrapper" style="flex: 3;">
                <a-switch
                    :checked="hasTheme"
                    @change="checked => toggleTheme(checked)"
                />
            </div>
        </div>

        <template v-if="hasTheme">
            <div class="row">
                <a-checkbox
                    @change="e => updateTheme({ rowHeader: e.target.checked })"
                    :checked="theme.rowHeader"
                    style="flex: 1;"
                    >标题行</a-checkbox
                >
                <a-checkbox
                    @change="e => updateTheme({ rowFooter: e.target.checked })"
                    :checked="theme.rowFooter"
                    style="flex: 1;"
                    >汇总行</a-checkbox
                >
            </div>
            <div class="row">
                <a-checkbox
                    @change="e => updateTheme({ colHeader: e.target.checked })"
                    :checked="theme.colHeader"
                    style="flex: 1;"
                    >第一列</a-checkbox
                >
                <a-checkbox
                    @change="e => updateTheme({ colFooter: e.target.checked })"
                    :checked="theme.colFooter"
                    style="flex: 1;"
                    >最后一列</a-checkbox
                >
            </div>
            <div class="row">
                <div style="flex: 2;">主题颜色：</div>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="theme.color"
                            @update:modelValue="
                                value => updateTheme({ color: value })
                            "
                        />
                    </template>
                    <ColorButton :color="theme.color" style="flex: 3;" />
                </a-popover>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import {
    PPTTableElement,
    TableCell,
    TableCellStyle,
    TableTheme
} from "@/types/slides";
import { createRandomCode } from "@/utils/common";
import { BASE_FONTS, WEB_FONTS } from "@/configs/font";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import emitter, { EmitterEvents } from "@/utils/emitter";

import ElementOutline from "../common/ElementOutline.vue";
import ColorButton from "../common/ColorButton.vue";
import { defaultRichTextAttrs } from "@/utils/prosemirror/utils";

const webFonts = WEB_FONTS;
const baseFonts = BASE_FONTS;

export default defineComponent({
    name: "table-style-panel",
    components: {
        ElementOutline,
        ColorButton
    },
    setup() {
        const store = useStore();
        const handleElement = computed<PPTTableElement>(
            () => store.getters.handleElement
        );
        const selectedCells = computed(() => store.state.selectedTableCells);
        const themeColor = computed(() => store.state.theme.themeColor);

        const availableFonts = computed(() => store.state.availableFonts);
        const fontSizeOptions = Array.from({ length: 245 }, (v, k) => k + 12 + "px");

        const textAttrs = ref({
            bold: false,
            em: false,
            underline: false,
            strikethrough: false,
            color: "#000",
            backcolor: "#000",
            fontsize: "12px",
            fontname: "微软雅黑",
            align: "left",
            lineHeight: 28,
            wordSpace: 0
        });

        const theme = ref<TableTheme>();
        const hasTheme = ref(false);
        const rowCount = ref(0);
        const colCount = ref(0);
        const minRowCount = ref(0);
        const minColCount = ref(0);
        const cellRichTextAttrs = computed(() => store.state.richTextAttrs);
        const richTextAttrs = ref(defaultRichTextAttrs);

        watch(
            handleElement,
            () => {
                if (!handleElement.value || handleElement.value.type !== "table") return;

                theme.value = handleElement.value.theme;
                hasTheme.value = !!theme.value;

                rowCount.value = handleElement.value.data.length;
                colCount.value = handleElement.value.data[0].length;

                minRowCount.value = handleElement.value.data.length;
                minColCount.value = handleElement.value.data[0].length;
            },
            { deep: true, immediate: true }
        );

        const { addHistorySnapshot } = useHistorySnapshot();

        // 更新当前选中单元格的文本样式状态
        const updateTextAttrState = () => {
            if (!handleElement.value || handleElement.value.type !== "table") return;

            let rowIndex = 0;
            let colIndex = 0;
            if (selectedCells.value.length) {
                const selectedCell = selectedCells.value[0];
                rowIndex = +selectedCell.split("_")[0];
                colIndex = +selectedCell.split("_")[1];
            }
            const style = handleElement.value.data[rowIndex][colIndex].style;

            if (!style) {
                textAttrs.value = {
                    bold: false,
                    em: false,
                    underline: false,
                    strikethrough: false,
                    color: "#000",
                    backcolor: "#000",
                    fontsize: "12px",
                    fontname: "微软雅黑",
                    align: "left",
                    lineHeight: 28,
                    wordSpace: 0
                };
            } else {
                textAttrs.value = {
                    bold: !!style.bold,
                    em: !!style.em,
                    underline: !!style.underline,
                    strikethrough: !!style.strikethrough,
                    color: style.color || "#000",
                    backcolor: style.backcolor || "#000",
                    fontsize: style.fontsize || "12px",
                    fontname: style.fontname || "微软雅黑",
                    align: style.align || "left",
                    lineHeight: style.lineHeight || 28,
                    wordSpace: style.wordSpace || 0
                };
            }
        };

        onMounted(() => {
            if (selectedCells.value.length) updateTextAttrState();
        });

        watch(selectedCells, () => {
            updateTextAttrState();
            updateRowAndColNum();
        });

        // 设置单元格内容文本样式
        const updateTextAttrs = (textAttrProp: Partial<TableCellStyle>) => {
            const data: TableCell[][] = JSON.parse(
                JSON.stringify(handleElement.value.data)
            );

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    if (
                        !selectedCells.value.length ||
                        selectedCells.value.includes(`${i}_${j}`)
                    ) {
                        const style = data[i][j].style || {};
                        data[i][j].style = { ...style, ...textAttrProp };
                    }
                }
            }
            const props = { data };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });

            addHistorySnapshot();
            updateTextAttrState();
        };

        // 更新表格主题：主题色、标题行、汇总行、第一列、最后一列
        const updateTheme = (themeProp: Partial<TableTheme>) => {
            const currentTheme = theme.value || {};
            const props = { theme: { ...currentTheme, ...themeProp } };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 开启/关闭表格主题
        const toggleTheme = (checked: boolean) => {
            if (checked) {
                const props = {
                    theme: {
                        color: themeColor.value,
                        rowHeader: true,
                        rowFooter: false,
                        colHeader: false,
                        colFooter: false
                    }
                };
                store.commit(MutationTypes.UPDATE_ELEMENT, {
                    id: handleElement.value.id,
                    props
                });
            } else {
                store.commit(MutationTypes.REMOVE_ELEMENT_PROPS, {
                    id: handleElement.value.id,
                    propName: "theme"
                });
            }
            addHistorySnapshot();
        };

        // 设置表格行数
        const setTableRow = (e: KeyboardEvent) => {
            const value = +(e.target as HTMLInputElement).value;
            const rowCount = handleElement.value.data.length;

            if (value === rowCount) return;
            let tableCells: TableCell[][] = JSON.parse(
                JSON.stringify(handleElement.value.data)
            );
            if (value < rowCount) {
                tableCells = tableCells.slice(0, value);
                // return message.warning("设置行数不能少于当前值");
            } else {
                const rowCells: TableCell[] = new Array(colCount.value).fill({
                    id: createRandomCode(),
                    colspan: 1,
                    rowspan: 1,
                    style: {
                        color: "#000",
                        fontname: "Microsoft Yahei"
                    },
                    text: ""
                });
                const newTableCells: TableCell[][] = new Array(
                    value - rowCount
                ).fill(rowCells);

                tableCells.push(...newTableCells);
            }

            const props = { data: tableCells };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置表格列数
        const setTableCol = (e: KeyboardEvent) => {
            const value = +(e.target as HTMLInputElement).value;
            const colCount = handleElement.value.data[0].length;

            if (value === colCount) return;
            let tableCells = handleElement.value.data;
            let colSizeList = handleElement.value.colWidths.map(
                item => item * handleElement.value.width
            );
            if (value < colCount) {
                tableCells = tableCells.map(item => {
                    return item.slice(0, value);
                });
                colSizeList = colSizeList.slice(0, value);
                // return message.warning("设置列数不能少于当前值");
            } else {
                tableCells = tableCells.map(item => {
                    const cells: TableCell[] = new Array(value - colCount).fill({
                        id: createRandomCode(),
                        colspan: 1,
                        rowspan: 1,
                        style: {
                            color: "#000",
                            fontname: "Microsoft Yahei"
                        },
                        text: ""
                    });
                    item.push(...cells);
                    return item;
                });

                const newColSizeList = new Array(value - colCount).fill(100);
                colSizeList.push(...newColSizeList);
            }

            const width = handleElement.value.width + 100 * (value - colCount);
            const colWidths = colSizeList.map(item => item / width);

            const props = {
                width,
                data: tableCells,
                colWidths
            };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });

            addHistorySnapshot();
        };

        const emitRichTextCommand = (command: string, value?: string) => {
            if (!editable.value) richTextAttrs.value[command] = value;
            emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { command, value });
        };

        const editable = ref(false);
        const watchEditable = (isEditable: boolean) => {
            editable.value = isEditable;
            if (!isEditable) richTextAttrs.value = defaultRichTextAttrs;
        };
        emitter.on(EmitterEvents.WATCH_TABLE_EDITABLE, watchEditable);

        onUnmounted(() => {
            emitter.off(EmitterEvents.WATCH_TABLE_EDITABLE, watchEditable);
        });

        const lineHeightOptions = Array.from({ length: 232 }, (v, k) => k + 24);
        const wordSpaceOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10];

        // 行高列宽配置
        const rowHeight = ref(25);
        const colWidth = ref(50);
        let rows: string[] = [];
        let cols: string[] = [];
        const updateRowAndColNum = () => {
            rows = [];
            cols = [];
            if (selectedCells.value.length === 0) return;
            // 选中表格发生变化，计算列宽和行高
            selectedCells.value.forEach(cell => {
                const rc = cell.split("_");
                if (rows.indexOf(rc[0]) === -1) rows.push(rc[0]);
                if (cols.indexOf(rc[1]) === -1) cols.push(rc[1]);
            });

            // 取选中的第一个的数据进行计算显示
            // 四舍五入
            // 计算行高
            rowHeight.value = Math.round(handleElement.value.height * handleElement.value.rowHeights[rows[0]]);
            // 计算列宽
            colWidth.value = Math.round(handleElement.value.width * handleElement.value.colWidths[cols[0]]);
        };

        const setColWidth = (e: KeyboardEvent) => {
            const value = +(e.target as HTMLInputElement).value;
            // 计算每一列的宽度 及 总宽度
            const colWidths: number[] = [];
            let totalWidth = 0;
            handleElement.value.colWidths.forEach((col, index) => {
                if (cols.indexOf(index.toString()) === -1) {
                    colWidths.push(col * handleElement.value.width);
                    totalWidth += col * handleElement.value.width;
                } else {
                    colWidths.push(value);
                    totalWidth += value;
                }
            });

            // 重新计算元素中的rowHeights及height
            const props = {
                colWidths: colWidths.map(col => {
                    return col / totalWidth;
                }),
                width: totalWidth
            };

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });

            addHistorySnapshot();
        };

        const setRowHeight = (e: KeyboardEvent) => {
            const value = +(e.target as HTMLInputElement).value;
            // 计算每一行的高度 及 总高度
            const rowHeights: number[] = [];
            let totalHeight = 0;
            handleElement.value.rowHeights.forEach((row, index) => {
                if (rows.indexOf(index.toString()) === -1) {
                    rowHeights.push(row * handleElement.value.height);
                    totalHeight += row * handleElement.value.height;
                } else {
                    rowHeights.push(value);
                    totalHeight += value;
                }
            });

            // 重新计算元素中的rowHeights及height
            const props = {
                rowHeights: rowHeights.map(row => {
                    return row / totalHeight;
                }),
                height: totalHeight
            };

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });

            addHistorySnapshot();
        };

        return {
            handleElement,
            availableFonts,
            fontSizeOptions,
            textAttrs,
            updateTextAttrs,
            theme,
            rowCount,
            colCount,
            minRowCount,
            minColCount,
            hasTheme,
            toggleTheme,
            updateTheme,
            setTableRow,
            setTableCol,
            webFonts,
            baseFonts,
            emitRichTextCommand,
            cellRichTextAttrs,
            richTextAttrs,
            editable,
            lineHeightOptions,
            wordSpaceOptions,
            rowHeight,
            colWidth,
            selectedCells,
            setRowHeight,
            setColWidth
        };
    }
});
</script>

<style lang="scss" scoped>
.row {
    width: 100%;
    display: flex !important;
    align-items: center;
    margin-bottom: 10px;
}
.theme-switch {
    margin-bottom: 18px;
}
.switch-wrapper {
    text-align: right;
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
