<template>
    <div
        class="element-create-selection"
        ref="selectionRef"
        @mousedown.stop="onMouseDown"
        @touchstart.stop="onTouchStart"
    >
        <div
            :class="['selection', creatingElement?.type]"
            v-if="start && end"
            :style="position"
        >
            <!-- 绘制线条专用 -->
            <svg-wrapper
                v-if="creatingElement?.type === 'line' && lineData"
                overflow="visible"
                :width="lineData.svgWidth"
                :height="lineData.svgHeight"
            >
                <path
                    :d="lineData.path"
                    stroke="#d14424"
                    fill="none"
                    stroke-width="1"
                    stroke-linecap
                    stroke-linejoin
                    stroke-miterlimit
                ></path>
            </svg-wrapper>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useStore } from "@/store";

export default defineComponent({
    name: "element-create-selection",
    emits: ["created"],
    setup(props, { emit }) {
        const store = useStore();

        const ctrlOrShiftKeyActive = computed<boolean>(
            () => store.getters.ctrlOrShiftKeyActive
        );

        const creatingElement = computed(() => store.state.creatingScreenShapeElement);

        const start = ref<number[]>([]);
        const end = ref<number[]>([]);

        const selectionRef = ref<HTMLElement>();
        const offset = reactive({
            x: 0,
            y: 0
        });
        let isMouseDown = false;

        onMounted(() => {
            if (!selectionRef.value) return;
            const { x, y } = selectionRef.value.getBoundingClientRect();
            offset.x = x;
            offset.y = y;
        });

        const onMove = (currentPageX: number, currentPageY: number) => {
            if (!creatingElement.value || !isMouseDown) return;
            const [startPageX, startPageY] = start.value;
            // 按住Ctrl键或者Shift键时：
            // 对于非线条元素需要锁定宽高比例，对于线条元素需要锁定水平或垂直方向
            if (ctrlOrShiftKeyActive.value) {
                const moveX = currentPageX - startPageX;
                const moveY = currentPageY - startPageY;

                // 水平和垂直方向的拖动距离，后面以拖动距离较大的方向为基础计算另一方向的数据
                const absX = Math.abs(moveX);
                const absY = Math.abs(moveY);

                if (creatingElement.value.type === "shape") {
                    // 判断是否为反向拖动：从左上到右下为正向操作，此外所有情况都是反向操作
                    const isOpposite =
                            (moveY > 0 && moveX < 0) ||
                            (moveY < 0 && moveX > 0);

                    if (absX > absY) {
                        currentPageY = isOpposite
                            ? startPageY - moveX
                            : startPageY + moveX;
                    } else {
                        currentPageX = isOpposite
                            ? startPageX - moveY
                            : startPageX + moveY;
                    }
                } else if (creatingElement.value.type === "line") {
                    if (absX > absY) currentPageY = startPageY;
                    else currentPageX = startPageX;
                }
            }

            end.value = [currentPageX, currentPageY];
        };

        const onEnd = (endPageX: number, endPageY: number) => {
            isMouseDown = false;
            const minSize = 30;
            const [startPageX, startPageY] = start.value;
            if (
                    creatingElement.value?.type === "line" &&
                    (Math.abs(endPageX - startPageX) >= minSize ||
                        Math.abs(endPageY - startPageY) >= minSize)
            ) {
                emit("created", {
                    start: start.value,
                    end: end.value
                });
            } else if (
                    creatingElement.value?.type !== "line" &&
                    Math.abs(endPageX - startPageX) >= minSize &&
                    Math.abs(endPageY - startPageY) >= minSize
            ) {
                emit("created", {
                    start: start.value,
                    end: end.value
                });
            } else {
                const defaultSize = 200;
                const minX = Math.min(endPageX, startPageX);
                const minY = Math.min(endPageY, startPageY);
                const maxX = Math.max(endPageX, startPageX);
                const maxY = Math.max(endPageY, startPageY);
                const offsetX =
                        maxX - minX >= minSize ? maxX - minX : defaultSize;
                const offsetY =
                        maxY - minY >= minSize ? maxY - minY : defaultSize;
                emit("created", {
                    start: [minX, minY],
                    end: [minX + offsetX, minY + offsetY]
                });
            }
        };

        const onMouseDown = (e: MouseEvent) => {
            isMouseDown = true;
            const startPageX = e.pageX;
            const startPageY = e.pageY;
            start.value = [startPageX, startPageY];
            document.onmousemove = e => {
                const currentPageX = e.pageX;
                const currentPageY = e.pageY;
                onMove(currentPageX, currentPageY);
            };
            document.onmouseup = e => {
                document.onmousemove = null;
                document.onmouseup = null;
                const endPageX = e.pageX;
                const endPageY = e.pageY;
                onEnd(endPageX, endPageY);
            };
        };

        const onTouchStart = (e: TouchEvent) => {
            isMouseDown = true;
            const startPageX = e.touches[0]?.pageX;
            const startPageY = e.touches[0]?.pageY;
            start.value = [startPageX, startPageY];
            const ontouchmove = (e: TouchEvent) => {
                const currentPageX = e.touches[0]?.pageX;
                const currentPageY = e.touches[0]?.pageY;
                onMove(currentPageX, currentPageY);
            };

            const ontouchend = (e: TouchEvent) => {
                document.removeEventListener("touchmove", ontouchmove);
                document.removeEventListener("touchend", ontouchend);
                const endPageX = e.changedTouches[0]?.pageX;
                const endPageY = e.changedTouches[0]?.pageY;
                onEnd(endPageX, endPageY);
            };
            document.addEventListener("touchmove", ontouchmove);
            document.addEventListener("touchend", ontouchend);
        };

        // 绘制线条的路径相关数据（仅当绘制元素类型为线条时使用）
        const lineData = computed(() => {
            if (!start.value || !end.value) return null;
            if (
                !creatingElement.value ||
                creatingElement.value.type !== "line"
            ) {
                return null;
            }

            const [_startX, _startY] = start.value;
            const [_endX, _endY] = end.value;
            const minX = Math.min(_startX, _endX);
            const maxX = Math.max(_startX, _endX);
            const minY = Math.min(_startY, _endY);
            const maxY = Math.max(_startY, _endY);

            const svgWidth = maxX - minX >= 24 ? maxX - minX : 24;
            const svgHeight = maxY - minY >= 24 ? maxY - minY : 24;

            const startX = _startX === minX ? 0 : maxX - minX;
            const startY = _startY === minY ? 0 : maxY - minY;
            const endX = _endX === minX ? 0 : maxX - minX;
            const endY = _endY === minY ? 0 : maxY - minY;

            const path = `M${startX}, ${startY} L${endX}, ${endY}`;

            return {
                svgWidth,
                svgHeight,
                startX,
                startY,
                endX,
                endY,
                path
            };
        });

        // 根据生成范围的起始位置和终点位置，计算元素创建时的位置和大小
        const position = computed(() => {
            if (!start.value || !end.value) return {};

            const [startX, startY] = start.value;
            const [endX, endY] = end.value;
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);

            const width = maxX - minX;
            const height = maxY - minY;

            return {
                left: minX - offset.x + "px",
                top: minY - offset.y + "px",
                width: width + "px",
                height: height + "px"
            };
        });

        return {
            selectionRef,
            start,
            end,
            creatingElement,
            onMouseDown,
            onTouchStart,
            lineData,
            position
        };
    }
});
</script>

<style lang="scss" scoped>
.element-create-selection {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    cursor: crosshair;
}
.selection {
    position: absolute;
    opacity: 0.8;

    &:not(.line) {
        border: 1px solid $themeColor;
    }
}
</style>
