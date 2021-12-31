// import { getOssAudioUrl } from "@/utils/audio";
import { debounce } from "lodash";
import { ref } from "vue";

export default () => {
    let audio: HTMLAudioElement | null = null;
    let timer: any = null;
    let isPause = false; // 是否暂停
    const showProgress = ref(false);
    const isPlay = ref(false); // 播放状态
    const duration = ref(0);
    const playDuration = ref(0);
    const playAudio = debounce(async (key: string) => {
        // const res = await getOssAudioUrl(key);
        if (!audio) {
            audio = new Audio();
            audio.src = key;
            audio.oncanplay = () => {
                showProgress.value = true;
                //  !isPause 改变进度条时会触发oncanplay
                if (audio && !isPause) {
                    isPlay.value = true;
                    duration.value = Math.floor(audio!.duration);
                    audio.play();
                    updateDuration();
                }
            };
            audio.onended = () => {
                clearInterval(timer);
                showProgress.value = false;
                isPause = false;
                playDuration.value = 0;
                audio && audio.remove();
                audio = null;
            };
        } else {
            if (audio.paused) {
                audio.play();
                isPlay.value = true;
                isPause = false;
                updateDuration();
            } else {
                audio.pause();
                isPause = true;
                isPlay.value = false;
                clearInterval(timer);
            }
        }
    }, 300);

    const stopAudio = () => {
        if (audio) {
            if (!audio.paused) audio.pause();
            audio.remove();
            clearInterval(timer);
            isPlay.value = false;
            isPause = true;
        }
    };

    const selectDuration = (value: number) => {
        clearInterval(timer);
        playDuration.value = value;
        if (audio) {
            audio.currentTime = value;
        }
    };

    const updateDuration = () => {
        timer = setInterval(() => {
            playDuration.value < duration.value && (playDuration.value = playDuration.value + 1);
        }, 1000);
    };

    const secondToTime = (second = 0) => {
        if (second === 0 || isNaN(second)) return "00:00";
        const add0 = (num: number) => (num < 10 ? "0" + num : "" + num);
        const hour = Math.floor(second / 3600);
        const min = Math.floor((second - hour * 3600) / 60);
        const sec = Math.floor(second - hour * 3600 - min * 60);
        return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(":");
    };

    return {
        playAudio,
        stopAudio,
        duration,
        playDuration,
        selectDuration,
        secondToTime,
        showProgress,
        isPlay
    };
};
