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
                                `scale(${isScale ? (elementInfo.custom ? (elementInfo.width / elementInfo.customViewBox[0]) : (elementInfo.width / elementInfo.viewBox)) : 1}, ${isScale ? (elementInfo.custom ? (elementInfo.height / elementInfo.customViewBox[1]) : (elementInfo.height / elementInfo.viewBox)) : 1}) translate(0,0) matrix(1,0,0,1,0,0)`
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
                        v-if="textEditable"
                        :elementId="elementInfo.id"
                        :defaultColor="text.defaultColor"
                        :defaultFontName="text.defaultFontName"
                        :defaultFontSize="text.defaultFontSize"
                        :editable="!elementInfo.lock"
                        :autoFocus="autoFocus"
                        :value="dealInputText(text.content)"
                        @update="value => updateText(value)"
                        @mousedown.stop
                    />
                    <div
                        class="show-text ProseMirror-static"
                        v-else
                        v-html="textHtml"
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
import useSpecialShape from "./useSpecailShape";

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
        const elementInfo = computed(() => props.elementInfo);
        const { text, textHtml, path, isScale } = useSpecialShape(elementInfo);
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

        const updateText = (content: string) => {
            const _text = { ...text.value, content };
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: props.elementInfo.id,
                props: { text: _text }
            });

            addHistorySnapshot();
        };

        // 当不需要富文本显示的时候不使用富文本渲染 降低性能消耗
        const textEditable = computed(() => {
            return editable.value || (store.state.handleElementId !== props.elementInfo.id && store.state.activeElementIdList.indexOf(props.elementInfo.id || "") > -1);
        });

        const autoFocus = computed(() => {
            return store.state.handleElementId === props.elementInfo.id && editable.value;
        });

        const dealInputText = (text: string) => {
            return text.replace(/<br.*?>/ig, "");
        };

        return {
            shadowStyle,
            outlineWidth,
            outlineStyle,
            outlineColor,
            flipStyle,
            textEditable,
            autoFocus,
            text,
            handleSelectElement,
            updateText,
            enterEditing,
            path,
            isScale,
            textHtml,
            dealInputText
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
