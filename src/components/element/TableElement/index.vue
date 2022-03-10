<template>
    <div
        class="editable-element-table"
        ref="elementRef"
        :class="{ lock: elementInfo.lock }"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px'
        }"
    >
        <div class="element-content" v-contextmenu="contextmenus">
            <EditableTable
                @mousedown.stop
                :id="elementInfo.id"
                :data="elementInfo.data"
                :width="elementInfo.width"
                :height="elementInfo.height"
                :colWidths="elementInfo.colWidths"
                :rowHeights="rowHeights"
                :outline="elementInfo.outline"
                :theme="elementInfo.theme"
                :editable="editable"
                @change="data => updateTableCells(data)"
                @changeColWidths="widths => updateColWidths(widths)"
                @changeRowHeights="heights => updateRowHeights(heights)"
                @changeSelectedCells="cells => updateSelectedCells(cells)"
            />
            <div
                class="table-mask"
                :class="{ lock: elementInfo.lock }"
                v-if="!editable || elementInfo.lock"
                @dblclick="startEdit()"
                @mousedown="$event => handleSelectElement($event)"
            >
                <div
                    class="mask-tip"
                    :style="{ transform: `scale(${1 / canvasScale})` }"
                >
                    双击编辑
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    nextTick,
    PropType,
    ref,
    watch
} from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTTableElement, TableCell } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import EditableTable from "./EditableTable.vue";

export default defineComponent({
    name: "editable-element-table",
    components: {
        EditableTable
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
        const canvasScale = computed(() => store.state.canvasScale);
        const handleElementId = computed(() => store.state.handleElementId);

        const elementRef = ref<HTMLElement>();

        const { addHistorySnapshot } = useHistorySnapshot();

        const handleSelectElement = (e: MouseEvent) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo);
        };

        // 更新表格的可编辑状态，表格处于编辑状态时需要禁用全局快捷键
        const editable = ref(false);

        watch(handleElementId, () => {
            if (handleElementId.value !== props.elementInfo.id) {
                editable.value = false;
            }
        });

        const startEdit = () => {
            if (!props.elementInfo.lock) {
                editable.value = true;
            }
        };

        // 监听表格元素的尺寸变化，当高度变化时，更新高度到vuex
        // 如果高度变化时正处在缩放操作中，则等待缩放操作结束后再更新
        const realHeightCache = ref(-1);

        const isScaling = computed(() => store.state.isScaling);

        watch(isScaling, () => {
            if (handleElementId.value !== props.elementInfo.id) return;

            if (isScaling.value) {
                // editable.value = false;
                store.commit(
                    MutationTypes.SET_DISABLE_HOTKEYS_STATE,
                    false
                );
            }

            if (!isScaling.value && realHeightCache.value !== -1) {
                store.commit(MutationTypes.UPDATE_ELEMENT, {
                    id: props.elementInfo.id,
                    props: { height: realHeightCache.value }
                });
                realHeightCache.value = -1;
            }
        });

        // const updateTableElementHeight = (entries: ResizeObserverEntry[]) => {
        //     const contentRect = entries[0].contentRect;
        //     if (!elementRef.value) return;

        //     const realHeight = contentRect.height;

        //     if (props.elementInfo.height !== realHeight) {
        //         if (!isScaling.value) {
        //             store.commit(MutationTypes.UPDATE_ELEMENT, {
        //                 id: props.elementInfo.id,
        //                 props: { height: realHeight }
        //             });
        //         } else realHeightCache.value = realHeight;
        //     }
        // };

        // const resizeObserver = new ResizeObserver(updateTableElementHeight);

        // onMounted(() => {
        //     if (elementRef.value) resizeObserver.observe(elementRef.value);
        // });
        // onUnmounted(() => {
        //     if (elementRef.value) resizeObserver.unobserve(elementRef.value);
        // });

        // 更新表格内容数据
        const updateTableCells = (data: TableCell[][]) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: props.elementInfo.id,
                props: { data }
            });
            addHistorySnapshot();
        };

        // 更新表格的列宽数据
        const updateColWidths = (widths: number[]) => {
            const width = widths.reduce((a, b) => a + b);
            const colWidths = widths.map(item => item / width);

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: props.elementInfo.id,
                props: { width, colWidths }
            });
            addHistorySnapshot();
        };

        // 更新表格的行高数据
        const updateRowHeights = (heights: number[]) => {
            const height = heights.reduce((a, b) => a + b);
            const rowHeights = heights.map(item => item / height);
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: props.elementInfo.id,
                props: { height, rowHeights }
            });
            addHistorySnapshot();
        };

        // 更新表格当前选中的单元格
        const updateSelectedCells = (cells: string[]) => {
            nextTick(() =>
                store.commit(MutationTypes.SET_SELECTED_TABLE_CELLS, cells)
            );
        };

        const rowHeights = computed(() => {
            let rowHeights = props.elementInfo.rowHeights || [];
            if (rowHeights.length === 0) {
                // const rowsNum = props.elementInfo.data.length;
                // 以前的旧数据格式处理
                // rowHeights = Array.from({ length: rowsNum }, () => 1 / rowsNum);
                rowHeights = [];
            }
            return rowHeights;
        });

        return {
            elementRef,
            canvasScale,
            handleSelectElement,
            updateTableCells,
            updateColWidths,
            editable,
            startEdit,
            updateSelectedCells,
            updateRowHeights,
            rowHeights
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-table {
    position: absolute;

    &.lock .element-content {
        cursor: default;
    }
}

.element-content {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: move;
}
.table-mask {
    @include absolute-0();

    opacity: 0;
    transition: opacity $transitionDelay;

    .mask-tip {
        position: absolute;
        top: 5px;
        left: 5px;
        background-color: rgba($color: #000, $alpha: 0.5);
        color: #fff;
        padding: 6px 12px;
        font-size: 12px;
        transform-origin: 0 0;
    }

    &:hover:not(.lock) {
        opacity: 0.9;
    }
}
</style>
