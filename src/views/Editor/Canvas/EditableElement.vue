<template>
    <div
        class="editable-element"
        ref="elementRef"
        :id="`editable-element-${elementInfo.id}`"
        :style="{
            zIndex: elementIndex
        }"
    >
        <component
            :is="currentElementComponent"
            :elementInfo="elementInfo"
            :selectElement="selectElement"
            :contextmenus="contextmenus"
            :style="{
                zIndex: editable ? 10000 : 0
            }"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ElementTypes, PPTElement } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";

import useLockElement from "@/hooks/useLockElement";
import useDeleteElement from "@/hooks/useDeleteElement";
import useCombineElement from "@/hooks/useCombineElement";
import useOrderElement from "@/hooks/useOrderElement";
import useAlignElementToCanvas from "@/hooks/useAlignElementToCanvas";
import useCopyAndPasteElement from "@/hooks/useCopyAndPasteElement";
import useSelectAllElement from "@/hooks/useSelectAllElement";
import useDisplayElement from "@/hooks/useDisplayElement";
import useStepElement from "@/hooks/useStepElement";

import { ElementOrderCommands, ElementAlignCommands } from "@/types/edit";

import ImageElement from "@/components/element/ImageElement/index.vue";
import TextElement from "@/components/element/TextElement/index.vue";
import ShapeElement from "@/components/element/ShapeElement/index.vue";
import LineElement from "@/components/element/LineElement/index.vue";
import ChartElement from "@/components/element/ChartElement/index.vue";
import TableElement from "@/components/element/TableElement/index.vue";
import LatexElement from "@/components/element/LatexElement/index.vue";
import AudioElement from "@/components/element/AudioElement/index.vue";
import VideoElement from "@/components/element/VideoElement/index.vue";
import WebIFrameElement from "@/components/element/IFrameElement/index.vue";
import FlashElement from "@/components/element/FlashElement/index.vue";
import MarkElement from "@/components/element/MarkElement/index.vue";
import { MutationTypes, useStore } from "@/store";

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
        },
        openLinkDialog: {
            type: Function as PropType<() => void>,
            required: true
        }
    },
    setup(props) {
        const currentElementComponent = computed(() => {
            const elementTypeMap = {
                [ElementTypes.IMAGE]: ImageElement,
                [ElementTypes.TEXT]: TextElement,
                [ElementTypes.SHAPE]: ShapeElement,
                [ElementTypes.LINE]: LineElement,
                [ElementTypes.CHART]: ChartElement,
                [ElementTypes.TABLE]: TableElement,
                [ElementTypes.LATEX]: LatexElement,
                [ElementTypes.AUDIO]: AudioElement,
                [ElementTypes.VIDEO]: VideoElement,
                [ElementTypes.IFRAME]: WebIFrameElement,
                [ElementTypes.FLASH]: FlashElement,
                [ElementTypes.MARK]: MarkElement
            };
            return elementTypeMap[props.elementInfo.type] || null;
        });

        const { orderElement } = useOrderElement();
        const { alignElementToCanvas, alignElementToElement } = useAlignElementToCanvas();
        const { combineElements, uncombineElements } = useCombineElement();
        const { deleteElement } = useDeleteElement(0);
        const { lockElement, unlockElement } = useLockElement();
        const { showElement, hideElement } = useDisplayElement();
        const {
            copyElement,
            pasteElement,
            cutElement,
            cacheElement
        } = useCopyAndPasteElement();
        const { selectAllElement } = useSelectAllElement();

        const store = useStore();

        const { setElementStep } = useStepElement();

        const handleElementId = computed(() => store.state.handleElementId);
        const editable = computed(() => {
            return store.state.editElementID === handleElementId.value && store.state.editElementID === props.elementInfo.id;
        });

        const contextmenus = (): ContextmenuItem[] => {
            if (props.elementInfo.lock) {
                return [
                    {
                        text: "解锁",
                        handler: () => unlockElement(props.elementInfo)
                    }
                ];
            }

            return [
                {
                    text: "剪切",
                    subText: "Ctrl + X",
                    handler: cutElement
                },
                {
                    text: "复制",
                    subText: "Ctrl + C",
                    handler: copyElement
                },
                {
                    text: "粘贴",
                    subText: "Ctrl + V",
                    handler: pasteElement
                },
                { divider: true },
                {
                    text: "暂存目标",
                    disable: props.isMultiSelect && !props.elementInfo.groupId,
                    subText: "",
                    handler: cacheElement
                },
                {
                    text: "加入步骤",
                    subText: "",
                    handler: setElementStep
                },
                { divider: true },
                {
                    text: "显示",
                    subText: "",
                    handler: showElement
                },
                {
                    text: "隐藏",
                    subText: "",
                    handler: hideElement
                },
                { divider: true },
                {
                    text: "相对对齐",
                    disable: !props.isMultiSelect || !!props.elementInfo.groupId,
                    children: [
                        {
                            text: "左对齐",
                            handler: () =>
                                alignElementToElement(
                                    ElementAlignCommands.LEFT
                                )
                        },
                        {
                            text: "右对齐",
                            handler: () =>
                                alignElementToElement(
                                    ElementAlignCommands.RIGHT
                                )
                        },
                        {
                            text: "顶部对齐",
                            handler: () =>
                                alignElementToElement(ElementAlignCommands.TOP)
                        },
                        {
                            text: "底部对齐",
                            handler: () =>
                                alignElementToElement(
                                    ElementAlignCommands.BOTTOM
                                )
                        }
                    ]
                },
                {
                    text: "水平居中",
                    handler: () =>
                        alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
                    children: [
                        {
                            text: "水平垂直居中",
                            handler: () =>
                                alignElementToCanvas(
                                    ElementAlignCommands.CENTER
                                )
                        },
                        {
                            text: "水平居中",
                            handler: () =>
                                alignElementToCanvas(
                                    ElementAlignCommands.HORIZONTAL
                                )
                        },
                        {
                            text: "左对齐",
                            handler: () =>
                                alignElementToCanvas(ElementAlignCommands.LEFT)
                        },
                        {
                            text: "右对齐",
                            handler: () =>
                                alignElementToCanvas(ElementAlignCommands.RIGHT)
                        }
                    ]
                },
                {
                    text: "垂直居中",
                    handler: () =>
                        alignElementToCanvas(ElementAlignCommands.VERTICAL),
                    children: [
                        {
                            text: "水平垂直居中",
                            handler: () =>
                                alignElementToCanvas(
                                    ElementAlignCommands.CENTER
                                )
                        },
                        {
                            text: "垂直居中",
                            handler: () =>
                                alignElementToCanvas(
                                    ElementAlignCommands.VERTICAL
                                )
                        },
                        {
                            text: "顶部对齐",
                            handler: () =>
                                alignElementToCanvas(ElementAlignCommands.TOP)
                        },
                        {
                            text: "底部对齐",
                            handler: () =>
                                alignElementToCanvas(
                                    ElementAlignCommands.BOTTOM
                                )
                        }
                    ]
                },
                { divider: true },
                {
                    text: "置于顶层",
                    disable: props.isMultiSelect && !props.elementInfo.groupId,
                    handler: () =>
                        orderElement(
                            props.elementInfo,
                            ElementOrderCommands.TOP
                        ),
                    children: [
                        {
                            text: "置于顶层",
                            handler: () =>
                                orderElement(
                                    props.elementInfo,
                                    ElementOrderCommands.TOP
                                )
                        },
                        {
                            text: "上移一层",
                            handler: () =>
                                orderElement(
                                    props.elementInfo,
                                    ElementOrderCommands.UP
                                )
                        }
                    ]
                },
                {
                    text: "置于底层",
                    disable: props.isMultiSelect && !props.elementInfo.groupId,
                    handler: () =>
                        orderElement(
                            props.elementInfo,
                            ElementOrderCommands.BOTTOM
                        ),
                    children: [
                        {
                            text: "置于底层",
                            handler: () =>
                                orderElement(
                                    props.elementInfo,
                                    ElementOrderCommands.BOTTOM
                                )
                        },
                        {
                            text: "下移一层",
                            handler: () =>
                                orderElement(
                                    props.elementInfo,
                                    ElementOrderCommands.DOWN
                                )
                        }
                    ]
                },
                { divider: true },
                {
                    text: "设置链接",
                    handler: props.openLinkDialog
                },
                {
                    text: props.elementInfo.groupId ? "取消组合" : "组合",
                    subText: "Ctrl + G",
                    handler: props.elementInfo.groupId
                        ? uncombineElements
                        : combineElements,
                    hide: !props.isMultiSelect
                },
                {
                    text: "全选",
                    subText: "Ctrl + A",
                    handler: selectAllElement
                },
                {
                    text: "锁定",
                    subText: "Ctrl + L",
                    handler: lockElement
                },
                {
                    text: "删除",
                    subText: "Delete",
                    handler: deleteElement
                }
            ];
        };

        return {
            currentElementComponent,
            contextmenus,
            editable
        };
    }
});
</script>
