import { computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { createRandomCode } from "@/utils/common";
import { getImageSize, getOssImageUrl } from "@/utils/image";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import {
    PPTLineElement,
    ChartType,
    PPTElement,
    TableCell,
    TableCellStyle,
    PPTShapeElement
} from "@/types/slides";
import { ShapePoolItem } from "@/configs/shapes";
import { LinePoolItem } from "@/configs/lines";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

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
    const themeColor = computed(() => store.state.theme.themeColor);
    const fontColor = computed(() => store.state.theme.fontColor);
    const fontName = computed(() => store.state.theme.fontName);
    const fontSize = computed(() => store.state.theme.fontSize);
    const viewportRatio = computed(() => store.state.viewportRatio);
    const creatingElement = computed(() => store.state.creatingElement);

    const { addHistorySnapshot } = useHistorySnapshot();

    // 创建（插入）一个元素并将其设置为被选中元素
    const createElement = (element: PPTElement) => {
        store.commit(MutationTypes.ADD_ELEMENT, element);
        store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, [element.id]);

        if (creatingElement.value) {
            store.commit(MutationTypes.SET_CREATING_ELEMENT, null);
        }

        setTimeout(() => {
            store.commit(MutationTypes.SET_EDITORAREA_FOCUS, true);
        }, 0);

        addHistorySnapshot();
    };

    /**
     * 创建图片元素
     * @param src 图片地址
     */
    const createImageElement = async (src: string) => {
        const { url, expiration } = await getOssImageUrl(src);
        getImageSize(url).then(({ width, height }) => {
            const scale = height / width;

            if (scale < viewportRatio.value && width > VIEWPORT_SIZE) {
                width = VIEWPORT_SIZE;
                height = width * scale;
            } else if (height > VIEWPORT_SIZE * viewportRatio.value) {
                height = VIEWPORT_SIZE * viewportRatio.value;
                width = height / scale;
            }

            const id = createRandomCode();

            createElement({
                name: "图片-" + id,
                type: "image",
                id,
                src,
                ossSrc: url,
                ossExpiration: expiration,
                width,
                height,
                left: (VIEWPORT_SIZE - width) / 2,
                top: (VIEWPORT_SIZE * viewportRatio.value - height) / 2,
                fixedRatio: true,
                rotate: 0
            });
        });
    };

    /**
     * 创建图表元素
     * @param chartType 图表类型
     */
    const createChartElement = (chartType: ChartType) => {
        const id = createRandomCode();

        createElement({
            name: "图表-" + id,
            type: "chart",
            id,
            chartType,
            left: 300,
            top: 81.25,
            width: 400,
            height: 400,
            themeColor: [themeColor.value],
            gridColor: fontColor.value,
            data: {
                labels: ["类别1", "类别2", "类别3", "类别4", "类别5"],
                legends: ["系列1"],
                series: [[12, 19, 5, 2, 18]]
            }
        });
    };

    /**
     * 创建表格元素
     * @param row 行数
     * @param col 列数
     */
    const createTableElement = (row: number, col: number) => {
        const style: TableCellStyle = {
            fontname: fontName.value,
            color: fontColor.value
        };
        const data: TableCell[][] = [];
        for (let i = 0; i < row; i++) {
            const rowCells: TableCell[] = [];
            for (let j = 0; j < col; j++) {
                rowCells.push({
                    id: createRandomCode(),
                    colspan: 1,
                    rowspan: 1,
                    text: "",
                    style
                });
            }
            data.push(rowCells);
        }

        const DEFAULT_CELL_WIDTH = 100;
        const DEFAULT_CELL_HEIGHT = 36;

        const colWidths: number[] = new Array(col).fill(1 / col);

        const width = col * DEFAULT_CELL_WIDTH;
        const height = row * DEFAULT_CELL_HEIGHT;

        const id = createRandomCode();

        createElement({
            name: "表格-" + id,
            type: "table",
            id,
            width,
            height,
            colWidths,
            data,
            left: (VIEWPORT_SIZE - width) / 2,
            top: (VIEWPORT_SIZE * viewportRatio.value - height) / 2,
            outline: {
                width: 2,
                style: "solid",
                color: "#eeece1"
            },
            theme: {
                color: themeColor.value,
                rowHeader: true,
                rowFooter: false,
                colHeader: false,
                colFooter: false
            }
        });
    };

    /**
     * 创建文本元素
     * @param position 位置大小信息
     * @param content 文本内容
     */
    const createTextElement = (
        position: CommonElementPosition,
        content = "请输入内容"
    ) => {
        const { left, top, width, height } = position;
        const id = createRandomCode();
        createElement({
            name: "文本-" + id,
            type: "text",
            id,
            left,
            top,
            width,
            height,
            content,
            rotate: 0,
            defaultFontName: fontName.value,
            defaultColor: fontColor.value,
            defaultFontSize: fontSize.value
        });
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
        const newElement: PPTShapeElement = {
            name: "形状-" + id,
            type: "shape",
            id,
            left,
            top,
            width,
            height,
            viewBox: data.viewBox,
            path: data.path,
            fill: themeColor.value,
            fixedRatio: false,
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
        const newElement: PPTLineElement = {
            name: "线条-" + id,
            type: "line",
            id,
            left,
            top,
            start,
            end,
            points: data.points,
            color: themeColor.value,
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

    /**
     * 创建LaTeX元素
     * @param svg SVG代码
     */
    const createLatexElement = (data: {
        path: string;
        latex: string;
        w: number;
        h: number;
    }) => {
        const id = createRandomCode();
        createElement({
            name: "公式-" + id,
            type: "latex",
            id,
            width: data.w,
            height: data.h,
            left: (VIEWPORT_SIZE - data.w) / 2,
            top: (VIEWPORT_SIZE * viewportRatio.value - data.h) / 2,
            path: data.path,
            latex: data.latex,
            color: fontColor.value,
            strokeWidth: 2,
            viewBox: [data.w, data.h],
            fixedRatio: true
        });
    };

    /**
     * 创建视频元素
     * @param src 视频地址
     */
    const createVideoElement = (src: string, showType: number) => {
        const width = showType === 0 ? 500 : 100;
        const height = showType === 0 ? 300 : 100;
        const id = createRandomCode();
        createElement({
            name: "视频-" + id,
            type: "video",
            id,
            width,
            height,
            rotate: 0,
            left: (VIEWPORT_SIZE - width) / 2,
            top: (VIEWPORT_SIZE * viewportRatio.value - height) / 2,
            src,
            showType
        });
    };

    /**
     * 创建音频元素
     * @param src 音频地址
     */
    const createAudioElement = (src: string) => {
        const id = createRandomCode();
        createElement({
            name: "音频-" + id,
            type: "audio",
            id,
            rotate: 0,
            width: 100,
            height: 100,
            left: (VIEWPORT_SIZE - 100) / 2,
            top: (VIEWPORT_SIZE * viewportRatio.value - 100) / 2,
            src
        });
    };

    /**
     * 创建网页
     * @param src 网页链接地址
     */
    const createWebIFrameElement = (src: string) => {
        const id = createRandomCode();
        createElement({
            name: "网页-" + id,
            type: "iframe",
            id,
            width: 400,
            height: 300,
            left: (VIEWPORT_SIZE - 400) / 2,
            top: (VIEWPORT_SIZE * viewportRatio.value - 300) / 2,
            src
        });
    };

    return {
        createImageElement,
        createChartElement,
        createTableElement,
        createTextElement,
        createShapeElement,
        createLineElement,
        createLatexElement,
        createVideoElement,
        createAudioElement,
        createWebIFrameElement
    };
};
