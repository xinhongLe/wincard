import { PPTImageElement } from "@/types/slides";
import { getOssImageUrl } from "@/utils/image";
import { getToken, OssToken } from "@/utils/oss";
import { ref, watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";

export default (imageElement: ComputedRef<PPTImageElement>) => {
    const imageUrl = ref("");
    const store = useStore();

    const updateImage = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
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
                    store.commit(MutationTypes.UPDATE_ELEMENT, { id: imageElement.value.id, props });
                });
            }
        });
    };

    const key = computed(() => {
        return imageElement.value ? imageElement.value.src : "";
    });

    watch(key, () => {
        updateImage();
    });

    updateImage();

    return {
        imageUrl
    };
};
