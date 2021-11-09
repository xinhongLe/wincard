import { PPTAudioElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssAudioUrl } from "@/utils/audio";

export default (audioElement: ComputedRef<PPTAudioElement>) => {
    const audioUrl = ref("");
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
                store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });
            }
        });
    };

    const key = computed(() => {
        return audioElement.value ? audioElement.value.src : "";
    });

    watch([key], () => {
        updateAudio();
    });

    updateAudio();

    return {
        audioUrl
    };
};
