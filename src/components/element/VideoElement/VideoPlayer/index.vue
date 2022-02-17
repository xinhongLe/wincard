<template>
    <div
        class="player"
        :class="{ 'hide-controller': hideController }"
        :style="{
            width: noTransform ? '100%' : width * scale + 'px',
            height: noTransform ? '100%' : height * scale + 'px',
            transform: `scale(${noTransform ? 1 : 1 / scale})`
        }"
        ref="containerRef"
        @mousemove="autoHideController()"
        @click="autoHideController()"
    >
        <div class="video-wrap" @click="toggle()">
            <video
                class="video"
                ref="videoRef"
                :src="videoUrl"
                v-if="videoUrl"
                :poster="posterUrl"
                webkit-playsinline
                playsinline
                @durationchange="handleDurationchange()"
                @timeupdate="handleTimeupdate()"
                @ended="handleEnded()"
                @progress="handleProgress()"
                @play="autoHideController()"
                @pause="autoHideController()"
                @error="handleError()"
            ></video>
            <div class="bezel">
                <span
                    class="bezel-icon"
                    :class="{ 'bezel-transition': bezelTransition }"
                    @animationend="bezelTransition = false"
                >
                    <IconPause v-if="paused" />
                    <IconPlayOne v-else />
                </span>
            </div>
        </div>

        <div class="controller-mask"></div>
        <div class="controller">
            <div class="icons icons-left">
                <div class="icon play-icon" @click="toggle()">
                    <span class="icon-content">
                        <IconPlayOne v-if="paused" />
                        <IconPause v-else />
                    </span>
                </div>
                <div class="volume">
                    <div class="icon volume-icon" @click="toggleVolume()">
                        <span class="icon-content">
                            <IconVolumeMute v-if="volume === 0" />
                            <IconVolumeNotice v-else-if="volume === 1" />
                            <IconVolumeSmall v-else />
                        </span>
                    </div>
                    <div
                        class="volume-bar-wrap"
                        @mousedown="$event => handleMousedownVolumeBar($event)"
                        @touchstart="$event => handleMousedownVolumeBar($event)"
                        @click="$event => handleClickVolumeBar($event)"
                    >
                        <div class="volume-bar" ref="volumeBarRef">
                            <div
                                class="volume-bar-inner"
                                :style="{ width: volumeBarWidth }"
                            >
                                <span class="thumb"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="time">
                    <span class="ptime">{{ ptime }}</span> /
                    <span class="dtime">{{ dtime }}</span>
                </span>
            </div>

            <!-- <div class="icons icons-right">
                <div class="speed">
                    <div class="icon speed-icon">
                        <span
                            class="icon-content"
                            @click="speedMenuVisible = !speedMenuVisible"
                            >倍速</span
                        >
                        <div
                            class="speed-menu"
                            v-if="speedMenuVisible"
                            @mouseleave="speedMenuVisible = false"
                        >
                            <div
                                class="speed-menu-item"
                                :class="{ active: item.value === playbackRate }"
                                v-for="item in speedOptions"
                                :key="item.label"
                                @click="speed(item.value)"
                            >
                                {{ item.label }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="loop" @click="toggleLoop()">
                    <div class="icon loop-icon" :class="{ active: loop }">
                        <span class="icon-content"><IconCycleOne /></span>
                    </div>
                </div>
            </div> -->

            <div
                class="bar-wrap"
                ref="playBarWrap"
                @mousedown="$event => handleMousedownPlayBar($event)"
                @touchstart="$event => handleMousedownPlayBar($event)"
                @mousemove="$event => handleMousemovePlayBar($event)"
                @mouseenter="playBarTimeVisible = true"
                @mouseleave="playBarTimeVisible = false"
            >
                <div
                    class="bar-time"
                    :class="{ hidden: !playBarTimeVisible }"
                    :style="{ left: playBarTimeLeft }"
                >
                    {{ playBarTime }}
                </div>
                <div class="bar">
                    <div class="pause-points">
                        <div class="pause-point" :style="{left: countPointLeft(point)}" v-for="point in pauseList" :key="point"></div>
                    </div>
                    <div
                        class="loaded"
                        :style="{ width: loadedBarWidth }"
                    ></div>
                    <div class="played" :style="{ width: playedBarWidth }">
                        <span class="thumb"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, ref } from "vue";
import useMSE from "./useMSE";
import useOssVideo from "./useOssVideo";
import { message } from "ant-design-vue";
import { PPTVideoElement } from "@/types/slides";

const secondToTime = (second = 0) => {
    if (second === 0 || isNaN(second)) return "00:00";

    const add0 = (num: number) => (num < 10 ? "0" + num : "" + num);
    const hour = Math.floor(second / 3600);
    const min = Math.floor((second - hour * 3600) / 60);
    const sec = Math.floor(second - hour * 3600 - min * 60);
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(":");
};

const getBoundingClientRectViewLeft = (element: HTMLElement) => {
    return element.getBoundingClientRect().left;
};

export default defineComponent({
    name: "Player",
    props: {
        noTransform: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        src: {
            type: String,
            required: true
        },
        videoElement: {
            type: Object as PropType<PPTVideoElement>,
            required: true
        },
        poster: {
            type: String,
            default: ""
        },
        scale: {
            type: Number,
            default: 1
        },
        isScreening: {
            type: Boolean,
            default: false
        },
        pauseList: {
            type: Array as PropType<string[]>,
            default: () => []
        }
    },
    setup(props) {
        const containerRef = ref<HTMLElement>();
        const videoRef = ref<HTMLVideoElement>();
        const playBarWrap = ref<HTMLElement>();
        const volumeBarRef = ref<HTMLElement>();

        const volume = ref(0.5);
        const paused = ref(true);
        const currentTime = ref(0);
        const duration = ref(0);
        const loaded = ref(0);
        const loop = ref(false);
        const bezelTransition = ref(false);
        const playbackRate = ref(1);

        const playBarTimeVisible = ref(false);
        const playBarTime = ref("00:00");
        const playBarTimeLeft = ref("0");

        const ptime = computed(() => secondToTime(currentTime.value));
        const dtime = computed(() => secondToTime(duration.value));
        const playedBarWidth = computed(
            () => (currentTime.value / duration.value) * 100 + "%"
        );
        const loadedBarWidth = computed(
            () => (loaded.value / duration.value) * 100 + "%"
        );
        const volumeBarWidth = computed(() => volume.value * 100 + "%");

        const speedMenuVisible = ref(false);
        const speedOptions = [
            { label: "2x", value: 2 },
            { label: "1.5x", value: 1.5 },
            { label: "1.25x", value: 1.25 },
            { label: "1x", value: 1 },
            { label: "0.75x", value: 0.75 },
            { label: "0.5x", value: 0.5 }
        ];

        const pauseList = computed(() => props.pauseList);

        const timeNum = (time: string | undefined) => {
            if (!time) return 0;
            const arr = time.split(":");
            return Number(arr[0]) * 3600 + Number(arr[1]) * 60 + Number(arr[2]);
        };

        const countPointLeft = (time: string) => {
            const pointTime = timeNum(time);
            return pointTime / duration.value * 100 + "%";
        };

        const seek = (time: number) => {
            if (!videoRef.value) return;

            time = Math.max(time, 0);
            time = Math.min(time, duration.value);

            videoRef.value.currentTime = time;
            currentTime.value = time;
        };

        const play = () => {
            if (!videoRef.value) return;

            paused.value = false;
            videoRef.value.play();
            bezelTransition.value = true;
        };

        const pause = () => {
            if (!videoRef.value) return;

            paused.value = true;
            videoRef.value.pause();
            bezelTransition.value = true;
        };

        const toggle = () => {
            if (paused.value) play();
            else pause();
        };

        const setVolume = (percentage: number) => {
            if (!videoRef.value) return;

            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);

            videoRef.value.volume = percentage;
            volume.value = percentage;
            if (videoRef.value.muted && percentage !== 0) videoRef.value.muted = false;
        };

        const speed = (rate: number) => {
            if (videoRef.value) videoRef.value.playbackRate = rate;
            playbackRate.value = rate;
        };

        const handleDurationchange = () => {
            duration.value = videoRef.value?.duration || 0;
        };

        const handleTimeupdate = () => {
            currentTime.value = videoRef.value?.currentTime || 0;
            // 处理视频暂停
            if (pauseList.value.length > 0) {
                const pauseIndex = pauseList.value.findIndex(time => {
                    return currentTime.value < timeNum(time);
                });
                if (pauseIndex > -1) {
                    const stime = timeNum(pauseList.value[pauseIndex]);
                    checkPauseTimer(currentTime.value, stime, () => {
                        pause();
                    });
                }
            }
        };

        let timeInterval: number;
        const checkPauseTimer = (ctime: number, stime: number, callback: any) => {
            if (stime - ctime < 0.5 && stime - ctime > 0) {
                // 当当前时间与停止时间间隔小于500ms时启动暂停操作
                clearInterval(timeInterval);
                timeInterval = window.setInterval(() => {
                    const _ctime: number = currentTime.value;
                    if (stime - _ctime < 0.02) {
                        // 接近目标值
                        clearInterval(timeInterval);

                        timeInterval = -1;

                        callback && callback();
                    }
                }, 20);
            }
        };

        const handleEnded = () => {
            if (!loop.value) pause();
            else {
                seek(0);
                play();
            }
        };

        const handleProgress = () => {
            loaded.value = videoRef.value?.buffered.length
                ? videoRef.value.buffered.end(
                    videoRef.value.buffered.length - 1
                )
                : 0;
        };

        const handleError = () => message.error("视频加载失败");

        const thumbMove = (e: MouseEvent | TouchEvent) => {
            if (!videoRef.value || !playBarWrap.value) return;
            const clientX =
                "clientX" in e ? e.clientX : e.changedTouches[0].clientX;
            let percentage =
                (clientX - getBoundingClientRectViewLeft(playBarWrap.value)) /
                playBarWrap.value.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            const time = percentage * duration.value;

            videoRef.value.currentTime = time;
            currentTime.value = time;
        };

        const thumbUp = (e: MouseEvent | TouchEvent) => {
            if (!videoRef.value || !playBarWrap.value) return;

            const clientX =
                "clientX" in e ? e.clientX : e.changedTouches[0].clientX;
            let percentage =
                (clientX - getBoundingClientRectViewLeft(playBarWrap.value)) /
                playBarWrap.value.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            const time = percentage * duration.value;

            videoRef.value.currentTime = time;
            currentTime.value = time;

            document.removeEventListener("mousemove", thumbMove);
            document.removeEventListener("touchmove", thumbMove);
            document.removeEventListener("mouseup", thumbUp);
            document.removeEventListener("touchend", thumbUp);
        };

        const handleMousedownPlayBar = () => {
            document.addEventListener("mousemove", thumbMove);
            document.addEventListener("touchmove", thumbMove);
            document.addEventListener("mouseup", thumbUp);
            document.addEventListener("touchend", thumbUp);
        };

        const volumeMove = (e: MouseEvent | TouchEvent) => {
            if (!volumeBarRef.value) return;
            const clientX =
                "clientX" in e ? e.clientX : e.changedTouches[0].clientX;
            const percentage =
                (clientX -
                    getBoundingClientRectViewLeft(volumeBarRef.value) -
                    5.5) /
                35;
            setVolume(percentage);
        };

        const volumeUp = () => {
            document.removeEventListener("mousemove", volumeMove);
            document.removeEventListener("touchmove", volumeMove);
            document.removeEventListener("mouseup", volumeUp);
            document.removeEventListener("touchend", volumeUp);
        };

        const handleMousedownVolumeBar = () => {
            document.addEventListener("mousemove", volumeMove);
            document.addEventListener("touchmove", volumeMove);
            document.addEventListener("mouseup", volumeUp);
            document.addEventListener("touchend", volumeUp);
        };

        const handleClickVolumeBar = (e: MouseEvent) => {
            if (!volumeBarRef.value) return;
            const percentage =
                (e.clientX -
                    getBoundingClientRectViewLeft(volumeBarRef.value) -
                    5.5) /
                35;
            setVolume(percentage);
        };

        const handleMousemovePlayBar = (e: MouseEvent) => {
            if (duration.value && playBarWrap.value) {
                const px = playBarWrap.value.getBoundingClientRect().left;
                const tx = e.clientX - px;
                if (tx < 0 || tx > playBarWrap.value.offsetWidth) return;

                const time =
                    duration.value * (tx / playBarWrap.value.offsetWidth);
                playBarTimeLeft.value = `${tx - (time >= 3600 ? 25 : 20)}px`;
                playBarTime.value = secondToTime(time);
                playBarTimeVisible.value = true;
            }
        };

        const toggleVolume = () => {
            if (!videoRef.value) return;

            if (videoRef.value.muted) {
                videoRef.value.muted = false;
                setVolume(0.5);
            } else {
                videoRef.value.muted = true;
                setVolume(0);
            }
        };

        const toggleLoop = () => {
            loop.value = !loop.value;
        };

        const autoHideControllerTimer = ref(-1);
        const hideController = ref(false);
        const autoHideController = () => {
            hideController.value = false;
            clearTimeout(autoHideControllerTimer.value);
            autoHideControllerTimer.value = window.setTimeout(() => {
                if (videoRef.value?.played.length) hideController.value = true;
            }, 3000);
        };

        const videoElement = computed(() => props.videoElement);
        const { videoUrl, posterUrl } = useOssVideo(videoElement, props.isScreening);

        useMSE(props.src, videoRef);

        let timeout: ReturnType<typeof setTimeout>;
        const autoPlay = () => {
            if (videoRef.value) {
                play();
            } else {
                timeout = setTimeout(() => {
                    autoPlay();
                }, 1000);
            }
        };

        onUnmounted(() => {
            clearTimeout(timeout);
        });

        if (videoElement.value.showType === 0 && videoElement.value.autoPlay && props.isScreening) {
            autoPlay();
        }

        return {
            containerRef,
            videoRef,
            playBarWrap,
            volumeBarRef,
            volume,
            loop,
            paused,
            ptime,
            dtime,
            playBarTime,
            playBarTimeVisible,
            playBarTimeLeft,
            playedBarWidth,
            loadedBarWidth,
            volumeBarWidth,
            hideController,
            bezelTransition,
            playbackRate,
            speedMenuVisible,
            speedOptions,
            videoUrl,
            posterUrl,
            seek,
            play,
            pause,
            toggle,
            setVolume,
            speed,
            handleDurationchange,
            handleTimeupdate,
            handleEnded,
            handleProgress,
            handleMousedownPlayBar,
            handleMousedownVolumeBar,
            handleClickVolumeBar,
            handleMousemovePlayBar,
            toggleVolume,
            toggleLoop,
            autoHideController,
            handleError,
            countPointLeft
        };
    }
});
</script>

<style scoped lang="scss">
@import "./style.scss";
</style>
