import { PPTImageElement, PPTVideoElement } from "@/types/slides";
import { getOssImageUrl } from "@/utils/image";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";

export default (videoElement: ComputedRef<PPTVideoElement>) => {
    const videoUrl = ref("");
    const store = useStore();

    const updateVideo = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        getToken((ossToken: OssToken) => {
            if (videoElement.value.ossSrc && videoElement.value.ossExpiration === ossToken.Expiration) {
                // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                videoUrl.value = videoElement.value.ossSrc;
            } else {
                getOssImageUrl(videoElement.value.src).then(res => {
                    videoUrl.value = res.url;
                    // 更新 PPTVideoElement
                    const props = {
                        ossSrc: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
                });
            }
        });
    };

    const key = computed(() => {
        return videoElement.value ? videoElement.value.src : "";
    });

    watch(key, () => {
        updateVideo();
    });

    updateVideo();

    return {
        videoUrl
    };
};
