<template>
    <div
        class="editable-element"
        ref="elementRef"
        :id="`editable-element-${elementInfo.id}`"
        :style="{
            zIndex: elementIndex,
        }"
    >
        <a-popover trigger="click" :align="{offset: [0, -50]}" :key="elementInfo.id">
            <template #content>
                <a-popover trigger="click" v-if="elementInfo.type === 'shape'">
                    <template #content>
                        <ColorPicker
                            :modelValue="elementInfo?.outline?.color"
                            @update:modelValue="(value) => updateOutline(value)"
                        />
                    </template>
                    <a-tooltip
                        :mouseLeaveDelay="0"
                        :mouseEnterDelay="0.1"
                        title="边框"
                        :get-popup-container="getPopupContainer"
                    >
                        <IconSquare
                            class="tool-btn"
                            theme="two-tone"
                            :size="24"
                            :fill="['#111', '#fff']"
                    /></a-tooltip>
                </a-popover>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="elementInfo.fill || elementInfo.color"
                            @update:modelValue="(value) => updateFill(value)"
                        />
                    </template>
                    <a-tooltip
                        :mouseLeaveDelay="0"
                        :mouseEnterDelay="0.1"
                        title="填充"
                        :get-popup-container="getPopupContainer"
                    >
                        <IconBackgroundColor
                            class="tool-btn"
                            theme="two-tone"
                            :size="24"
                            :fill="['#111', '#fff']"
                    /></a-tooltip>
                </a-popover>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.1"
                    title="置顶"
                    :get-popup-container="getPopupContainer"
                >
                    <IconToTop
                        class="tool-btn"
                        theme="two-tone"
                        :size="24"
                        :fill="['#111', '#fff']"
                        @click="moveTopElement"
                /></a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.1"
                    title="克隆"
                    :get-popup-container="getPopupContainer"
                >
                    <IconCopy
                        class="tool-btn"
                        theme="two-tone"
                        :size="24"
                        :fill="['#111', '#fff']"
                        @click="copyElement"
                /></a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.1"
                    title="删除"
                    :get-popup-container="getPopupContainer"
                >
                    <IconDelete
                        class="tool-btn"
                        theme="two-tone"
                        :size="24"
                        :fill="['#111', '#fff']"
                        @click="deleteElement"
                /></a-tooltip>
            </template>
            <component
                :is="currentElementComponent"
                :elementInfo="elementInfo"
                :selectElement="selectElement"
                :style="{
                    zIndex: editable ? 10000 : 0,
                }"
            ></component>
        </a-popover>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ElementTypes, PPTElement, PPTShapeElement } from "@/types/slides";

import ShapeElement from "@/components/element/ShapeElement/BaseShapeElement.vue";
import LineElement from "@/components/element/LineElement/index.vue";
import { MutationTypes, useStore } from "@/store";
import { createRandomCode } from "@/utils/common";

export default defineComponent({
    name: "editable-element",
    props: {
        elementInfo: {
            type: Object as PropType<PPTElement>,
            required: true
        },
        elementIndex: {
            type: Number,
            required: true
        },
        isMultiSelect: {
            type: Boolean,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (e: MouseEvent, element: PPTElement, canMove?: boolean) => void
            >,
            required: true
        }
    },
    setup(props) {
        const currentElementComponent = computed(() => {
            const elementTypeMap = {
                [ElementTypes.SHAPE]: ShapeElement,
                [ElementTypes.LINE]: LineElement
            };
            return elementTypeMap[props.elementInfo.type] || null;
        });

        const store = useStore();

        const handleElementId = computed(() => store.state.handleElementId);
        const editable = computed(() => {
            return (
                store.state.editElementID === handleElementId.value &&
                store.state.editElementID === props.elementInfo.id
            );
        });

        // 设置填充色
        const updateFill = (value: string) => {
            const data =
                props.elementInfo.type === "shape"
                    ? { fill: value }
                    : { color: value };
            store.commit(MutationTypes.UPDATE_SCREEN_ELEMENT, {
                id: props.elementInfo.id,
                props: data
            });
        };

        const updateOutline = (color: string) => {
            const data = {
                outline: {
                    ...(props.elementInfo as PPTShapeElement).outline,
                    color
                }
            };
            store.commit(MutationTypes.UPDATE_SCREEN_ELEMENT, {
                id: props.elementInfo.id,
                props: data
            });
        };

        const getPopupContainer = (trigger: HTMLElement) => {
            return trigger.parentElement;
        };

        const moveTopElement = () => {
            const elementList = store.state.screenElements;
            const level = elementList.findIndex(
                (item) => item.id === props.elementInfo.id
            );

            // 已经处在顶层，无法继续移动
            if (level === elementList.length - 1) return null;

            // 将该组合元素从元素列表中移除，然后将被移除的元素添加到元素列表底部
            elementList.splice(level, 1);
            elementList.push(props.elementInfo);
            store.commit(MutationTypes.UPDATE_SCREEN_ELEMENTS, elementList);
        };

        const copyElement = () => {
            const copyElementInfo = JSON.parse(
                JSON.stringify(props.elementInfo)
            ) as PPTShapeElement;
            copyElementInfo.left =
                props.elementInfo.left + props.elementInfo.width / 2;
            copyElementInfo.id = createRandomCode();
            const elementList = store.state.screenElements;
            elementList.push(copyElementInfo);
            store.commit(MutationTypes.UPDATE_SCREEN_ELEMENTS, elementList);
        };

        const deleteElement = () => {
            const elementList = store.state.screenElements;
            const index = elementList.findIndex(
                (item) => item.id === props.elementInfo.id
            );
            elementList.splice(index, 1);
            store.commit(MutationTypes.UPDATE_SCREEN_ELEMENTS, elementList);
        };

        return {
            currentElementComponent,
            updateFill,
            editable,
            copyElement,
            deleteElement,
            updateOutline,
            moveTopElement,
            getPopupContainer
        };
    }
});
</script>

<style lang="scss" scoped>
.tool-btn {
    opacity: 0.35;

    &:hover {
        opacity: 0.9;
    }
    & + .tool-btn {
        margin-left: 8px;
    }
}
</style>
