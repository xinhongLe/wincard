<template>
    <div
        class="editable-element-iframe"
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
import { defineComponent, PropType } from "vue";
import { PPTWebIFrameElement } from "@/types/slides";

export default defineComponent({
    name: "editable-element-iframe",
    props: {
        elementInfo: {
            type: Object as PropType<PPTWebIFrameElement>,
            required: true
        }
    }
});
</script>

<style lang="scss" scoped>
.editable-element-iframe {
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
