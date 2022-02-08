import { ELEMENT_TYPE_ZH } from "@/configs/element";
import { LinePoolItem } from "@/configs/lines";
import { ShapePoolItem } from "@/configs/shapes";
import { useStore, MutationTypes } from "@/store";
import { PPTElement, PPTLineElement, PPTShapeElement } from "@/types/slides";
import { createRandomCode } from "@/utils/common";
import { computed } from "vue";

interface CommonElementPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface LineElementPosition {
    top: number;
    left: number;
    start: [number, number];
    end: [number, number];
}

export default () => {
    const store = useStore();
    const elements = computed(() => store.state.screenElements);
    const creatingElement = computed(() => store.state.creatingScreenShapeElement);
    const getNumber = (value: string) => {
        const result = /\((\d+)\)/.exec(value);
        if (result && result.length > 0) {
            return Number(result[1]);
        } else {
            return 0;
        }
    };
    const randomName = (type: string) => {
        const typeElements = elements.value.filter(element => element.type === type);
        let num = 0;
        typeElements.forEach(element => {
            const val = getNumber(element.name);
            if (val > num) {
                num = val;
            }
        });
        return ELEMENT_TYPE_ZH[type] + `(${num + 1})`;
    };
    // 创建（插入）一个元素并将其设置为被选中元素
    const createElement = (element: PPTElement) => {
        store.commit(MutationTypes.ADD_SCREEN_ELEMENT, element);
        store.commit(MutationTypes.SET_ACTIVE_SCREEN_ELEMENT_ID_LIST, [element.id]);

        if (creatingElement.value) {
            store.commit(MutationTypes.SET_SCREEN_CREATING_SHAPE_ELEMENT, null);
        }
    };
    /**
     * 创建形状元素
     * @param position 位置大小信息
     * @param data 形状路径信息
     */
    const createShapeElement = (
        position: CommonElementPosition,
        data: ShapePoolItem
    ) => {
        const { left, top, width, height } = position;
        const id = createRandomCode();
        const name = randomName("shape");

        const newElement: PPTShapeElement = {
            name,
            type: "shape",
            id,
            left,
            top,
            width,
            height,
            viewBox: data.viewBox,
            path: data.path,
            fill: "",
            fixedRatio: false,
            outline: {
                width: 1,
                style: "solid",
                color: "#000"
            },
            rotate: 0
        };
        if (data.special) newElement.special = true;
        createElement(newElement);
    };

    /**
 * 创建线条元素
 * @param position 位置大小信息
 * @param data 线条的路径和样式
 */
    const createLineElement = (
        position: LineElementPosition,
        data: LinePoolItem
    ) => {
        const { left, top, start, end } = position;
        const id = createRandomCode();
        const name = randomName("line");

        const newElement: PPTLineElement = {
            name,
            type: "line",
            id,
            left,
            top,
            start,
            end,
            points: data.points,
            color: "#000",
            style: data.style,
            width: 2
        };
        if (data.isBroken) {
            newElement.broken = [
                (start[0] + end[0]) / 2,
                (start[1] + end[1]) / 2
            ];
        }

        if (data.isCurve) {
            newElement.curve = [
                (start[0] + end[0]) / 2,
                (start[1] + end[1]) / 2
            ];
        }

        createElement(newElement);
    };

    return {
        createShapeElement,
        createLineElement
    };
};
