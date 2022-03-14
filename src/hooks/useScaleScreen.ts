import { Ref, computed, ref, onMounted, onUnmounted } from "vue";
import { throttle, debounce } from "lodash";
import { MutationTypes, useStore } from "@/store";

const unit = 0.05; // 缩放单位
export default (scale: Ref<number>, offsetX: Ref<number>, offsetY: Ref<number>, execPrev: () => void, execNext: () => void, resetPosition: () => void, contentRef: Ref<HTMLElement>) => {
    let isMove = false;
    const store = useStore();
    const altKeyState = computed(() => store.state.altKeyState);
    const keyupListener = () => {
        if (altKeyState.value) store.commit(MutationTypes.SET_ALT_KEY_STATE, false);
    };

    const keydownListener = () => {
        if (!altKeyState.value) store.commit(MutationTypes.SET_ALT_KEY_STATE, true);
    };

    onMounted(() => {
        document.addEventListener("keydown", keydownListener);
        document.addEventListener("keyup", keyupListener);
        window.addEventListener("blur", keyupListener);
    });
    onUnmounted(() => {
        document.removeEventListener("keydown", keydownListener);
        document.removeEventListener("keyup", keyupListener);
        window.removeEventListener("blur", keyupListener);
    });

    const handleMousewheelScreen = (e: WheelEvent) => {
        if (!isMove && altKeyState.value) {
            e.preventDefault();
            const offset = getPointOffset({ x: e.pageX, y: e.pageY });
            if (e.deltaY > 0) {
                if (scale.value === 1) return;
                // 缩小
                scale.value -= unit;
                offsetX.value = offset.offsetX * unit + offsetX.value;
                offsetY.value = offset.offsetY * unit + offsetY.value;
            } else {
                // 放大
                scale.value += unit;
                offsetX.value = -offset.offsetX * unit + offsetX.value;
                offsetY.value = -offset.offsetY * unit + offsetY.value;
            }
        }
    };

    // 鼠标移动时禁止缩放
    const moveEnd = debounce(() => {
        isMove = false;
    }, 300);

    const handleMouseMove = () => {
        isMove = true;
        moveEnd();
    };

    // 移动画布
    const moveScreen = (
        e: MouseEvent
    ) => {
        store.commit(MutationTypes.SET_ACTIVE_SCREEN_ELEMENT_ID_LIST, []);
        if (scale.value === 1 && offsetX.value === 0 && offsetY.value === 0) return;
        let isMouseDown = true;
        const startPageX = e.pageX;
        const startPageY = e.pageY;

        // 初始移动距离
        const moveScreenX = offsetX.value;
        const moveScreenY = offsetY.value;

        // 开始移动
        document.onmousemove = e => {
            if (!isMouseDown) return;

            const currentPageX = e.pageX;
            const currentPageY = e.pageY;

            offsetX.value = currentPageX - startPageX + moveScreenX;
            offsetY.value = currentPageY - startPageY + moveScreenY;
        };

        document.onmouseup = () => {
            isMouseDown = false;
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    // 触摸屏左右滑动上/下一步
    const touchInfo = ref<TouchList | null>(null);
    const touchTime = ref<number | null>(null);
    const touchCount = ref(0);
    const isTouchScale = ref(false);

    const touchStartListener = (e: TouchEvent) => {
        touchInfo.value = e.touches;
        touchTime.value = new Date().getTime();
        if (e.touches.length === 2) {
            center = getTouchesCenter(e.touches);
        }
    };

    const touchEndListener = (e: TouchEvent) => {
        if (!touchInfo.value) return;
        if (isTouchScale.value) {
            touchTime.value = null;
            touchInfo.value = null;
            isTouchScale.value = false;
        } else {
            const y = Math.abs(
                touchInfo.value[0].pageY - e.changedTouches[0].pageY
            );
            const x = e.changedTouches[0].pageX - touchInfo.value[0].pageX;
            const time = new Date().getTime() - (touchTime.value || 0);

            touchTime.value = null;
            touchInfo.value = null;

            // 快速点击三下复位
            if (time < 100 && time > 0) touchCount.value++;
            if (touchCount.value === 3) {
                touchCount.value = 0;
                resetPosition();
            }
            clearTouchCount();

            if (scale.value > 1 || offsetX.value !== 0 || offsetY.value !== 0) return;
            // 垂直方向变动小于10 且 左右移动大于50 且 时间间隔在 .5秒 内
            if (y < 30 && Math.abs(x) > 50 && time < 500) {
                if (x > 0) execPrev();
                else execNext();
            }
        }
    };

    // 清空计数
    const clearTouchCount = debounce(() => {
        touchCount.value = 0;
    }, 300);

    // 获取两指间距离
    const getDistance = (start: { x: number, y: number }, stop: { x: number, y: number }) => {
        return Math.hypot(stop.x - start.x, stop.y - start.y);
    };

    // 获取两指中心点
    const getTouchesCenter = (touchList: TouchList) => {
        const pointOne = touchList[0];
        const pointTwo = touchList[1];
        return { x: (pointOne.pageX + pointTwo.pageX) / 2, y: (pointOne.pageY + pointTwo.pageY) / 2 };
    };

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
        return { offsetX: (point.x - offsetX) / scale.value, offsetY: (point.y - offsetY) / scale.value };
    };

    let center: { x: number, y: number };

    const touchMoveListener = throttle((e: TouchEvent) => {
        e.preventDefault();
        if (touchInfo.value?.length === 2 && e.touches.length === 2) {
            isTouchScale.value = true;
            // 双指缩放
            const zoom = getDistance({ x: e.touches[0].pageX, y: e.touches[0].pageY }, { x: e.touches[1].pageX, y: e.touches[1].pageY }) / getDistance({ x: touchInfo.value[0].pageX, y: touchInfo.value[0].pageY }, { x: touchInfo.value[1].pageX, y: touchInfo.value[1].pageY });
            touchInfo.value = e.touches;
            const offset = getPointOffset(center);
            if (zoom - 1 < 0) {
                if (scale.value === 1) return;
                // 缩小
                scale.value -= unit;
                offsetX.value = offset.offsetX * unit + offsetX.value;
                offsetY.value = offset.offsetY * unit + offsetY.value;
            } else if (zoom - 1 > 0) {
                // 放大
                scale.value += unit;
                offsetX.value = -offset.offsetX * unit + offsetX.value;
                offsetY.value = -offset.offsetY * unit + offsetY.value;
            }
        } else if (touchInfo.value?.length === 1 && e.touches.length === 1) {
            if (scale.value === 1 && offsetX.value === 0 && offsetY.value === 0) return;
            // 移动
            const moveScreenX = offsetX.value;
            const moveScreenY = offsetY.value;
            offsetX.value = e.touches[0].pageX - touchInfo.value[0].pageX + moveScreenX;
            offsetY.value = e.touches[0].pageY - touchInfo.value[0].pageY + moveScreenY;
            touchInfo.value = e.touches;
        }
    }, 10);

    return {
        handleMousewheelScreen,
        handleMouseMove,
        moveScreen,
        touchStartListener,
        touchEndListener,
        touchMoveListener
    };
};
