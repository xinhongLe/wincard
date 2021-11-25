import { Ref, ComputedRef } from "vue";
import { throttle } from "lodash";

const unit = 0.05; // 缩放单位
export default (scale: Ref<number>, offsetX: Ref<number>, offsetY: Ref<number>, originScale: ComputedRef<number>) => {
    let isMove = false;

    const handleMousewheelScreen = (e: WheelEvent) => {
        e.preventDefault();
        if (isMove) return;
        if (e.deltaY > 0) {
            if (scale.value === 1) return;
            // 缩小
            scale.value -= unit;
            offsetX.value = e.offsetX * unit * originScale.value + offsetX.value;
            offsetY.value = e.offsetY * unit * originScale.value + offsetY.value;
        } else {
            // 放大
            scale.value += unit;
            offsetX.value = -e.offsetX * unit * originScale.value + offsetX.value;
            offsetY.value = -e.offsetY * unit * originScale.value + offsetY.value;
        }
    };

    // 鼠标移动时禁止缩放
    const moveEnd = throttle(() => {
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

    return {
        handleMousewheelScreen,
        handleMouseMove,
        moveScreen
    };
};
