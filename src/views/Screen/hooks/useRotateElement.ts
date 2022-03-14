import { Ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import {
    PPTElement,
    PPTShapeElement
} from "@/types/slides";

/**
 * 计算给定坐标到原点连线的弧度
 * @param x 坐标x
 * @param y 坐标y
 */
const getAngleFromCoordinate = (x: number, y: number) => {
    const radian = Math.atan2(x, y);
    const angle = (180 / Math.PI) * radian;
    return angle;
};

export default (
    elementList: Ref<PPTElement[]>,
    canvasScale: Ref<number>,
    viewportRef: Ref<HTMLElement | undefined>
) => {
    const store = useStore();
    let angle = 0;
    let isMouseDown = false;
    // 元素中心点（旋转中心点）
    let centerX:number;
    let centerY:number;

    const onMove = (pageX:number, pageY:number, element: PPTShapeElement, viewportRect: DOMRect) => {
        if (!isMouseDown) return;

        // 计算当前鼠标位置相对元素中心点连线的角度（弧度）
        const mouseX = (pageX - viewportRect.left) / canvasScale.value;
        const mouseY = (pageY - viewportRect.top) / canvasScale.value;
        const x = mouseX - centerX;
        const y = centerY - mouseY;

        angle = getAngleFromCoordinate(x, y);

        // 靠近45倍数的角度时有吸附效果
        const sorptionRange = 5;
        if (Math.abs(angle) <= sorptionRange) {
            angle = 0;
        } else if (angle > 0 && Math.abs(angle - 45) <= sorptionRange) {
            angle -= angle - 45;
        } else if (angle < 0 && Math.abs(angle + 45) <= sorptionRange) {
            angle -= angle + 45;
        } else if (angle > 0 && Math.abs(angle - 90) <= sorptionRange) {
            angle -= angle - 90;
        } else if (angle < 0 && Math.abs(angle + 90) <= sorptionRange) {
            angle -= angle + 90;
        } else if (angle > 0 && Math.abs(angle - 135) <= sorptionRange) {
            angle -= angle - 135;
        } else if (angle < 0 && Math.abs(angle + 135) <= sorptionRange) {
            angle -= angle + 135;
        } else if (angle > 0 && Math.abs(angle - 180) <= sorptionRange) {
            angle -= angle - 180;
        } else if (angle < 0 && Math.abs(angle + 180) <= sorptionRange) {
            angle -= angle + 180;
        }

        store.commit(MutationTypes.UPDATE_SCREEN_ELEMENTS, elementList.value.map(el =>
            element.id === el.id ? { ...el, rotate: angle } : el
        ));
    };

    const onEnd = (elOriginRotate: number) => {
        isMouseDown = false;
        if (elOriginRotate === angle) return;
        store.commit(MutationTypes.UPDATE_SCREEN_ELEMENTS, elementList.value);
    };

    // 旋转元素
    const rotateElement = (
        element: PPTShapeElement
    ) => {
        isMouseDown = true;
        angle = 0;
        const elOriginRotate = element.rotate || 0;

        const elLeft = element.left;
        const elTop = element.top;
        const elWidth = element.width;
        const elHeight = element.height;

        // 元素中心点（旋转中心点）
        centerX = elLeft + elWidth / 2;
        centerY = elTop + elHeight / 2;

        if (!viewportRef.value) return;
        const viewportRect = viewportRef.value.getBoundingClientRect();

        document.onmousemove = e => {
            onMove(e.pageX, e.pageY, element, viewportRect);
        };

        document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
            onEnd(elOriginRotate);
        };

        const ontouchmove = (e: TouchEvent) => {
            onMove(e.touches[0]?.pageX, e.touches[0]?.pageY, element, viewportRect);
        };

        const ontouchend = () => {
            document.removeEventListener("touchmove", ontouchmove);
            document.removeEventListener("touchend", ontouchend);
            onEnd(elOriginRotate);
        };
        document.addEventListener("touchmove", ontouchmove);
        document.addEventListener("touchend", ontouchend);
    };

    return {
        rotateElement
    };
};
