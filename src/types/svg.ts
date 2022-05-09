export interface ISVGElementAttr {
    points: string;
    id: string;
    fill: "none";
    opacity: number;
    "stroke-width": number;
    "stroke-linecap": "round" | "butt" | "square" | "inherit";
    "stroke-dasharray": string;
    style: string;
    [key: string]: string | number;
}

export interface ISVGElementConfig {
    element: "polyline";
    attr: ISVGElementAttr;
}
