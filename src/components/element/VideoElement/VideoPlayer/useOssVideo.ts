import { PPTVideoElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssPosterUrl, getOssVideoUrl, videoUrlToBase64 } from "@/utils/video";
import { getResourceDB } from "@/utils/database";
import { imageUrlToBase64 } from "@/utils/image";

export default (videoElement: ComputedRef<PPTVideoElement>, isScreening?: boolean) => {
    const videoUrl = ref("");
    const posterUrl = ref("");
    const iconUrl = ref("");
    const store = useStore();
    const resourceDB = getResourceDB();
    const updateVideo = async () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        const iconResult = await resourceDB.db.where({ id: videoElement.value.icon || "" }).toArray();
        if (iconResult.length > 0) {
            iconUrl.value = iconResult[0].resource;
            const props = {
                ossIcon: iconUrl.value
            };
            !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
        }
        const posterResult = await resourceDB.db.where({ id: videoElement.value.poster || "" }).toArray();
        if (posterResult.length > 0) {
            posterUrl.value = posterResult[0].resource;
            const props = {
                ossPoster: posterUrl.value
            };
            !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
        }
        const videoResult = await resourceDB.db.where({ id: videoElement.value.src || "" }).toArray();
        if (videoResult.length > 0) {
            videoUrl.value = videoResult[0].resource;
        }
        if (iconResult.length > 0 && videoResult.length > 0 && posterResult.length > 0) return;
        getToken(async (ossToken: OssToken) => {
            if (videoResult.length === 0) {
                if (videoElement.value.ossSrc && videoElement.value.ossExpiration === ossToken.Expiration) {
                    // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                    videoUrl.value = videoElement.value.ossSrc;
                } else {
                    const res = await getOssVideoUrl(videoElement.value.src);
                    // videoUrl.value = res.url;
                    // 更新 PPTVideoElement
                    const props = {
                        ossSrc: res.url,
                        ossExpiration: ossToken.Expiration
                    };
                    !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
                    videoUrlToBase64(res.url).then(base64 => {
                        videoUrl.value = base64;
                        videoElement.value.src && resourceDB.db.add({ id: videoElement.value.src, resource: base64 });
                    });
                }
            }

            if (posterResult.length === 0) {
                if (videoElement.value.ossPoster && videoElement.value.ossExpiration === ossToken.Expiration) {
                    // ossPoster 存在 且 ossToken 未过期 则不请求 直接返回
                    posterUrl.value = videoElement.value.ossPoster;
                } else {
                    if (videoElement.value.poster) {
                        const res = await getOssPosterUrl(videoElement.value.poster);
                        // posterUrl.value = res.url;
                        // 更新 PPTVideoElement
                        const props = {
                            ossPoster: res.url,
                            ossExpiration: ossToken.Expiration
                        };
                        !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });

                        imageUrlToBase64(res.url).then(base64 => {
                            posterUrl.value = base64;
                            videoElement.value.poster && resourceDB.db.add({ id: videoElement.value.poster, resource: base64 });
                        });
                    }
                }
            }

            if (iconResult.length === 0) {
                if (videoElement.value.ossIcon && videoElement.value.ossExpiration === ossToken.Expiration) {
                    // ossPoster 存在 且 ossToken 未过期 则不请求 直接返回
                    iconUrl.value = videoElement.value.ossIcon;
                } else {
                    if (videoElement.value.icon) {
                        const res = await getOssPosterUrl(videoElement.value.icon);
                        // iconUrl.value = res.url;
                        // 更新 PPTVideoElement
                        const props = {
                            ossIcon: res.url,
                            ossExpiration: ossToken.Expiration
                        };
                        !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: videoElement.value.id, props });
                        imageUrlToBase64(res.url).then(base64 => {
                            iconUrl.value = base64;
                            videoElement.value.icon && resourceDB.db.add({ id: videoElement.value.icon, resource: base64 });
                        });
                    } else {
                        iconUrl.value = "";
                    }
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
