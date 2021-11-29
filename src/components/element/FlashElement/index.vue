<template>
    <div
        class="editable-element-flash"
        :class="{ lock: elementInfo.lock }"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div
            class="rotate-wrapper"
            :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
        >
            <div class="element-content"
                v-contextmenu="contextmenus"
                @mousedown="($event) => handleSelectElement($event)"
            >
                <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="" />
                <img
                    class="icon-image"
                    v-else
                    src="@/assets/images/flash.png"
                    alt=""
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { PPTFlashElement } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";
import useOssFlash from "./useOssFlash";

export default defineComponent({
    name: "editable-element-flash",
    props: {
        elementInfo: {
            type: Object as PropType<PPTFlashElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTFlashElement,
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
        const handleSelectElement = (e: MouseEvent, canMove = true) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo, canMove);
        };

        const flashElement = computed(() => props.elementInfo);
        const { iconUrl } = useOssFlash(flashElement);

        return {
            iconUrl,
            handleSelectElement
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-flash {
    position: absolute;

    &.lock .handler-border {
        cursor: default;
    }
}
.rotate-wrapper {
    width: 100%;
    height: 100%;
}
.element-content {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: move;
}
.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    -webkit-user-drag: none;
}
</style>
