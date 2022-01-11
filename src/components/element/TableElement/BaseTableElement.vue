<template>
    <div
        class="base-element-table"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px'
        }"
    >
        <div class="element-content">
            <StaticTable
                :data="elementInfo.data"
                :width="elementInfo.width"
                :colWidths="elementInfo.colWidths"
                :height="elementInfo.height"
                :rowHeights="rowHeights"
                :outline="elementInfo.outline"
                :theme="elementInfo.theme"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { PPTTableElement } from "@/types/slides";

import StaticTable from "./StaticTable.vue";

export default defineComponent({
    name: "base-element-table",
    components: {
        StaticTable
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTTableElement>,
            required: true
        }
    },
    setup(props) {
        const rowHeights = computed(() => {
            let rowHeights = props.elementInfo.rowHeights || [];
            if (rowHeights.length === 0) {
                const rowsNum = props.elementInfo.data.length;
                // 以前的旧数据格式处理
                rowHeights = Array.from({ length: rowsNum }, () => 1 / rowsNum);
            }
            return rowHeights;
        });
        return {
            rowHeights
        };
    }
});
</script>

<style lang="scss" scoped>
.base-element-table {
    position: absolute;
}

.element-content {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
