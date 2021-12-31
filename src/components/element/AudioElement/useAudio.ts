import { getOssAudioUrl } from "@/utils/audio";
import { debounce } from "lodash";
import { ref } from "vue";

export default () => {
    let audio: HTMLAudioElement | null = null;
    let timer: any = null;
    const showProgress = ref(false);
    const duration = ref(0);
    const playDuration = ref(0);
    const playAudio = debounce(async (key: string) => {
        // const res = await getOssAudioUrl(key);
        if (!audio) {
            audio = new Audio();
            audio.src = key;
            audio.oncanplay = () => {
                showProgress.value = true;
                audio && (duration.value = Math.floor(audio!.duration));
                audio && audio.play();
                timer = setInterval(() => {
                    playDuration.value < duration.value && (playDuration.value = playDuration.value + 1);
                }, 1000);
            };
            audio.onended = () => {
                showProgress.value = false;
                playDuration.value = 0;
                clearInterval(timer);
                duration.value = playDuration.value;
                audio && audio.remove();
                audio = null;
            };
        } else {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
                clearInterval(timer);
            }
        }
    }, 300);

    const stopAudio = () => {
        if (audio) {
            if (!audio.paused) audio.pause();
            audio.remove();
        }
    };

    const selectDuration = (value: number) => {
        clearInterval(timer);
        playDuration.value = value;
        if (audio) {
            audio.currentTime = value;
            audio.play();
        }
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
        showProgress
    };
};
