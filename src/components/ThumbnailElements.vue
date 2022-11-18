<template>
    <div
        class="thumbnail-slide"
        :style="{
            width: size + 'px',
            height: slide?.maxHeight * scale + 'px'
        }"
    >
        <div
            class="elements"
            :style="{
                width: slide?.maxWidth + 'px',
                height: slide?.maxHeight + 'px',
                transform: `scale(${ scale })`
            }"
        >
            <div>
                <thumbnail-element
                    v-for="(element, index) in slide[key] || []"
                    :key="element.id"
                    :elementInfo="element"
                    :elementIndex="index + 1"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import ThumbnailElement from "./ThumbnailSlide/ThumbnailElement.vue";
import { PPTElement } from "@/types/slides";
interface IData {
    maxWidth: number,
    maxHeight: number,
    offSetElements: PPTElement[],
    elements: PPTElement[]
}

export default defineComponent({
    name: "thumbnail-elements",
    components: {
        ThumbnailElement
    },
    props: {
        key: {
            type: String,
            default: () => "offSetElements"
        },
        slide: {
            type: Object as PropType<IData>,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const scale = computed(() => props.size / props.slide?.maxWidth);

        return {
            scale
        };
    }
});
</script>

<style lang="scss" scoped>
.thumbnail-slide {
    background-color: #fff;
    overflow: hidden;
}
.elements {
    transform-origin: 0 0;
}
.background {
    width: 100%;
    height: 100%;
    background-position: center;
    position: absolute;
}
</style>
