<template>
    <div class="alignment-line" :style="{ left, top }">
        <div :class="['line', type]" :style="sizeStyle"></div>
    </div>
</template>

<script lang="ts">
import { computed, PropType, defineComponent } from "vue";
import { AlignmentLineAxis } from "@/types/edit";

export default defineComponent({
    name: "alignment-line",
    props: {
        type: {
            type: String as PropType<"vertical" | "horizontal">,
            required: true
        },
        axis: {
            type: Object as PropType<AlignmentLineAxis>,
            required: true
        },
        length: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        // 吸附对齐线的位置
        const left = computed(() => props.axis.x + "px");
        const top = computed(() => props.axis.y + "px");

        // 吸附对齐线的长度
        const sizeStyle = computed(() => {
            if (props.type === "vertical") return { height: props.length + "px" };
            return { width: props.length + "px" };
        });

        return {
            left,
            top,
            sizeStyle
        };
    }
});
</script>

<style lang="scss" scoped>
.alignment-line {
    position: absolute;
    z-index: 100;

    .line {
        width: 0;
        height: 0;
        border: 0 dashed $themeColor;

        &.vertical {
            transform: translateY(-0.5px);
            border-left-width: 1px;
        }
        &.horizontal {
            transform: translateX(-0.5px);
            border-top-width: 1px;
        }
    }
}
</style>
