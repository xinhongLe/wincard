<template>
    <div
        class="editable-element-teach"
        :class="{ lock: elementInfo.lock }"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >

        <div
            class="element-content"
        >
            <iframe v-if="elementInfo.src" :src="elementInfo.src"></iframe>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "@/store";
import { PPTTeachAidElement } from "@/types/slides";

export default defineComponent({
    name: "editable-element-teach",
    props: {
        elementInfo: {
            type: Object as PropType<PPTTeachAidElement>,
            required: true
        }
    },
    setup() {
        const store = useStore();
        const scale = computed(() => store.state.canvasScale);

        return {
            scale
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-teach {
    position: absolute;

    &.lock .handler-border {
        cursor: default;
    }
}
.element-content {
    width: 100%;
    height: 100%;
    position: relative;
    iframe {
        width: 100%;
        height: 100%;
    }
}
</style>
