import { SlideBackground } from "@/types/slides";
import { getOssImageUrl, imageUrlToBase64 } from "@/utils/image";
import { getToken, OssToken } from "@/utils/oss";
import { watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getResourceDB } from "@/utils/database";

export default (background: ComputedRef<SlideBackground | undefined>, callback?: (url: string) => void) => {
    const store = useStore();
    const resourceDB = getResourceDB();
    const updateImage = async () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
        const result = await resourceDB.db.where({ id: background.value?.image }).toArray();
        if (result.length > 0) {
            callback && callback(result[0].resource);
        } else {
            getToken((ossToken: OssToken) => {
                if (
                    background.value &&
                    background.value.ossSrc &&
                    background.value.ossExpiration === ossToken.Expiration
                ) {
                    // ossSrc 存在 且 ossToken 未过期 则不请求 直接返回
                } else if (background.value && background.value.image) {
                    getOssImageUrl(background.value.image).then(res => {
                        // 更新 SlideBackground

                        imageUrlToBase64(res.url).then(base64 => {
                            background.value?.image && resourceDB.db.add({ id: background.value?.image, resource: base64 });
                            if (callback) {
                                return callback(base64);
                            }
                            const props = {
                                ossSrc: base64,
                                ossExpiration: ossToken.Expiration
                            };
                            store.commit(MutationTypes.UPDATE_SLIDE, {
                                background: { ...background.value, ...props }
                            });
                        });
                    });
                }
            });
        }
    };

    const key = computed(() => {
        return background.value ? background.value.image : "";
    });

    watch(key, () => {
        updateImage();
    });

    updateImage();
};
