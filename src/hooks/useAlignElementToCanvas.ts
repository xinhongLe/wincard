import { computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTElement, Slide } from "@/types/slides";
import { ElementAlignCommand, ElementAlignCommands } from "@/types/edit";
import { getElementListRange } from "@/utils/element";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import useHistorySnapshot from "./useHistorySnapshot";

export default () => {
    const store = useStore();

    const activeElementIdList = computed(() => store.state.activeElementIdList);
    const viewportRatio = computed(() => store.state.viewportRatio);
    const activeElementList = computed<PPTElement[]>(
        () => store.getters.activeElementList
    );
    const currentSlide = computed<Slide>(() => store.getters.currentSlide);

    const { addHistorySnapshot } = useHistorySnapshot();

    /**
     * 将所有选中的元素对齐到画布
     * @param command 对齐方向
     */
    const alignElementToCanvas = (command: ElementAlignCommand) => {
        const viewportWidth = VIEWPORT_SIZE;
        const viewportHeight = VIEWPORT_SIZE * viewportRatio.value;
        const { minX, maxX, minY, maxY } = getElementListRange(
            activeElementList.value
        );

        const newElementList: PPTElement[] = JSON.parse(
            JSON.stringify(currentSlide.value.elements)
        );
        for (const element of newElementList) {
            if (!activeElementIdList.value.includes(element.id)) continue;

            // 水平垂直居中
            if (command === ElementAlignCommands.CENTER) {
                const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2;
                const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2;
                element.top = element.top - offsetY;
                element.left = element.left - offsetX;
            }

            if (command === ElementAlignCommands.TOP) {
                // 顶部对齐
                const offsetY = minY - 0;
                element.top = element.top - offsetY;
            } else if (command === ElementAlignCommands.VERTICAL) {
                // 垂直居中
                const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2;
                element.top = element.top - offsetY;
            } else if (command === ElementAlignCommands.BOTTOM) {
                // 底部对齐
                const offsetY = maxY - viewportHeight;
                element.top = element.top - offsetY;
            } else if (command === ElementAlignCommands.LEFT) {
                // 左侧对齐
                const offsetX = minX - 0;
                element.left = element.left - offsetX;
            } else if (command === ElementAlignCommands.HORIZONTAL) {
                // 水平居中
                const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2;
                element.left = element.left - offsetX;
            } else if (command === ElementAlignCommands.RIGHT) {
                // 右侧对齐
                const offsetX = maxX - viewportWidth;
                element.left = element.left - offsetX;
            }
        }

        store.commit(MutationTypes.UPDATE_SLIDE, { elements: newElementList });
        addHistorySnapshot();
    };

    return {
        alignElementToCanvas
    };
};
