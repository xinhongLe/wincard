import { ELEMENT_TYPE_ZH } from "@/configs/element";
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

    const getNumber = (value: string) => {
        const result = /\((\d+)\)/.exec(value);
        if (result && result.length > 0) {
            return Number(result[1]);
        } else {
            return 0;
        }
    };

    const randomName = (type: string) => {
        const elements = currentSlide.value.elements;
        const typeElements = elements.filter(element => element.type === type);
        let num = 0;
        typeElements.forEach(element => {
            const val = getNumber(element.name);
            if (val > num) {
                num = val;
            }
        });
        return ELEMENT_TYPE_ZH[type] + `(${num + 1})`;
    };

    return {
        randomName,
        countElementByType
    };
};
