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
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref, watch } from "vue";
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
        },
        useScale: {
            type: Boolean,
            default: false
        },
        keyDisabled: {
            type: Boolean,
            default: false
        }
    },
    components: {
        Screen
    },
    emits: ["pagePrev", "pageNext", "openCard"],
    setup(props, { emit }) {
        const store = useStore();
        const ctrlKeyActive = computed(() => store.state.ctrlKeyState);
        const slide = computed(() => props.slide);
        const background = computed(() => slide.value.background);
        const currentSlide = ref(slide.value);

        const updateBackground = () => {
            useOssBackground(background, url => {
                if (currentSlide.value.background) currentSlide.value.background.ossSrc = url;
            });
        };

        const isKeyDisabled = computed(() => props.keyDisabled);
        store.commit(MutationTypes.SET_KEY_DISABLED, isKeyDisabled.value);
        watch(isKeyDisabled, () => {
            store.commit(MutationTypes.SET_KEY_DISABLED, isKeyDisabled.value);
        });

        updateBackground();
        watch(slide, () => {
            currentSlide.value = slide.value;
            updateBackground();
        });

        const keyupListener = () => {
            if (ctrlKeyActive.value && props.useScale) store.commit(MutationTypes.SET_CTRL_KEY_STATE, false);
        };

        const keydownListener = (e: KeyboardEvent) => {
            const { ctrlKey } = e;
            if (ctrlKey && !ctrlKeyActive.value) store.commit(MutationTypes.SET_CTRL_KEY_STATE, true);
        };

        onMounted(() => {
            document.addEventListener("keydown", keydownListener);
            document.addEventListener("keyup", keyupListener);
            window.addEventListener("blur", keyupListener);
        });
        onUnmounted(() => {
            document.removeEventListener("keydown", keydownListener);
            document.removeEventListener("keyup", keyupListener);
            window.removeEventListener("blur", keyupListener);
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
