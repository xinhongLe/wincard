<template>
    <div class="writing-board-tool">
        <WritingBoard
            ref="writingBoardRef"
            :color="writingBoardColor"
            :setPenSize="penSize"
            :setEraseSize="eraseSize"
            :blackboard="blackboard"
            :model="writingBoardModel"
            :scale="scale"
            :enable="enable"
            :offsetX="offsetX"
            :offsetY="offsetY"
            :slideWidth="slideWidth"
            :slideHeight="slideHeight"
            :screenWidth="screenWidth"
            :screenHeight="screenHeight"
            :offsetScreenX="offsetScreenX"
            :offsetScreenY="offsetScreenY"
        />

        <div
            class="tools"
            v-if="enable"
            :style="{left: writingBoardPosition.x + 'px', bottom: writingBoardPosition.y + 'px'}"
            @mousedown="$event => handleMousedown($event)"
            @mousemove="$event => handleMousemove($event)"
            @mouseup="handleMouseup()"
            @touchstart="$event => handleMousedown($event)"
            @touchmove="$event => handleMousemove($event)"
            @mouseleave="handleMouseup()"
        >
            <a-popover v-model:visible="penCardVisible" title="画笔" trigger="click">
                <template #content>
                    <div class="pen-radius-box">
                        <div class="pen-radius pen-radius-1" @click="setPenSize(4)" :style="{ backgroundColor: penSize === 4 ? writingBoardColor : '#ccc' }"></div>
                        <div class="pen-radius pen-radius-2" @click="setPenSize(8)" :style="{ backgroundColor: penSize === 8 ? writingBoardColor : '#ccc' }"></div>
                        <div class="pen-radius pen-radius-3" @click="setPenSize(12)" :style="{ backgroundColor: penSize === 12 ? writingBoardColor : '#ccc' }"></div>
                        <div class="pen-radius pen-radius-4" @click="setPenSize(16)" :style="{ backgroundColor: penSize === 16 ? writingBoardColor : '#ccc' }"></div>
                        <div class="pen-radius pen-radius-5" @click="setPenSize(20)" :style="{ backgroundColor: penSize === 20 ? writingBoardColor : '#ccc' }"></div>
                    </div>
                </template>
                <div
                    class="btn"
                    :class="{ active: writingBoardModel === 'pen' }"
                    @click="changePen()"
                >
                    <IconWrite class="icon" />
                </div>
            </a-popover>
            <a-popover v-model:visible="eraserCardVisible" title="橡皮擦" trigger="click">
                <template #content>
                    <div class="eraser-radius-box">
                        <div class="eraser-radius eraser-radius-1" @click="setEraseSize(20)" :style="{ backgroundColor: eraseSize === 20 ? '#000' : '#ccc' }"></div>
                        <div class="eraser-radius eraser-radius-2" @click="setEraseSize(40)" :style="{ backgroundColor: eraseSize === 40 ? '#000' : '#ccc' }"></div>
                        <div class="eraser-radius eraser-radius-3" @click="setEraseSize(60)" :style="{ backgroundColor: eraseSize === 60 ? '#000' : '#ccc' }"></div>
                        <div class="eraser-radius eraser-radius-4" @click="setEraseSize(120)" :style="{ backgroundColor: eraseSize === 120 ? '#000' : '#ccc' }"></div>
                        <div class="eraser-radius eraser-radius-5" @click="setEraseSize(180)" :style="{ backgroundColor: eraseSize === 180 ? '#000' : '#ccc' }"></div>
                    </div>
                </template>
                <div
                    class="btn"
                    :class="{ active: writingBoardModel === 'eraser' }"
                    @click="changeEraser()"
                >
                    <IconErase class="icon" />
                </div>
            </a-popover>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.3"
                title="清除墨迹"
                overlayClassName="tipZIndex"
            >
                <div class="btn" @click="clearCanvas()">
                    <IconClear class="icon" />
                </div>
            </a-tooltip>
            <!-- <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.3" title="黑板" overlayClassName="tipZIndex">
                <div
                    class="btn"
                    :class="{ active: blackboard }"
                    @click="blackboard = !blackboard"
                >
                    <IconFill class="icon" />
                </div>
            </a-tooltip> -->
            <div class="colors">
                <div
                    class="color"
                    :class="{ active: color === writingBoardColor }"
                    v-for="color in writingBoardColors"
                    :key="color"
                    :style="{ backgroundColor: color }"
                    @click="changeColor(color)"
                ></div>
            </div>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.3"
                title="关闭画笔"
                overlayClassName="tipZIndex"
            >
                <div class="btn" @click="closeWritingBoard()">
                    <IconClose class="icon" />
                </div>
            </a-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import WritingBoard from "@/components/WritingBoard.vue";
import { Slide } from "@/types/slides";

const writingBoardColors = [
    "#000000",
    "#ffffff",
    "#1e497b",
    "#4e81bb",
    "#e2534d",
    "#9aba60",
    "#8165a0",
    "#47acc5",
    "#f9974c"
];
interface Icanvas {
    id: string,
    data: ImageData
}

export default defineComponent({
    name: "writing-board-tool",
    emits: ["close"],
    props: {
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
        slide: {
            type: Object as PropType<Slide>,
            required: true
        }
    },
    components: {
        WritingBoard
    },
    setup(props, { emit }) {
        const writingBoardRef = ref();
        const writingBoardColor = ref("#e2534d");
        const writingBoardModel = ref("pen");
        const blackboard = ref(false);

        // 切换到画笔状态
        const changePen = () => {
            writingBoardModel.value = "pen";
        };

        // 切换到橡皮状态
        const changeEraser = () => {
            writingBoardModel.value = "eraser";
        };

        // 清除画布上的墨迹
        const clearCanvas = () => {
            writingBoardRef.value.clearCanvas();
        };

        const canvasList = ref<Icanvas[]>([]);
        const slide = computed(() => {
            return props.slide;
        });
        // 存储画布 slide改变之前存储
        const getDataCanvas = () => {
            const imageData = writingBoardRef.value.getCanvas();
            const index = canvasList.value.findIndex(item => item.id === slide.value.id);
            if (index === -1) {
                canvasList.value.push({ id: slide.value.id, data: imageData });
            } else {
                canvasList.value[index].data = imageData;
            }
        };
        // 设置画布  slide改变后就会取
        const putDataCanvas = () => {
            clearCanvas(); // 先清除一下发布
            const canvasData = canvasList.value.find(item => item.id === slide.value.id);
            if (canvasData) {
                writingBoardRef.value.putCanvas(canvasData.data);
            }
        };

        const updateCanvasList = () => {
            canvasList.value = [];
        };

        // 修改画笔颜色，如果当前不处于画笔状态则先切换到画笔状态
        const changeColor = (color: string) => {
            if (writingBoardModel.value !== "pen") writingBoardModel.value = "pen";
            writingBoardColor.value = color;
        };

        // 关闭写字板
        const closeWritingBoard = () => {
            emit("close");
        };

        const penCardVisible = ref(false);
        const eraserCardVisible = ref(false);
        const penSize = ref(4);
        const eraseSize = ref(40);
        const setPenSize = (size: number) => {
            penSize.value = size;
            penCardVisible.value = false;
        };

        const setEraseSize = (size: number) => {
            eraserCardVisible.value = false;
            eraseSize.value = size;
        };

        let isMouseDown = false;
        let lastPos = { x: 0, y: 0 };
        const writingBoardPosition = ref({ x: window.innerWidth / 2 - 100, y: 120 });

        const handleMousedown = (e: MouseEvent | TouchEvent) => {
            const x = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
            const y = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;

            isMouseDown = true;
            lastPos = { x, y };
        };

        const handleMousemove = (e: MouseEvent | TouchEvent) => {
            if (isMouseDown) {
                const x = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
                const y = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;
                const moveX = x - lastPos.x;
                const moveY = y - lastPos.y;
                handleMove(moveX, moveY);
                lastPos = { x, y };
            }
        };

        const handleMove = (x: number, y: number) => {
            const changeX = writingBoardPosition.value.x + x;
            const changeY = writingBoardPosition.value.y - y;
            writingBoardPosition.value = { x: changeX, y: changeY };
        };

        const handleMouseup = () => {
            if (!isMouseDown) return;
            isMouseDown = false;
        };

        return {
            writingBoardRef,
            writingBoardColors,
            writingBoardColor,
            writingBoardModel,
            blackboard,
            changePen,
            changeEraser,
            clearCanvas,
            changeColor,
            closeWritingBoard,
            getDataCanvas,
            putDataCanvas,
            updateCanvasList,
            penCardVisible,
            eraserCardVisible,
            penSize,
            eraseSize,
            setPenSize,
            setEraseSize,
            handleMousedown,
            handleMousemove,
            handleMouseup,
            writingBoardPosition
        };
    }
});
</script>

<style lang="scss" scoped>
.writing-board-tool {
    font-size: 12px;

    .tools {
        height: 50px;
        position: fixed;
        bottom: 120px;
        left: 5px;
        z-index: 11;
        padding: 12px;
        background-color: #eee;
        border-radius: $borderRadius;
        display: flex;
        align-items: center;
        cursor: move;
    }
    .btn {
        padding: 5px 10px;
        cursor: pointer;

        &:hover {
            color: $themeColor;
        }
        &.active {
            background-color: rgba($color: $themeColor, $alpha: 0.5);
            color: #fff;
        }
    }
    .icon {
        font-size: 20px;
    }
    .colors {
        display: flex;
        padding: 0 10px;
    }
    .color {
        width: 16px;
        height: 16px;
        border-radius: $borderRadius;
        cursor: pointer;

        &:hover {
            transform: scale(1.15);
        }
        &.active {
            transform: scale(1.3);
        }

        & + .color {
            margin-left: 8px;
        }
    }
}
</style>

<style lang="scss">
.tipZIndex {
    z-index: 10001;
}

.pen-radius-box, .eraser-radius-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.pen-radius, .eraser-radius {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
    cursor: pointer;
}
.pen-radius-2 {
    width: 12px;
    height: 12px;
}
.pen-radius-3 {
    width: 16px;
    height: 16px;
}
.pen-radius-4 {
    width: 20px;
    height: 20px;
}
.pen-radius-5 {
    width: 24px;
    height: 24px;
}
.eraser-radius-1 {
    width: 8px;
    height: 8px;
}
.eraser-radius-2 {
    width: 16px;
    height: 16px;
}
.eraser-radius-3 {
    width: 24px;
    height: 24px;
}
.eraser-radius-4 {
    width: 32px;
    height: 32px;
}
.eraser-radius-5 {
    width: 40px;
    height: 40px;
}
</style>
