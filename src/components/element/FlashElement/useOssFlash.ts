import { PPTFlashElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssFlashUrl, getOssIconUrl } from "@/utils/flash";

export default (flashElement: ComputedRef<PPTFlashElement>, callback?: () => void) => {
    const flashUrl = ref("");
    const iconUrl = ref("");
    const store = useStore();

    const updateFlash = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        getToken(async (ossToken: OssToken) => {
            if (flashElement.value.ossSrc && flashElement.value.ossExpiration === ossToken.Expiration) {
                // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                flashUrl.value = flashElement.value.ossSrc;
            } else {
                const res = await getOssFlashUrl(flashElement.value.src);
                flashUrl.value = res.url;
                // 更新 PPTFlashElement
                const props = {
                    ossSrc: res.url,
                    ossExpiration: ossToken.Expiration
                };
                if (!callback) store.commit(MutationTypes.UPDATE_ELEMENT, { id: flashElement.value.id, props });
                if (callback) callback();
            }

            if (flashElement.value.ossIcon && flashElement.value.ossExpiration === ossToken.Expiration) {
                // ossIcon 存在 且 ossToken 未过期 则不请求 直接返回
                iconUrl.value = flashElement.value.ossIcon;
            } else {
                if (flashElement.value.icon) {
                    const res = await getOssIconUrl(flashElement.value.icon);
                    iconUrl.value = res.url;
                    // 更新 PPTFlashElement
                    const props = {
                        ossIcon: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    if (!callback) store.commit(MutationTypes.UPDATE_ELEMENT, { id: flashElement.value.id, props });
                } else {
                    iconUrl.value = "";
                }
            }
        });
    };

    const key = computed(() => {
        return flashElement.value ? flashElement.value.src : "";
    });

    const keyIcon = computed(() => {
        return flashElement.value ? flashElement.value.icon : "";
    });

    watch([key, keyIcon], () => {
        updateFlash();
    });

    updateFlash();

    return {
        flashUrl,
        iconUrl
    };
};
