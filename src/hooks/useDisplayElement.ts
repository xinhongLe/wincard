import { MutationTypes, useStore } from "@/store";
import { Slide } from "@/types/slides";
import { computed } from "vue";
import useHistorySnapshot from "./useHistorySnapshot";

export default () => {
    const store = useStore();
    const activeElementIdList = computed(() => store.state.activeElementIdList);
    const activeGroupElementId = computed(
        () => store.state.activeGroupElementId
    );
    const currentSlide = computed<Slide>(() => store.getters.currentSlide);

    const { addHistorySnapshot } = useHistorySnapshot();

    // 隐藏选中元素
    // 组合元素成员中，存在被选中可独立操作的元素时，优先隐藏该元素。否则默认隐藏所有被选中的元素
    const hideElement = () => {
        if (!activeElementIdList.value.length) return;

        if (activeGroupElementId.value) {
            currentSlide.value.elements.map(el => {
                if (el.id === activeGroupElementId.value) el.display = false;
            });
        } else {
            currentSlide.value.elements.map(el => {
                if (activeElementIdList.value.includes(el.id)) {
                    el.display = false;
                }
            });
        }

        store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(MutationTypes.UPDATE_SLIDE, { elements: currentSlide.value.elements });
        addHistorySnapshot();
    };

    const showElement = () => {
        if (!activeElementIdList.value.length) return;

        if (activeGroupElementId.value) {
            currentSlide.value.elements.map(el => {
                if (el.id === activeGroupElementId.value) el.display = true;
            });
        } else {
            currentSlide.value.elements.filter(el => {
                if (activeElementIdList.value.includes(el.id)) {
                    el.display = true;
                }
            });
        }

        store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(MutationTypes.UPDATE_SLIDE, { elements: currentSlide.value.elements });
        addHistorySnapshot();
    };

    return {
        hideElement,
        showElement
    };
};
