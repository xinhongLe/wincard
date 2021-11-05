# WinCard

# use

main.js 中引用 WinCard：

```js
import { createApp } from "vue";
import App from "./App.vue";

import WinCard from "wincard";

createApp(App)
    .use(WinCard)
    .mount("#app");
```

vue 中使用：

```html
<!-- 素材页编辑 -->
<PPTEditor :slide="slide" @onSave="onSave" />

<!-- 预览 -->
<ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" />
```

关于slide参数：
```ts
/**
 * 幻灯片页面
 *
 * id: 页面ID
 *
 * type: 页面类型 0 普通素材页 1 听写页 2 跟读页
 *
 * listenWords: 听写页单词列表
 *
 * viewportRatio: 画布尺寸
 *
 * elements: 元素集合
 *
 * remark?: 备注
 *
 * background?: 页面背景
 *
 * animations?: 元素动画集合
 *
 * turningMode?: 翻页方式
 *
 * steps: 操作步骤
 */
export interface Slide {
    id: string;
    type: number,
    viewportRatio?: number;
    elements: PPTElement[];
    listenWords?: ListenWord[];
    remark?: string;
    background?: SlideBackground;
    animations?: PPTAnimation[];
    turningMode?: "no" | "fade" | "slideX" | "slideY";
    steps?: PPTElementAction[][]
}

/**
 * 听写页单词
 */
export interface ListenWord {
    id: string;
    file: string;
    name: string;
    extention: string;
    pageWordID?: string;
}

/**
 * 元素阴影
 *
 * h: 水平偏移量
 *
 * v: 垂直偏移量
 *
 * blur: 模糊程度
 *
 * color: 阴影颜色
 */
export interface PPTElementShadow {
    h: number;
    v: number;
    blur: number;
    color: string;
}

/**
 * 元素边框
 *
 * style?: 边框样式（实线或虚线）
 *
 * width?: 边框宽度
 *
 * color?: 边框颜色
 */
export interface PPTElementOutline {
    style?: "dashed" | "solid";
    width?: number;
    color?: string;
}

/**
 * 执行事件
 *
 * type: 事件的类型 显示 隐藏 切换
 *
 * target: 事件触发执行的对象id
 *
 * inAni?: 进入动画
 *
 * outAni?: 退出动画
 *
 * duration?: 执行延迟时间
 */
export interface PPTElementAction {
    type: "show" | "hide" | "toggle";
    target: string;
    inAni?: string;
    outAni?: string;
    duration?: number;
}

/**
 * 元素通用属性
 *
 * id: 元素ID
 *
 * name: 元素名
 *
 * left: 元素水平方向位置（距离画布左侧）
 *
 * top: 元素垂直方向位置（距离画布顶部）
 *
 * lock?: 锁定元素
 *
 * groupId?: 组合ID（拥有相同组合ID的元素即为同一组合元素成员）
 *
 * width: 元素宽度
 *
 * height: 元素高度
 *
 * link?: 超链接地址
 *
 * actions: 执行事件
 */
interface PPTBaseElement {
    id: string;
    name: string,
    left: number;
    top: number;
    lock?: boolean;
    groupId?: string;
    width: number;
    height: number;
    link?: string;
    display?: boolean;
    actions?: PPTElementAction[]
}

/**
 * 文本元素
 *
 * type: 元素类型（text）
 *
 * content: 文本内容（HTML字符串）
 *
 * rotate: 旋转角度
 *
 * defaultFontName: 默认字体（会被文本内容中的HTML内联样式覆盖）
 *
 * defaultColor: 默认颜色（会被文本内容中的HTML内联样式覆盖）
 *
 * outline?: 边框
 *
 * fill?: 填充色
 *
 * lineHeight?: 行高（倍），默认1.5
 *
 * wordSpace?: 字间距，默认0
 *
 * opacity?: 不透明度，默认1
 *
 * shadow?: 阴影
 */
export interface PPTTextElement extends PPTBaseElement {
    type: "text";
    content: string;
    rotate: number;
    defaultFontName: string;
    defaultColor: string;
    outline?: PPTElementOutline;
    fill?: string;
    lineHeight?: number;
    wordSpace?: number;
    opacity?: number;
    shadow?: PPTElementShadow;
}

/**
 * 图片翻转、形状翻转
 *
 * flipH?: 水平翻转
 *
 * flipV?: 垂直翻转
 */
export interface ImageOrShapeFlip {
    flipH?: boolean;
    flipV?: boolean;
}

/**
 * 图片滤镜
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter
 *
 * 'blur'?: 模糊，默认0（px）
 *
 * 'brightness'?: 亮度，默认100（%）
 *
 * 'contrast'?: 对比度，默认100（%）
 *
 * 'grayscale'?: 灰度，默认0（%）
 *
 * 'saturate'?: 饱和度，默认100（%）
 *
 * 'hue-rotate'?: 色相旋转，默认0（deg）
 *
 * 'opacity'?: 不透明度，默认100（%）
 */
export interface ImageElementFilters {
    blur?: string;
    brightness?: string;
    contrast?: string;
    grayscale?: string;
    saturate?: string;
    "hue-rotate"?: string;
    opacity?: string;
}

/**
 * 图片裁剪
 *
 * range: 裁剪范围，例如：[[10, 10], [90, 90]] 表示裁取原图从左上角 10%, 10% 到 90%, 90% 的范围
 *
 * shape: 裁剪形状，见 configs/imageClip.ts CLIPPATHS
 */
export interface ImageElementClip {
    range: [[number, number], [number, number]];
    shape: string;
}

/**
 * 图片元素
 *
 * type: 元素类型（image）
 *
 * fixedRatio: 固定图片宽高比例
 *
 * src: 图片 fileName 请求 oss 使用
 *
 * ossSrc: 图片 oss 访问地址
 *
 * ossExpiration: 图片 oss 访问地址过期时间
 *
 * rotate: 旋转角度
 *
 * outline?: 边框
 *
 * filters?: 图片滤镜
 *
 * clip?: 裁剪信息
 *
 * flipH?: 水平翻转
 *
 * flipV?: 垂直翻转
 *
 * shadow?: 阴影
 */
export interface PPTImageElement extends PPTBaseElement {
    type: "image";
    fixedRatio: boolean;
    src: string;
    ossSrc?: string;
    ossExpiration?: string;
    rotate: number;
    outline?: PPTElementOutline;
    filters?: ImageElementFilters;
    clip?: ImageElementClip;
    flipH?: boolean;
    flipV?: boolean;
    shadow?: PPTElementShadow;
}

/**
 * 形状渐变
 *
 * type: 渐变类型（径向、线性）
 *
 * color: 渐变颜色
 *
 * rotate: 渐变角度（线性渐变）
 */
export interface ShapeGradient {
    type: "linear" | "radial";
    color: [string, string];
    rotate: number;
}

/**
 * 形状内文本
 *
 * content: 文本内容（HTML字符串）
 *
 * defaultFontName: 默认字体（会被文本内容中的HTML内联样式覆盖）
 *
 * defaultColor: 默认颜色（会被文本内容中的HTML内联样式覆盖）
 *
 * align: 文本对齐方向（垂直方向）
 */
export interface ShapeText {
    content: string;
    defaultFontName: string;
    defaultColor: string;
    align: "top" | "middle" | "bottom";
}

/**
 * 形状元素
 *
 * type: 元素类型（shape）
 *
 * viewBox: SVG的viewBox属性，默认为正方形，例如 1000 表示 '0 0 1000 1000'
 *
 * path: 形状路径，SVG path 的 d 属性
 *
 * fixedRatio: 固定形状宽高比例
 *
 * fill: 填充，不存在渐变时生效
 *
 * gradient?: 渐变，该属性存在时将优先作为填充
 *
 * rotate: 旋转角度
 *
 * outline?: 边框
 *
 * opacity?: 不透明度
 *
 * flipH?: 水平翻转
 *
 * flipV?: 垂直翻转
 *
 * shadow?: 阴影
 *
 * special?: 特殊形状（标记一些难以解析的形状，例如路径使用了 L Q C A 以外的类型，该类形状在导出后将变为图片的形式）
 *
 * text?: 形状内文本
 */
export interface PPTShapeElement extends PPTBaseElement {
    type: "shape";
    viewBox: number;
    path: string;
    fixedRatio: boolean;
    fill: string;
    gradient?: ShapeGradient;
    rotate: number;
    outline?: PPTElementOutline;
    opacity?: number;
    flipH?: boolean;
    flipV?: boolean;
    shadow?: PPTElementShadow;
    special?: boolean;
    text?: ShapeText;
}

export type LinePoint = "" | "arrow" | "dot";

/**
 * 线条元素
 *
 * type: 元素类型（line）
 *
 * start: 起点位置（[x, y]）
 *
 * end: 终点位置（[x, y]）
 *
 * style: 线条样式（实线、虚线）
 *
 * color: 线条颜色
 *
 * points: 端点样式（[起点样式, 终点样式]，可选：无、箭头、圆点）
 *
 * shadow?: 阴影
 *
 * broken?: 折线中点位置（[x, y]）
 *
 * curve?: 曲线中点位置（[x, y]）
 */
export interface PPTLineElement extends Omit<PPTBaseElement, "height"> {
    type: "line";
    start: [number, number];
    end: [number, number];
    style: "solid" | "dashed";
    color: string;
    points: [LinePoint, LinePoint];
    shadow?: PPTElementShadow;
    broken?: [number, number];
    curve?: [number, number];
}

export type ChartType = "bar" | "line" | "pie";
export interface ChartData {
    labels: string[];
    legends: string[];
    series: number[][];
}

/**
 * 图表元素
 *
 * type: 元素类型（chart）
 *
 * fill?: 填充色
 *
 * chartType: 图表类型
 *
 * data: 图表数据
 *
 * options?: 图表配置项
 *
 * outline?: 边框
 *
 * themeColor: 主题色
 *
 * gridColor?: 网格&坐标颜色
 *
 * legend?: 图例/位置
 */
export interface PPTChartElement extends PPTBaseElement {
    type: "chart";
    fill?: string;
    chartType: ChartType;
    data: ChartData;
    options?: ILineChartOptions & IBarChartOptions & IPieChartOptions;
    outline?: PPTElementOutline;
    themeColor: string[];
    gridColor?: string;
    legend?: "" | "top" | "bottom";
}

/**
 * 表格单元格样式
 *
 * bold?: 加粗
 *
 * em?: 斜体
 *
 * underline?: 下划线
 *
 * strikethrough?: 删除线
 *
 * color?: 字体颜色
 *
 * backcolor?: 填充色
 *
 * fontsize?: 字体大小
 *
 * fontname?: 字体
 *
 * align?: 对齐方式
 */
export interface TableCellStyle {
    bold?: boolean;
    em?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    color?: string;
    backcolor?: string;
    fontsize?: string;
    fontname?: string;
    align?: "left" | "center" | "right";
}

/**
 * 表格单元格
 *
 * id: 单元格ID
 *
 * colspan: 合并列数
 *
 * rowspan: 合并行数
 *
 * text: 文字内容
 *
 * style?: 单元格样式
 */
export interface TableCell {
    id: string;
    colspan: number;
    rowspan: number;
    text: string;
    style?: TableCellStyle;
}

/**
 * 表格主题
 *
 * color: 主题色
 *
 * rowHeader: 标题行
 *
 * rowFooter: 汇总行
 *
 * colHeader: 第一列
 *
 * colFooter: 最后一列
 */
export interface TableTheme {
    color: string;
    rowHeader: boolean;
    rowFooter: boolean;
    colHeader: boolean;
    colFooter: boolean;
}

/**
 * 表格元素
 *
 * type: 元素类型（table）
 *
 * outline: 边框
 *
 * theme?: 主题
 *
 * colWidths: 列宽数组，如[30, 50, 20]表示三列宽度分别为30%, 50%, 20%
 *
 * data: 表格数据
 */
export interface PPTTableElement extends PPTBaseElement {
    type: "table";
    outline: PPTElementOutline;
    theme?: TableTheme;
    colWidths: number[];
    data: TableCell[][];
}

/**
 * LaTeX元素（公式）
 *
 * type: 元素类型（latex）
 *
 * latex: latex代码
 *
 * path: svg path
 *
 * color: 颜色
 *
 * strokeWidth: 路径宽度
 *
 * viewBox: SVG的viewBox属性
 *
 * fixedRatio: 固定形状宽高比例
 */
export interface PPTLatexElement extends PPTBaseElement {
    type: "latex";
    latex: string;
    path: string;
    color: string;
    strokeWidth: number;
    viewBox: [number, number];
    fixedRatio: boolean;
}

/**
 * 视频元素
 *
 * type: 元素类型（video）
 *
 * src: 视频地址
 *
 * ossSrc: 视频 oss 访问地址
 *
 * ossExpiration: 视频 oss 访问地址过期时间
 *
 * showType: 视频预览形式 0: 视频普通展示（大视频） 1: 视频只展示按钮，需要点击弹框展示（小视频）
 *
 * poster: 预览封面
 */
export interface PPTVideoElement extends PPTBaseElement {
    type: "video";
    src: string;
    ossSrc?: string;
    ossExpiration?: string;
    showType: number;
    poster?: string;
    ossPoster?: string;
}

export type PPTElement =
    | PPTTextElement
    | PPTImageElement
    | PPTShapeElement
    | PPTLineElement
    | PPTChartElement
    | PPTTableElement
    | PPTLatexElement
    | PPTVideoElement;

/**
 * 元素动画
 *
 * elId: 元素ID
 *
 * type: 动画类型
 *
 * duration: 动画持续时间
 */
export interface PPTAnimation {
    elId: string;
    type: string;
    duration: number;
}

/**
 * 幻灯片背景
 *
 * type: 背景类型（纯色、图片、渐变）
 *
 * color?: 背景颜色（纯色）
 *
 * image?: 图片地址（图片）
 *
 * ossSrc: 图片 oss 访问地址
 *
 * ossExpiration: 图片 oss 访问地址过期时间
 *
 * imageSize?: 图片填充方式
 *
 * gradientType?: 渐变类型（线性、径向）
 *
 * gradientColor?: 渐变颜色
 *
 * gradientRotate?: 渐变角度（线性）
 */
export interface SlideBackground {
    type: "solid" | "image" | "gradient";
    color?: string;
    image?: string;
    ossSrc?: string;
    ossExpiration?: string;
    imageSize?: "cover" | "contain" | "repeat";
    gradientType?: "linear" | "radial";
    gradientColor?: [string, string];
    gradientRotate?: number;
}

/**
 * 幻灯片主题
 *
 * backgroundColor: 页面背景颜色
 *
 * themeColor: 主题色，用于默认创建的形状颜色等
 *
 * fontColor: 字体颜色
 *
 * fontName: 字体
 */
export interface SlideTheme {
    backgroundColor: string;
    themeColor: string;
    fontColor: string;
    fontName: string;
}
```

slide数据示例：
```ts
// 素材页
{
    id: "39FFFBBE2B08D1CFD8FCA24DE655B35B",
    type: 0,
    viewportRatio: 0.5625,
    elements: [
        {
            name: "形状1",
            type: "shape",
            id: "4cbRxp",
            left: 0,
            top: 200,
            width: 546,
            height: 362.5,
            viewBox: 200,
            path: "M 0 0 L 0 200 L 200 200 Z",
            fill: "#5b9bd5",
            fixedRatio: false,
            opacity: 0.7,
            rotate: 0
        },
        {
            name: "形状2",
            type: "shape",
            id: "ookHrf",
            left: 0,
            top: 0,
            width: 300,
            height: 320,
            viewBox: 200,
            path: "M 0 0 L 0 200 L 200 200 Z",
            fill: "#5b9bd5",
            fixedRatio: false,
            flipV: true,
            rotate: 0
        },
        {
            name: "文本1",
            type: "text",
            id: "idn7Mx",
            left: 355,
            top: 65.25,
            width: 585,
            height: 188,
            lineHeight: 1.2,
            content:
                "<p><strong><span style='font-size:  112px'>PPTIST</span></strong></p>",
            rotate: 0,
            defaultFontName: "Microsoft Yahei",
            defaultColor: "#333"
        },
        {
            name: "文本2",
            type: "text",
            id: "7stmVP",
            left: 355,
            top: 253.25,
            width: 585,
            height: 56,
            content:
                "<p><span style='font-size:  24px'>基于 Vue 3.x + TypeScript 的在线演示文稿应用</span></p>",
            rotate: 0,
            defaultFontName: "Microsoft Yahei",
            defaultColor: "#333"
        },
        {
            name: "线条",
            type: "line",
            id: "FnpZs4",
            left: 361,
            top: 238,
            start: [0, 0],
            end: [549, 0],
            points: ["", ""],
            color: "#5b9bd5",
            style: "solid",
            width: 2
        }
    ],
    background: {
        type: "solid",
        color: "#ffffff"
    }
}

// 听写页
{
    id: "39FFFBBE2B08D1CFD8FCA24DE655B35B",
    type: 1,
    viewportRatio: 0.5625,
    elements: [],
    listenWords: [
        {
            id: "39FED7308B47FE07436EC33844DE78F5",
            name: "苹果1",
            file: "TeachPageFile/EFF4D19486842BDF411839B61AE22B71.mp3",
            extention: "mp3",
            pageWordID: "39FFFC10573FB3AD0BC87C17A08E2AD5"
        },
        {
            name: "121212",
            id: "39FECC5CDF3022C43C032688958B16BF",
            file: "TeachPageFile/28D7326F7772879CDCF564A2A755B264.m4a",
            extention: "m4a",
            pageWordID: "39FFFC10574015C89FAEF9355BB5E7CB"
        },
        {
            name: "121212",
            id: "39FECC5CDF3022C43C032688958B16BF",
            file: "TeachPageFile/28D7326F7772879CDCF564A2A755B264.m4a",
            extention: "m4a",
            pageWordID: "39FFFC65054430D68B36F090A1875989"
        },
        {
            name: "测试",
            id: "39FEBCA9648BE111E08E1B4CD1C5104E",
            file: "TeachPageFile/814F94E1DBA66566099B0787FA7678D7.mp4",
            extention: "mp4",
            pageWordID: "39FFFC654B2BDC6027B84AE7E1021F3A"
        },
        {
            name: "敦实",
            id: "39FEBCA933D981CE5D2A348A65ABC0DB",
            file: "TeachPageFile/CA7DC5A89DD86B2DD66B8D996EAB67E3.mp3",
            extention: "mp3",
            pageWordID: "39FFFC654B2B2A9804F1F6914BF1D786"
        }
    ],
    background: {
        type: "solid",
        color: "#ffffff"
    }
}
```

**_【注】：支持数据导入和导出_**
