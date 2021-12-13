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
        <div
            class="rotate-wrapper"
            :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
        >
            <div class="element-content">
                <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="" @click="handleAudioEvent">
                <img class="icon-image" v-else src="@/assets/images/audio.png" alt="" @click="handleAudioEvent">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onUnmounted, PropType, Ref, ref } from "vue";
import { PPTAudioElement } from "@/types/slides";
import useAudio from "./useAudio";
import useOssAudio from "./useOssAudio";

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

        const { playAudio, stopAudio } = useAudio();
        const handleAudioEvent = () => {
            playAudio(props.elementInfo.src);
        };

        const audioElenent = computed(() => props.elementInfo);
        const { iconUrl } = useOssAudio(audioElenent, true);

        onUnmounted(() => {
            stopAudio();
        });

        return {
            scale,
            iconUrl,
            handleAudioEvent
        };
    }
});
</script>

<style lang="scss" scoped>
.screen-element-audio {
    position: absolute;
}

.rotate-wrapper {
    width: 100%;
    height: 100%;
}

.element-content {
    width: 100%;
    height: 100%;
}

.audio-btn {
    font-size: 40px;
    cursor: pointer;
}

.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
    -webkit-user-drag: none;
}
</style>
