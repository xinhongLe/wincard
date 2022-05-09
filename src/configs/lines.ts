import { LinePoint } from "@/types/slides";

export interface LinePoolItem {
    path: string;
    style: "solid" | "dashed" | "dashedPoint";
    points: [LinePoint, LinePoint];
    isBroken?: boolean;
    isCurve?: boolean;
}

export interface PresetLine {
    type: string;
    children: LinePoolItem[];
}

export const LINE_LIST: PresetLine[] = [
    {
        type: "直线",
        children: [
            { path: "M 0 0 L 20 20", style: "solid", points: ["", ""] },
            { path: "M 0 0 L 20 20", style: "dashed", points: ["", ""] },
            { path: "M 0 0 L 20 20", style: "dashedPoint", points: ["", ""] },
            { path: "M 0 0 L 20 20", style: "solid", points: ["", "arrow"] },
            { path: "M 0 0 L 20 20", style: "solid", points: ["arrow", "arrow"] },
            { path: "M 0 0 L 20 20", style: "dashed", points: ["", "arrow"] },
            { path: "M 0 0 L 20 20", style: "dashed", points: ["arrow", "arrow"] },
            { path: "M 0 0 L 20 20", style: "solid", points: ["", "dot"] },
            { path: "M 0 0 L 20 20", style: "solid", points: ["dot", "dot"] }
        ]
    },
    {
        type: "折线、曲线",
        children: [
            {
                path: "M 0 0 L 0 20 L 20 20",
                style: "solid",
                points: ["", "arrow"],
                isBroken: true
            },
            {
                path: "M 0 0 L 0 20 L 20 20",
                style: "solid",
                points: ["arrow", "arrow"],
                isBroken: true
            },
            {
                path: "M 0 0 Q 0 20 20 20",
                style: "solid",
                points: ["", "arrow"],
                isCurve: true
            },
            {
                path: "M 0 0 Q 0 20 20 20",
                style: "solid",
                points: ["arrow", "arrow"],
                isCurve: true
            }
        ]
    }
];
