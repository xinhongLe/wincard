<template>
    <div
        class="writing-board"
        :class="enable ? '' : 'no-point-event'"
        ref="writingBoardRef"
    >
        <div class="blackboard" v-if="blackboard"></div>

        <div
            class="canvas-box"
            ref="contentRef"
            :style="{
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                marginLeft: offsetX - ((screenWidth - slideWidth) / 2) * (scale - 1) + 'px',
                marginTop: offsetY - ((screenHeight - slideHeight) / 2) * (scale - 1) + 'px',
                cursor: (penTempHide ? 'auto' : 'none')
            }"
        >
            <canvas
                class="canvas"
                ref="canvasRef"
                @mousedown="$event => handleMousedown($event)"
                @mousemove="$event => handleMousemove($event)"
                @mouseup="handleMouseup()"
                @touchstart="$event => handleMousedown($event)"
                @touchmove="$event => handleMousemove($event)"
                @touchend="
                    handleMouseup();
                    mouseInCanvas = false;
                "
                @mouseleave="
                    handleMouseup();
                    mouseInCanvas = false;
                "
                @mouseenter="mouseInCanvas = true"
                :style="{
                    transform: `scale(${scale})`
                }"
            ></canvas>
        </div>

        <div
            class="pen"
            :style="{
                left: mouse.x * scale + (offsetX  + offsetScreenX - ((screenWidth - slideWidth) / 2) * (scale - 1)) - penSize / 2 + 'px',
                top: mouse.y * scale + (offsetY + offsetScreenY - ((screenHeight - slideHeight) / 2) * (scale - 1)) - 36 + penSize / 2 + 'px',
                color: color
            }"
            v-if="mouseInCanvas && !penTempHide && model === 'pen'"
        >
            <IconWrite class="icon" size="36" />
        </div>

        <div
            class="eraser"
            :style="{
                left: mouse.x - rubberSize / 2 + 'px',
                top: mouse.y - rubberSize / 2 + 'px',
                width: rubberSize + 'px',
                height: rubberSize + 'px'
            }"
            v-if="mouseInCanvas && model === 'eraser'"
        ></div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, reactive, ref } from "vue";

export default defineComponent({
    name: "writing-board",
    props: {
        color: {
            type: String,
            default: "#ffcc00"
        },
        model: {
            type: String as PropType<"pen" | "eraser">,
            default: "pen"
        },
        blackboard: {
            type: Boolean,
            default: false
        },
        scale: {
            type: Number,
            default: 1
        },
        enable: {
            type: Boolean,
            default: false
        },
        offsetX: {
            type: Number,
            default: 0
        },
        offsetY: {
            type: Number,
            default: 0
        },
        slideWidth: {
            type: Number,
            default: 1
        },
        slideHeight: {
            type: Number,
            default: 1
        },
        screenWidth: {
            type: Number,
            default: 1
        },
        screenHeight: {
            type: Number,
            default: 1
        },
        offsetScreenX: {
            type: Number,
            default: 1
        },
        offsetScreenY: {
            type: Number,
            default: 1
        },
        setPenSize: {
            type: Number,
            default: 4
        },
        setEraseSize: {
            type: Number,
            default: 10
        }
    },
    setup(props) {
        let ctx: CanvasRenderingContext2D | null = null;
        const writingBoardRef = ref<HTMLElement>();
        const canvasRef = ref<HTMLCanvasElement>();
        let timer: any = null;
        const penTempHide = ref(false);
        const penSize = computed(() => props.setPenSize);
        const rubberSize = computed(() => props.setEraseSize);

        let lastPos = {
            x: 0,
            y: 0
        };
        let isMouseDown = false;
        let lastTime = 0;
        let lastLineWidth = -1;

        // 鼠标位置坐标：用于画笔或橡皮位置跟随
        const mouse = reactive({
            x: 0,
            y: 0
        });

        // 更新鼠标位置坐标
        const updateMousePosition = (x: number, y: number) => {
            mouse.x = x;
            mouse.y = y;
        };

        // 鼠标是否处在画布范围内：处在范围内才会显示画笔或橡皮
        const mouseInCanvas = ref(false);

        const canvasWidth = ref(0);
        const canvasHeight = ref(0);

        // 初始化画布
        const initCanvas = () => {
            if (!canvasRef.value || !writingBoardRef.value) return;

            if (!ctx) ctx = canvasRef.value.getContext("2d");
            if (!ctx) return;

            canvasRef.value.width = writingBoardRef.value.clientWidth;
            canvasRef.value.height = writingBoardRef.value.clientHeight;

            canvasWidth.value = canvasRef.value.width;
            canvasHeight.value = canvasRef.value.height;

            canvasRef.value.style.width =
                writingBoardRef.value.clientWidth + "px";
            canvasRef.value.style.height =
                writingBoardRef.value.clientHeight + "px";

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        };

        const resizeObserver = new ResizeObserver(initCanvas);

        onMounted(() => {
            setTimeout(() => {
                initCanvas();
            }, 600);
            clearInterval(timer);
            writingBoardRef.value && resizeObserver.observe(writingBoardRef.value);
        });

        // 绘制画笔墨迹方法
        const draw = (posX: number, posY: number, lineWidth: number) => {
            if (!ctx) return;

            const lastPosX = lastPos.x;
            const lastPosY = lastPos.y;

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = props.color;
            ctx.beginPath();
            ctx.moveTo(lastPosX, lastPosY);
            ctx.lineTo(posX, posY);
            ctx.stroke();
            ctx.closePath();
        };

        // 擦除墨迹方法
        const erase = (posX: number, posY: number) => {
            if (!ctx || !canvasRef.value) return;
            const lastPosX = lastPos.x;
            const lastPosY = lastPos.y;

            const radius = rubberSize.value / 2;

            const sinRadius =
                radius *
                Math.sin(Math.atan((posY - lastPosY) / (posX - lastPosX)));
            const cosRadius =
                radius *
                Math.cos(Math.atan((posY - lastPosY) / (posX - lastPosX)));
            const rectPoint1: [number, number] = [
                lastPosX + sinRadius,
                lastPosY - cosRadius
            ];
            const rectPoint2: [number, number] = [
                lastPosX - sinRadius,
                lastPosY + cosRadius
            ];
            const rectPoint3: [number, number] = [
                posX + sinRadius,
                posY - cosRadius
            ];
            const rectPoint4: [number, number] = [
                posX - sinRadius,
                posY + cosRadius
            ];

            ctx.save();
            ctx.beginPath();
            ctx.arc(posX, posY, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(...rectPoint1);
            ctx.lineTo(...rectPoint3);
            ctx.lineTo(...rectPoint4);
            ctx.lineTo(...rectPoint2);
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
            ctx.restore();
        };

        // 计算鼠标两次移动之间的距离
        const getDistance = (posX: number, posY: number) => {
            const lastPosX = lastPos.x;
            const lastPosY = lastPos.y;
            return Math.sqrt(
                (posX - lastPosX) * (posX - lastPosX) +
                    (posY - lastPosY) * (posY - lastPosY)
            );
        };

        // 根据鼠标两次移动之间的距离s和时间t计算绘制速度，速度越快，墨迹越细
        const getLineWidth = (s: number, t: number) => {
            const maxV = 10;
            const minV = 0.1;
            const maxWidth = penSize.value;
            const minWidth = 3;
            const v = s / t;
            let lineWidth;

            if (v <= minV) lineWidth = maxWidth;
            else if (v >= maxV) lineWidth = minWidth;
            else lineWidth = maxWidth - (v / maxV) * maxWidth;

            if (lastLineWidth === -1) return lineWidth;
            return (lineWidth * 1) / 3 + (lastLineWidth * 2) / 3;
        };

        // 路径操作
        const handleMove = (x: number, y: number) => {
            const time = new Date().getTime();

            if (props.model === "pen") {
                const s = getDistance(x, y);
                const t = time - lastTime;
                const lineWidth = getLineWidth(s, t);

                draw(x, y, lineWidth);
                lastLineWidth = lineWidth;
            } else erase(x, y);

            lastPos = { x, y };
            lastTime = new Date().getTime();
        };

        const contentRef = ref();

        // 获取目标dom左上角距离视窗左边和上边的距离
        const getDomOffset = () => {
            const width = contentRef.value.clientWidth;
            const height = contentRef.value.clientHeight;
            const offsetX = contentRef.value.offsetLeft - width / 2;
            const offsetY = contentRef.value.offsetTop - height / 2;
            return { offsetX, offsetY };
        };

        // 获取中心点距离可视窗左边和上边距离
        const getPointOffset = (point: { x: number, y: number }) => {
            const { offsetX, offsetY } = getDomOffset();
            return { offsetX: (point.x - offsetX) / props.scale, offsetY: (point.y - offsetY) / props.scale };
        };

        // 处理鼠标（触摸）事件
        // 准备开始绘制/擦除墨迹（落笔）
        const handleMousedown = (e: MouseEvent | TouchEvent) => {
            clearInterval(timer);
            penTempHide.value = false;
            const offset = getPointOffset({ x: e instanceof MouseEvent ? e.offsetX : e.changedTouches[0].pageX, y: e instanceof MouseEvent ? e.offsetY : e.changedTouches[0].pageY });
            const x = e instanceof MouseEvent ? e.offsetX : offset.offsetX;
            const y = e instanceof MouseEvent ? e.offsetY : offset.offsetY;

            isMouseDown = true;
            lastPos = { x, y };
            lastTime = new Date().getTime();

            if (e instanceof TouchEvent) {
                updateMousePosition(x, y);
                mouseInCanvas.value = true;
            }
        };

        // 开始绘制/擦除墨迹（移动）
        const handleMousemove = (e: MouseEvent | TouchEvent) => {
            const offset = getPointOffset({ x: e instanceof MouseEvent ? e.offsetX : e.changedTouches[0].pageX, y: e instanceof MouseEvent ? e.offsetY : e.changedTouches[0].pageY });
            const x = e instanceof MouseEvent ? e.offsetX : offset.offsetX;
            const y = e instanceof MouseEvent ? e.offsetY : offset.offsetY;

            updateMousePosition(x, y);

            if (isMouseDown) handleMove(x, y);
        };

        // 结束绘制/擦除墨迹（停笔）
        const handleMouseup = () => {
            if (!isMouseDown) return;
            isMouseDown = false;
            timer = setTimeout(() => {
                penTempHide.value = true;
            }, 3000);
        };

        // 清空画布
        const clearCanvas = () => {
            if (!ctx || !canvasRef.value) return;
            ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
        };

        // 获取画布
        const getCanvas = () => {
            if (!ctx || !canvasRef.value) return;
            const imageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
            return imageData;
        };
        // 设置画布
        const putCanvas = (data: any) => {
            if (!ctx || !canvasRef.value) return;
            ctx.putImageData(data, 0, 0);
        };

        return {
            mouse,
            mouseInCanvas,
            penSize,
            rubberSize,
            writingBoardRef,
            canvasRef,
            handleMousedown,
            handleMousemove,
            handleMouseup,
            clearCanvas,
            canvasWidth,
            canvasHeight,
            contentRef,
            getCanvas,
            putCanvas,
            penTempHide
        };
    }
});
</script>

<style lang="scss" scoped>
.writing-board {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 8;
}
.no-point-event {
    pointer-events: none;
}
.blackboard {
    width: 100%;
    height: 100%;
    background-color: #0f392b;
}
.canvas-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.canvas {
    transform-origin: top left;
}
.eraser,
.pen {
    pointer-events: none;
    position: fixed;
    z-index: 9;

    .icon {
        filter: drop-shadow(2px 2px 2px #555);
    }
}
.eraser {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 4px solid rgba($color: #555, $alpha: 0.15);
    color: rgba($color: #555, $alpha: 0.75);
}
</style>
