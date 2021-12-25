<template>
    <div class="common-element-operate">
        <border-line
            class="operate-border-line"
            v-for="line in borderLines"
            :key="line.type"
            :type="line.type"
            :style="line.style"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "@/store";

import {
    PPTMarkElement
} from "@/types/slides";
import useCommonOperate from "../hooks/useCommonOperate";

import BorderLine from "./BorderLine.vue";

export default defineComponent({
    name: "common-element-operate",
    inheritAttrs: false,
    components: {
        BorderLine
    },
    props: {
        elementInfo: {
            type: Object as PropType<
                PPTMarkElement
            >,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const canvasScale = computed(() => store.state.canvasScale);

        const scaleWidth = computed(
            () => props.elementInfo.width * canvasScale.value
        );
        const scaleHeight = computed(
            () => props.elementInfo.height * canvasScale.value
        );
        const { borderLines } = useCommonOperate(
            scaleWidth,
            scaleHeight
        );

        return {
            borderLines
        };
    }
});
</script>
