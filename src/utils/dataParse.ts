import { OSS_PATH } from "@/configs/filePath";
import { PPTElement, PPTElementAction, PPTImageElement, PPTShapeElement, PPTTextElement, Slide, SlideBackground } from "@/types/slides";
import { createRandomCode } from "./common";

interface IOldSlide {
    Elements: string[];
    Events: string[],
    PageSetting: string;
    Steps: string[];
}

interface IAction {
    ActionType: number;
    TargetID: string;
}

interface IEvent {
    Actions: IAction[];
    CustomActions: IAction[];
    EventType: number;
    SourceID: string;
}

interface IOldAction {
    ActionType: number;
    TargetID: string;
}

export const dealOldData = (oldSlide: IOldSlide) => {
    const slide: Slide = {
        id: createRandomCode(),
        type: 0,
        viewportRatio: 0.5625,
        elements: []
    };

    slide.background = getSlideData(oldSlide.PageSetting);

    slide.steps = getSlideStepData(oldSlide.Steps);

    const sortOldElenents = sortElementsByZIndex(oldSlide.Elements);

    slide.elements = getElementsData(sortOldElenents, oldSlide.Events);
    return slide;
};

// 处理页面配置数据
const getSlideData = (slideBackgroundString: string) => {
    const setting = JSON.parse(slideBackgroundString);
    const background: SlideBackground = {
        type: "solid"
    };
    if (setting.BackColor) {
        // 纯色背景填充
        background.type = "solid";
        background.color = converColor(setting.BackColor);
    }
    if (setting.OssFileName) {
        // 背景图填充
        background.type = "image";
        background.image = OSS_PATH + "/" + setting.OssFileName;
        background.imageSize = "cover";
    }
    return background;
};

// 处理事件
const getSlideEventData = (oldEvents: string[]) => {
    return oldEvents.map(item => {
        const event: IEvent = JSON.parse(item);
        return event;
    });
};

// 获取对应元素的事件
const getElementActionsById = (events: IEvent[], id: string) => {
    const event = events.find((event: IEvent) => {
        return event.SourceID === id;
    });
    const actions: PPTElementAction[] = (event?.Actions || []).map(item => {
        return {
            type: item.ActionType === 1 ? "show" : item.ActionType === 2 ? "hide" : "toggle",
            target: item.TargetID
        };
    });
    return actions;
};

// 处理页面步骤数据
const getSlideStepData = (oldSteps: string[]) => {
    const steps: PPTElementAction[][] = [];
    oldSteps.forEach((item: string) => {
        const oldStep = JSON.parse(item);
        const actions: PPTElementAction[] = oldStep.Actions.map((action: IOldAction) => {
            return {
                type: ["", "show", "hide", "toggle"][action.ActionType],
                target: action.TargetID
            };
        });
        steps.push(actions);
    });
    return steps;
};

// 根据 ZIndex 进行排序
const sortElementsByZIndex = (oldElements: string[]) => {
    return oldElements.sort((a, b) => {
        return JSON.parse(a).ZIndex - JSON.parse(b).ZIndex;
    });
};

// 处理获取元素集合
const getElementsData = (oldElements: string[], oldActions: string[]) => {
    const events: IEvent[] = getSlideEventData(oldActions);
    const elements: PPTElement[] = [];
    oldElements.forEach((item: string) => {
        const oldElement = JSON.parse(item);
        const actions: PPTElementAction[] = getElementActionsById(events, oldElement.UUID);
        switch (oldElement.Type) {
        case 1:
            elements.push({ ...dealText(oldElement), actions });
            break;
        case 3:
            elements.push({ ...dealCircle(oldElement), actions });
            break;
        case 5:
            elements.push({ ...dealImage(oldElement), actions });
            break;
        }
    });
    return elements;
};

interface IOldTextElement {
    Angle: number;
    Background: string;
    CornerRadius: number; // 缺
    FontFamily: string;
    FontSize: number;
    Foreground: string;
    Height: number;
    HorizontalAlignment: number; // 水平对齐 0 left  1 center  2 right // 缺
    IsVisibility: boolean;
    Left: number;
    LineBrush: string; // 边框颜色
    LineHeight: number;
    LineType: number; // 边框类型  1 实线 0 虚线
    LineWidth: number;
    Name: string;
    Text: string;
    Top: number;
    Type: number;
    UUID: string;
    VerticalAlignment: number; // 缺
    Width: number;
    ZIndex: number;
}

// 处理文本
const dealText = (oldText: IOldTextElement) => {
    const element: PPTTextElement = {
        id: "",
        name: "",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        type: "text",
        content: "",
        rotate: 0,
        defaultFontName: "",
        defaultColor: "",
        defaultFontSize: ""
    };
    element.id = oldText.UUID;
    element.name = oldText.Name;
    element.top = oldText.Top;
    element.left = oldText.Left;
    element.width = oldText.Width;
    element.height = oldText.Height;
    element.content = oldText.Text;
    element.rotate = oldText.Angle;
    element.defaultFontName = oldText.FontFamily;
    element.defaultColor = converColor(oldText.Foreground);
    element.fill = converColor(oldText.Background);
    element.defaultFontSize = oldText.FontSize + "px";
    element.display = oldText.IsVisibility;
    element.outline = {};
    element.outline.color = converColor(oldText.LineBrush);
    element.outline.width = oldText.LineWidth;
    element.outline.style = oldText.LineType === 0 ? "dashed" : "solid";
    element.lineHeight = oldText.LineHeight / oldText.Height < 1 ? 1 : oldText.LineHeight / oldText.Height;
    return element;
};

interface IOldImageElement {
    Angle: number;
    Height: number;
    ImageStretch: number;
    IsVisibility: boolean;
    Left: number;
    Name: string;
    OssFileName: string;
    Top: number;
    Type: number;
    UUID: string;
    Width: number;
    ZIndex: number;
}

// 处理图片
const dealImage = (oldImage: IOldImageElement) => {
    const element: PPTImageElement = {
        id: "",
        name: "",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        type: "image",
        rotate: 0,
        fixedRatio: true,
        src: ""
    };
    element.id = oldImage.UUID;
    element.name = oldImage.Name;
    element.top = oldImage.Top;
    element.left = oldImage.Left;
    element.width = oldImage.Width;
    element.height = oldImage.Height;
    element.rotate = oldImage.Angle;
    element.src = OSS_PATH + "/" + oldImage.OssFileName;
    element.display = oldImage.IsVisibility;
    element.fixedRatio = oldImage.ImageStretch === 0;
    return element;
};

interface IOldCircleElement {
    Angle: number;
    Background: string;
    Height: number;
    IsVisibility: boolean;
    Left: number;
    LineBrush: string;
    LineType: number;
    LineWidth: number;
    Name: string;
    Top: number;
    Type: number;
    UUID: string;
    Width: number;
    ZIndex: number;
}

// 处理圆
const dealCircle = (oldCircle: IOldCircleElement) => {
    const element: PPTShapeElement = {
        id: "",
        type: "shape",
        viewBox: 200,
        path: "M 100 0 A 50 50 0 1 1 100 200 A 50 50 0 1 1 100 0 Z",
        fixedRatio: true,
        fill: "",
        rotate: 0,
        name: "",
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
    element.id = oldCircle.UUID;
    element.name = oldCircle.Name;
    element.width = oldCircle.Width;
    element.height = oldCircle.Height;
    element.rotate = oldCircle.Angle;
    element.left = oldCircle.Left;
    element.top = oldCircle.Top;
    element.outline = {};
    element.outline.color = converColor(oldCircle.LineBrush);
    element.outline.width = oldCircle.LineWidth;
    element.outline.style = oldCircle.LineType === 0 ? "dashed" : "solid";
    // element.backgroundColor = oldCircle.Background;
    element.display = oldCircle.IsVisibility;
    element.fill = oldCircle.Background;
    return element;
};

// 颜色处理转化
const converColor = (color: string) => {
    return "#" + color.substr(3, 8) + color.substr(1, 2);
};
