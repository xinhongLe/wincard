import { computed, Ref } from "vue";
import { CLIPPATHS, ClipPathTypes } from "@/configs/imageClip";
import { ImageElementClip } from "@/types/slides";

export default (clip: Ref<ImageElementClip | undefined>, stretch?: Ref<number>) => {
    const clipShape = computed(() => {
        if (!clip.value) return CLIPPATHS.rect;
        const shape = clip.value.shape || ClipPathTypes.RECT;

        return CLIPPATHS[shape];
    });

    const imgPosition = computed(() => {
        if (!clip.value) {
            if (stretch && stretch.value === 0) {
                return {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "calc(100% - 2px)",
                    maxHeight: "calc(100% - 2px)",
                    width: "calc(100% - 2px)",
                    height: "calc(100% - 2px)",
                    objectFit: "contain"
                };
            }
            return {
                top: "0",
                left: "0",
                width: "100%",
                height: "100%"
            };
        }

        const [start, end] = clip.value.range;

        const widthScale = (end[0] - start[0]) / 100;
        const heightScale = (end[1] - start[1]) / 100;
        const left = start[0] / widthScale;
        const top = start[1] / heightScale;

        return {
            left: -left + "%",
            top: -top + "%",
            width: 100 / widthScale + "%",
            height: 100 / heightScale + "%"
        };
    });

    return {
        clipShape,
        imgPosition
    };
};
