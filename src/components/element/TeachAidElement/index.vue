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
            v-contextmenu="contextmenus"
        >
            <iframe v-if="elementInfo.src" :src="elementInfo.src"></iframe>
            <div
                :class="['handler-border', item]"
                v-for="item in ['t', 'b', 'l', 'r']"
                :key="item"
                @mousedown="($event) => handleSelectElement($event)"
            ></div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "@/store";
import { PPTTeachAidElement } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";

export default defineComponent({
    name: "editable-element-teach",
    props: {
        elementInfo: {
            type: Object as PropType<PPTTeachAidElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTTeachAidElement,
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
        const scale = computed(() => store.state.canvasScale);

        const handleSelectElement = (e: MouseEvent, canMove = true) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo, canMove);
        };

        return {
            scale,
            handleSelectElement
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
    background: #fff;
    iframe {
        width: 100%;
        height: 100%;
    }
}
.handler-border {
    position: absolute;
    cursor: move;

    &.t {
        width: 100%;
        height: 20px;
        top: 0;
        left: 0;
    }
    &.b {
        width: 100%;
        height: 5px;
        bottom: 0;
        left: 0;
    }
    &.l {
        width: 10px;
        height: 100%;
        left: 0;
        top: 0;
    }
    &.r {
        width: 10px;
        height: 100%;
        right: 0;
        top: 0;
    }
}
</style>
