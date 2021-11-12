<template>
    <div
        class="screen-element"
        :class="{ link: elementInfo.link }"
        :id="`screen-element-${elementInfo.id}`"
        :style="{
            zIndex: elementIndex,
            color: theme.fontColor,
            fontFamily: theme.fontName,
            fontSize: theme.fontSize,
            display: (typeof elementInfo.display === 'undefined' || elementInfo.display) ? 'block' : 'none',
            visibility: needWaitAnimation ? 'hidden' : 'visible'
        }"
        :title="elementInfo.link || ''"
    >
        <component
            :is="currentElementComponent"
            :elementInfo="elementInfo"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "@/store";
import { ElementTypes, PPTElement, Slide } from "@/types/slides";

import BaseImageElement from "@/components/element/ImageElement/BaseImageElement.vue";
import BaseTextElement from "@/components/element/TextElement/BaseTextElement.vue";
import BaseShapeElement from "@/components/element/ShapeElement/BaseShapeElement.vue";
import BaseLineElement from "@/components/element/LineElement/BaseLineElement.vue";
import ScreenChartElement from "@/components/element/ChartElement/ScreenChartElement.vue";
import BaseTableElement from "@/components/element/TableElement/BaseTableElement.vue";
import BaseLatexElement from "@/components/element/LatexElement/BaseLatexElement.vue";
import ScreenAudioElement from "@/components/element/AudioElement/ScreenAudioElement.vue";
import ScreenVideoElement from "@/components/element/VideoElement/ScreenVideoElement.vue";
import ScreenTeachElement from "@/components/element/TeachAidElement/ScreenTeachElement.vue";

export default defineComponent({
    name: "screen-element",
    props: {
        elementInfo: {
            type: Object as PropType<PPTElement>,
            required: true
        },
        elementIndex: {
            type: Number,
            required: true
        },
        animationIndex: {
            type: Number,
            default: -1
        }
    },
    setup(props) {
        const currentElementComponent = computed(() => {
            const elementTypeMap = {
                [ElementTypes.IMAGE]: BaseImageElement,
                [ElementTypes.TEXT]: BaseTextElement,
                [ElementTypes.SHAPE]: BaseShapeElement,
                [ElementTypes.LINE]: BaseLineElement,
                [ElementTypes.CHART]: ScreenChartElement,
                [ElementTypes.TABLE]: BaseTableElement,
                [ElementTypes.LATEX]: BaseLatexElement,
                [ElementTypes.AUDIO]: ScreenAudioElement,
                [ElementTypes.VIDEO]: ScreenVideoElement,
                [ElementTypes.TEACH]: ScreenTeachElement
            };
            return elementTypeMap[props.elementInfo.type] || null;
        });

        const store = useStore();
        const theme = computed(() => store.state.theme);
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);

        // 判断元素是否需要等待执行入场动画：等待执行的元素需要先隐藏
        const needWaitAnimation = computed(() => {
            const animations = currentSlide.value.animations || [];
            const elementIndexInAnimation = animations.findIndex(
                animation => animation.elId === props.elementInfo.id
            );
            if (
                elementIndexInAnimation !== -1 &&
                elementIndexInAnimation >= props.animationIndex
            ) return true;
            return false;
        });

        // 打开元素绑定的超链接
        // const openLink = () => {
        //     if (props.elementInfo.link) window.open(props.elementInfo.link);
        // };

        return {
            currentElementComponent,
            needWaitAnimation,
            theme
        };
    }
});
</script>

<style lang="scss" scoped>
.link {
    cursor: pointer;
}
</style>
