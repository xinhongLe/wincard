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
        <div class="element-content">
            <div class="mark-content">
                <a-tooltip
                    placement="left"
                    trigger="click"
                    :title="elementInfo.content || ''"
                    arrow-point-at-center
                    overlayClassName="mark-tooltip"
                >
                    {{elementList.findIndex(element => element.id === elementInfo.id) + 1}}
                </a-tooltip>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, Ref, ref } from "vue";
import { PPTElement, PPTMarkElement } from "@/types/slides";

export default defineComponent({
    name: "editable-element-mark",
    props: {
        elementInfo: {
            type: Object as PropType<PPTMarkElement>,
            required: true
        }
    },
    setup() {
        const elements: Ref<PPTElement[]> = inject("elements") || ref([]);
        const elementList = computed(() => elements.value.filter(element => element.type === "mark"));
        const getPopupContainer = (trigger: HTMLElement) => {
            return trigger.parentElement;
        };
        return {
            getPopupContainer,
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

<style>
.mark-tooltip {
    /* width: 250px; */
    z-index: 10000;
}
.mark-tooltip .ant-tooltip-inner {
    font-size: 14px;
}
</style>
