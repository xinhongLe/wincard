import { Ref, computed, getCurrentInstance, watch, ref } from "vue";
import { SlideBackground } from "@/types/slides";
import isElectron from "is-electron";
import { get, STORAGE_TYPES } from "@/utils/storage";

// 将页面背景数据转换为css样式
export default (background: Ref<SlideBackground | undefined>) => {
    const instance = getCurrentInstance();

    const backgroundStyle = ref<any>({ backgroundColor: "#fff" });

    const updateBackground = async () => {
        if (!background.value) return { backgroundColor: "#fff" };

        const {
            type,
            color,
            image,
            ossSrc,
            imageSize,
            gradientColor,
            gradientRotate,
            gradientType
        } = background.value;

        // 纯色背景
        if (type === "solid") {
            backgroundStyle.value = { backgroundColor: color };
            return;
        } else if (type === "image") {
            // 背景图模式
            // 包括：背景图、背景大小，是否重复
            let imageRes: string | null = null;
            if (isElectron() && get(STORAGE_TYPES.SET_ISCACHE)) {
                imageRes = await instance?.appContext.config.globalProperties.$getLocalFileUrl(image || "");
            }
            if (!ossSrc && !imageRes) {
                backgroundStyle.value = { backgroundColor: "#fff" };
                return;
            }
            if (imageSize === "repeat") {
                backgroundStyle.value = {
                    backgroundImage: `url(${imageRes || ossSrc}`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "contain"
                };
                return;
            }
            backgroundStyle.value = {
                backgroundImage: `url(${imageRes || ossSrc}`,
                backgroundRepeat: "no-repeat",
                backgroundSize: imageSize || "cover"
            };
            return;
        } else if (type === "gradient") {
            // 渐变色背景
            const rotate = gradientRotate || 0;
            const color1 = gradientColor ? gradientColor[0] : "#fff";
            const color2 = gradientColor ? gradientColor[1] : "#fff";

            if (gradientType === "radial") {
                backgroundStyle.value = {
                    backgroundImage: `radial-gradient(${color1}, ${color2}`
                };
                return;
            }

            backgroundStyle.value = {
                backgroundImage: `linear-gradient(${rotate}deg, ${color1}, ${color2}`
            };
            return;
        }

        backgroundStyle.value = { backgroundColor: "#fff" };
    };

    updateBackground();
    watch(background, () => {
        updateBackground();
    });

    return {
        backgroundStyle
    };
};
