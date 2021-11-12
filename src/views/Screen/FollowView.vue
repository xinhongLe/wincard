<template>
    <div class="me-follow-container">
        <div class="me-follow-box">
            <video
                class="me-video"
                ref="videoRef"
                @ended="videoEnd()"
                :src="videoUrl"
            ></video>
        </div>
        <div class="me-pause-box">
            <div
                class="me-pause-item"
                @click="pausePlay(index)"
                :class="pauseIndex === index && 'active'"
                v-for="(item, index) in pauseList"
                :key="index"
            ></div>
        </div>
        <div class="me-follow-footer">
            <div class="me-mode-select">
                模式选择：
                <div
                    class="me-mode-item"
                    :class="mode === 0 && 'active'"
                    @click="checkMode(0)"
                >
                    全文播放
                </div>
                <div
                    class="me-mode-item"
                    :class="mode === 1 && 'active'"
                    @click="checkMode(1)"
                >
                    自然跟读
                </div>
                <div
                    class="me-mode-item"
                    :class="mode === 2 && 'active'"
                    @click="checkMode(2)"
                >
                    手动跟读
                </div>
            </div>
            <div class="me-play-btn" @click="playEvent()">
                <i
                    class="me-icon el-icon-video-play"
                    v-if="videoStatus === 0 || videoStatus === 3"
                ></i>
                <i
                    class="me-icon el-icon-video-pause"
                    v-if="videoStatus === 1"
                ></i>
                <i
                    class="me-icon el-icon-refresh-right"
                    v-if="videoStatus === 4"
                ></i>
                <div class="me-audio-box" v-if="videoStatus === 2">
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                    <div class="me-audio-line"></div>
                </div>
                <div v-if="videoStatus === 2" class="me-wait-time">
                    {{ timeCount }}s
                </div>
                {{ ["开始", "暂停", "", "继续", "重播"][videoStatus] }}
            </div>
            <div style="width: 371px"></div>
        </div>
    </div>
</template>

<script lang="ts">
import useOssVideo from "@/views/Editor/Follow/useOssVideo";
import { Slide, PauseList, Follow } from "@/types/slides";
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from "vue";

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        }
    },
    setup(props) {
        const videoRef = ref<HTMLVideoElement>();
        const follow = computed<Follow>(() => props.slide.follow || { src: "" });
        const { videoUrl } = useOssVideo(follow);

        let timeInterval: number | undefined;
        let timeCountInterval: number | undefined;

        const pauseIndex = ref(0);
        const mode = ref(0);
        const pauseList = ref<PauseList[]>([]);
        const timeCount = ref(0);
        const isPlaying = ref(false);
        const isEnd = ref(false);

        const getVideoCurrentTime = () => {
            if (videoRef.value) return videoRef.value.currentTime;
            return 0;
        };

        const setVideoCurrentTime = (time: number) => {
            if (videoRef.value) videoRef.value.currentTime = time;
        };

        const pauseVideo = () => {
            isPlaying.value = false;
            if (videoRef.value) videoRef.value.pause();
        };

        const play = () => {
            isPlaying.value = true;
            isEnd.value = false;
            if (videoRef.value) videoRef.value.play();
        };

        const pausePlay = (i: number) => {
            clearInterval(timeCountInterval);
            pauseIndex.value = i;
            setVideoCurrentTime(i === 0 ? 0 : timeNum(pauseList.value[i - 1].time));
            play();
        };

        const videoEnd = () => {
            isPlaying.value = false;
            isEnd.value = true;
            pauseVideo();
        };

        const checkMode = (value: number) => {
            mode.value = value;
        };

        const playEvent = () => {
            if (videoStatus.value === 0 || videoStatus.value === 3) {
                play();
            } else if (videoStatus.value === 4) {
                pausePlay(0);
            } else if (videoStatus.value === 1) {
                pauseVideo();
            }
        };

        const videoStatus = computed(() => {
            // 0 未开始 1 播放中 2 等待中 3 暂停 4 结束
            let status = 0;
            if (isPlaying.value) {
                status = 1;
            } else if (mode.value === 1 && timeCount.value > 0) {
                status = 2;
            } else if (isEnd.value) {
                status = 4;
            } else if (!getVideoCurrentTime()) {
                status = 0;
            } else {
                status = 3;
            }
            return status;
        });

        const timeNum = (time: string | undefined) => {
            if (!time) return 0;
            const arr = time.split(":");
            return Number(arr[0]) * 3600 + Number(arr[1]) * 60 + Number(arr[2]);
        };

        const checkPauseTimer = (ctime: number, stime: number, callback: any) => {
            if (mode.value !== 0 && stime - ctime < 0.5 && stime - ctime > 0) {
                // 当当前时间与停止时间间隔小于500ms时启动暂停操作
                clearInterval(timeInterval);
                timeInterval = setInterval(() => {
                    const _ctime: number = getVideoCurrentTime();
                    if (stime - _ctime < 0.02) {
                        // 接近目标值
                        clearInterval(timeInterval);

                        timeInterval = undefined;

                        callback && callback();
                    }
                }, 20);
            }
        };

        const getWaitTime = () => {
            const currentTime = timeNum(pauseList.value[pauseIndex.value].time);
            const startTime = pauseIndex.value === 0 ? 0 : timeNum(pauseList.value[pauseIndex.value - 1].time);
            return Math.ceil((currentTime - startTime) * 1.2);
        };

        const watchTimeUpdate = () => {
            const obj = pauseList.value[pauseIndex.value];
            if (!obj) return;
            // 判断是否是视频最后一个点
            if (obj.isEnd) return;

            // 当前视频播放时间
            const _ctime = getVideoCurrentTime();

            // 获得暂停时间点
            const stopTime = timeNum(obj.time);

            // 开启定时器 用定时器来限制视频暂停 减少停止的误差
            checkPauseTimer(_ctime, stopTime, () => {
                pauseVideo();
                if (mode.value === 1) {
                    timeCount.value = getWaitTime();
                    clearTimeout(timeCountInterval);
                    timeCountInterval = setInterval(() => {
                        if (timeCount.value <= 0) {
                            clearTimeout(timeCountInterval);
                            pausePlay(pauseIndex.value + 1);
                        } else {
                            timeCount.value--;
                        }
                    }, 1000);
                }
            });

            // 断点切换到下一个
            if (stopTime < _ctime) pauseIndex.value++;
        };

        const init = () => {
            pauseIndex.value = 0;
            mode.value = 1;
            pauseList.value = pauseList.value.concat([{ isEnd: true }]);
            clearInterval(timeInterval);
            if (videoRef.value) {
                videoRef.value.addEventListener("timeupdate", watchTimeUpdate);
            }
        };

        onMounted(() => {
            init();
        });

        onUnmounted(() => {
            clearInterval(timeInterval);
            if (videoRef.value) videoRef.value.removeEventListener("timeupdate", watchTimeUpdate);
        });

        return {
            videoRef,
            videoUrl,
            pauseIndex,
            mode,
            pauseList,
            timeCount,
            isPlaying,
            isEnd,
            videoStatus,
            videoEnd,
            playEvent,
            checkMode
        };
    }
});
</script>

<style lang="scss" scoped>
.me-follow-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    .me-follow-box {
        flex: 1;
        min-height: 0;
    }
    .me-video {
        width: 100%;
        display: block;
        max-height: 100%;
    }

    .me-pause-box {
        height: 25px;
        display: flex;
    }

    .me-pause-item {
        flex: 1;
        background-color: #ccd0db;
        margin-right: 2px;
        cursor: pointer;
    }

    .me-pause-item:last-child {
        margin-right: 0;
    }

    .me-pause-item.active {
        background-color: #4b71ee;
    }

    .me-follow-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
    }

    .me-mode-select {
        display: flex;
        color: #888;
        align-items: center;
    }

    .me-mode-item {
        padding: 5px 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 15px;
        cursor: pointer;
        margin-right: 5px;
    }

    .me-mode-item.active {
        background-color: #4b71ee;
        color: #fff;
    }

    .me-play-btn {
        padding: 8px 40px;
        border-radius: 5px;
        background-color: #4b71ee;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        position: relative;
    }

    .me-play-btn:active {
        background-color: #839cf0;
    }

    .me-icon {
        font-size: 26px;
        margin-right: 5px;
        margin-left: -5px;
    }

    .me-audio-box {
        display: flex;
        align-items: flex-end;
    }

    .me-audio-line:nth-of-type(0) {
        animation: audio 0.5s linear 0.1s infinite alternate;
    }

    .me-audio-line:nth-of-type(1) {
        animation: audio 0.5s linear 0.2s infinite alternate;
    }

    .me-audio-line:nth-of-type(2) {
        animation: audio 0.5s linear 0.5s infinite alternate;
    }

    .me-audio-line:nth-of-type(4) {
        animation: audio 0.5s linear 0.2s infinite alternate;
    }

    .me-audio-line:nth-of-type(5) {
        animation: audio 0.5s linear 0.3s infinite alternate;
    }

    .me-audio-line:nth-of-type(6) {
        animation: audio 0.5s linear 0.1s infinite alternate;
    }

    .me-audio-line {
        width: 5px;
        height: 20px;
        background-color: #fff;
    }

    .me-wait-time {
        font-size: 14px;
        position: absolute;
        right: 8px;
    }

    @keyframes audio {
        from {
            height: 1px;
        }
        to {
            height: 20px;
        }
    }
}
</style>
