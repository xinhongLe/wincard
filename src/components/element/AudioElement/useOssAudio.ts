import { PPTAudioElement } from "@/types/slides";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed, getCurrentInstance } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getOssAudioUrl } from "@/utils/audio";
import { getOssImageUrl } from "@/utils/image";
import { get, STORAGE_TYPES } from "@/utils/storage";
// import { getResourceDB } from "@/utils/database";

export default (audioElement: ComputedRef<PPTAudioElement>, isScreening?: boolean) => {
    const audioUrl = ref("");
    const iconUrl = ref("");
    const store = useStore();
    const instance = getCurrentInstance();

    // const resourceDB = getResourceDB();
    const updateAudio = async () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        // const iconResult = await resourceDB.db.where({ id: audioElement.value.icon || "" }).toArray();
        // if (iconResult.length > 0) {
        //     iconUrl.value = iconResult[0].resource;
        //     const props = {
        //         ossIcon: iconUrl.value
        //     };
        //     !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });
        // }
        // const audioResult = await resourceDB.db.where({ id: audioElement.value.src || "" }).toArray();
        // if (audioResult.length > 0) {
        //     audioUrl.value = audioResult[0].resource;
        // }
        // if (iconResult.length > 0 && audioResult.length > 0) return;
        let icon: string | null = null;
        let audio: string | null = null;
        if (window.isElectron && get(STORAGE_TYPES.SET_ISCACHE)) {
            icon = await instance?.appContext.config.globalProperties.$getLocalFileUrl(audioElement.value.icon || "");
            if (icon) {
                iconUrl.value = icon;
                const props = { ossIcon: icon };
                !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });
            }
            audio = await instance?.appContext.config.globalProperties.$getLocalFileUrl(audioElement.value.src || "");
            if (audio) audioUrl.value = audio;
        }
        if (icon && audio) return;
        getToken(async (ossToken: OssToken) => {
            if (!audio) {
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
                    // audioUrlToBase64(res.url).then(base64 => {
                    //     audioUrl.value = base64;
                    //     audioElement.value.icon && resourceDB.db.add({ id: audioElement.value.src, resource: base64 });
                    // });
                }
            }

            if (!icon) {
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
                        !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: audioElement.value.id, props });

                        // imageUrlToBase64(res.url).then(base64 => {
                        //     iconUrl.value = base64;
                        //     audioElement.value.icon && resourceDB.db.add({ id: audioElement.value.icon, resource: base64 });
                        // });
                    } else {
                        iconUrl.value = "";
                    }
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
