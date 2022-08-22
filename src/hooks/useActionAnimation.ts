/* eslint-disable */
import { getCurrentInstance, Ref } from "vue";
import { PPTElementAction, Slide } from "@/types/slides";
import { CUSTOM_ANIMATIONS } from "@/configs/animation";
import { get, STORAGE_TYPES } from "@/utils/storage";
import { getToken, OssToken } from "@/utils/oss";
import { getOssAudioUrl } from "@/utils/audio";

export default (slide: Ref<Slide>) => {
    const instance = getCurrentInstance();

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
                // 如果当前效果和点击触发效果一样将不执行下面的逻辑
                // if ((display ? "show" : "hide") === animationType) return;
                if (animationType === "hide" && !action.outAni) {
                    // 执行动画的音效
                    if (action.audioSrc) {
                        runPlayAudio(action);
                    }
                    // 当需要执行隐藏 却没有隐藏动画时 直接 隐藏
                    return setDisplay(false, element.id);
                }

                // 处理来回动画切换 动画不执行问题 先清空动画 延时100ms后重新赋值
                // 放在判断里面当返回的时候不触发
                (<any>elRef).style.animation = null;
                (<any>elRef).style.offsetPath = null;

                // 判断是否为自定义动画
                if (CUSTOM_ANIMATIONS.indexOf(animation || "") > -1) {
                    setTimeout(() => {
                        // 如果是执行显示动画，需要先将display设置为true
                        if (animationType === "show") {
                            setDisplay(true, element.id);
                        }

                        const duration = noAnimation ? 0 : animationType === "show" ? action.inDuration : action.outDuration;
                        const path = noAnimation ? "" : animationType === "show" ? action.inPath : action.outPath;
                        (<any>elRef).style.offsetPath = `path("M${path}")`;
                        (<any>elRef).style.offsetRotate = "0deg";
                        if (path) elRef.style.animation = `animation-move ${(duration || 0) / 1000}s linear forwards`;

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

                // 执行动画的音效
                if (action.audioSrc) {
                    runPlayAudio(action);
                }
            }
        }, noAnimation ? 0 : action.duration || 0);
    };

    const runPlayAudio = async (action: PPTElementAction) => {
        let audioUrl = "";
        if (action.audioSrc) {
            if (window.isElectron && get(STORAGE_TYPES.SET_ISCACHE)) {
                audioUrl = await instance?.appContext.config.globalProperties.$getLocalFileUrl(action.audioSrc);
            }
            if (audioUrl) {
                playAudio(audioUrl);
            } else {
                getToken(async (ossToken: OssToken) => {
                    if (action.audioOssSrc && action.ossExpiration === ossToken.Expiration) {
                        // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                        audioUrl = action.audioOssSrc;
                    } else {
                        const res = await getOssAudioUrl(action.audioSrc || "");
                        audioUrl = res.url;
                        action.audioOssSrc = audioUrl;
                        action.ossExpiration = ossToken.Expiration;
                    }
                    playAudio(audioUrl);
                });
            }
        }
    };

    const playAudio = (audioUrl: string) => {
        const audio = new Audio();
        audio.src = audioUrl;
        audio.onended = () => {
            audio && audio.remove();
        };
        audio.oncanplay = () => {
            audio.play();
        };
    };

    return {
        runAnimation
    };
};
