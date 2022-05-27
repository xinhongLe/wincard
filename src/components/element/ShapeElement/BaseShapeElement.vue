<template>
    <div
        class="base-element-shape"
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
                :class="{move: selectElement}"
                :style="{
                    opacity: elementInfo.opacity,
                    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
                    transform: flipStyle,
                    color: text.defaultColor,
                    fontFamily: text.defaultFontName
                }"
                @mousedown="handleSelectElement"
                @touchstart="handleSelectElement"
            >
                <div style="font-size: 0;">
                    <SvgWrapper
                        overflow="visible"
                        :width="elementInfo.width"
                        :height="elementInfo.height"
                    >
                        <defs v-if="elementInfo.gradient">
                            <GradientDefs
                                :id="`base-gradient-${elementInfo.id}`"
                                :type="elementInfo.gradient.type"
                                :color1="elementInfo.gradient.color[0]"
                                :color2="elementInfo.gradient.color[1]"
                                :rotate="elementInfo.gradient.rotate"
                            />
                        </defs>
                        <g
                            :transform="`scale(${isScale ? (elementInfo.custom ? (elementInfo.width / elementInfo.customViewBox[0]) : (elementInfo.width / elementInfo.viewBox)) : 1}, ${isScale ? (elementInfo.custom ? (elementInfo.height / elementInfo.customViewBox[1]) : (elementInfo.height / elementInfo.viewBox)) : 1}) translate(0,0) matrix(1,0,0,1,0,0)`
                            "
                        >
                            <path
                                vector-effect="non-scaling-stroke"
                                stroke-linecap="butt"
                                stroke-miterlimit="8"
                                stroke-linejoin=""
                                :d="path"
                                :fill="
                                    elementInfo.gradient
                                        ? `url(#base-gradient-${elementInfo.id})`
                                        : elementInfo.fill || 'transparent'
                                "
                                :stroke="outlineColor"
                                :stroke-width="outlineWidth"
                                :stroke-dasharray="
                                    outlineStyle === 'dashed' ? '10 5' : '0 0'
                                "
                            ></path>
                        </g>
                    </SvgWrapper>
                </div>

                <div class="shape-text" :class="text.align">
                    <div class="ProseMirror-static" v-html="textHtml"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { PPTShapeElement } from "@/types/slides";
import useElementOutline from "@/components/element/hooks/useElementOutline";
import useElementShadow from "@/components/element/hooks/useElementShadow";
import useElementFlip from "@/components/element/hooks/useElementFlip";
import useSpecialShape from "./useSpecailShape";

import GradientDefs from "./GradientDefs.vue";

export default defineComponent({
    name: "base-shape-element",
    components: {
        GradientDefs
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTShapeElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent | TouchEvent,
                    element: PPTShapeElement,
                    canMove?: boolean
                ) => void
            >,
            default: null
        }
    },
    setup(props) {
        const outline = computed(() => props.elementInfo.outline);
        const { outlineWidth, outlineStyle, outlineColor } = useElementOutline(
            outline
        );

        const shadow = computed(() => props.elementInfo.shadow);
        const { shadowStyle } = useElementShadow(shadow);

        const flipH = computed(() => props.elementInfo.flipH);
        const flipV = computed(() => props.elementInfo.flipV);
        const { flipStyle } = useElementFlip(flipH, flipV);

        const elementInfo = computed(() => props.elementInfo);
        const { text, textHtml, path, isScale } = useSpecialShape(elementInfo);

        const handleSelectElement = (e: MouseEvent | TouchEvent) => {
            if (!props.selectElement) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo);
        };

        return {
            shadowStyle,
            outlineWidth,
            outlineStyle,
            outlineColor,
            flipStyle,
            text,
            path,
            handleSelectElement,
            isScale,
            textHtml
        };
    }
});
</script>

<style lang="scss" scoped>
.base-element-shape {
    position: absolute;
}
.rotate-wrapper {
    width: 100%;
    height: 100%;
}
.element-content {
    width: 100%;
    height: 100%;
    position: relative;
    &.move {
        cursor: move;
    }

    // overflow: hidden;

    svg {
        transform-origin: 0 0;
        overflow: visible;
    }
}
.shape-text {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 10px;
    line-height: 1.2;
    word-break: break-word;

    &.top {
        justify-content: flex-start;
    }
    &.middle {
        justify-content: center;
    }
    &.bottom {
        justify-content: flex-end;
    }
}
</style>
