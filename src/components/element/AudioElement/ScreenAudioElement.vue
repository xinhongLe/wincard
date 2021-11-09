<template>
    <div
        class="screen-element-audio"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div class="element-content">
            <IconAudioFile class="audio-btn" @click="handleAudioEvent"  />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, Ref, ref } from "vue";
import { PPTAudioElement } from "@/types/slides";
import useAudio from "./useAudio";

export default defineComponent({
    name: "screen-element-video",
    props: {
        elementInfo: {
            type: Object as PropType<PPTAudioElement>,
            required: true
        }
    },
    setup(props) {
        const scale: Ref<number> = inject("slideScale") || ref(1);

        const { playAudio } = useAudio();
        const handleAudioEvent = () => {
            playAudio(props.elementInfo.src);
        };

        return {
            scale,
            handleAudioEvent
        };
    }
});
</script>

<style lang="scss" scoped>
.screen-element-audio {
    position: absolute;
}

.element-content {
    width: 100%;
    height: 100%;
}

.audio-btn {
    font-size: 40px;
    cursor: pointer;
}
</style>
