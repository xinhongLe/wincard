<template>
    <div
        class="operate"
        :class="{ 'multi-select': isMultiSelect && !isActive }"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            transform: `rotate(${elementInfo.rotate}deg)`,
            transformOrigin: `${(elementInfo.width) /
                2}px ${(elementInfo.height) / 2}px`
        }"
    >
        <component
            v-if="isSelected"
            :is="currentOperateComponent"
            :elementInfo="elementInfo"
            :isMultiSelect="isMultiSelect"
            :rotateElement="rotateElement"
            :scaleElement="scaleElement"
            :dragLineElement="dragLineElement"
        ></component>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { ElementTypes, PPTElement } from "@/types/slides";
import { OperateLineHandler, OperateResizeHandler } from "@/types/edit";

import ShapeElementOperate from "./ShapeElementOperate.vue";
import LineElementOperate from "./LineElementOperate.vue";

export default defineComponent({
    name: "operate",
    props: {
        elementInfo: {
            type: Object as PropType<PPTElement>,
            required: true
        },
        isSelected: {
            type: Boolean,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
        isMultiSelect: {
            type: Boolean,
            required: true
        },
        rotateElement: {
            type: Function as PropType<(element: PPTElement) => void>,
            required: true
        },
        scaleElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTElement,
                    command: OperateResizeHandler
                ) => void
            >,
            required: true
        },
        dragLineElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTElement,
                    command: OperateLineHandler
                ) => void
            >,
            required: true
        }
    },
    setup(props) {
        const currentOperateComponent = computed(() => {
            const elementTypeMap = {
                [ElementTypes.SHAPE]: ShapeElementOperate,
                [ElementTypes.LINE]: LineElementOperate
            };
            if (props.elementInfo.type === ElementTypes.VIDEO) return elementTypeMap[props.elementInfo.type][props.elementInfo.showType] || null;
            return elementTypeMap[props.elementInfo.type] || null;
        });

        return {
            currentOperateComponent
        };
    }
});
</script>

<style lang="scss" scoped>
.operate {
    position: absolute;
    z-index: 100;
    user-select: none;

    &.multi-select {
        opacity: 0;
    }
}
.animation-index {
    position: absolute;
    top: 0;
    left: -24px;
    font-size: 12px;
    width: 18px;
    height: 18px;
    background-color: #fff;
    color: $themeColor;
    border: 1px solid $themeColor;
    display: flex;
    justify-content: center;
    align-items: center;
}

.display-index {
    position: absolute;
    top: -22px;
    left: -22px;
    font-size: 12px;
    width: 18px;
    height: 18px;
    background-color: #fff;
    color: $themeColor;
    border: 1px solid $themeColor;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
