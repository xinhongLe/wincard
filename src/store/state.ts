// import { slides } from "@/mocks/slides";
import { theme } from "@/mocks/theme";
import { SYS_FONTS } from "@/configs/font";
import { CreatingElement } from "@/types/edit";
import { ListenWord, PPTElement, Slide, SlideTheme } from "@/types/slides";
import { defaultRichTextAttrs, TextAttrs } from "@/utils/prosemirror/utils";
import { ToolbarState } from "@/types/toolbar";

export interface State {
    activeElementIdList: string[];
    handleElementId: string;
    activeGroupElementId: string;
    screening: boolean;
    showGridLines: boolean;
    canvasPercentage: number;
    canvasScale: number;
    creatingElement: CreatingElement | null;
    viewportRatio: number;
    slides: Slide[];
    slideIndex: number;
    selectedSlidesIndex: number[];
    snapshotCursor: number;
    snapshotLength: number;
    theme: SlideTheme;
    editorAreaFocus: boolean;
    availableFonts: typeof SYS_FONTS;
    oldSlides: boolean;
    isScaling: boolean;
    richTextAttrs: TextAttrs;
    disableHotkeys: boolean;
    ctrlKeyState: boolean;
    shiftKeyState: boolean;
    altKeyState: boolean;
    clipingImageElementId: string;
    toolbarState: ToolbarState;
    thumbnailsFocus: boolean;
    selectedTableCells: string[];
    editingShapeElementId: string;
    listenSystemList: ListenWord[];
    listenPage: number;
    listenTotal: number;
    canvasMoveX: number;
    canvasMoveY: number;
    menuOpen: boolean;
}

export const state: State = {
    activeElementIdList: [], // 被选中的元素ID集合，包含 handleElementId
    handleElementId: "", // 正在操作的元素ID
    activeGroupElementId: "", // 组合元素成员中，被选中可独立操作的元素ID
    screening: false, // 是否进入放映状态
    showGridLines: false, // 是否显示网格线
    slides: [], // 幻灯片页面数据
    slideIndex: 0, // 当前页面索引
    selectedSlidesIndex: [], // 当前被选中的页面索引集合
    canvasPercentage: 90, // 画布可视区域百分比
    canvasScale: 1, // 画布缩放比例（基于宽度1000px）
    viewportRatio: 0.5625, // 可是区域比例，默认16:9
    snapshotCursor: -1, // 历史快照指针
    snapshotLength: 0, // 历史快照长度
    creatingElement: null, // 正在插入的元素信息，需要绘制插入的元素（文字、形状、线条）
    theme: theme, // 主题样式
    editorAreaFocus: false, // 编辑区域聚焦
    availableFonts: [], // 当前环境可用字体
    oldSlides: false, // 是否存在未保存的旧数据
    isScaling: false, // 正在进行元素缩放
    richTextAttrs: defaultRichTextAttrs, // 富文本状态
    disableHotkeys: false, // 禁用快捷键
    ctrlKeyState: false, // ctrl键按下状态
    shiftKeyState: false, // shift键按下状态
    altKeyState: false, // alt键按下状态
    clipingImageElementId: "", // 当前正在裁剪的图片ID
    toolbarState: "slideDesign", // 右侧工具栏状态
    thumbnailsFocus: false, // 左侧导航缩略图区域聚焦
    selectedTableCells: [], // 选中的表格单元格
    editingShapeElementId: "", // 当前正处在编辑文字状态的形状ID
    listenSystemList: [], // 存字词库数据
    listenPage: 1, // 字词库分页
    listenTotal: 0, // 字词库总数
    canvasMoveX: 0, // 画布横向移动距离
    canvasMoveY: 0, // 画布纵向移动距离
    menuOpen: false // 元素列表菜单是否展开
};
