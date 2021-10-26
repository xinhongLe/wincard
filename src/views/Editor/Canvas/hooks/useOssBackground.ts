import { SlideBackground } from "@/types/slides";
import { getOssImageUrl } from "@/utils/image";
import { getToken, OssToken } from "@/utils/oss";
import { watch, ComputedRef, computed } from "vue";
import { MutationTypes, useStore } from "@/store";

export default (background: ComputedRef<SlideBackground | undefined>) => {
    const store = useStore();

    const updateImage = () => {
        // 目前切换图片编辑 会重复拉取图片 后面考虑要不要缓存成base64进行存储
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
                    const props = {
                        ossSrc: res.url,
                        ossExpiration: ossToken.Expiration
                    };

                    store.commit(MutationTypes.UPDATE_SLIDE, {
                        background: { ...background.value, ...props }
                    });
                });
            }
        });
    };

    const key = computed(() => {
        return background.value ? background.value.image : "";
    });

    watch(key, () => {
        updateImage();
    });

    updateImage();
};
