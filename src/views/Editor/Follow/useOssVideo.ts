import { Follow } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, computed, ComputedRef } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssVideoUrl, videoUrlToBase64 } from "@/utils/video";
import { getResourceDB } from "@/utils/database";

export default (follow: ComputedRef<Follow | undefined>, isScreening?: boolean) => {
    const videoUrl = ref("");
    const store = useStore();
    const updateVideo = () => {
        const resourceDB = getResourceDB();

        getToken(async (ossToken: OssToken) => {
            const result = await resourceDB.db.where({ id: follow.value ? follow.value.src : "" }).toArray();
            if (result.length > 0) {
                videoUrl.value = result[0].resource;
            } else {
                if (follow.value && follow.value.ossSrc && follow.value.ossExpiration === ossToken.Expiration) {
                    // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                    videoUrl.value = follow.value.ossSrc;
                } else {
                    if (follow.value && follow.value.src) {
                        const res = await getOssVideoUrl(follow.value.src);
                        // videoUrl.value = res.url;
                        const props = {
                            src: follow.value.src,
                            ossSrc: res.url,
                            ossExpiration: ossToken.Expiration
                        };
                        !isScreening && store.commit(MutationTypes.UPDATE_FOLLOW, props);
                        videoUrlToBase64(res.url).then(base64 => {
                            videoUrl.value = base64;
                            (follow.value && follow.value.src) && resourceDB.db.add({ id: follow.value.src, resource: base64 });
                        });
                    }
                }
            }
        });
    };

    const key = computed(() => {
        return follow.value ? follow.value.src : "";
    });

    watch([key], () => {
        updateVideo();
    });

    updateVideo();

    return {
        videoUrl
    };
};
