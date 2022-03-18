import mitt, { Emitter } from "mitt";

export const enum EmitterEvents {
    RICH_TEXT_COMMAND = "RICH_TEXT_COMMAND",
    OPEN_CHART_DATA_EDITOR = "OPEN_CHART_DATA_EDITOR",
    OPEN_LATEX_EDITOR = "OPEN_LATEX_EDITOR",
    SET_UPLOAD_LOADING = "SET_UPLOAD_LOADING",
    WATCH_TABLE_EDITABLE = "WATCH_TABLE_EDITABLE",
    SET_CUSTOM_ANIMATION = "SET_CUSTOM_ANIMATION",
    OPEN_CUSTOM_ANIMATION = "OPEN_CUSTOM_ANIMATION"
}

export interface RichTextCommand {
    command: string;
    value?: string;
}

export interface CustomAnimation {
    path: string;
    type: string;
}

type Events = {
    [EmitterEvents.RICH_TEXT_COMMAND]: RichTextCommand | RichTextCommand[];
    [EmitterEvents.OPEN_CHART_DATA_EDITOR]: void;
    [EmitterEvents.OPEN_LATEX_EDITOR]: void;
    [EmitterEvents.SET_UPLOAD_LOADING]: boolean;
    [EmitterEvents.WATCH_TABLE_EDITABLE]: boolean;
    [EmitterEvents.SET_CUSTOM_ANIMATION]: string;
    [EmitterEvents.OPEN_CUSTOM_ANIMATION]: CustomAnimation;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
