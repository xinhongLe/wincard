<template>
    <div
        class="editable-element-audio"
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
                <div class="progress-bar" v-if="showProgress">
                    <a-slider v-model:value="playDuration" :max="duration" @afterChange="selectDuration" :tipFormatter="(value) => secondToTime(value)"></a-slider>
                    <p>{{ secondToTime(playDuration) }}/{{ secondToTime(duration) }}</p>
                </div>
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

        const { playAudio, stopAudio, showProgress, duration, playDuration, selectDuration, secondToTime } = useAudio();
        const handleAudioEvent = () => {
            playAudio(audioUrl.value);
        };

        const audioElenent = computed(() => props.elementInfo);
        const { iconUrl, audioUrl } = useOssAudio(audioElenent, true);

        onUnmounted(() => {
            stopAudio();
        });

        return {
            scale,
            iconUrl,
            handleAudioEvent,
            duration,
            playDuration,
            selectDuration,
            secondToTime,
            showProgress
        };
    }
});
</script>

<style lang="scss" scoped>
.editable-element-audio {
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

.progress-bar {
    width: 242px;
    height: 100%;
    background: rgba(231, 239, 255, .5);
    border-radius: 8px;
    margin-left: 16px;
    padding: 6px 15px 8px;
    box-sizing: border-box;
    position: absolute;
    right: -258px;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    > p {
        margin-top: 15px;
        font-size: 16px;
        font-weight: 500;
        color: #727B91;
        line-height: 22px;
        margin-left: 5px;
    }
}
</style>
