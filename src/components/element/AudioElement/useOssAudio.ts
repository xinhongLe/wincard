import { PPTAudioElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssAudioUrl } from "@/utils/audio";
import { getOssImageUrl } from "@/utils/image";

export default (audioElement: ComputedRef<PPTAudioElement>, isScreening?: boolean) => {
    const audioUrl = ref("");
    const iconUrl = ref("");
    const store = useStore();

    const updateAudio = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        getToken(async (ossToken: OssToken) => {
            if (audioElement.value.ossSrc && audioElement.value.ossExpiration === ossToken.Expiration) {
                // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                audioUrl.value = audioElement.value.ossSrc;
            } else {
                const res = await getOssAudioUrl(audioElement.value.src);
                audioUrl.value = res.url;
                // 更新 PPTVideoElement
                const props = {
                    ossSrc: res.url,
                    ossExpiration: ossToken.Expiration
                };
                !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });
            }

            if (audioElement.value.ossIcon && audioElement.value.ossExpiration === ossToken.Expiration) {
                // ossIcon 存在 且 ossToken 未过期 则不请求 直接返回
                iconUrl.value = audioElement.value.ossIcon;
            } else {
                if (audioElement.value.icon) {
                    const res = await getOssImageUrl(audioElement.value.icon);
                    iconUrl.value = res.url;
                    // 更新 PPTVideoElement
                    const props = {
                        ossIcon: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });
                } else {
                    iconUrl.value = "";
                }
            }
        });
    };

    const key = computed(() => {
        return audioElement.value ? audioElement.value.src : "";
    });

    const keyIcon = computed(() => {
        return audioElement.value ? audioElement.value.icon : "";
    });

    watch([key, keyIcon], () => {
        updateAudio();
    });

    updateAudio();

    return {
        iconUrl,
        audioUrl
    };
};
