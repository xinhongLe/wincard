import { MutationTypes, useStore } from "@/store";
import { computed } from "vue";
import { PPTElementAction } from "@/types/slides";

export default () => {
    const store = useStore();
    const elements = computed(() => store.state.previewElements);
    // 执行元素的动画
    const runAnimation = (action: PPTElementAction) => {
        const prefix = "animate__";
        const element = elements.value.find(el => { return el.id === action.target; });
        if (!element) return;
        const display = typeof element?.display === "undefined" || element.display;
        const animationType = action.type === "show" ? "show" : (action.type === "toggle" ? (display ? "hide" : "show") : "hide");
        const animation = animationType === "show" ? action.inAni : action.outAni;

        const elRef = document.querySelector(`#screen-element-${action.target} [class^=base-element-]`) || document.querySelector(`#screen-element-${action.target} [class^=editable-element-]`);

        setTimeout(() => {
            if (elRef) {
                // 如果是执行显示动画，需要先将display设置为true
                if (animationType === "show") {
                    store.commit(MutationTypes.UPDATE_PREVIEW_ELEMENT, {
                        id: element.id,
                        props: {
                            display: true
                        }
                    });
                }

                const animationName = `${prefix}${animation}`;
                elRef.classList.add(`${prefix}animated`, animationName);

                const handleAnimationEnd = () => {
                    store.commit(MutationTypes.UPDATE_PREVIEW_ELEMENT, {
                        id: element.id,
                        props: {
                            display: animationType === "show"
                        }
                    });

                    elRef.classList.remove(`${prefix}animated`, animationName);
                };
                elRef.addEventListener("animationend", handleAnimationEnd, {
                    once: true
                });
            }
        }, action.duration || 0);
    };

    return {
        runAnimation
    };
};
