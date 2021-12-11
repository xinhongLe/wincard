import { Ref } from "vue";
import { PPTElementAction, Slide } from "@/types/slides";

export default (slide: Ref<Slide>) => {
    const setDisplay = (display: boolean, id: string) => {
        const elements = slide.value.elements.map(el => {
            return id === el.id ? { ...el, ...{ display } } : el;
        });
        slide.value.elements = elements;
    };

    // 执行元素的动画
    const runAnimation = (action: PPTElementAction, noAnimation?: boolean) => {
        const prefix = "animate__";
        const element = slide.value.elements.find(el => { return el.id === action.target; });
        if (!element) return;
        const display = typeof element?.display === "undefined" || element.display;
        const animationType = action.type === "show" ? "show" : (action.type === "toggle" ? (display ? "hide" : "show") : "hide");
        const animation = (noAnimation || action.type === "none") ? "" : animationType === "show" ? action.inAni : action.outAni;

        const elRef = document.querySelector(`#screen-element-${action.target} [class^=base-element-]`) || document.querySelector(`#screen-element-${action.target} [class^=editable-element-]`);

        setTimeout(() => {
            if (elRef) {
                // 如果是执行显示动画，需要先将display设置为true
                if (animationType === "show") {
                    setDisplay(true, element.id);
                }

                const animationName = `${prefix}${animation}`;
                elRef.classList.add(`${prefix}animated`, animationName);

                const handleAnimationEnd = () => {
                    setDisplay(animationType === "show", element.id);

                    elRef.classList.remove(`${prefix}animated`, animationName);
                };
                elRef.addEventListener("animationend", handleAnimationEnd, {
                    once: true
                });

                if (animationType === "hide" && !action.outAni) {
                    // 当需要执行隐藏 却没有隐藏动画时 直接 隐藏
                    handleAnimationEnd();
                }
            }
        }, noAnimation ? 0 : action.duration || 0);
    };

    return {
        runAnimation
    };
};
