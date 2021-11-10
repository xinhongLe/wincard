import { computed } from "vue";
import { MutationTypes, useStore } from "@/store";

export default () => {
    const store = useStore();
    const altKeyState = computed(() => store.state.altKeyState);

    // 移动画布
    const moveCanvas = (
        e: MouseEvent
    ) => {
        // 如果没有按下 ALT 键 则不认为是移动画布 退出方法
        if (!altKeyState.value) return;

        let isMouseDown = true;
        const startPageX = e.pageX;
        const startPageY = e.pageY;

        // 初始移动距离
        const moveCanvasX = store.state.canvasMoveX;
        const moveCanvasY = store.state.canvasMoveY;

        // 开始移动
        document.onmousemove = e => {
            if (!isMouseDown) return;

            const currentPageX = e.pageX;
            const currentPageY = e.pageY;

            const x = currentPageX - startPageX + moveCanvasX;
            const y = currentPageY - startPageY + moveCanvasY;

            store.commit(MutationTypes.SET_VIEWPORT_MOVE_X, x);
            store.commit(MutationTypes.SET_VIEWPORT_MOVE_Y, y);
        };

        document.onmouseup = () => {
            isMouseDown = false;
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    return {
        moveCanvas
    };
};
