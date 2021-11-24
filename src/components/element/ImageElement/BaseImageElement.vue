<template>
    <div
        class="base-element-image"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
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
                        :src="imageUrl"
                        :draggable="false"
                        :style="{
                            ...imgPosition,
                            filter: filter
                        }"
                        alt=""
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { PPTImageElement } from "@/types/slides";
import useElementShadow from "@/components/element/hooks/useElementShadow";
import useElementFlip from "@/components/element/hooks/useElementFlip";
import useClipImage from "./useClipImage";
import useFilter from "./useFilter";
import useOssImage from "./useOssImage";

import ImageOutline from "./ImageOutline/index.vue";

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
        const { imageUrl } = useOssImage(imageElement, true);

        return {
            imgPosition,
            filter,
            flipStyle,
            shadowStyle,
            clipShape,
            imageUrl
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
</style>
