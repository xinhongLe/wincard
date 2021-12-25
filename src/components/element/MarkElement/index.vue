<template>
    <div
        class="editable-element-mark"
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
            <div
                class="element-content"
                v-contextmenu="contextmenus"
                @mousedown="$event => handleSelectElement($event)"
            >
                <div
                    class="mark-content"
                >
                    {{elementList.findIndex(element => element.id === elementInfo.id) + 1}}
                    <!-- <IconBookMark /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from "vue";
import { useStore } from "@/store";
import { PPTElement, PPTMarkElement, Slide } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";

export default defineComponent({
    name: "editable-element-mark",
    props: {
        elementInfo: {
            type: Object as PropType<PPTMarkElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTMarkElement,
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
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value ? currentSlide.value.elements.filter(element => element.type === "mark") : [];
        };
        watchEffect(setLocalElementList);
        const handleSelectElement = (e: MouseEvent) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();
            props.selectElement(e, props.elementInfo);
        };

        return {
            handleSelectElement,
            elementList
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-mark {
    position: absolute;

    &.lock .element-content {
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

    .mark-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 14px;
        color: #fff;
        background-image: url(~@/assets/images/pic_pizhu.png);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        padding-bottom: 2px;
    }
}
</style>
