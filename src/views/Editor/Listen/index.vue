<template>
    <div
        class="canvas"
        ref="canvasRef"
        @mousewheel="($event) => handleMousewheelCanvas($event)"
    >
        <div
            class="viewport-wrapper"
            :style="{
                width: viewportStyles.width * canvasScale + 'px',
                height: viewportStyles.height * canvasScale + 'px',
                left: viewportStyles.left + 'px',
                top: viewportStyles.top + 'px'
            }"
        >
            <div
                class="viewport"
                ref="viewportRef"
                :style="{ transform: `scale(${canvasScale})` }"
            >
                <div class="listen-word-list">
                    <div class="listen-word-item" v-for="(item, index) in listenWords" :key="index">
                        {{item.name}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { throttle } from "lodash";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";

import useScaleCanvas from "@/hooks/useScaleCanvas";
import useViewportSize from "../Canvas/hooks/useViewportSize";

export default defineComponent({
    name: "editor-canvas",
    components: {},
    setup() {
        const store = useStore();
        const ctrlKeyState = computed(() => store.state.ctrlKeyState);

        // 初始化 canvas 显示
        const canvasRef = ref<HTMLElement>();
        const canvasScale = computed(() => store.state.canvasScale);

        // 滚动鼠标
        const { scaleCanvas } = useScaleCanvas();
        const throttleScaleCanvas = throttle(scaleCanvas, 100, {
            leading: true,
            trailing: false
        });

        const listenWords = computed(() => store.getters.currentSlide.listenWords);

        const handleMousewheelCanvas = (e: WheelEvent) => {
            e.preventDefault();

            // 按住Ctrl键时：缩放画布
            if (ctrlKeyState.value) {
                if (e.deltaY > 0) {
                    throttleScaleCanvas("-");
                } else if (e.deltaY < 0) {
                    throttleScaleCanvas("+");
                }
            }
        };

        const { viewportStyles } = useViewportSize(canvasRef);

        return {
            canvasRef,
            canvasScale,
            viewportStyles,
            handleMousewheelCanvas,
            listenWords
        };
    }
});
</script>

<style lang="scss" scoped>
.canvas {
    height: 100%;
    user-select: none;
    overflow: hidden;
    background-color: $lightGray;
    position: relative;
}

.viewport-wrapper {
    position: absolute;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
    background-image: url(~@/assets/images/bg_blue.png);
    background-size: 100% 100%;
    border-radius: 10px;
}

.viewport {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
}

.listen-word-list {
    width: 1000px;
    box-sizing: border-box;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .listen-word-item {
        background-image: url(~@/assets/images/bg_card.png);
        background-size: 100% 100%;
        height: 100px;
        width: 220px;
        margin-bottom: 20px;
        font-size: 30px;
        font-weight: 600;
        white-space: nowrap;
        text-align: center;
        overflow: hidden;
        box-sizing: border-box;
        padding: 10px;
        text-overflow: ellipsis;
        line-height: 74px;
    }
}
</style>
