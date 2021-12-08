<template>
    <Screen
        ref="screenRef"
        :slide="currentSlide"
        :inline="inline"
        :isInit="isInit"
        @pagePrev="pagePrev()"
        @pageNext="pageNext()"
        @openCard="openCard"
    />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import Screen from "@/views/Screen/index.vue";
import { IWin, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import useOssBackground from "@/views/Editor/Canvas/hooks/useOssBackground";

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        },
        inline: {
            type: Boolean,
            default: false
        },
        isInit: {
            type: Boolean,
            default: true
        }
    },
    components: {
        Screen
    },
    emits: ["pagePrev", "pageNext", "openCard"],
    setup(props, { emit }) {
        // const store = useStore();
        const slide = computed(() => props.slide);
        const background = computed(() => slide.value.background);
        const currentSlide = ref(slide.value);

        const updateBackground = () => {
            useOssBackground(background, url => {
                if (currentSlide.value.background) currentSlide.value.background.ossSrc = url;
            });
        };

        updateBackground();
        watch(slide, () => {
            currentSlide.value = slide.value;
            updateBackground();
        });

        // store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        // watch(slide, () => {
        //     store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        // });

        const screenRef = ref();

        const execPrev = () => {
            screenRef.value.execPrev();
        };

        const execNext = () => {
            screenRef.value.execNext();
        };

        const pagePrev = () => {
            emit("pagePrev");
        };

        const pageNext = () => {
            emit("pageNext");
        };

        const openCard = (wins: IWin[]) => {
            emit("openCard", wins);
        };

        return {
            currentSlide,
            pagePrev,
            pageNext,
            openCard,
            screenRef,
            execPrev,
            execNext
        };
    }
});
</script>
