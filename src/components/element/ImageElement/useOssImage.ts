import { PPTImageElement } from "@/types/slides";
import { getOssImageUrl, imageUrlToBase64 } from "@/utils/image";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed, getCurrentInstance } from "vue";
import { MutationTypes, useStore } from "@/store";
import isElectron from "is-electron";
import { get, STORAGE_TYPES } from "@/utils/storage";
// import { getResourceDB } from "@/utils/database";

declare function require(img: string): string;
export default (imageElement: ComputedRef<PPTImageElement>, isScreening?: boolean) => {
    const image = require("@/assets/images/default.png");
    const imageUrl = ref("");
    const store = useStore();
    const instance = getCurrentInstance();
    // const resourceDB = getResourceDB();
    const updateImage = async () => {
        // 切换图片编辑 会重复拉取图片 图片缓存成base64进行存储
        // const result = await resourceDB.db.where({ id: imageElement.value.src }).toArray();
        let imageRes: string | null = null;
        if (isElectron() && get(STORAGE_TYPES.SET_ISCACHE)) {
            imageRes = await instance?.appContext.config.globalProperties.$getLocalFileUrl(imageElement.value.src || "");
        }
        if (imageRes) {
            imageUrl.value = imageRes;
            const props = {
                ossSrc: imageRes
            };
            !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: imageElement.value.id, props });
        } else {
            getToken((ossToken: OssToken) => {
                if (imageElement.value.ossSrc && imageElement.value.ossExpiration === ossToken.Expiration) {
                    // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                    imageUrl.value = imageElement.value.ossSrc;
                } else {
                    getOssImageUrl(imageElement.value.src).then(res => {
                        imageUrl.value = res.url;
                        // 更新 PPTImageElement
                        const props = {
                            ossSrc: res.url,
                            ossExpiration: ossToken.Expiration
                        };

                        !isScreening && store.commit(MutationTypes.UPDATE_ELEMENT, { id: imageElement.value.id, props });

                        // imageUrlToBase64(res.url).then(base64 => {
                        //     imageUrl.value = base64;
                        //     resourceDB.db.add({ id: imageElement.value.src, resource: base64 });
                        // });
                    });
                }
            });
        }
    };

    const key = computed(() => {
        return imageElement.value ? imageElement.value.src : "";
    });

    watch(key, () => {
        updateImage();
    });

    updateImage();

    const errorImage = ref(image);

    return {
        imageUrl,
        errorImage
    };
};
