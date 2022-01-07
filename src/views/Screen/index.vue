<template>
    <div class="pptist-screen" ref="screenRef" :class="{'pptist-disable-select': disableSelect, 'fixed': !inline}">
        <div class="mark-view"
            v-if="remarkVisible"
            :style="{
                transform: `translate(${markOffsetX}px, ${markOffsetY}px)`
            }"
            @mousedown="markMouseDown($event)"
            @mousemove="markMouseMove($event)"
            @mouseup="markMouseUp()"
            @mouseleave="markMouseUp()"
            @touchstart="markMouseDown($event)"
            @touchmove="markMouseMove($event)"
            @touchend="markMouseUp()"
        >
            <div class="mark-title">
                教学建议
            </div>
            <div class="mark-content">
                {{currentSlide.remark}}
            </div>
        </div>
        <div
            class="slide-list"
            @mousedown="disableSelectEnd"
            @touchstart="$event => touchStartListener($event)"
            @touchend="$event => touchEndListener($event)"
            @touchmove="$event => touchMoveListener($event)"
        >
            <div
                :class="[
                    'slide-item',
                    `turning-mode-${slide.turningMode || 'slideY'}`,
                    remarkVisible ? 'adjust-width' : ''
                ]"
            >
                <div
                    class="slide-content"
                    ref="contentRef"
                    :style="{
                        width: slideWidth + 'px',
                        height: slideHeight + 'px',
                        marginLeft: offsetX + 'px',
                        marginTop: offsetY + 'px',
                    }"
                >
                    <div
                        class="scale-content"
                        :style="{
                            width: slideWidth + 'px',
                            height: slideHeight + 'px',
                            transform: `scale(${viewScale})`
                        }"
                        @mousewheel="$event => handleMousewheelScreen($event)"
                        @mousemove="handleMouseMove"
                        @mousedown="$event => moveScreen($event)"
                        v-contextmenu="contextmenus"
                    >
                        <ScreenSlide
                            :runAnimation="runAnimation"
                            :slide="currentSlide"
                            :scale="scale"
                            @openCard="openCard"
                        />
                    </div>
                </div>
            </div>
        </div>

        <WritingBoardTool
            :scale="viewScale"
            :offsetX="offsetX"
            :offsetY="offsetY"
            :slideWidth="slideWidth"
            :slideHeight="slideHeight"
            :screenWidth="screenWidth"
            :screenHeight="screenHeight"
            :offsetScreenX="offsetScreenX"
            :offsetScreenY="offsetScreenY"
            :enable="writingBoardToolVisible"
            :slide="currentSlide"
            @close="closeWriteBoard()"
            ref="writingBoardToolRef"
        />

        <div class="tools" v-if="!inline">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="上一步"
                :get-popup-container="getPopupContainer"
            >
                <IconLeftTwo
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#111', '#fff']"
                    @click="execPrev()"
                />
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="下一步"
                :get-popup-container="getPopupContainer"
            >
                <IconRightTwo
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#111', '#fff']"
                    @click="execNext()"
                />
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="画板"
                :get-popup-container="getPopupContainer"
            >
                <IconWrite
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#111', '#fff']"
                    @click="writingBoardToolVisible = true"
                />
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="教学建议"
                :get-popup-container="getPopupContainer"
            >
                <IconBookmark
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#111', '#fff']"
                    @click="remarkVisible = !remarkVisible"
                />
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="复位"
                :get-popup-container="getPopupContainer"
            >
                <IconBack
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#111', '#fff']"
                    @click="resetPosition()"
                />
            </a-tooltip>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="退出全屏"
                :get-popup-container="getPopupContainer"
            >
                <IconOffFullScreen
                    class="tool-btn"
                    theme="two-tone"
                    :fill="['#fff', '#111']"
                    @click="offScreen()"
                />
            </a-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, inject, nextTick,
    onMounted,
    onUnmounted,
    PropType,
    provide,
    ref,
    watch
} from "vue";
import { throttle } from "lodash";
import { useStore } from "@/store";
import { IWin, PPTElementAction, Slide, ICard } from "@/types/slides";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import { KEYS } from "@/configs/hotkey";
import { exitFullscreen, isFullscreen } from "@/utils/fullscreen";
import useScreening from "@/hooks/useScreening";
import isElectron from "is-electron";
// import { message } from "ant-design-vue";

import ScreenSlide from "./ScreenSlide.vue";
import WritingBoardTool from "./WritingBoardTool.vue";
import useActionAnimation from "@/hooks/useActionAnimation";
import useScaleScreen from "@/hooks/useScaleScreen";

import { PAGE_TYPE } from "@/configs/page";
import { ContextmenuItem } from "@/types/contextmenu";

export default defineComponent({
    name: "screen",
    components: {
        ScreenSlide,
        WritingBoardTool
    },
    props: {
        inline: {
            type: Boolean,
            default: false
        },
        slide: {
            type: Object as PropType<Slide>,
            required: true
        },
        isInit: {
            type: Boolean,
            default: true
        },
        keyDisabled: {
            type: Boolean,
            default: false
        },
        writeBoardVisible: {
            type: Boolean,
            default: false
        },
        winList: {
            type: Array as PropType<ICard[]>,
            default: () => []
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const viewportRatio = computed(() => store.state.viewportRatio);
        const slide = computed<Slide>(() => JSON.parse(JSON.stringify(props.slide)));
        const currentSlide = ref(slide.value);
        const steps = computed(() => currentSlide.value.steps || []);
        const stepIndex = ref(-1);

        const disableSelect = ref(false);

        const slideWidth = ref(0);
        const slideHeight = ref(0);

        const scale = computed(() => slideWidth.value / VIEWPORT_SIZE);

        const writeBoardVisible = computed(() => props.writeBoardVisible);
        const writingBoardToolVisible = ref(writeBoardVisible.value);

        // 保存canvas笔记
        const writingBoardToolRef = ref();
        watch(() => props.winList, () => {
            writingBoardToolRef.value.updateCanvasList();
        });

        const elementList = computed(() => currentSlide.value.elements);
        provide("elements", elementList);

        watch(writeBoardVisible, () => {
            writingBoardToolVisible.value = writeBoardVisible.value;
        });

        watch(slide, () => {
            writingBoardToolRef.value.getDataCanvas();
            stepIndex.value = -1;
            currentSlide.value = slide.value;
            setSlideContentSize();
            nextTick(() => {
                init();
                writingBoardToolRef.value.putDataCanvas();
            });
        });

        const screenRef = ref();
        const contentRef = ref();
        const offsetScreenX = ref(0);
        const offsetScreenY = ref(0);
        const screenWidth = ref(0);
        const screenHeight = ref(0);

        // 计算和更新幻灯片内容的尺寸（按比例自适应屏幕）
        const setSlideContentSize = () => {
            const winWidth = props.inline ? screenRef.value.clientWidth : document.body.clientWidth;
            const winHeight = props.inline ? screenRef.value.clientHeight : document.body.clientHeight;
            // if (remarkVisible.value) {
            //     winWidth = winWidth - 250;
            // }
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

            offsetScreenX.value = screenRef.value.offsetLeft;
            offsetScreenY.value = screenRef.value.offsetTop;
            screenWidth.value = screenRef.value.clientWidth;
            screenHeight.value = screenRef.value.clientHeight;
        };

        // 窗口尺寸变化监听：窗口发生变化时更新幻灯片的大小
        // 如果退出了全屏，需要返回到编辑模式
        const { exitScreening } = useScreening();

        const windowResizeListener = () => {
            setSlideContentSize();
            if (!isFullscreen()) exitScreening();
        };

        const resizeObserver = new ResizeObserver(setSlideContentSize);

        onMounted(() => {
            setSlideContentSize();
            if (!props.inline) window.addEventListener("resize", windowResizeListener);
            if (props.inline && screenRef.value) resizeObserver.observe(screenRef.value);
        });

        onUnmounted(() => {
            if (!props.inline) window.removeEventListener("resize", windowResizeListener);
            if (props.inline && screenRef.value) resizeObserver.unobserve(screenRef.value);
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

        const { runAnimation } = useActionAnimation(currentSlide);

        // 防止点击过快导致文本被选中
        const disableSelectEnd = throttle(() => {
            disableSelect.value = false;

            // 清除选中
            const selection: Selection | null = window.getSelection();
            selection && selection.removeAllRanges();
        }, 300);

        const disableSelectStart = () => {
            // 清除选中
            // const selection: Selection | null = window.getSelection();
            // selection && selection.removeAllRanges();
            disableSelect.value = true;
            // disableSelectEnd();
        };

        watch(currentSlide, () => {
            stepIndex.value = -1;
        });

        // 向上/向下播放
        const execPrev = () => {
            if (props.keyDisabled) return;
            console.log("上一步");
            disableSelectStart();

            // 非素材页直接跳过
            if (currentSlide.value.type !== PAGE_TYPE.ELEMENT) {
                stepIndex.value = -1;
                return emit("pagePrev");
            }

            if (stepIndex.value === -1) {
                return emit("pagePrev");
            }
            const step = steps.value[stepIndex.value];
            if (!step) {
                stepIndex.value = -1;
                return emit("pagePrev");
            }
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
            if (props.keyDisabled) return;
            console.log("下一步");
            disableSelectStart();

            // 非素材页直接跳过
            if (currentSlide.value.type !== PAGE_TYPE.ELEMENT) {
                stepIndex.value = -1;
                return emit("pageNext");
            }

            if (stepIndex.value === steps.value.length - 1) {
                // stepIndex.value = -1;
                return emit("pageNext");
            }

            stepIndex.value++;

            const step = steps.value[stepIndex.value];
            if (!step) {
                stepIndex.value = -1;
                return emit("pageNext");
            }
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

        // 快捷键翻页
        const keydownListener = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key === KEYS.UP || key === KEYS.PAGEUP || key === KEYS.LEFT) execPrev();
            else if (
                key === KEYS.DOWN ||
                key === KEYS.RIGHT ||
                key === KEYS.SPACE ||
                key === KEYS.ENTER ||
                key === KEYS.PAGEDOWN
            ) execNext();
        };

        onMounted(() => {
            document.addEventListener("keydown", keydownListener);
        });
        onUnmounted(() => {
            document.removeEventListener("keydown", keydownListener);
        });

        provide("slideScale", scale);

        const openCard = (wins: IWin[]) => {
            emit("openCard", wins);
        };

        const viewScale = ref(1);
        const offsetX = ref(0);
        const offsetY = ref(0);
        const resetPosition = () => {
            viewScale.value = 1;
            offsetX.value = 0;
            offsetY.value = 0;
        };
        const { handleMousewheelScreen, handleMouseMove, moveScreen, touchStartListener, touchEndListener, touchMoveListener } = useScaleScreen(viewScale, offsetX, offsetY, execPrev, execNext, resetPosition, contentRef, offsetScreenX, offsetScreenY);

        const remarkVisible = ref(false);

        watch(remarkVisible, () => {
            setSlideContentSize();
        });

        const contextmenus = (): ContextmenuItem[] => {
            return [
                {
                    text: "上一步",
                    subText: "←",
                    handler: execPrev
                },
                {
                    text: "下一步",
                    subText: "→",
                    handler: execNext
                },
                {
                    text: "画板",
                    subText: "",
                    handler: () => {
                        writingBoardToolVisible.value = true;
                    }
                },
                {
                    text: remarkVisible.value ? "关闭备注" : "打开备注",
                    subText: "",
                    handler: () => {
                        remarkVisible.value = !remarkVisible.value;
                    }
                },
                {
                    text: "复位",
                    subText: "",
                    handler: resetPosition
                }
            ];
        };

        const init = () => {
            if (!props.isInit && currentSlide.value.type === PAGE_TYPE.ELEMENT && steps.value.length > 0) {
                // 不是初始化页面，是从上一个页面返回，这是需要将步骤置为最后一步
                stepIndex.value = steps.value.length - 1;
                steps.value.map(step => {
                    step.map(a => {
                        runAnimation(a, true);
                    });
                });
            }
        };

        nextTick(() => {
            init();
        });

        const closeWriteBoard = () => {
            writingBoardToolVisible.value = false;
            emit("closeWriteBoard");
        };

        const offScreen = () => {
            exitScreening();
            emit("offScreen");
        };

        const markOffsetX = ref(0);
        const markOffsetY = ref(0);
        let markStart = [0, 0];
        let markIsMove = false;
        const markMouseDown = (e: MouseEvent | TouchEvent) => {
            const x = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
            const y = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;
            markStart = [x, y];
            markIsMove = true;
        };

        const markMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!markIsMove) return;
            const x = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
            const y = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;
            markOffsetX.value = markOffsetX.value + x - markStart[0];
            markOffsetY.value = markOffsetY.value + y - markStart[1];
            markStart = [x, y];
        };

        const markMouseUp = () => {
            markStart = [0, 0];
            markIsMove = false;
        };

        const getPopupContainer = (trigger: HTMLElement) => {
            return trigger.parentElement;
        };

        return {
            screenRef,
            contentRef,
            currentSlide,
            slideWidth,
            slideHeight,
            scale,
            mousewheelListener,
            touchStartListener,
            touchEndListener,
            touchMoveListener,
            execPrev,
            execNext,
            writingBoardToolVisible,
            writingBoardToolRef,
            openCard,
            disableSelect,
            disableSelectEnd,
            runAnimation,
            viewScale,
            offsetX,
            offsetY,
            handleMouseMove,
            moveScreen,
            handleMousewheelScreen,
            resetPosition,
            contextmenus,
            remarkVisible,
            closeWriteBoard,
            offScreen,
            markOffsetX,
            markOffsetY,
            markMouseDown,
            markMouseMove,
            markMouseUp,
            getPopupContainer,
            offsetScreenX,
            offsetScreenY,
            screenWidth,
            screenHeight
        };
    }
});
</script>

<style lang="scss" scoped>
.pptist-screen {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    &.fixed {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000;
        background-color: #111;
    }
}
.pptist-disable-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
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

    &.adjust-width {
        // left: 250px;
        // width: calc(100% - 250px);
    }

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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    transform-origin: center center;
}

.tools {
    position: fixed;
    bottom: 8px;
    right: 8px;
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
.scale-content {
    transform-origin: left top;
    background-color: #fff;
}
.mark-view {
    position: absolute;
    z-index: 8;
    background: #fff;
    right: 0;
    bottom: 60px;
    width: 300px;
    min-height: 250px;
    // padding: 20px;
    line-height: 24px;
    color: #666;
    box-shadow: 0 0 15px 0 rgb(0 0 0 / 10%);
    cursor: move;
    user-select: none;
    .mark-title {
        padding: 10px 20px;
        font-size: 16px;
        border-bottom: 1px solid #ccc;
    }
    .mark-content {
        padding: 10px 20px;
    }
}
</style>
