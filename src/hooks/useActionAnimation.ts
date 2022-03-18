/* eslint-disable */
import { Ref } from "vue";
import { PPTElementAction, Slide } from "@/types/slides";
import { CUSTOM_ANIMATIONS } from "@/configs/animation";

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
        const animation = noAnimation ? "" : animationType === "show" ? action.inAni : action.outAni;
        if (action.type === "none") return;
        const elRef: HTMLElement | null = document.querySelector(`#screen-element-${action.target} [class^=base-element-]`) || document.querySelector(`#screen-element-${action.target} [class^=editable-element-]`);

        setTimeout(() => {
            if (elRef) {
                if (animationType === "hide" && !action.outAni) {
                    // 当需要执行隐藏 却没有隐藏动画时 直接 隐藏
                    return setDisplay(false, element.id);
                }

                // 判断是否为自定义动画
                if (CUSTOM_ANIMATIONS.indexOf(animation || "") > -1) {
                    // 处理来回动画切换 动画不执行问题 先清空动画 延时100ms后重新赋值
                    (<any>elRef).style.animation = null;
                    (<any>elRef).style.offsetPath = null;
                    setTimeout(() => {
                        // 如果是执行显示动画，需要先将display设置为true
                        if (animationType === "show") {
                            setDisplay(true, element.id);
                        }

                        const duration = noAnimation ? 0 : animationType === "show" ? action.inDuration : action.outDuration;
                        const path = noAnimation ? "" : animationType === "show" ? action.inPath : action.outPath;
                        (<any>elRef).style.offsetPath = `path("M${path}")`;
                        (<any>elRef).style.offsetRotate = "0deg";
                        elRef.style.animation = `animation-move ${(duration || 0) / 1000}s linear forwards`;

                        setTimeout(() => {
                            if (animationType !== "show") {
                                setDisplay(false, element.id);
                            }
                        }, duration);
                    }, 100);
                } else {
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
                }
            }
        }, noAnimation ? 0 : action.duration || 0);
    };

    return {
        runAnimation
    };
};
