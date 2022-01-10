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
            <div class="element-content" @mouseover="mouseover" @mouseleave="mouseleave">
                <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="" @click="handleAudioEvent">
                <img class="icon-image" v-else src="@/assets/images/audio.png" alt="" @click="handleAudioEvent">
                <div class="progress-bar"
                    v-if="showProgress && isHideProcess"
                    :style="{
                        width: durationBoxWidth + 'px',
                        right: VIEWPORT_SIZE - elementInfo.width - elementInfo.left > durationBoxWidth ? -durationBoxWidth + 'px' : elementInfo.width + 'px'
                    }">
                    <div>
                        <a-slider v-model:value="playDuration" :max="duration" @afterChange="selectDuration"></a-slider>
                        <div class="duration">
                            <span>{{ secondToTime(playDuration) }}</span>
                            <IconPlayOne v-if="!isPlay" class="icon-play" @click="handleAudioEvent" />
                            <IconPause v-else class="icon-play" @click="handleAudioEvent" />
                            <span>{{ secondToTime(duration) }}</span>
                        </div>
                    </div>
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
import { VIEWPORT_SIZE } from "@/configs/canvas";

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
        const durationBoxWidth = 200;

        const { playAudio, stopAudio, showProgress, duration, playDuration, selectDuration, secondToTime, isPlay, isHideProcess, mouseover, mouseleave } = useAudio();
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
            showProgress,
            durationBoxWidth,
            isPlay,
            VIEWPORT_SIZE,
            mouseleave,
            mouseover,
            isHideProcess
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
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 200;
    padding-left: 16px;
    height: 50px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    >div {
        height: 50px;
        background: #e7efff;
        border-radius: 8px;
        padding: 0px 6px 6px;
        box-sizing: border-box;
        flex: 1;
    }
    .duration {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5px;
        box-sizing: border-box;
        > span {
            font-size: 12px;
            font-weight: 550;
            color: #727b91;
            line-height: 16px;
            transform: scale(.8);
            transform-origin: 0% 0%;
        }
        .icon-play {
            font-size: 20px;
            font-weight: 400;
            color: #4b71ee;
            margin-right: 5px;
            display: flex;
            align-items: center;
            cursor: pointer;
        }
    }
    ::v-deep(.ant-slider-rail) {
        background-color: #e0e6f6;
    }
    ::v-deep(.ant-slider-track), ::v-deep(.ant-slider-handle) {
        background-color: #4b71ee;
    }
    ::v-deep(.ant-slider-handle) {
        border-color: #fff;
    }
    ::v-deep(.ant-slider) {
        margin-top: 10px;
        margin-bottom: 4px;
    }
}
</style>
