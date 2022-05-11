import { PPTShapeElement, ShapeText } from "@/types/slides";
import { computed, ComputedRef } from "vue";

export default (elementInfo: ComputedRef<PPTShapeElement>) => {
    const path = computed(() => {
        if (elementInfo.value.path === "M 20 0 L 180 0 Q 200 0 200 20 L 200 180 Q 200 200 180 200 L 20 200 Q 0 200 0 180 L 0 20 Q 0 0 20 0 Z") {
            const borderRadius = elementInfo.value.radius || 0;
            const w = elementInfo.value.width;
            const h = elementInfo.value.height;
            return `M ${borderRadius} 0 L ${w - borderRadius} 0 Q ${w} 0 ${w} ${borderRadius} L ${w} ${h - borderRadius} Q ${w} ${h} ${w - borderRadius} ${h} L ${borderRadius} ${h} Q 0 ${h} 0 ${h - borderRadius} L 0 ${borderRadius} Q 0 0 ${borderRadius} 0 Z`;
        }
        if (elementInfo.value.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z") {
            const borderRadius = elementInfo.value.radius || 0;
            const w = elementInfo.value.width;
            const h = elementInfo.value.height;
            const position = elementInfo.value.chartPosition || "bottom";
            const offset = elementInfo.value.chartOffset || (position === "top" || position === "bottom" ? (Math.ceil(w / 4)) : (Math.ceil(h / 4)));
            const bottom = `L ${offset + 10} ${h} L ${offset - 10} ${h + 40} L ${offset - 10} ${h}`;
            const left = `L 0 ${offset + 10} L -40 ${offset - 10} L 0 ${offset - 10}`;
            const right = `L ${w} ${offset - 10} L ${w + 40} ${offset + 10} L ${w} ${offset + 10}`;
            const top = `L ${offset - 10} 0 L ${offset + 10} -40 L ${offset + 10} 0`;
            return `M 0 ${borderRadius} Q 0 0 ${borderRadius} 0 ${position === "top" ? top : ""} L ${w - borderRadius} 0 Q ${w} 0 ${w} ${borderRadius} ${position === "right" ? right : ""} L ${w} ${h - borderRadius} Q ${w} ${h} ${w - borderRadius} ${h} ${position === "bottom" ? bottom : ""} L ${borderRadius} ${h} Q 0 ${h} 0 ${h - borderRadius} ${position === "left" ? left : ""} L 0 ${borderRadius} Z`;
        }
        if (elementInfo.value.path === "M 50 240 L 60 191.6515138991168 A 100 100 0 1 1 100 200 Z") {
            // px py 为聊天框箭头点的坐标
            const px = typeof elementInfo.value.ovalChartOffset !== "undefined" ? elementInfo.value.ovalChartOffset : { leftBottom: 50, rightBottom: 150, leftTop: 50, rightTop: 150 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            const py = { leftBottom: 240, rightBottom: 240, leftTop: -40, rightTop: -40 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            // ox oy 为聊天框在椭圆顶点外的坐标
            const ox = { leftBottom: 60, rightBottom: 140, leftTop: 60, rightTop: 140 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            const oy = { leftBottom: 191.6515138991168, rightBottom: 191.6515138991168, leftTop: 8.348486100883207, rightTop: 8.348486100883207 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            // ex ey 为形状结束位置的点
            const ex = { leftBottom: 100, rightBottom: 100, leftTop: 100, rightTop: 100 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            const ey = { leftBottom: 200, rightBottom: 200, leftTop: 0, rightTop: 0 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            // sweepFlag 为弧线方向
            const sweepFlag = { leftBottom: 1, rightBottom: 0, leftTop: 0, rightTop: 1 }[elementInfo.value.ovalChartPosition || "leftBottom"];
            return `M ${px} ${py} L ${ox} ${oy} A 100 100 0 1 ${sweepFlag} ${ex} ${ey} Z`;
        }
        return elementInfo.value.path;
    });

    const isScale = computed(() => {
        return !(elementInfo.value.path === "M 20 0 L 180 0 Q 200 0 200 20 L 200 180 Q 200 200 180 200 L 20 200 Q 0 200 0 180 L 0 20 Q 0 0 20 0 Z" || elementInfo.value.path === "M 0 40 Q 0 0 40 0 L 160 0 Q 200 0 200 40 L 200 160 Q 200 200 160 200 L 100 200 L 80 240 L 60 200 L 40 200 Q 0 200 0 160 L 0 40 Z");
    });

    const text = computed<ShapeText>(() => {
        const defaultText: ShapeText = {
            content: "",
            defaultFontName: "微软雅黑",
            defaultColor: "#000",
            defaultFontSize: "14px",
            align: "middle"
        };
        if (!elementInfo.value.text) return defaultText;

        return elementInfo.value.text;
    });

    const textHtml = computed(() => {
        return text.value.content.replace(/<p(?:\s+?[^>]*?)?>\s*?<\/p>/ig, "<p><br class=\"ProseMirror-trailingBreak\" /></p>");
    });

    return {
        text,
        textHtml,
        path,
        isScale
    };
};
