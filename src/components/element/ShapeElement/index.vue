<template>
    <div
        class="editable-element-shape"
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
                :style="{
                    opacity: elementInfo.opacity,
                    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
                    transform: flipStyle,
                    color: text.defaultColor,
                    fontFamily: text.defaultFontName
                }"
                v-contextmenu="contextmenus"
                @mousedown="$event => handleSelectElement($event)"
                @dblclick="enterEditing()"
            >
                <div style="font-size: 0;">
                    <SvgWrapper
                        overflow="visible"
                        :width="elementInfo.width"
                        :height="elementInfo.height"
                    >
                        <defs v-if="elementInfo.gradient">
                            <GradientDefs
                                :id="`editabel-gradient-${elementInfo.id}`"
                                :type="elementInfo.gradient.type"
                                :color1="elementInfo.gradient.color[0]"
                                :color2="elementInfo.gradient.color[1]"
                                :rotate="elementInfo.gradient.rotate"
                            />
                        </defs>
                        <g
                            :transform="
                                `scale(${isScale ? elementInfo.width /
                                    elementInfo.viewBox : 1}, ${isScale ? elementInfo.height /
                                    elementInfo.viewBox : 1}) translate(0,0) matrix(1,0,0,1,0,0)`
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
                                        ? `url(#editabel-gradient-${elementInfo.id})`
                                        : elementInfo.fill
                                "
                                :stroke="outlineColor"
                                :stroke-width="outlineWidth"
                                :stroke-dasharray="
                                    outlineStyle === 'dashed' ? '10 6' : '0 0'
                                "
                            ></path>
                        </g>
                    </SvgWrapper>
                </div>

                <div class="shape-text" :class="text.align">
                    <ProsemirrorEditor
                        v-if="editable"
                        :elementId="elementInfo.id"
                        :defaultColor="text.defaultColor"
                        :defaultFontName="text.defaultFontName"
                        :defaultFontSize="text.defaultFontSize"
                        :editable="!elementInfo.lock"
                        :autoFocus="true"
                        :value="text.content"
                        @update="value => updateText(value)"
                        @mousedown.stop
                    />
                    <div
                        class="show-text ProseMirror-static"
                        v-else
                        v-html="text.content"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTShapeElement, ShapeText } from "@/types/slides";
import { ContextmenuItem } from "@/types/contextmenu";
import useElementOutline from "@/components/element/hooks/useElementOutline";
import useElementShadow from "@/components/element/hooks/useElementShadow";
import useElementFlip from "@/components/element/hooks/useElementFlip";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import GradientDefs from "./GradientDefs.vue";
import ProsemirrorEditor from "@/components/element/ProsemirrorEditor.vue";

export default defineComponent({
    name: "editable-element-shape",
    components: {
        GradientDefs,
        ProsemirrorEditor
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTShapeElement>,
            required: true
        },
        selectElement: {
            type: Function as PropType<
                (
                    e: MouseEvent,
                    element: PPTShapeElement,
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

        const { addHistorySnapshot } = useHistorySnapshot();

        const handleSelectElement = (e: MouseEvent) => {
            if (props.elementInfo.lock) return;
            e.stopPropagation();

            props.selectElement(e, props.elementInfo);
        };

        const outline = computed(() => props.elementInfo.outline);
        const { outlineWidth, outlineStyle, outlineColor } = useElementOutline(
            outline
        );

        const shadow = computed(() => props.elementInfo.shadow);
        const { shadowStyle } = useElementShadow(shadow);

        const flipH = computed(() => props.elementInfo.flipH);
        const flipV = computed(() => props.elementInfo.flipV);
        const { flipStyle } = useElementFlip(flipH, flipV);

        const editable = ref(false);

        const enterEditing = () => {
            editable.value = true;
            store.commit(
                MutationTypes.SET_EDITING_SHAPE_ELEMENT_ID,
                props.elementInfo.id
            );
        };

        const exitEditing = () => {
            editable.value = false;
            store.commit(MutationTypes.SET_EDITING_SHAPE_ELEMENT_ID, "");
        };

        const handleElementId = computed(() => store.state.handleElementId);
        watch(handleElementId, () => {
            if (handleElementId.value !== props.elementInfo.id) {
                if (editable.value) exitEditing();
            }
        });

        const text = computed<ShapeText>(() => {
            const defaultText: ShapeText = {
                content: "",
                defaultFontName: "微软雅黑",
                defaultColor: "#000",
                defaultFontSize: "14px",
                align: "middle"
            };
            if (!props.elementInfo.text) return defaultText;

            return props.elementInfo.text;
        });

        const updateText = (content: string) => {
            const _text = { ...text.value, content };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: props.elementInfo.id,
                props: { text: _text }
            });

            addHistorySnapshot();
        };

        const path = computed(() => {
            if (props.elementInfo.path === "M 20 0 L 180 0 Q 200 0 200 20 L 200 180 Q 200 200 180 200 L 20 200 Q 0 200 0 180 L 0 20 Q 0 0 20 0 Z") {
                const borderRadius = props.elementInfo.radius || 0;
                const w = props.elementInfo.width;
                const h = props.elementInfo.height;
                return `M ${borderRadius} 0 L ${w - borderRadius} 0 Q ${w} 0 ${w} ${borderRadius} L ${w} ${h - borderRadius} Q ${w} ${h} ${w - borderRadius} ${h} L ${borderRadius} ${h} Q 0 ${h} 0 ${h - borderRadius} L 0 ${borderRadius} Q 0 0 ${borderRadius} 0 Z`;
            }
            if (props.elementInfo.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z") {
                const borderRadius = props.elementInfo.radius || 0;
                const w = props.elementInfo.width;
                const h = props.elementInfo.height;
                const position = props.elementInfo.chartPosition || "bottom";
                const offset = props.elementInfo.chartOffset || (position === "top" || position === "bottom" ? (Math.ceil(w / 4)) : (Math.ceil(h / 4)));
                const bottom = `L ${offset + 10} ${h} L ${offset - 10} ${h + 40} L ${offset - 10} ${h}`;
                const left = `L 0 ${offset + 10} L -40 ${offset - 10} L 0 ${offset - 10}`;
                const right = `L ${w} ${offset - 10} L ${w + 40} ${offset + 10} L ${w} ${offset + 10}`;
                const top = `L ${offset - 10} 0 L ${offset + 10} -40 L ${offset + 10} 0`;
                return `M 0 ${borderRadius} Q 0 0 ${borderRadius} 0 ${position === "top" ? top : ""} L ${w - borderRadius} 0 Q ${w} 0 ${w} ${borderRadius} ${position === "right" ? right : ""} L ${w} ${h - borderRadius} Q ${w} ${h} ${w - borderRadius} ${h} ${position === "bottom" ? bottom : ""} L ${borderRadius} ${h} Q 0 ${h} 0 ${h - borderRadius} ${position === "left" ? left : ""} L 0 ${borderRadius} Z`;
            }
            return props.elementInfo.path;
        });

        const isScale = computed(() => {
            return !(props.elementInfo.path === "M 20 0 L 180 0 Q 200 0 200 20 L 200 180 Q 200 200 180 200 L 20 200 Q 0 200 0 180 L 0 20 Q 0 0 20 0 Z" || props.elementInfo.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z");
        });

        return {
            shadowStyle,
            outlineWidth,
            outlineStyle,
            outlineColor,
            flipStyle,
            editable,
            text,
            handleSelectElement,
            updateText,
            enterEditing,
            path,
            isScale
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-shape {
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
.show-text {
    pointer-events: none;
}
</style>
