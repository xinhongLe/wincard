export const enum MutationTypes {
    // editor
    SET_ACTIVE_ELEMENT_ID_LIST = "setActiveElementIdList",
    SET_HANDLE_ELEMENT_ID = "setHandleElementId",
    SET_ACTIVE_GROUP_ELEMENT_ID = "setActiveGroupElementId",
    SET_CREATING_ELEMENT = "setCreatingElement", // 选择绘制元件
    SET_CANVAS_PERCENTAGE = "setCanvasPercentage", // 设置canvas区域缩放显示比例
    SET_CANVAS_SCALE = "setCanvasScale",
    ADD_ELEMENT = "addElement",
    SET_EDITORAREA_FOCUS = "setEditorAreaFocus",
    SET_AVAILABLE_FONTS = "setAvailableFonts",
    SET_DISABLE_HOTKEYS_STATE = "setDisableHotkeysState",
    SET_RICHTEXT_ATTRS = "setRichTextAttrs",
    SET_SCALING_STATE = "setScalingState",
    SET_THUMBNAILS_FOCUS = "setThumbnailsFocus",
    SET_GRID_LINES_STATE = "setGridLinesState",
    SET_TOOLBAR_STATE = "setToolbarState",
    SET_CLIPING_IMAGE_ELEMENT_ID = "setClipingImageElementId",
    SET_SELECTED_TABLE_CELLS = "setSelectedTableCells",
    SET_EDITING_SHAPE_ELEMENT_ID = "setEditingShapeElementId",

    // slides
    SET_THEME = "setTheme",
    SET_VIEWPORT_RATIO = "setViewportRatio",
    SET_VIEWPORT_MOVE_X = "setViewportMoveX",
    SET_VIEWPORT_MOVE_Y = "setViewportMoveY",
    SET_SLIDES = "setSlides",
    UPDATE_SLIDE_INDEX = "updateSlideIndex",
    UPDATE_ELEMENT = "updateElement",
    UPDATE_SLIDE = "updateSlide",
    REMOVE_ELEMENT_PROPS = "removeElementProps",
    UPDATE_SELECTED_SLIDES_INDEX = "updateSelectedSlidesIndex",
    ADD_SLIDE = "addSlide",
    DELETE_SLIDE = "deleteSlide",
    UPDATE_PREVIEW_ELEMENTS = "updatePreviewElements",
    UPDATE_PREVIEW_ELEMENT = "updatePreviewElement",
    UPDATE_FOLLOW = "updateFollow",

    // listen
    UPDATE_LISTEN_SYSTEM_LIST = "updateListeSystemList",
    UPDATE_LISTEN_PAGE_LIST = "updateListenPageList",
    UPDATE_LISTEN_PAGE = "updateListenPage",
    UPDATE_LISTEN_TOTAL = "updateListenTotal",

    // snapshot
    SET_SNAPSHOT_CURSOR = "setSnapshotCursor",
    SET_SNAPSHOT_LENGTH = "setSnapshotLength",
    SET_SNAPSHOT_OLDSLIDES = "setSnapshotOldSlides",

    // keyboard
    SET_CTRL_KEY_STATE = "setCtrlKeyState",
    SET_SHIFT_KEY_STATE = "setShiftKeyState",
    SET_ALT_KEY_STATE = "setAltKeyState",

    // screen
    SET_SCREENING = "setScreening"
}

export const enum ActionTypes {
    CHECK_SNAPSHOT_DATABASE = "checkSnapshotDatabase",
    INIT_SNAPSHOT_DATABASE = "initSnapshotDatabase",
    ADD_SNAPSHOT = "addSnapshot",
    DELETE_SNAPSHOT = "deleteSnapshot",
    RECOVERY_SNAPSHOT = "recoverySnapshot",
    UN_DO = "undo",
    RE_DO = "redo"
}
