<template>
    <div class="listen-box">
        <div class="listen-list-box">
            <div class="listen-word-list">
                <div
                    class="listen-word-item"
                    v-for="(item, index) in wordList"
                    :key="index"
                >
                    {{ item.name }}
                    <div class="listening" v-if="current === index">
                        <img
                            src="@/assets/images/icon_volume_notice_small.png"
                            alt=""
                        />
                        正在播报...
                    </div>
                </div>
            </div>
        </div>
        <div class="listen-footer">
            <div class="listen-count-box">
                每个字词播报 &nbsp;&nbsp;
                <a-radio-group v-model:value="count">
                    <a-radio-button :value="1">1遍</a-radio-button>
                    <a-radio-button :value="2">2遍</a-radio-button>
                </a-radio-group>
                <div class="listen-control">
                    <div class="control-btn" :class="(current === -1 || (isStop && current < wordList.length)) ? '' : isStop && current === wordList.length ? 'end' : 'stop'" @click="control">
                        <img src="@/assets/images/icon_start.png" v-if="current === -1 || (isStop && current < wordList.length)" alt="" />
                        <img src="@/assets/images/icon_zanting.png" v-if="current > -1 && !isStop" alt="" />
                        <img src="@/assets/images/icon_restart.png" v-if="isStop && current === wordList.length" alt="" />
                        {{
                            current === -1
                                ? "开始"
                                : current === wordList.length
                                ? "重新"
                                : isStop
                                ? "继续"
                                : "暂停"
                        }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import useListen from "@/hooks/useListen";
import { Slide } from "@/types/slides";
import { computed, defineComponent, onUnmounted, PropType, ref } from "vue";

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        }
    },
    setup(props) {
        const wordList = computed(() => props.slide.listenWords || []);
        const current = ref(-1);
        const count = ref(2);
        const time = ref(2);
        const isStop = ref(true);

        const { playAudio } = useListen();

        const control = () => {
            clearTimeout(playTimer);
            if (isStop.value) {
                isStop.value = false;
                if (current.value === -1) {
                    // 开始播放
                    current.value = 0;
                    time.value = count.value;
                } else if (current.value === wordList.value.length) {
                    // 重新播放
                    current.value = 0;
                    time.value = count.value;
                } else {
                    // 继续播放
                }
                playAudioTimer();
            } else {
                // 暂停播放
                isStop.value = true;
            }
        };

        let playTimer: number;
        const delayTime = 4000;

        const playAudioTimer = () => {
            if (isStop.value) return;
            const word = wordList.value[current.value];
            playAudio(word, () => {
                time.value--;
                if (time.value === 0) {
                    time.value = count.value;
                    current.value++;
                }
                if (current.value === wordList.value.length) {
                    // 播放结束
                    isStop.value = true;
                } else {
                    playTimer = setTimeout(() => {
                        playAudioTimer();
                    }, delayTime);
                }
            });
        };

        onUnmounted(() => {
            isStop.value = true;
            clearTimeout(playTimer);
        });

        return {
            wordList,
            current,
            count,
            isStop,
            control
        };
    }
});
</script>

<style lang="scss" scoped>
.listen-box {
    height: 100%;
    display: flex;
    flex-direction: column;
    .listen-list-box {
        flex: 1;
        background-image: url(~@/assets/images/bg_blue.png);
        background-size: 110% 110%;
        background-position: center;
    }
    .listen-word-list {
        width: 100%;
        box-sizing: border-box;
        padding: 20px 0 20px 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .listen-word-item {
            background-image: url(~@/assets/images/bg_card.png);
            background-size: 100% 100%;
            height: 80px;
            width: calc((100% - 120px) / 5);
            margin-bottom: 20px;
            font-size: 22px;
            font-weight: 600;
            white-space: nowrap;
            text-align: center;
            overflow: hidden;
            box-sizing: border-box;
            padding: 10px;
            text-overflow: ellipsis;
            line-height: 52px;
            position: relative;
            margin-right: 20px;
        }
    }
    .listening {
        position: absolute;
        bottom: 10px;
        font-size: 12px;
        line-height: 1;
        display: flex;
        align-items: center;
        left: 50%;
        transform: translateX(-50%);
        color: $themeColor;
        img {
            width: 14px;
            margin-right: 5px;
        }
    }
    .listen-footer {
        font-size: 12px;
        padding: 10px 15px;
        position: relative;
    }
    .listen-control {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .control-btn {
            background-image: url(~@/assets/images/btn_blue.png);
            background-size: 100% 100%;
            width: 140px;
            height: 36px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
            cursor: pointer;
            img {
                width: 12px;
                margin-right: 5px;
            }
            &.stop {
                background-image: url(~@/assets/images/btn_zanting.png);
            }
            &.end {
                background-image: url(~@/assets/images/btn_restart.png);
            }
        }
    }
}
</style>
