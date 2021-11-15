<template>
    <div class="pptist-screen">
        <div
            class="slide-list"
        >
            <div
                :class="[
                    'slide-item',
                    `turning-mode-${slide.turningMode || 'slideY'}`,
                    {
                        current: index === slideIndex,
                        before: index < slideIndex,
                        after: index > slideIndex,
                        hide:
                            (index === slideIndex - 1 ||
                                index === slideIndex + 1) &&
                            slide.turningMode !== currentSlide.turningMode
                    }
                ]"
                v-for="(slide, index) in slides"
                :key="slide.id"
            >
                <div
                    class="slide-content"
                    :style="{
                        width: slideWidth + 'px',
                        height: slideHeight + 'px'
                    }"
                >
                    <ScreenSlide
                        :slide="slide"
                        :scale="scale"
                        @openCard="openCard"
                    />
                </div>
            </div>
        </div>

        <WritingBoardTool
            v-if="writingBoardToolVisible"
            @close="writingBoardToolVisible = false"
        />

        <div class="tools">
            <IconLeftTwo
                class="tool-btn"
                theme="two-tone"
                :fill="['#111', '#fff']"
                @click="execPrev()"
            />
            <IconRightTwo
                class="tool-btn"
                theme="two-tone"
                :fill="['#111', '#fff']"
                @click="execNext()"
            />
            <IconWrite
                class="tool-btn"
                theme="two-tone"
                :fill="['#111', '#fff']"
                @click="writingBoardToolVisible = true"
            />
        </div>

        <div
            class="page-number"
            @click="slideThumbnailModelVisible = true"
            v-if="showPageNumber"
        >
            {{ slideIndex + 1 }} / {{ slides.length }}
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted,
    onUnmounted,
    provide,
    ref
} from "vue";
import { throttle } from "lodash";
import { useStore } from "@/store";
import { IWin, PPTElementAction, Slide } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import { KEYS } from "@/configs/hotkey";
import { isFullscreen } from "@/utils/fullscreen";
import useScreening from "@/hooks/useScreening";

// import { message } from "ant-design-vue";

import ScreenSlide from "./ScreenSlide.vue";
import WritingBoardTool from "./WritingBoardTool.vue";
import useActionAnimation from "@/hooks/useActionAnimation";

import { PAGE_TYPE } from "@/configs/page";

export default defineComponent({
    name: "screen",
    components: {
        ScreenSlide,
        WritingBoardTool
    },
    setup(props, { emit }) {
        const store = useStore();
        const slides = computed(() => store.state.slides);
        const slideIndex = computed(() => store.state.slideIndex);
        const viewportRatio = computed(() => store.state.viewportRatio);
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const steps = computed(() => currentSlide.value.steps || []);
        const stepIndex = ref(-1);

        const slideWidth = ref(0);
        const slideHeight = ref(0);

        const scale = computed(() => slideWidth.value / VIEWPORT_SIZE);

        const showPageNumber = ref(false);

        const slideThumbnailModelVisible = ref(true);

        const writingBoardToolVisible = ref(false);

        // 计算和更新幻灯片内容的尺寸（按比例自适应屏幕）
        const setSlideContentSize = () => {
            const winWidth = document.body.clientWidth;
            const winHeight = document.body.clientHeight;
            let width, height;

            if (winHeight / winWidth === viewportRatio.value) {
                width = winWidth;
                height = winHeight;
            } else if (winHeight / winWidth > viewportRatio.value) {
                width = winWidth;
                height = winWidth * viewportRatio.value;
            } else {
                width = winHeight / viewportRatio.value;
                height = winHeight;
            }
            slideWidth.value = width;
            slideHeight.value = height;
        };

        // 窗口尺寸变化监听：窗口发生变化时更新幻灯片的大小
        // 如果退出了全屏，需要返回到编辑模式
        const { exitScreening } = useScreening();

        const windowResizeListener = () => {
            setSlideContentSize();
            if (!isFullscreen()) exitScreening();
        };

        onMounted(() => {
            setSlideContentSize();
            window.addEventListener("resize", windowResizeListener);
        });
        onUnmounted(() => {
            window.removeEventListener("resize", windowResizeListener);
        });

        // 关闭自动播放
        const autoPlayTimer = ref(0);
        const closeAutoPlay = () => {
            if (autoPlayTimer.value) {
                clearInterval(autoPlayTimer.value);
                autoPlayTimer.value = 0;
            }
        };
        onUnmounted(closeAutoPlay);

        // const throttleMassage = throttle(
        //     function(msg) {
        //         message.success(msg);
        //     },
        //     1000,
        //     { leading: true, trailing: false }
        // );

        const { runAnimation } = useActionAnimation();

        // 向上/向下播放
        const execPrev = () => {
            // 非素材页直接跳过
            if (currentSlide.value.type !== PAGE_TYPE.ELEMENT) return emit("pagePrev");
            if (stepIndex.value === -1) return emit("pagePrev");
            const step = steps.value[stepIndex.value];
            // 向上 step 要逆向执行
            step.map(a => {
                const action: PPTElementAction = {
                    ...a,
                    type: a.type === "show" ? "hide" : (a.type === "toggle" ? "toggle" : "show")
                };
                runAnimation(action);
            });
            stepIndex.value--;
        };
        const execNext = () => {
            // 非素材页直接跳过
            if (currentSlide.value.type !== PAGE_TYPE.ELEMENT) return emit("pageNext");
            if (stepIndex.value === steps.value.length - 1) return emit("pageNext");
            stepIndex.value++;
            const step = steps.value[stepIndex.value];
            step.map(a => {
                runAnimation(a);
            });
        };

        // 自动播放
        // const autoPlay = () => {
        //     closeAutoPlay();
        //     message.success("开始自动放映");
        //     autoPlayTimer.value = setInterval(execNext, 2500);
        // };

        // 鼠标滚动翻页
        const mousewheelListener = throttle(
            function(e: WheelEvent) {
                if (e.deltaY < 0) execPrev();
                else if (e.deltaY > 0) execNext();
            },
            500,
            { leading: true, trailing: false }
        );

        // 触摸屏上下滑动翻页
        const touchInfo = ref<{ x: number; y: number } | null>(null);

        const touchStartListener = (e: TouchEvent) => {
            touchInfo.value = {
                x: e.changedTouches[0].pageX,
                y: e.changedTouches[0].pageY
            };
        };
        const touchEndListener = (e: TouchEvent) => {
            if (!touchInfo.value) return;

            const offsetX = Math.abs(
                touchInfo.value.x - e.changedTouches[0].pageX
            );
            const offsetY = e.changedTouches[0].pageY - touchInfo.value.y;

            if (Math.abs(offsetY) > offsetX && Math.abs(offsetY) > 50) {
                touchInfo.value = null;

                if (offsetY > 0) execPrev();
                else execNext();
            }
        };

        // 快捷键翻页
        const keydownListener = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key === KEYS.UP || key === KEYS.LEFT) execPrev();
            else if (
                key === KEYS.DOWN ||
                key === KEYS.RIGHT ||
                key === KEYS.SPACE ||
                key === KEYS.ENTER
            ) execNext();
        };

        onMounted(() => {
            document.addEventListener("keydown", keydownListener);
        });
        onUnmounted(() => {
            document.removeEventListener("keydown", keydownListener);
        });

        provide("slideScale", scale);

        const openCard = (win: IWin) => {
            emit("openCard", win);
        };

        return {
            slides,
            slideIndex,
            currentSlide,
            slideWidth,
            slideHeight,
            scale,
            mousewheelListener,
            touchStartListener,
            touchEndListener,
            execPrev,
            execNext,
            slideThumbnailModelVisible,
            writingBoardToolVisible,
            showPageNumber,
            openCard
        };
    }
});
</script>

<style lang="scss" scoped>
.pptist-screen {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #111;
}
.slide-list {
    background: #1d1d1d;
    position: relative;
    width: 100%;
    height: 100%;
}
.slide-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    &.current {
        z-index: 2;
    }

    &.hide {
        opacity: 0;
    }

    &.turning-mode-no {
        &.before {
            transform: translateY(-100%);
        }
        &.after {
            transform: translateY(100%);
        }
    }
    &.turning-mode-fade {
        transition: opacity 0.75s;
        &.before {
            pointer-events: none;
            opacity: 0;
        }
        &.after {
            pointer-events: none;
            opacity: 0;
        }
    }
    &.turning-mode-slideX {
        transition: transform 0.35s;
        &.before {
            transform: translateX(-100%);
        }
        &.after {
            transform: translateX(100%);
        }
    }
    &.turning-mode-slideY {
        transition: transform 0.35s;
        &.before {
            transform: translateY(-100%);
        }
        &.after {
            transform: translateY(100%);
        }
    }
}
.slide-content {
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
}

.tools {
    position: fixed;
    bottom: 8px;
    left: 8px;
    font-size: 25px;
    color: #666;
    z-index: 10;
    cursor: pointer;
}
.tool-btn {
    opacity: 0.35;

    &:hover {
        opacity: 0.9;
    }
    & + .tool-btn {
        margin-left: 8px;
    }
}
.page-number {
    position: fixed;
    bottom: 8px;
    right: 8px;
    padding: 8px 12px;
    color: #666;
    background-color: #eee;
    border-radius: $borderRadius;
    z-index: 10;
    cursor: pointer;
}
</style>
