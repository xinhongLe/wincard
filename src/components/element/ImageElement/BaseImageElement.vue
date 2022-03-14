<template>
    <div :class="preview ? 'preview-box' : ''">
        <div
            class="base-element-image"
            :style="elementPosition"
            @dblclick="() => elementInfo.preview && !preview && startPreview()"
        >
            <div
                class="rotate-wrapper"
                :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
            >
                <div
                    class="element-content"
                    :style="{
                        filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
                        transform: flipStyle
                    }"
                >
                    <ImageOutline :elementInfo="elementInfo" />

                    <div
                        class="image-content"
                        :style="{ clipPath: clipShape.style }"
                    >
                        <img
                            v-if="imageUrl"
                            :src="imageUrl"
                            :draggable="false"
                            :style="{
                                ...imgPosition,
                                filter: filter
                            }"
                            @error="imageUrl = errorImage"
                            alt=""
                        />
                    </div>

                    <div class="preview-btn" v-if="elementInfo.preview && preview" @click.stop="startPreview">
                        <IconFullScreenOne />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref } from "vue";
import { PPTImageElement } from "@/types/slides";
import useElementShadow from "@/components/element/hooks/useElementShadow";
import useElementFlip from "@/components/element/hooks/useElementFlip";
import useClipImage from "./useClipImage";
import useFilter from "./useFilter";
import useOssImage from "./useOssImage";

import ImageOutline from "./ImageOutline/index.vue";
import { VIEWPORT_SIZE } from "@/configs/canvas";
import { useStore } from "@/store";

export default defineComponent({
    name: "base-element-image",
    components: {
        ImageOutline
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTImageElement>,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const shadow = computed(() => props.elementInfo.shadow);
        const { shadowStyle } = useElementShadow(shadow);

        const flipH = computed(() => props.elementInfo.flipH);
        const flipV = computed(() => props.elementInfo.flipV);
        const { flipStyle } = useElementFlip(flipH, flipV);

        const stretch = computed(() => props.elementInfo.stretch);
        const clip = computed(() => props.elementInfo.clip);
        const { clipShape, imgPosition } = useClipImage(clip, stretch);

        const filters = computed(() => props.elementInfo.filters);
        const { filter } = useFilter(filters);

        const imageElement = computed(() => props.elementInfo);
        const { imageUrl, errorImage } = useOssImage(imageElement, true);

        const viewportRatio = computed(() => store.state.viewportRatio);
        const slideWidth = VIEWPORT_SIZE;
        const slideHeight = VIEWPORT_SIZE * viewportRatio.value;

        const preview = ref(false);
        const elementPosition = computed(() => {
            const basePosition = {
                top: props.elementInfo.top + "px",
                left: props.elementInfo.left + "px",
                width: props.elementInfo.width + "px",
                height: props.elementInfo.height + "px"
            };
            const useWidth = (slideWidth / slideHeight) < (props.elementInfo.width / props.elementInfo.height);
            const previewPosition = {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: (useWidth ? slideWidth : (slideHeight / props.elementInfo.height * props.elementInfo.width)) + "px",
                height: (useWidth ? (slideWidth / props.elementInfo.width * props.elementInfo.height) : slideHeight) + "px"
            };
            return preview.value ? previewPosition : basePosition;
        });

        const resetPosition: (() => void) | undefined = inject("resetPosition");

        const startPreview = () => {
            preview.value = !preview.value;
            resetPosition && resetPosition();
        };

        return {
            imgPosition,
            filter,
            flipStyle,
            shadowStyle,
            clipShape,
            imageUrl,
            errorImage,
            preview,
            elementPosition,
            startPreview
        };
    }
});
</script>

<style lang="scss" scoped>
.base-element-image {
    position: absolute;
}
.rotate-wrapper {
    width: 100%;
    height: 100%;
}
.element-content {
    width: 100%;
    height: 100%;
    position: relative;

    .image-content {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
    }

    img {
        position: absolute;
    }
}
.preview-btn {
    position: absolute;
    right: 5px;
    bottom: 5px;
    cursor: pointer;
    border-radius: 3px;
    background: #fff;
    padding: 3px;
}

.preview-box {
    position: fixed;
    top: -2px;
    bottom: -2px;
    left: -2px;
    right: -2px;
    z-index: 100000;
    background: #1d1d1d;
}
</style>
