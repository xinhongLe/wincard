<template>
    <div
        class="svg-container pen"
        @mousedown="drawStart"
        @mousemove="drawing"
        @mouseup="drawEnd"
        @mouseout="drawEnd"
    >
        <svg-wrapper width="100%" height="100%" :viewBox="viewBox">
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
        }
    },
    setup(props) {
        const store = useStore();
        const canDrawing = ref(false);
        const pathRef = ref();
        const svgMatrix = ref<null | DOMMatrix>();
        const viewportRatio = computed(() => store.state.viewportRatio);
        const viewBox = computed(() => {
            return `0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE * viewportRatio.value}`;
        });

        let pathID = "";
        let path = "";

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
            canDrawing.value = true;
            svgMatrix.value = pathRef.value.getScreenCTM().inverse();
            if (!svgMatrix.value) return (canDrawing.value = false);
            const point = transformPoint(evt.pageX, evt.pageY, svgMatrix.value);
            path = point.x + "," + point.y + " ";
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
            if (canDrawing.value && pathID && svgMatrix.value) {
                let tempPath = path;
                const point = transformPoint(
                    evt.pageX,
                    evt.pageY,
                    svgMatrix.value
                );
                tempPath += point.x + "," + point.y + " ";
                switch (props.type) {
                case "beeline":
                    // 不做处理
                    break;
                case "custom":
                    path = tempPath;
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
                        path += point.x + "," + point.y + " ";
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
                                        type: props.type
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
            canDrawing,
            pathRef,
            viewBox
        };
    }
});
</script>

<style lang="scss">
.pen {
    cursor: url(~@/assets/images/write.png) 0 32, auto;
}
</style>
