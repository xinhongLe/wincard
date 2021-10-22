import { computed, onMounted, onUnmounted } from "vue";
import { MutationTypes, useStore } from "@/store";
import { ElementOrderCommand, ElementOrderCommands } from "@/types/edit";
import { PPTElement, Slide } from "@/types/slides";
import { KEYS } from "@/configs/hotkey";

import useSlideHandler from "./useSlideHandler";
import useLockElement from "./useLockElement";
import useDeleteElement from "./useDeleteElement";
import useCombineElement from "./useCombineElement";
import useCopyAndPasteElement from "./useCopyAndPasteElement";
import useSelectAllElement from "./useSelectAllElement";
import useMoveElement from "./useMoveElement";
import useOrderElement from "./useOrderElement";
import useHistorySnapshot from "./useHistorySnapshot";
import useScreening from "./useScreening";
import useScaleCanvas from "./useScaleCanvas";

export default () => {
    const store = useStore();

    const ctrlKeyActive = computed(() => store.state.ctrlKeyState);
    const shiftKeyActive = computed(() => store.state.shiftKeyState);
    const disableHotkeys = computed(() => store.state.disableHotkeys);
    const activeElementIdList = computed(() => store.state.activeElementIdList);
    const handleElement = computed<PPTElement>(
        () => store.getters.handleElement
    );
    const currentSlide = computed<Slide>(() => store.getters.currentSlide);

    const editorAreaFocus = computed(() => store.state.editorAreaFocus);
    const thumbnailsFocus = computed(() => store.state.thumbnailsFocus);

    const {
        updateSlideIndex,
        copySlide,
        createSlide,
        deleteSlide,
        cutSlide,
        copyAndPasteSlide,
        selectAllSlide
    } = useSlideHandler();

    const { combineElements, uncombineElements } = useCombineElement();
    const { deleteElement } = useDeleteElement();
    const { lockElement } = useLockElement();
    const {
        copyElement,
        cutElement,
        quickCopyElement
    } = useCopyAndPasteElement();
    const { selectAllElement } = useSelectAllElement();
    const { moveElement } = useMoveElement();
    const { orderElement } = useOrderElement();
    const { redo, undo } = useHistorySnapshot();
    const { enterScreening } = useScreening();
    const { scaleCanvas, setCanvasPercentage } = useScaleCanvas();

    const copy = () => {
        if (activeElementIdList.value.length) copyElement();
        else if (thumbnailsFocus.value) copySlide();
    };

    const cut = () => {
        if (activeElementIdList.value.length) cutElement();
        else if (thumbnailsFocus.value) cutSlide();
    };

    const quickCopy = () => {
        if (activeElementIdList.value.length) quickCopyElement();
        else if (thumbnailsFocus.value) copyAndPasteSlide();
    };

    const selectAll = () => {
        if (editorAreaFocus.value) selectAllElement();
        if (thumbnailsFocus.value) selectAllSlide();
    };

    const lock = () => {
        if (!editorAreaFocus.value) return;
        lockElement();
    };
    const combine = () => {
        if (!editorAreaFocus.value) return;
        combineElements();
    };

    const uncombine = () => {
        if (!editorAreaFocus.value) return;
        uncombineElements();
    };

    const remove = () => {
        if (activeElementIdList.value.length) deleteElement();
        else if (thumbnailsFocus.value) deleteSlide();
    };

    const move = (key: string) => {
        if (activeElementIdList.value.length) moveElement(key);
        else if (key === KEYS.UP || key === KEYS.DOWN) updateSlideIndex(key);
    };

    const order = (command: ElementOrderCommand) => {
        if (!handleElement.value) return;
        orderElement(handleElement.value, command);
    };

    const create = () => {
        if (!thumbnailsFocus.value) return;
        createSlide();
    };

    const tabActiveElement = () => {
        if (!currentSlide.value.elements.length) return;
        if (!handleElement.value) {
            const firstElement = currentSlide.value.elements[0];
            store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, [
                firstElement.id
            ]);
            return;
        }

        const currentIndex = currentSlide.value.elements.findIndex(
            el => el.id === handleElement.value.id
        );
        const nextIndex =
            currentIndex >= currentSlide.value.elements.length - 1
                ? 0
                : currentIndex + 1;
        const nextElementId = currentSlide.value.elements[nextIndex].id;

        store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, [nextElementId]);
    };

    const keydownListener = (e: KeyboardEvent) => {
        const { ctrlKey, shiftKey, altKey, metaKey } = e;
        const ctrlOrMetaKeyActive = ctrlKey || metaKey;

        const key = e.key.toUpperCase();

        if (ctrlOrMetaKeyActive && !ctrlKeyActive.value) store.commit(MutationTypes.SET_CTRL_KEY_STATE, true);
        if (shiftKey && !shiftKeyActive.value) store.commit(MutationTypes.SET_SHIFT_KEY_STATE, true);

        if (ctrlOrMetaKeyActive && key === KEYS.F) {
            e.preventDefault();
            enterScreening();
            store.commit(MutationTypes.SET_CTRL_KEY_STATE, false);
        }

        if (!editorAreaFocus.value && !thumbnailsFocus.value) return;

        if (ctrlOrMetaKeyActive && key === KEYS.C) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            copy();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.X) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            cut();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.D) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            quickCopy();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.Z) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            undo();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.Y) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            redo();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.A) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            selectAll();
        }
        if (ctrlOrMetaKeyActive && key === KEYS.L) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            lock();
        }
        if (!shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            combine();
        }
        if (shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            uncombine();
        }
        if (altKey && key === KEYS.F) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            order(ElementOrderCommands.TOP);
        }
        if (altKey && key === KEYS.B) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            order(ElementOrderCommands.BOTTOM);
        }
        if (key === KEYS.DELETE || key === KEYS.BACKSPACE) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            remove();
        }
        if (key === KEYS.UP) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            move(KEYS.UP);
        }
        if (key === KEYS.DOWN) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            move(KEYS.DOWN);
        }
        if (key === KEYS.LEFT) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            move(KEYS.LEFT);
        }
        if (key === KEYS.RIGHT) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            move(KEYS.RIGHT);
        }
        if (key === KEYS.ENTER) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            create();
        }
        if (key === KEYS.MINUS) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            scaleCanvas("-");
        }
        if (key === KEYS.EQUAL) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            scaleCanvas("+");
        }
        if (key === KEYS.DIGIT_0) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            setCanvasPercentage(90);
        }
        if (key === KEYS.TAB) {
            if (disableHotkeys.value) return;
            e.preventDefault();
            tabActiveElement();
        }
    };

    const keyupListener = () => {
        if (ctrlKeyActive.value) store.commit(MutationTypes.SET_CTRL_KEY_STATE, false);
        if (shiftKeyActive.value) store.commit(MutationTypes.SET_SHIFT_KEY_STATE, false);
    };

    onMounted(() => {
        document.addEventListener("keydown", keydownListener);
        document.addEventListener("keyup", keyupListener);
        window.addEventListener("blur", keyupListener);
    });
    onUnmounted(() => {
        document.removeEventListener("keydown", keydownListener);
        document.removeEventListener("keyup", keyupListener);
        window.removeEventListener("blur", keyupListener);
    });
};
