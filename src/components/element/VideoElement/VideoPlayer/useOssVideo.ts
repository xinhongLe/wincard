import { PPTVideoElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssPosterUrl, getOssVideoUrl } from "@/utils/video";

export default (videoElement: ComputedRef<PPTVideoElement>) => {
    const videoUrl = ref("");
    const posterUrl = ref("");
    const iconUrl = ref("");
    const store = useStore();

    const updateVideo = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        getToken(async (ossToken: OssToken) => {
            if (videoElement.value.ossSrc && videoElement.value.ossExpiration === ossToken.Expiration) {
                // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                videoUrl.value = videoElement.value.ossSrc;
            } else {
                const res = await getOssVideoUrl(videoElement.value.src);
                videoUrl.value = res.url;
                // 更新 PPTVideoElement
                const props = {
                    ossSrc: res.url,
                    ossExpiration: ossToken.Expiration
                };
                store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
            }

            if (videoElement.value.ossPoster && videoElement.value.ossExpiration === ossToken.Expiration) {
                // ossPoster 存在 且 ossToken 未过期 则不请求 直接返回
                posterUrl.value = videoElement.value.ossPoster;
            } else {
                if (videoElement.value.poster) {
                    const res = await getOssPosterUrl(videoElement.value.poster);
                    posterUrl.value = res.url;
                    // 更新 PPTVideoElement
                    const props = {
                        ossPoster: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
                }
            }

            if (videoElement.value.ossIcon && videoElement.value.ossExpiration === ossToken.Expiration) {
                // ossPoster 存在 且 ossToken 未过期 则不请求 直接返回
                iconUrl.value = videoElement.value.ossIcon;
            } else {
                if (videoElement.value.icon) {
                    const res = await getOssPosterUrl(videoElement.value.icon);
                    iconUrl.value = res.url;
                    // 更新 PPTVideoElement
                    const props = {
                        ossIcon: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
                } else {
                    iconUrl.value = "";
                }
            }
        });
    };

    const key = computed(() => {
        return videoElement.value ? videoElement.value.src : "";
    });

    const keyPoster = computed(() => {
        return videoElement.value ? videoElement.value.poster : "";
    });

    const keyIcon = computed(() => {
        return videoElement.value ? videoElement.value.icon : "";
    });

    watch([key, keyPoster, keyIcon], () => {
        updateVideo();
    });

    updateVideo();

    return {
        videoUrl,
        posterUrl,
        iconUrl
    };
};
