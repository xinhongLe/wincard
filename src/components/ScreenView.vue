<template>
    <Screen
        ref="screenRef"
        :inline="inline"
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

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>
        },
        inline: {
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
        const slide = computed(() => props.slide);
        store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        watch(slide, () => {
            store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        });

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
