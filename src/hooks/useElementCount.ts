import { useStore } from "@/store";
import { Slide } from "@/types/slides";
import { computed } from "vue";

export default () => {
    const store = useStore();
    const currentSlide = computed<Slide>(() => store.getters.currentSlide);

    const countElementByType = (type: string) => {
        const elements = currentSlide.value.elements;
        return elements.filter(element => element.type === type).length;
    };

    return {
        countElementByType
    };
};
