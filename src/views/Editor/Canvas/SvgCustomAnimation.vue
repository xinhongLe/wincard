<template>
    <div
        class="svg-container"
        :class="(type !== 'dragBeeline' && type !== 'dragCustom') && 'pen'"
        @mousedown="drawStart"
        @mousemove="drawing"
        @mouseup="drawEnd"
        @mouseout="drawEnd"
        :style="{ transform: `scale(${scale})` }"
    >
        <svg-wrapper class="svg" :width="width" :height="height" :viewBox="viewBox">
            <defs>
                <marker
                    id="triangleStart"
                    markerUnits="strokeWidth"
                    markerWidth="5"
                    markerHeight="4"
                    refX="5"
                    refY="2"
                    orient="auto"
                >
                    <path d="M 0 0 L 5 2 L 0 4 z" fill="#00ff00" />
                </marker>
                <marker
                    id="triangleEnd"
                    markerUnits="strokeWidth"
                    markerWidth="5"
                    markerHeight="4"
                    refX="0"
                    refY="2"
                    orient="auto"
                >
                    <path d="M 0 0 L 5 2 L 0 4 z" fill="#ff0000" />
                </marker>
            </defs>

            <g ref="pathRef"></g>
        </svg-wrapper>
        <div
            class="move-element"
            @mousedown="moveStart"
            @mousemove="moving"
            @mouseup="moveEnd"
            :style="{
                width: element.width + 'px',
                height: element.height + 'px',
                top: element.top + 'px',
                left: element.left + 'px'
            }"
            v-if="type === 'dragBeeline' || type === 'dragCustom'"
        ></div>
        <component
            :is="currentElementComponent"
            :elementInfo="element"
            style="z-index: -1;"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref } from "vue";
import { addSvgElement, transformPoint } from "@/utils/svg";
import { createRandomCode } from "@/utils/common";
import { useStore } from "@/store";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import { Modal } from "ant-design-vue";
import emitter, { EmitterEvents } from "@/utils/emitter";
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
import ScreenIFrameElement from "@/components/element/IFrameElement/ScreenIFrameElement.vue";
import ScreenFlashElement from "@/components/element/FlashElement/ScreenFlashElement.vue";
import ScreenMarkElement from "@/components/element/MarkElement/ScreenMarkElement.vue";

type IElement = PPTElement & { height?: number };

export default defineComponent({
    name: "svg-custom-animation",
    props: {
        close: {
            type: Function,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: "custom"
        },
        target: {
            type: String,
            required: true
        },
        scale: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const canDrawing = ref(false);
        const pathRef = ref();
        const svgMatrix = ref<null | DOMMatrix>();
        const viewportRatio = computed(() => store.state.viewportRatio);
        const width = ref(VIEWPORT_SIZE);
        const height = ref(VIEWPORT_SIZE * viewportRatio.value);
        const viewBox = computed(() => {
            return `0 0 ${width.value} ${height.value}`;
        });

        let pathID = "";
        let path = "";

        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementCopy = currentSlide.value.elements.find(item => { return item.id === props.target; });
        const element = ref<IElement | undefined>(elementCopy ? JSON.parse(JSON.stringify(elementCopy)) : undefined);

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
                [ElementTypes.IFRAME]: ScreenIFrameElement,
                [ElementTypes.FLASH]: ScreenFlashElement,
                [ElementTypes.MARK]: ScreenMarkElement
            };
            return (props.type === "dragBeeline" || props.type === "dragCustom") ? element.value ? elementTypeMap[element.value.type] : null : null;
        });

        const drawPath = () => {
            nextTick(() => {
                if (props.path && pathRef.value) {
                    pathID = createRandomCode();
                    addSvgElement(pathRef.value, {
                        element: "polyline",
                        attr: {
                            id: pathID,
                            points: props.path,
                            fill: "none",
                            opacity: 1,
                            stroke: "#000",
                            "stroke-width": 3,
                            "stroke-linecap": "square",
                            "stroke-dasharray": "5,5",
                            style: "marker-start: url(#triangleStart);marker-end: url(#triangleEnd);"
                        }
                    });
                }
            });
        };

        drawPath();

        const drawStart = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (props.type === "dragBeeline" || props.type === "dragCustom") return;
            start(evt);
        };

        let startPoint = { x: 0, y: 0 };
        const moveStart = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            start(evt);
        };

        const start = (evt: MouseEvent) => {
            canDrawing.value = true;
            svgMatrix.value = pathRef.value.getScreenCTM().inverse();
            if (!svgMatrix.value) return (canDrawing.value = false);
            const point = transformPoint(evt.pageX, evt.pageY, svgMatrix.value);

            if ((props.type === "dragBeeline" || props.type === "dragCustom") && element.value) {
                startPoint = point;
                path = (element.value.left + element.value.width / 2) + "," + (element.value.top + (element.value.height || 4) / 2) + " ";
            } else {
                path = point.x + "," + point.y + " ";
            }

            pathID = createRandomCode();
            addSvgElement(pathRef.value, {
                element: "polyline",
                attr: {
                    id: pathID,
                    points: path,
                    fill: "none",
                    opacity: 1,
                    stroke: "#000",
                    "stroke-width": 3,
                    "stroke-linecap": "square",
                    "stroke-dasharray": "0,0",
                    style: "pointer-events:none"
                }
            });
        };

        const drawing = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (props.type === "dragBeeline" || props.type === "dragCustom") return;
            ing(evt);
        };

        const moving = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            ing(evt);
        };

        const ing = (evt: MouseEvent) => {
            if (canDrawing.value && pathID && svgMatrix.value) {
                let tempPath = path;
                const point = transformPoint(
                    evt.pageX,
                    evt.pageY,
                    svgMatrix.value
                );

                switch (props.type) {
                case "beeline":
                    tempPath += point.x + "," + point.y + " ";
                    break;
                case "custom":
                    tempPath += point.x + "," + point.y + " ";
                    path = tempPath;
                    break;
                case "dragBeeline":
                case "dragCustom":
                    if (element.value) {
                        const moveX = point.x - startPoint.x;
                        const moveY = point.y - startPoint.y;
                        startPoint = point;
                        element.value.top += moveY;
                        element.value.left += moveX;
                        tempPath += (element.value.left + element.value.width / 2) + "," + (element.value.top + (element.value.height || 4) / 2) + " ";
                    }
                    if (props.type === "dragCustom") path = tempPath;
                    break;
                }
                const shape = pathRef.value.querySelector(`[id='${pathID}']`);
                if (shape) {
                    shape.setAttributeNS(null, "points", tempPath);
                }
            }
        };

        const drawEnd = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (props.type === "dragBeeline" || props.type === "dragCustom") return;
            end(evt);
        };

        const moveEnd = (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            end(evt);
        };

        const end = (evt: MouseEvent) => {
            if (pathID && canDrawing.value && svgMatrix.value) {
                canDrawing.value = false;
                const shape = pathRef.value.querySelector(`[id='${pathID}']`);
                if (shape) {
                    const points = shape.getAttribute("points");
                    const commaIndex = points.indexOf(",");
                    let keep = null;
                    if (commaIndex >= 0) {
                        keep = points.indexOf(",", commaIndex + 1) >= 0;
                    } else {
                        keep = points.indexOf(" ", points.indexOf(" ") + 1) >= 0;
                    }
                    if (!keep) {
                        shape.parentNode.removeChild(shape);
                        pathID = "";
                        path = "";
                    } else {
                        const point = transformPoint(
                            evt.pageX,
                            evt.pageY,
                            svgMatrix.value
                        );

                        if ((props.type === "dragBeeline" || props.type === "dragCustom") && element.value) {
                            startPoint = point;
                            path += (element.value.left + element.value.width / 2) + "," + (element.value.top + (element.value.height || 4) / 2) + " ";
                        } else {
                            path += point.x + "," + point.y + " ";
                        }

                        shape.setAttributeNS(null, "points", path);
                        // 绘制成功 变成虚线
                        shape.setAttribute("stroke-dasharray", "5,5");
                        // 补充开头结尾箭头标识
                        shape.setAttribute(
                            "style",
                            "marker-start: url(#triangleStart);marker-end: url(#triangleEnd);"
                        );
                        Modal.confirm({
                            title: "提示",
                            content: "确定使用该自定义动画路径？",
                            okText: "确定",
                            cancelText: "重新绘制",
                            onOk() {
                                emitter.emit(EmitterEvents.SET_CUSTOM_ANIMATION, path);
                                props.close();
                            },
                            onCancel() {
                                setTimeout(() => {
                                    emitter.emit(EmitterEvents.OPEN_CUSTOM_ANIMATION, {
                                        path: "",
                                        type: props.type,
                                        target: props.target
                                    });
                                    pathID = "";
                                    path = "";
                                }, 300);
                            }
                        });
                    }
                } else {
                    pathID = "";
                    path = "";
                }
            }
            canDrawing.value = false;
        };

        return {
            drawStart,
            drawing,
            drawEnd,
            moveStart,
            moving,
            moveEnd,
            canDrawing,
            pathRef,
            viewBox,
            element,
            width,
            height,
            currentElementComponent
        };
    }
});
</script>

<style lang="scss" scoped>
.pen {
    cursor: url(~@/assets/images/write.png) 0 32, auto;
}

.move-element {
    position: absolute;
    z-index: 2;
    cursor: move;
}

.svg-container {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
    .svg {
        position: relative;
        z-index: 1;
    }
}
</style>
