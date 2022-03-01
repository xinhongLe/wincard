import { MutationTree } from "vuex";
import { State } from "./state";
import { omit } from "lodash";
import { MutationTypes } from "./constants";
import {
    Follow,
    ListenWord,
    PPTElement,
    RemoveElementPropData,
    Slide,
    SlideTheme,
    UpdateElementData
} from "@/types/slides";
import { SYS_FONTS } from "@/configs/font";
import { isSupportFont } from "@/utils/font";
import { TextAttrs } from "@/utils/prosemirror/utils";
import { ToolbarState } from "@/types/toolbar";

export const mutations: MutationTree<State> = {
    [MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST](
        state,
        activeElementIdList: string[]
    ) {
        if (activeElementIdList.length === 1) {
            state.handleElementId = activeElementIdList[0];
        } else {
            state.handleElementId = "";
        }

        state.activeElementIdList = activeElementIdList;
    },

    [MutationTypes.SET_ACTIVE_SCREEN_ELEMENT_ID_LIST](
        state,
        activeElementIdList: string[]
    ) {
        if (activeElementIdList.length === 1) {
            state.handleScreenElementId = activeElementIdList[0];
        } else {
            state.handleScreenElementId = "";
        }

        state.activeScreenElementIdList = activeElementIdList;
    },

    [MutationTypes.SET_HANDLE_ELEMENT_ID](state, handleElementId: string) {
        state.handleElementId = handleElementId;
    },

    [MutationTypes.SET_HANDLE_SCREEN_ELEMENT_ID](state, handleElementId: string) {
        state.handleScreenElementId = handleElementId;
    },

    [MutationTypes.SET_ACTIVE_GROUP_ELEMENT_ID](
        state,
        activeGroupElementId: string
    ) {
        state.activeGroupElementId = activeGroupElementId;
    },

    [MutationTypes.SET_CREATING_ELEMENT](state, element) {
        state.creatingElement = element;
    },

    [MutationTypes.SET_SCREEN_CREATING_SHAPE_ELEMENT](state, element) {
        state.creatingScreenShapeElement = element;
    },

    [MutationTypes.SET_CANVAS_PERCENTAGE](state, scale: number) {
        state.canvasPercentage = scale;
    },

    [MutationTypes.SET_CANVAS_SCALE](state, scale: number) {
        state.canvasScale = scale;
    },

    [MutationTypes.ADD_ELEMENT](state, element: PPTElement | PPTElement[]) {
        const elements = Array.isArray(element) ? element : [element];
        const currentSlideEls = state.slides[state.slideIndex].elements;
        const newEls = [...currentSlideEls, ...elements];
        state.slides[state.slideIndex].elements = newEls;
    },

    [MutationTypes.ADD_SCREEN_ELEMENT](state, element: PPTElement | PPTElement[]) {
        const elements = Array.isArray(element) ? element : [element];
        state.screenElements = [...state.screenElements, ...elements];
    },

    [MutationTypes.SET_EDITORAREA_FOCUS](state, isFocus: boolean) {
        state.editorAreaFocus = isFocus;
    },

    [MutationTypes.SET_AVAILABLE_FONTS](state) {
        state.availableFonts = SYS_FONTS.filter(font =>
            isSupportFont(font.value)
        );
    },

    [MutationTypes.SET_DISABLE_HOTKEYS_STATE](state, disable: boolean) {
        state.disableHotkeys = disable;
    },

    [MutationTypes.SET_RICHTEXT_ATTRS](state, attrs: TextAttrs) {
        state.richTextAttrs = attrs;
    },

    [MutationTypes.SET_SCALING_STATE](state, isScaling: boolean) {
        state.isScaling = isScaling;
    },

    [MutationTypes.SET_THUMBNAILS_FOCUS](state, isFocus: boolean) {
        state.thumbnailsFocus = isFocus;
    },

    [MutationTypes.SET_GRID_LINES_STATE](state, show: boolean) {
        state.showGridLines = show;
    },

    [MutationTypes.SET_TOOLBAR_STATE](state, toolbarState: ToolbarState) {
        state.toolbarState = toolbarState;
    },

    [MutationTypes.SET_CLIPING_IMAGE_ELEMENT_ID](state, elId: string) {
        state.clipingImageElementId = elId;
    },

    [MutationTypes.SET_SELECTED_TABLE_CELLS](state, cells: string[]) {
        state.selectedTableCells = cells;
    },

    [MutationTypes.SET_EDITING_SHAPE_ELEMENT_ID](state, ellId: string) {
        state.editingShapeElementId = ellId;
    },

    [MutationTypes.SET_MENU_OPEN_STATUS](state) {
        state.menuOpen = !state.menuOpen;
    },

    // slides
    [MutationTypes.SET_THEME](state, themeProps: Partial<SlideTheme>) {
        state.theme = { ...state.theme, ...themeProps };
    },

    [MutationTypes.SET_VIEWPORT_RATIO](state, viewportRatio: number) {
        state.viewportRatio = viewportRatio;
    },

    [MutationTypes.SET_INTERVAL_DURATION](state, intervalDuration: number) {
        state.intervalDuration = intervalDuration;
    },

    [MutationTypes.SET_VIEWPORT_MOVE_X](state, x: number) {
        state.canvasMoveX = x;
    },

    [MutationTypes.SET_VIEWPORT_MOVE_Y](state, y: number) {
        state.canvasMoveY = y;
    },

    [MutationTypes.SET_SLIDES](state, slides: Slide[]) {
        state.slides = slides;
    },

    [MutationTypes.UPDATE_SLIDE_INDEX](state, index: number) {
        state.slideIndex = index;
    },

    [MutationTypes.UPDATE_SELECTED_SLIDES_INDEX](
        state,
        selectedSlidesIndex: number[]
    ) {
        state.selectedSlidesIndex = selectedSlidesIndex;
    },

    [MutationTypes.UPDATE_ELEMENT](state, data: UpdateElementData) {
        const { id, props } = data;
        const elIdList = typeof id === "string" ? [id] : id;

        const slideIndex = state.slideIndex;
        const slide = state.slides[slideIndex];
        const elements = slide.elements.map(el => {
            return elIdList.includes(el.id) ? { ...el, ...props } : el;
        });
        state.slides[slideIndex].elements = elements as PPTElement[];
    },

    [MutationTypes.UPDATE_SLIDE](state, props: Partial<Slide>) {
        const slideIndex = state.slideIndex;
        state.slides[slideIndex] = { ...state.slides[slideIndex], ...props };
    },
    [MutationTypes.UPDATE_SCREEN_ELEMENTS](state, props: PPTElement[]) {
        state.screenElements = props;
    },
    [MutationTypes.UPDATE_SCREEN_ELEMENT](state, data: UpdateElementData) {
        const { id, props } = data;
        const elIdList = typeof id === "string" ? [id] : id;
        const elements = state.screenElements.map(el => {
            return elIdList.includes(el.id) ? { ...el, ...props } : el;
        }) as PPTElement[];
        state.screenElements = elements;
    },

    [MutationTypes.REMOVE_ELEMENT_PROPS](state, data: RemoveElementPropData) {
        const { id, propName } = data;
        const propsNames = typeof propName === "string" ? [propName] : propName;

        const slideIndex = state.slideIndex;
        const slide = state.slides[slideIndex];
        const elements = slide.elements.map(el => {
            return el.id === id ? omit(el, propsNames) : el;
        });
        state.slides[slideIndex].elements = elements as PPTElement[];
    },

    [MutationTypes.ADD_SLIDE](state, slide: Slide | Slide[]) {
        const slides = Array.isArray(slide) ? slide : [slide];
        const addIndex = state.slideIndex + 1;
        state.slides.splice(addIndex, 0, ...slides);
        state.slideIndex = addIndex;
    },

    [MutationTypes.DELETE_SLIDE](state, slideId: string | string[]) {
        const slidesId = Array.isArray(slideId) ? slideId : [slideId];

        const deleteSlidesIndex = [];
        for (let i = 0; i < slidesId.length; i++) {
            const index = state.slides.findIndex(
                item => item.id === slidesId[i]
            );
            deleteSlidesIndex.push(index);
        }
        let newIndex = Math.min(...deleteSlidesIndex);

        const maxIndex = state.slides.length - slidesId.length - 1;
        if (newIndex > maxIndex) newIndex = maxIndex;

        state.slideIndex = newIndex;
        state.slides = state.slides.filter(item => !slidesId.includes(item.id));
    },

    [MutationTypes.UPDATE_FOLLOW](state, props: Follow) {
        const follow = state.slides[state.slideIndex].follow;
        state.slides[state.slideIndex].follow = { ...follow, ...props };
    },

    [MutationTypes.CACHE_ELEMENT_ID](state, id: string) {
        state.cacheElementID = id;
    },

    [MutationTypes.EDIT_ELEMENT_ID](state, id: string) {
        state.editElementID = id;
    },

    // listen
    [MutationTypes.UPDATE_LISTEN_SYSTEM_LIST](state, list: ListenWord[]) {
        state.listenSystemList = list;
    },

    [MutationTypes.UPDATE_LISTEN_PAGE_LIST](state, list: ListenWord[]) {
        const slideIndex = state.slideIndex;
        state.slides[slideIndex].listenWords = list;
    },

    [MutationTypes.UPDATE_LISTEN_PAGE](state, page: number) {
        state.listenPage = page;
    },

    [MutationTypes.UPDATE_LISTEN_TOTAL](state, total: number) {
        state.listenTotal = total;
    },

    // snapshot

    [MutationTypes.SET_SNAPSHOT_CURSOR](state, cursor: number) {
        state.snapshotCursor = cursor;
    },

    [MutationTypes.SET_SNAPSHOT_LENGTH](state, length: number) {
        state.snapshotLength = length;
    },

    [MutationTypes.SET_SNAPSHOT_OLDSLIDES](state, oldSlides: boolean) {
        state.oldSlides = oldSlides;
    },

    // keyboard

    [MutationTypes.SET_CTRL_KEY_STATE](state, isActive: boolean) {
        state.ctrlKeyState = isActive;
    },

    [MutationTypes.SET_SHIFT_KEY_STATE](state, isActive: boolean) {
        state.shiftKeyState = isActive;
    },

    [MutationTypes.SET_ALT_KEY_STATE](state, isActive: boolean) {
        state.altKeyState = isActive;
    },

    // screen

    [MutationTypes.SET_SCREENING](state, screening) {
        state.screening = screening;
    },

    // step

    [MutationTypes.SET_STEP_DIALOG](state, visible) {
        state.addStepVisible = visible;
    },

    [MutationTypes.SET_UPLOAD_LOADING](state, visible) {
        state.spinning = visible;
    }
};
