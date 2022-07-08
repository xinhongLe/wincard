import { App } from "vue";
import "@icon-park/vue-next/styles/index.css";

import {
    PlayOne,
    Lock,
    Unlock,
    Ppt,
    Format,
    Picture,
    FullScreen,
    List,
    OrderedList,
    Helpcenter,
    FlipVertically,
    FlipHorizontally,
    FontSize,
    Code,
    TextBold,
    TextItalic,
    TextUnderline,
    Strikethrough,
    Edit,
    Quote,
    BackgroundColor,
    Group,
    Ungroup,
    Back,
    Next,
    Fullwidth,
    AlignTop,
    AlignLeft,
    AlignRight,
    AlignBottom,
    AlignVertically,
    AlignHorizontally,
    BringToFront,
    SendToBack,
    AlignTextLeft,
    AlignTextRight,
    AlignTextCenter,
    RowHeight,
    Write,
    InsertTable,
    AddText,
    Fill,
    Tailoring,
    Effects,
    ColorFilter,
    Down,
    Plus,
    Minus,
    WaterfallsH,
    Connection,
    BringToFrontOne,
    SentToBack,
    Github,
    ChartProportion,
    ChartHistogram,
    ChartHistogramOne,
    ChartLine,
    ChartLineArea,
    ChartScatter,
    ChartPie,
    ChartRing,
    Text,
    Rotate,
    LeftTwo,
    RightTwo,
    Platte,
    UpOne,
    DownOne,
    Close,
    CloseSmall,
    Undo,
    Transform,
    Click,
    Theme,
    ArrowCircleLeft,
    GraphicDesign,
    Logout,
    Erase,
    Clear,
    FolderClose,
    AlignTextTopOne,
    AlignTextBottomOne,
    AlignTextMiddleOne,
    Pause,
    VolumeMute,
    VolumeNotice,
    VolumeSmall,
    CycleOne,
    VideoTwo,
    VideoOne,
    Video,
    Formula,
    Check,
    AudioFile,
    Delete,
    Page,
    Right,
    Bookmark,
    VideoFile,
    DistributeHorizontally,
    DistributeVertically,
    BookmarkOne,
    Square,
    ToTop,
    Copy,
    Refraction,
    FolderWithdrawal,
    FullScreenOne,
    Detection,
    Word
} from "@icon-park/vue-next";
import {
    DEFAULT_ICON_CONFIGS,
    IconProvider
} from "@icon-park/vue-next/es/runtime";

export default {
    install(app: App) {
        IconProvider({ ...DEFAULT_ICON_CONFIGS, prefix: "icon" });
        // 保存
        app.component("IconSave", Check);
        // 插入元素
        app.component("IconFontSize", FontSize);
        app.component("IconPicture", Picture);
        app.component("IconGraphicDesign", GraphicDesign);
        app.component("IconConnection", Connection);
        app.component("IconChartProportion", ChartProportion);
        app.component("IconInsertTable", InsertTable);
        app.component("IconVideoTwo", VideoTwo);
        app.component("IconFormula", Formula);
        app.component("IconBookMark", BookmarkOne);

        // 锁定与解锁
        app.component("IconLock", Lock);
        app.component("IconUnlock", Unlock);

        // 全屏
        app.component("IconFullScreen", FullScreen);
        app.component("IconOffFullScreen", FolderWithdrawal);
        app.component("IconFullScreenOne", FullScreenOne);

        // 撤销重做
        app.component("IconBack", Back);
        app.component("IconNext", Next);

        // 对齐
        app.component("IconAlignTop", AlignTop);
        app.component("IconAlignLeft", AlignLeft);
        app.component("IconAlignRight", AlignRight);
        app.component("IconAlignBottom", AlignBottom);
        app.component("IconAlignVertically", AlignVertically);
        app.component("IconAlignHorizontally", AlignHorizontally);
        app.component("IconDistributeHorizontally", DistributeHorizontally);
        app.component("IconDistributeVertically", DistributeVertically);

        // 层级
        app.component("IconBringToFront", BringToFront);
        app.component("IconSentToBack", SentToBack);
        app.component("IconBringToFrontOne", BringToFrontOne);
        app.component("IconToTop", ToTop);
        app.component("IconSendToBack", SendToBack);

        // 组合
        app.component("IconGroup", Group);
        app.component("IconUngroup", Ungroup);

        // 通用元素编辑
        app.component("IconFill", Fill);
        app.component("IconBackgroundColor", BackgroundColor);
        app.component("IconPlatte", Platte);

        // 图片编辑
        app.component("IconTailoring", Tailoring);
        app.component("IconColorFilter", ColorFilter);
        app.component("IconFlipVertically", FlipVertically);
        app.component("IconFlipHorizontally", FlipHorizontally);

        // 文字编辑
        app.component("IconText", Text);
        app.component("IconAddText", AddText);
        app.component("IconAlignTextLeft", AlignTextLeft);
        app.component("IconAlignTextRight", AlignTextRight);
        app.component("IconAlignTextCenter", AlignTextCenter);
        app.component("IconRowHeight", RowHeight);
        app.component("IconFullwidth", Fullwidth);
        app.component("IconCode", Code);
        app.component("IconTextBold", TextBold);
        app.component("IconTextItalic", TextItalic);
        app.component("IconTextUnderline", TextUnderline);
        app.component("IconStrikethrough", Strikethrough);
        app.component("IconQuote", Quote);
        app.component("IconList", List);
        app.component("IconOrderedList", OrderedList);
        app.component("IconUpOne", UpOne);
        app.component("IconDownOne", DownOne);
        app.component("IconFormat", Format);
        app.component("IconAlignTextTopOne", AlignTextTopOne);
        app.component("IconAlignTextBottomOne", AlignTextBottomOne);
        app.component("IconAlignTextMiddleOne", AlignTextMiddleOne);

        // 箭头与符号
        app.component("IconDown", Down);
        app.component("IconLeftTwo", LeftTwo);
        app.component("IconRightTwo", RightTwo);
        app.component("IconRight", Right);
        app.component("IconPlus", Plus);
        app.component("IconMinus", Minus);
        app.component("IconWaterfallsH", WaterfallsH);
        app.component("IconClose", Close);
        app.component("IconCloseSmall", CloseSmall);
        app.component("IconRefraction", Refraction);

        // 图表
        app.component("IconChartHistogram", ChartHistogram);
        app.component("IconChartHistogramOne", ChartHistogramOne);
        app.component("IconChartLine", ChartLine);
        app.component("IconChartLineArea", ChartLineArea);
        app.component("IconChartScatter", ChartScatter);
        app.component("IconChartPie", ChartPie);
        app.component("IconChartRing", ChartRing);

        // 其他
        app.component("IconPlayOne", PlayOne);
        app.component("IconPpt", Ppt);
        app.component("IconHelpcenter", Helpcenter);
        app.component("IconGithub", Github);
        app.component("IconWrite", Write);
        app.component("IconErase", Erase);
        app.component("IconEffects", Effects);
        app.component("IconRotate", Rotate);
        app.component("IconEdit", Edit);
        app.component("IconUndo", Undo);
        app.component("IconTransform", Transform);
        app.component("IconClick", Click);
        app.component("IconTheme", Theme);
        app.component("IconArrowCircleLeft", ArrowCircleLeft);
        app.component("IconLogout", Logout);
        app.component("IconClear", Clear);
        app.component("IconFolderClose", FolderClose);
        app.component("IconDelete", Delete);
        app.component("IconBookmark", Bookmark);
        app.component("IconSquare", Square);
        app.component("IconCopy", Copy);
        app.component("IconDetection", Detection);
        app.component("IconWord", Word);

        // 视频播放器
        app.component("IconPause", Pause);
        app.component("IconVolumeMute", VolumeMute);
        app.component("IconVolumeNotice", VolumeNotice);
        app.component("IconVolumeSmall", VolumeSmall);
        app.component("IconCycleOne", CycleOne);
        app.component("IconVideoOne", VideoOne);
        app.component("IconBigVideo", Video);
        app.component("IconVideoFile", VideoFile);

        // 音频
        app.component("IconAudioFile", AudioFile);

        // 网页
        app.component("IconWeb", Page);
    }
};
