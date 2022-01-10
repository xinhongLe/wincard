import { computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { ElementTypes, PPTElement, Slide } from "@/types/slides";
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

    const getAlignValue = (command: ElementAlignCommand) => {
        const elements = currentSlide.value.elements.filter(element => {
            return activeElementIdList.value.includes(element.id);
        });
        let alignValue = 0;
        if (command === ElementAlignCommands.TOP) {
            elements.forEach(element => {
                if (alignValue === 0) alignValue = element.top;
                alignValue = Math.min(alignValue, element.top);
            });
        } else if (command === ElementAlignCommands.LEFT) {
            elements.forEach(element => {
                if (alignValue === 0) alignValue = element.left;
                alignValue = Math.min(alignValue, element.left);
            });
        } else if (command === ElementAlignCommands.RIGHT) {
            elements.forEach(element => {
                alignValue = Math.max(alignValue, element.left + element.width);
            });
        } else if (command === ElementAlignCommands.BOTTOM) {
            elements.forEach(element => {
                alignValue = Math.max(alignValue, element.top + (element.type === ElementTypes.LINE ? Math.abs(element.start[1] - element.end[1]) : element.height));
            });
        }
        return alignValue;
    };

    const alignElementToElement = (command: ElementAlignCommand) => {
        const newElementList: PPTElement[] = JSON.parse(
            JSON.stringify(currentSlide.value.elements)
        );
        const alignValue = getAlignValue(command);
        for (const element of newElementList) {
            if (!activeElementIdList.value.includes(element.id)) continue;
            if (command === ElementAlignCommands.LEFT) {
                element.left = alignValue;
            } else if (command === ElementAlignCommands.TOP) {
                element.top = alignValue;
            } else if (command === ElementAlignCommands.BOTTOM) {
                element.top = alignValue - (element.type === ElementTypes.LINE ? Math.abs(element.start[1] - element.end[1]) : element.height);
            } else if (command === ElementAlignCommands.RIGHT) {
                element.left = alignValue - element.width;
            }
        }

        store.commit(MutationTypes.UPDATE_SLIDE, { elements: newElementList });
        addHistorySnapshot();
    };

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
        alignElementToCanvas,
        alignElementToElement
    };
};
