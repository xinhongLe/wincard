<template>
    <div class="multi-position-panel">
        <a-button-group class="row">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="左对齐"
            >
                <a-button style="flex: 1;" @click="alignElement('left')"
                    ><IconAlignLeft
                /></a-button>
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="水平居中"
            >
                <a-button style="flex: 1;" @click="alignElement('horizontal')"
                    ><IconAlignHorizontally
                /></a-button>
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="右对齐"
            >
                <a-button style="flex: 1;" @click="alignElement('right')"
                    ><IconAlignRight
                /></a-button>
            </a-tooltip>
        </a-button-group>
        <a-button-group class="row">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="上对齐"
            >
                <a-button style="flex: 1;" @click="alignElement('top')"
                    ><IconAlignTop
                /></a-button>
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="垂直居中"
            >
                <a-button style="flex: 1;" @click="alignElement('vertical')"
                    ><IconAlignVertically
                /></a-button>
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="下对齐"
            >
                <a-button style="flex: 1;" @click="alignElement('bottom')"
                    ><IconAlignBottom
                /></a-button>
            </a-tooltip>
        </a-button-group>
        <a-button-group class="row" v-if="displayItemCount > 2">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="水平均匀分布"
            >
                <a-button style="flex: 1;" @click="uniformHorizontalDisplay()">
                    <IconDistributeHorizontally />
                </a-button>
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="垂直均匀分布"
            >
                <a-button style="flex: 1;" @click="uniformVerticalDisplay()">
                    <IconDistributeVertically />
                </a-button>
            </a-tooltip>
        </a-button-group>

        <a-divider />

        <a-button-group class="row">
            <a-button
                :disabled="!canCombine"
                @click="combineElements()"
                style="flex: 1;"
                ><IconGroup style="margin-right: 3px;" />组合</a-button
            >
            <a-button
                :disabled="canCombine"
                @click="uncombineElements()"
                style="flex: 1;"
                ><IconUngroup style="margin-right: 3px;" />取消组合</a-button
            >
        </a-button-group>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElementAlignCommand } from "@/types/edit";
import useCombineElement from "@/hooks/useCombineElement";
import useAlignActiveElement from "@/hooks/useAlignActiveElement";
import useAlignElementToCanvas from "@/hooks/useAlignElementToCanvas";
import useUniformDisplayElement from "@/hooks/useUniformDisplayElement";

export default defineComponent({
    name: "multi-position-panel",
    setup() {
        const {
            canCombine,
            combineElements,
            uncombineElements
        } = useCombineElement();
        const { alignActiveElement } = useAlignActiveElement();
        const { alignElementToCanvas } = useAlignElementToCanvas();
        const {
            displayItemCount,
            uniformHorizontalDisplay,
            uniformVerticalDisplay
        } = useUniformDisplayElement();

        // 多选元素对齐，需要先判断当前所选中的元素状态：
        // 如果所选元素为一组组合元素，则将它对齐到画布；
        // 如果所选元素不是组合元素或不止一组元素（即当前为可组合状态），则将这多个（多组）元素相互对齐。
        const alignElement = (command: ElementAlignCommand) => {
            if (canCombine.value) alignActiveElement(command);
            else alignElementToCanvas(command);
        };

        return {
            canCombine,
            displayItemCount,
            combineElements,
            uncombineElements,
            uniformHorizontalDisplay,
            uniformVerticalDisplay,
            alignElement
        };
    }
});
</script>

<style lang="scss" scoped>
.row {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
</style>
