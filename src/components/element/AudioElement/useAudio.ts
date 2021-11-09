import { getOssAudioUrl } from "@/utils/audio";
import { debounce } from "lodash";

export default () => {
    let audio: HTMLAudioElement | null = null;
    const playAudio = debounce(async (key: string) => {
        const res = await getOssAudioUrl(key);
        if (!audio) {
            audio = new Audio();
            audio.src = res.url;
            audio.oncanplay = () => {
                audio && audio.play();
            };
            audio.onended = () => {
                audio && audio.remove();
                audio = null;
            };
        } else {
            audio.pause();
            audio.remove();
            audio = null;
        }
    }, 300);

    return {
        playAudio
    };
};
